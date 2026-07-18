// 文化芸術助成メディア 静的サイトジェネレータ（依存なし・Node ESM）
// data/programs.data.json → 各ページのHTMLを生成する。
// 使い方: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const VERIFIED = '2026-07-18';
const SITE_NAME = '文化芸術 助成金ナビ';
const BASE_URL = 'https://aratama-ship-it.github.io/stage-grants/'; // 独自ドメイン取得後に差し替え
// --- 解析・広告（値を入れて node build.mjs で有効化。空なら読み込まれずバナーも出ない）---
const ANALYTICS_GA4 = '';   // 例: 'G-XXXXXXXXXX'（Google Analytics 4 の測定ID）
const ADSENSE_CLIENT = '';  // 例: 'ca-pub-1234567890123456'（AdSense 承認後のクライアントID）
const programs = JSON.parse(readFileSync(join(ROOT, 'data/programs.data.json'), 'utf8'));

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- 地域バケット ----
// 47都道府県 → ローマ字キー（region文字列に都道府県名が含まれれば自動でその県バケットに振り分け）
const PREF_KEY = {
  '北海道': 'hokkaido', '青森': 'aomori', '岩手': 'iwate', '宮城': 'miyagi', '秋田': 'akita', '山形': 'yamagata', '福島': 'fukushima',
  '茨城': 'ibaraki', '栃木': 'tochigi', '群馬': 'gunma', '埼玉': 'saitama', '千葉': 'chiba', '東京': 'tokyo', '神奈川': 'kanagawa',
  '新潟': 'niigata', '富山': 'toyama', '石川': 'ishikawa', '福井': 'fukui', '山梨': 'yamanashi', '長野': 'nagano', '岐阜': 'gifu', '静岡': 'shizuoka', '愛知': 'aichi',
  '三重': 'mie', '滋賀': 'shiga', '京都': 'kyoto', '大阪': 'osaka', '兵庫': 'hyogo', '奈良': 'nara', '和歌山': 'wakayama',
  '鳥取': 'tottori', '島根': 'shimane', '岡山': 'okayama', '広島': 'hiroshima', '山口': 'yamaguchi',
  '徳島': 'tokushima', '香川': 'kagawa', '愛媛': 'ehime', '高知': 'kochi',
  '福岡': 'fukuoka', '佐賀': 'saga', '長崎': 'nagasaki', '熊本': 'kumamoto', '大分': 'oita', '宮崎': 'miyazaki', '鹿児島': 'kagoshima', '沖縄': 'okinawa',
};
const PREF_ORDER = Object.keys(PREF_KEY); // 東京→京都の順序で、東京都に含まれる「京都」の誤マッチを回避
function bucketOf(region) {
  if (region.includes('東京以外')) return { key: 'national', label: '全国' };
  if (region.includes('全国')) return { key: 'national', label: '全国' };
  for (const s of PREF_ORDER) if (region.includes(s)) return { key: PREF_KEY[s], label: s };
  if (region.includes('関西')) return { key: 'osaka', label: '大阪' };
  return { key: 'national', label: '全国' };
}
const activeBucketKeys = new Set(programs.map((p) => bucketOf(p.region).key));
const BUCKETS = [{ key: 'national', label: '全国' }, ...PREF_ORDER.filter((s) => activeBucketKeys.has(PREF_KEY[s])).map((s) => ({ key: PREF_KEY[s], label: s }))];
// ---- ジャンル ----
const GENRES = [
  { key: 'butai', tag: '舞台', label: '舞台芸術（演劇・舞踊・サーカス）', hero: '演劇・舞踊・ダンス・サーカス' },
  { key: 'ongaku', tag: '音楽', label: '音楽', hero: 'クラシック・現代音楽・邦楽・オペラ・合唱・吹奏楽' },
  { key: 'bijutsu', tag: '美術', label: '美術・現代アート', hero: '絵画・彫刻・現代アート・メディアアート・写真・工芸・展覧会' },
  { key: 'eizo', tag: '映像', label: '映像・映画', hero: '映画・ドキュメンタリー・アニメーション・実験映像・メディア芸術' },
  { key: 'bungei', tag: '文芸・伝統芸能', label: '文芸・伝統芸能ほか', hero: '文芸・出版・伝統芸能・工芸・地域文化' },
];
const genresOf = (p) => (Array.isArray(p.genres) && p.genres.length ? p.genres : ['舞台']);
const COMING = [];
const openPrograms = programs.filter((p) => p.dlUrgent);

