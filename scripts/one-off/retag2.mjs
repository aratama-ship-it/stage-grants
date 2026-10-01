// 既存制度に 美術/映像/文芸・伝統芸能 ジャンルを追加する変換（Phase D genre拡張）。
// 「文化芸術全般が対象」の汎用制度を各ジャンルにも該当させる。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(fileURLToPath(import.meta.url));
const path = join(ROOT, 'data/programs.data.json');
const programs = JSON.parse(readFileSync(path, 'utf8'));

// 文化芸術全般が対象＝美術・映像・文芸・伝統芸能すべてに該当
const generalAll = new Set([
  'act_c1', 'act_c2', 'act_c3', 'act_startup', 'act_chiiki', 'act_shakai',
  'suginami_wakate', 'suginami_bunka', 'minato_support', 'osaka_city', 'aichi_pref',
  'air_kyodo', 'eujapan_mobility',
]);
// 個別に追加するタグ（program id -> 追加するジャンルtag配列）
const specific = {
  arts_kansai: ['美術', '文芸・伝統芸能'],       // 美術・デザイン/音楽/舞台/伝統
  cln_shakai: ['美術', '映像'],                  // 美術/音楽/舞台/映像
  cln_career: ['美術', '映像'],
  kikin_chouiki: ['美術', '映像'],               // 超域的（領域横断）
  shinshin_kaigai: ['美術'],                     // 美術・音楽・舞踊・演劇・舞台美術
  jpf_haken: ['美術', '映像', '文芸・伝統芸能'],  // 文化芸術一般の海外派遣
  act_kansho: ['美術', '映像'],                  // 鑑賞環境整備（展覧会・上映にも）
};

function addTags(p, tags) {
  const set = new Set(p.genres || ['舞台']);
  for (const t of tags) set.add(t);
  p.genres = [...set];
}

for (const p of programs) {
  if (generalAll.has(p.id)) addTags(p, ['美術', '映像', '文芸・伝統芸能']);
  if (specific[p.id]) addTags(p, specific[p.id]);
}

writeFileSync(path, JSON.stringify(programs) + '\n');
const count = (t) => programs.filter((p) => (p.genres || []).includes(t)).length;
console.log(`舞台=${count('舞台')} 音楽=${count('音楽')} 美術=${count('美術')} 映像=${count('映像')} 文芸伝統=${count('文芸・伝統芸能')}`);
