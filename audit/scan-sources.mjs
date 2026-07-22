import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DATA_PATH = resolve(ROOT, 'data/programs.data.json');
const OUTPUT_PATH = resolve(ROOT, 'audit/2026-07-22-source-scan.json');
const CONCURRENCY = 4;
const TIMEOUT_MS = 15_000;

const programs = JSON.parse(await readFile(DATA_PATH, 'utf8'));
const targets = programs.filter((program) => !program.verified);

function stripHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripHtml(match[1]).slice(0, 240) : '';
}

function snippets(text, patterns) {
  const results = [];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (!match) continue;
    const start = Math.max(0, match.index - 90);
    const end = Math.min(text.length, match.index + match[0].length + 150);
    const snippet = text.slice(start, end).trim();
    if (snippet && !results.includes(snippet)) results.push(snippet);
  }
  return results.slice(0, 5);
}

async function inspect(program) {
  const startedAt = Date.now();
  try {
    const response = await fetch(program.src, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'user-agent': 'MonosashiDataAudit/1.0 (+https://joseikin-monosashi.com/)',
        accept: 'text/html,application/xhtml+xml,application/pdf;q=0.8,*/*;q=0.5',
      },
    });
    const contentType = response.headers.get('content-type') || '';
    const result = {
      id: program.id,
      name: program.name,
      deadline: program.deadline,
      src: program.src,
      status: response.status,
      ok: response.ok,
      finalUrl: response.url,
      contentType,
      lastModified: response.headers.get('last-modified') || '',
      elapsedMs: Date.now() - startedAt,
      title: '',
      signals: [],
    };

    if (/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      const html = await response.text();
      const text = stripHtml(html);
      result.title = extractTitle(html);
      result.signals = snippets(text, [
        /(?:2026|令和\s*8)年度?/i,
        /(?:2027|令和\s*9)年度?/i,
        /(?:募集中|受付中|募集開始|受付期間|応募期間|申請期間)/i,
        /(?:募集終了|受付終了|締切済|終了しました|応募を締め切)/i,
        /(?:更新日|最終更新|掲載日)/i,
      ]);
    }

    return result;
  } catch (error) {
    return {
      id: program.id,
      name: program.name,
      deadline: program.deadline,
      src: program.src,
      status: null,
      ok: false,
      finalUrl: '',
      contentType: '',
      lastModified: '',
      elapsedMs: Date.now() - startedAt,
      title: '',
      signals: [],
      error: error?.name === 'TimeoutError' ? 'timeout' : String(error?.message || error),
    };
  }
}

const results = new Array(targets.length);
let cursor = 0;
let completed = 0;

async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= targets.length) return;
    results[index] = await inspect(targets[index]);
    completed += 1;
    if (completed % 20 === 0 || completed === targets.length) {
      console.log(`scanned ${completed}/${targets.length}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

const summary = {
  generatedAt: new Date().toISOString(),
  scope: 'stage-grants records without a manual verified date',
  total: results.length,
  reachable: results.filter((result) => result.ok).length,
  redirects: results.filter((result) => result.ok && result.finalUrl !== result.src).length,
  httpErrors: results.filter((result) => result.status && !result.ok).length,
  networkErrors: results.filter((result) => result.status === null).length,
  htmlResponses: results.filter((result) => /text\/html|application\/xhtml\+xml/i.test(result.contentType)).length,
  nonHtmlResponses: results.filter((result) => result.ok && !/text\/html|application\/xhtml\+xml/i.test(result.contentType)).length,
};

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify({ summary, results }, null, 2)}\n`);
console.log(JSON.stringify(summary));
console.log(`wrote ${OUTPUT_PATH}`);