// ---- 共通レイアウト ----
function layout({ title, desc, rel, body, active }) {
  const nav = [
    ['index.html', 'ホーム', 'home'],
    ['grants.html', '助成金を探す', 'grants'],
    ['calendar.html', '締切カレンダー', 'calendar'],
    ['check.html', '適格性チェック', 'check'],
    ['about.html', 'このサイトについて', 'about'],
  ].map(([href, label, key]) =>
    `<a href="${rel}${href}"${key === active ? ' class="on"' : ''}>${label}</a>`
  ).join('');
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<style>
:root{--bg:#f2f3f7;--card:#fff;--ink:#1c1c22;--sub:#6a6d7a;--line:#e4e5ec;--accent:#3355e0;
--ok:#1a8f5a;--ok-bg:#e6f5ee;--chk:#b7791f;--chk-bg:#fbf3e2;--dl:#c05621;--dl-bg:#fff4f0;
--shadow:0 1px 3px rgba(20,20,40,.06),0 8px 24px rgba(20,20,40,.05)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);line-height:1.7;font-size:15px;
font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Noto Sans JP",sans-serif}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.nav{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:10}
.nav-in{max-width:900px;margin:0 auto;display:flex;gap:4px;flex-wrap:wrap;align-items:center;padding:10px 14px}
.brand{font-weight:700;font-size:15px;margin-right:10px;color:var(--ink)}
.nav a{padding:6px 10px;border-radius:8px;font-size:13.5px;color:var(--sub)}
.nav a.on{background:#eaeeff;color:var(--accent);font-weight:600}
main{max-width:900px;margin:0 auto;padding:18px 14px 60px}
h1{font-size:22px;margin:6px 0 6px}h2{font-size:17px;margin:26px 0 12px}
.lede{color:var(--sub);margin:0 0 6px}
.card{background:var(--card);border-radius:14px;box-shadow:var(--shadow);padding:16px 18px;margin:12px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.tile{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px;display:block}
.tile b{font-size:15px}.tile .c{color:var(--sub);font-size:12px}
.stat{display:flex;gap:14px;flex-wrap:wrap;margin:10px 0}
.stat div{background:#fff;border-radius:10px;padding:10px 14px;box-shadow:var(--shadow)}
.stat .n{font-size:22px;font-weight:700}.stat .l{font-size:12px;color:var(--sub)}
.gitem{display:block;background:#fff;border:1px solid var(--line);border-radius:12px;padding:13px 15px;margin:9px 0}
.gitem:hover{border-color:var(--accent);text-decoration:none}
.gitem .t{font-weight:600;color:var(--ink)}
.gitem .m{color:var(--sub);font-size:12.5px;margin-top:2px}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.tag{font-size:11.5px;background:#f4f5fa;color:var(--sub);border-radius:6px;padding:3px 8px}
.tag.cash{background:#eef3ff;color:var(--accent);font-weight:600}
.tag.dl{background:var(--dl-bg);color:var(--dl);font-weight:600}
.cta{display:inline-block;background:var(--accent);color:#fff;padding:11px 18px;border-radius:11px;font-weight:700}
.cta:hover{text-decoration:none;opacity:.94}
.kv{margin:10px 0}.kv .k{font-size:12px;color:var(--sub)}.kv .v{font-size:15px}
ul.cond{margin:8px 0 0;padding-left:0;list-style:none}
ul.cond li{padding:7px 0;border-top:1px dashed var(--line);font-size:14px}
ul.cond li:first-child{border-top:none}
.qbox{background:var(--chk-bg);border-radius:10px;padding:12px;margin-top:12px;font-size:13px;color:var(--chk)}
.note{color:var(--sub);font-size:13px;margin-top:8px}
.src{margin-top:12px;font-size:13px}
.verified{color:var(--sub);font-size:12px;margin-top:6px}
.discl{font-size:12px;color:var(--sub);background:#fff;border:1px dashed var(--line);border-radius:10px;padding:11px 13px;margin:16px 0}
footer{border-top:1px solid var(--line);background:#fff;margin-top:30px}
.foot-in{max-width:900px;margin:0 auto;padding:18px 14px;font-size:12px;color:var(--sub)}
.foot-in a{color:var(--sub)}
.hidden{display:none}
.tabs{display:flex;gap:6px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:5px;margin:8px 0 6px}
.tab{flex:1;padding:10px 6px;border:none;background:transparent;border-radius:9px;font-size:13.5px;font-weight:600;color:var(--sub);cursor:pointer;font-family:inherit}
.tab.on{background:var(--accent);color:#fff}
.tabpane{padding:6px 0 2px}
.regionbar{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 12px}
.prefgroup{margin:12px 0}
.prefgroup .gh{font-size:12px;color:var(--sub);margin:0 0 6px}
.prefs{display:flex;flex-wrap:wrap;gap:7px}
.pref{font-size:13px;border:1px solid var(--line);border-radius:8px;padding:6px 11px;background:#fafafb;color:#b4b6c0}
a.pref{color:var(--accent);border-color:#d7ddf6;background:#eef0fa;font-weight:600}
a.pref:hover{text-decoration:none;border-color:var(--accent)}
</style>
<script>window.__SITE_TRACKING={ga4:${JSON.stringify(ANALYTICS_GA4)},adsClient:${JSON.stringify(ADSENSE_CLIENT)},privacyUrl:${JSON.stringify(rel + 'privacy.html')}};</script>
<script src="${rel}assets/tracking.js" defer></script>
</head>
<body>
<div class="nav"><div class="nav-in"><span class="brand">${SITE_NAME}</span>${nav}</div></div>
<main>
${body}
</main>
<footer><div class="foot-in">
<!-- ad-slot: フッター広告（AdSense審査後に有効化） -->
情報は${VERIFIED}に各公式サイト・募集要項で一次確認したものです（順次更新）。締切・条件は変動します。最終判断は各助成元の最新の募集要項でご確認ください。<br>
<a href="${rel}about.html">このサイトについて</a> ・ <a href="${rel}privacy.html">プライバシー</a> ・ <a href="${rel}disclaimer.html">免責事項・情報訂正</a>
</div></footer>
</body>
</html>`;
}

// 受付状態を締切テキストから機械判定（不確実なものは「要確認」に倒す）
function recruitStatus(p) {
  const t = p.deadline || '';
  if (p.dlUrgent || /受付中|募集中|随時|通年/.test(t)) return { label: '受付中・随時', cls: 'ok' };
  if (/締切済み|締め?切(り)?済|終了|募集は終了/.test(t)) return { label: '募集期間外（次回情報は未確認）', cls: '' };
  return { label: '募集時期は要確認', cls: '' };
}
function statusTags(p) {
  const t = [];
  const st = recruitStatus(p);
  t.push(`<span class="tag${st.cls === 'ok' ? ' dl' : ''}">${st.label}</span>`);
  if (p.dlUrgent) t.push(`<span class="tag dl">締切: ${esc(p.deadline)}</span>`);
  else t.push(`<span class="tag">${esc(p.deadline)}</span>`);
  t.push(`<span class="tag">${esc(p.amount)}</span>`);
  t.push(`<span class="tag cash">支給: ${esc(p.cashflow)}</span>`);
  return t.join('');
}
function gitem(p, rel) {
  return `<a class="gitem" href="${rel}grants/${p.id}.html">
<div class="t">${esc(p.name)}</div>
<div class="m">${esc(p.funder)} ・ ${esc(p.region)}</div>
<div class="tags">${statusTags(p)}</div></a>`;
}

const WRITTEN_PAGES = [];
function write(rel, html) {
  // canonical / OGP を自動注入（title・descriptionは生成済みHTMLから抽出）
  const url = BASE_URL + rel.replace(/^index\.html$/, '');
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || SITE_NAME;
  const desc = (html.match(/<meta name="description" content="([\s\S]*?)">/) || [])[1] || '';
  const head = `<link rel="canonical" href="${url}">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary">`;
  html = html.replace(/(<meta name="description" content="[\s\S]*?">)/, `$1\n${head}`);
  WRITTEN_PAGES.push(rel);
  const abs = join(ROOT, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, html);
}

// ---- トップ ----
{
  const openList = openPrograms.map((p) => gitem(p, '')).join('') || '<p class="note">現在受付中の制度はありません。</p>';
  const genreTiles = GENRES.map((g) => {
    const n = programs.filter((p) => genresOf(p).includes(g.tag)).length;
    return `<a class="tile" href="genres/${g.key}.html"><b>${g.label}</b><div class="c">${n}制度・公開中</div></a>`;
  }).join('') + COMING.map((n) => `<div class="tile" style="opacity:.55"><b>${n}</b><div class="c">近日追加</div></div>`).join('');

  // 地域: 全国＋47都道府県＋海外（制度がある県は自動でリンク有効化、無い県はグレー）
  const CHIHO = [
    ['北海道・東北', ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島']],
    ['関東', ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川']],
    ['中部', ['新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知']],
    ['近畿', ['三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山']],
    ['中国', ['鳥取', '島根', '岡山', '広島', '山口']],
    ['四国', ['徳島', '香川', '愛媛', '高知']],
    ['九州・沖縄', ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄']],
  ];
  const prefChip = (name) => activeBucketKeys.has(PREF_KEY[name])
    ? `<a class="pref" href="regions/${PREF_KEY[name]}.html">${name}</a>`
    : `<span class="pref" title="準備中">${name}</span>`;
  const nationalN = programs.filter((p) => bucketOf(p.region).key === 'national').length;
  const regionPane = `
<div class="regionbar"><a class="pref" href="regions/national.html" style="font-size:14px;padding:9px 16px">全国（${nationalN}制度）</a></div>
<p class="note" style="margin:0 0 6px">都道府県から探す（全47都道府県に対応。制度は順次拡充します。海外は準備中）</p>
${CHIHO.map(([label, prefs]) => `<div class="prefgroup"><div class="gh">${label}</div><div class="prefs">${prefs.map(prefChip).join('')}</div></div>`).join('')}
<div class="prefgroup"><div class="gh">海外</div><div class="prefs"><span class="pref" title="準備中">海外（準備中）</span></div></div>`;

  const closedN = programs.length - openPrograms.length;
  const deadlinePane = `
<p class="note" style="margin:2px 0 12px">締切・募集状況から探す。日付つきの月別カレンダーは今後拡充します。</p>
<div class="regionbar">
<a class="pref" href="calendar.html" style="font-size:14px;padding:9px 16px">いま受付中（${openPrograms.length}件）</a>
<a class="pref" href="calendar.html" style="font-size:14px;padding:9px 16px">募集終了・次回待ち（${closedN}件）</a>
</div>
<p><a class="cta" href="calendar.html">締切カレンダー・募集状況の一覧を見る →</a></p>`;

  const body = `
<h1>あなたに合う文化芸術の助成金を、根拠つきで。</h1>
<p class="lede">締切・助成額・「いつ入金されるか（支給時期）」・応募条件をまとめて確認。舞台芸術・音楽・美術・映像・文芸/伝統芸能の${programs.length}制度を収録（無料）。</p>
<div class="stat">
<div><div class="n">${programs.length}</div><div class="l">収録制度</div></div>
<div><div class="n">${openPrograms.length}</div><div class="l">いま受付中</div></div>
<div><div class="n">5</div><div class="l">ジャンル</div></div>
</div>
<p><a class="cta" href="check.html">適格性チェックを試す →</a></p>

<div class="tabs" role="tablist">
<button class="tab on" data-tab="genre" role="tab">ジャンルから探す</button>
<button class="tab" data-tab="region" role="tab">地域から探す</button>
<button class="tab" data-tab="deadline" role="tab">締切から探す</button>
</div>
<div class="tabpane" id="tab-genre"><div class="tiles">${genreTiles}</div></div>
<div class="tabpane hidden" id="tab-region">${regionPane}</div>
<div class="tabpane hidden" id="tab-deadline">${deadlinePane}</div>

<h2>いま応募できる助成（${openPrograms.length}）</h2>
${openList}

<div class="discl">これは開発中のプロトタイプです。適格性の判定は募集要項の明示条件のみに基づく機械的なもので、採択可能性を示すものではありません。</div>
<script>
document.querySelectorAll('.tab').forEach(function(b){b.onclick=function(){
document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on');});
document.querySelectorAll('.tabpane').forEach(function(x){x.classList.add('hidden');});
b.classList.add('on');
document.getElementById('tab-'+b.dataset.tab).classList.remove('hidden');
};});
</script>`;
  write('index.html', layout({ title: `${SITE_NAME}｜文化芸術の助成金を根拠つきで探す`, desc: `文化芸術・クリエイターの助成金を、締切・助成額・支給時期・応募条件つきで探せる無料サイト。舞台芸術・音楽・美術・映像・文芸/伝統芸能の${programs.length}制度を収録。`, rel: '', active: 'home', body }));
}

// ---- 制度一覧 ----
{
  let body = `<h1>助成金を探す（${programs.length}制度）</h1>
<p class="lede">地域別に全制度を掲載。各制度ページで締切・助成額・支給時期・応募条件・出典を確認できます。</p>`;
  for (const b of BUCKETS) {
    const list = programs.filter((p) => bucketOf(p.region).key === b.key);
    if (!list.length) continue;
    body += `<h2>${b.label}（${list.length}）</h2>` + list.map((p) => gitem(p, '')).join('');
  }
  write('grants.html', layout({ title: `助成金一覧（${programs.length}制度）｜${SITE_NAME}`, desc: `文化芸術の助成金${programs.length}制度を地域別に一覧。締切・助成額・支給時期・応募条件つき。`, rel: '', active: 'grants', body }));
}

// ---- 締切カレンダー ----
{
  const closed = programs.filter((p) => !p.dlUrgent);
  const body = `<h1>締切カレンダー・募集状況</h1>
<p class="lede">「いま受付中」と「募集終了・次回の目安」を一覧。日付つきの月別カレンダーは今後拡充します。</p>
<h2>いま受付中（${openPrograms.length}）</h2>
${openPrograms.map((p) => gitem(p, '')).join('') || '<p class="note">現在受付中の制度はありません。</p>'}
<h2>現在は募集終了・次回待ち（${closed.length}）</h2>
${closed.map((p) => gitem(p, '')).join('')}`;
  write('calendar.html', layout({ title: `締切カレンダー・募集状況｜${SITE_NAME}`, desc: `文化芸術助成の受付中・募集終了・次回の目安を一覧。`, rel: '', active: 'calendar', body }));
}

// ---- 地域別ページ ----
for (const b of BUCKETS) {
  const list = programs.filter((p) => bucketOf(p.region).key === b.key);
  const open = list.filter((p) => p.dlUrgent);
  const body = `<h1>${b.label}の文化芸術 助成金（${list.length}制度）</h1>
<p class="lede">${b.label}で応募できる舞台芸術系の助成金。締切・助成額・支給時期・応募条件つき。</p>
${open.length ? `<h2>いま受付中（${open.length}）</h2>${open.map((p) => gitem(p, '../')).join('')}` : ''}
<h2>制度一覧</h2>
${list.map((p) => gitem(p, '../')).join('')}
<p class="note"><a href="../grants.html">← 全地域の一覧に戻る</a></p>`;
  write(`regions/${b.key}.html`, layout({ title: `${b.label}の文化芸術 助成金一覧｜${SITE_NAME}`, desc: `${b.label}で応募できる文化芸術・舞台芸術の助成金${list.length}制度。締切・助成額・支給時期つき。`, rel: '../', active: 'grants', body }));
}

// ---- ジャンル別ページ ----
for (const g of GENRES) {
  const list = programs.filter((p) => genresOf(p).includes(g.tag));
  if (!list.length) continue;
  const open = list.filter((p) => p.dlUrgent);
  const otherGenres = GENRES.filter((x) => x.key !== g.key).map((x) => `<a href="${x.key}.html">${x.label}</a>`).join(' ・ ');
  const body = `<h1>${g.label}の助成金（${list.length}制度）</h1>
<p class="lede">${g.hero}の制作者・団体・フリー制作者が応募できる助成金を、全国＋東京・大阪・名古屋で掲載。締切・助成額・支給時期・応募条件つき。</p>
<p class="note">ほかのジャンル: ${otherGenres}（美術・映像などは順次追加）</p>
${open.length ? `<h2>いま受付中（${open.length}）</h2>${open.map((p) => gitem(p, '../')).join('')}` : ''}
<h2>制度一覧</h2>
${list.map((p) => gitem(p, '../')).join('')}`;
  write(`genres/${g.key}.html`, layout({ title: `${g.label}の助成金一覧（${list.length}制度）｜${SITE_NAME}`, desc: `${g.hero}の助成金${list.length}制度。締切・助成額・支給時期・応募条件つき。`, rel: '../', active: 'grants', body }));
}

// ---- 制度別ページ ----
for (const p of programs) {
  const related = programs.filter((q) => q.funder === p.funder && q.id !== p.id).slice(0, 5);
  const genreLinks = genresOf(p).map((tag) => {
    const g = GENRES.find((x) => x.tag === tag);
    return g ? `<a href="../genres/${g.key}.html">${g.label}</a>` : esc(tag);
  }).join(' ・ ');
  const body = `<p class="note"><a href="../grants.html">助成金一覧</a> ／ <a href="../regions/${bucketOf(p.region).key}.html">${esc(bucketOf(p.region).label)}</a> ／ ${genreLinks}</p>
<h1>${esc(p.name)}</h1>
<p class="lede">${esc(p.funder)} ・ ${esc(p.region)}</p>
<div class="tags">${statusTags(p)}</div>
<div class="card">
<div class="kv"><div class="k">受付状態（本サイトの機械判定）</div><div class="v">${recruitStatus(p).label}</div></div>
<div class="kv"><div class="k">受付状況・締切</div><div class="v">${esc(p.deadline)}</div></div>
<div class="kv"><div class="k">助成額</div><div class="v">${esc(p.amount)}</div></div>
<div class="kv"><div class="k">支給時期（キャッシュフロー）</div><div class="v">${esc(p.cashflow)}<br><span class="note">${esc(p.payment)}</span></div></div>
<div class="kv"><div class="k">主な応募条件</div><ul class="cond">${p.conditions.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
${p.note ? `<p class="note">ℹ️ ${esc(p.note)}</p>` : ''}
${p.funderQ ? `<div class="qbox"><b>助成元への確認事項</b><br>${esc(p.funderQ)}</div>` : ''}
<div class="src">📄 出典: <a href="${esc(p.src)}" target="_blank" rel="noopener">${esc(p.funder)} 公式ページ</a></div>
<p class="verified">最終確認: ${VERIFIED}（募集要項で一次確認）</p>
</div>
<p><a class="cta" href="../check.html">この条件で適格性をチェックする →</a></p>
<!-- ad-slot: 記事内広告。ADSENSE_CLIENT 設定時に自動広告で配信（同意後のみ） -->
${related.length ? `<h2>同じ助成元の他の制度</h2>${related.map((q) => gitem(q, '../')).join('')}` : ''}
<div class="discl">判定・掲載情報は募集要項の明示内容に基づく参考情報で、採択可能性や最終的な適格性を保証するものではありません。応募前に必ず公式の最新要項をご確認ください。</div>`;
  write(`grants/${p.id}.html`, layout({ title: `${esc(p.name)}｜${esc(p.funder)}の助成金｜${SITE_NAME}`, desc: `${esc(p.funder)}「${esc(p.name)}」。${esc(p.region)}／${esc(p.amount)}／支給:${esc(p.cashflow)}。締切・応募条件・出典を掲載。`, rel: '../', active: 'grants', body }));
}

// ---- ポリシー系 ----
write('about.html', layout({
  title: `このサイトについて｜${SITE_NAME}`, desc: `${SITE_NAME}の目的・情報源・更新方針。`, rel: '', active: 'about',
  body: `<h1>このサイトについて</h1>
<div class="card">
<p>${SITE_NAME}は、文化芸術・クリエイターのための助成金・補助金を、締切・助成額・「いつ入金されるか（支給時期）」・応募条件つきで探せる無料サイトです。舞台芸術・音楽・美術・映像・文芸/伝統芸能の5ジャンル、全国＋47都道府県・市区町村の${programs.length}制度を収録しています。</p>
<h2>特徴</h2>
<ul>
<li>単なる一覧ではなく、応募条件を根拠つきで示し、適格性チェック機能で「自分が合うか」を確認できます。</li>
<li>舞台芸術の資金繰りに直結する「支給時期（前払い／概算払い／精算払い）」を第一級の情報として掲載しています。</li>
<li>各制度に出典（公式ページ）と最終確認日を明記しています。</li>
</ul>
<h2>情報源と更新</h2>
<p>掲載情報は各助成元の公式サイト・募集要項を一次確認したものです（最終確認: ${VERIFIED}）。制度は毎年変わるため順次更新しますが、応募前には必ず各助成元の最新要項をご確認ください。</p>
<p>掲載内容の誤り・更新のご連絡は <a href="disclaimer.html">情報訂正の窓口</a> へ。</p>
</div>`,
}));

write('privacy.html', layout({
  title: `プライバシーポリシー｜${SITE_NAME}`, desc: `${SITE_NAME}のプライバシーポリシー。`, rel: '', active: 'about',
  body: `<h1>プライバシーポリシー</h1>
<div class="card">
<h2>アクセス解析・Cookie</h2>
<p>本サイトは、サービス改善のためのアクセス解析（Google Analytics 等）や広告配信のためにCookie等を利用する場合があります。これらを利用する際は、初回アクセス時に同意バナーを表示し、<strong>「同意する」を選んだ場合にのみ解析・広告のスクリプトを読み込みます</strong>。「拒否」を選んだ場合、これらは読み込まれません。${ANALYTICS_GA4 || ADSENSE_CLIENT ? '' : '（現時点では解析・広告は未導入で、Cookieによる追跡は行っていません。）'}</p>
<p>同意の選択はお使いのブラウザに保存されます。取り消すには、ブラウザのサイトデータ（localStorage）を削除してください。</p>
<h2>広告について</h2>
<p>本サイトは運営費のためにディスプレイ広告（Google AdSense 等）を掲載する場合があります。広告の配信にはCookie等が利用され、上記のとおり同意した場合にのみ読み込まれます。広告の内容・配信は配信事業者により行われ、助成情報の掲載内容や適格性の判定結果・並び順に影響することはありません。（本サイトでは商用サービスへのアフィリエイト送客は行いません。）</p>
<h2>適格性チェックの入力内容について</h2>
<p>適格性チェックツールに入力いただいた条件（拠点・分野・実績など）は、<strong>お使いのブラウザ内でのみ処理され、本サイトのサーバーや第三者に送信されることはありません</strong>。ページを閉じると入力内容は破棄されます。</p>
<h2>個人情報</h2>
<p>本サイトはお問い合わせ等でいただいた個人情報を、対応の目的以外に利用しません。第三者への提供は法令に基づく場合を除き行いません。</p>
<p>お問い合わせ・訂正のご連絡は <a href="disclaimer.html">情報訂正の窓口</a> へ。</p>
</div>`,
}));

write('disclaimer.html', layout({
  title: `免責事項・情報訂正の窓口｜${SITE_NAME}`, desc: `${SITE_NAME}の免責事項と情報訂正の連絡先。`, rel: '', active: 'about',
  body: `<h1>免責事項・情報訂正の窓口</h1>
<div class="card">
<h2>免責</h2>
<p>本サイトの掲載情報および適格性チェックの結果は、募集要項の明示内容に基づく参考情報です。「適格」ではなく「条件上、該当の可能性がある」ことを示すもので、採択可能性・最終的な適格性を保証しません。応募の最終判断は必ず各助成元の最新の募集要項でご確認ください。締切・金額・条件は変動します。</p>
<h2>情報訂正の窓口</h2>
<p>掲載内容の誤り・古い情報にお気づきの場合、また掲載制度に関するご連絡は、下記までお寄せください。確認のうえ速やかに修正します。</p>
<p>連絡先（準備中）: <em>お問い合わせフォーム／メールアドレスを設置予定</em></p>
<h2>更新履歴</h2>
<ul>
<li>2026-07-18: ${programs.length}制度に拡充（全国47都道府県の主要市区町村まで収録）。適格性チェックを全5ジャンル・全制度対応に拡張。</li>
<li>2026-07-17: サイト公開。全国＋東京・大阪・名古屋の46制度でスタートし、同日中に155制度・全47都道府県対応まで拡充。</li>
</ul>
</div>`,
}));

// ---- sitemap.xml / robots.txt ----
{
  const staticPages = ['check.html'];
  const urls = [...WRITTEN_PAGES, ...staticPages].map((rel) => BASE_URL + rel.replace(/^index\.html$/, ''));
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${u}</loc><lastmod>${VERIFIED}</lastmod></url>`).join('\n')}
</urlset>`;
  writeFileSync(join(ROOT, 'sitemap.xml'), sitemap);
  writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}sitemap.xml\n`);
}

console.log(`Generated: index, grants, calendar, ${BUCKETS.length} regions, ${GENRES.length} genres, ${programs.length} grant pages, 3 policy pages, sitemap(${WRITTEN_PAGES.length + 1} urls), robots.txt.`);
