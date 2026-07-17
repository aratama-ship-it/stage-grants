// programs.data.json に genres タグを付与する一回限りの変換スクリプト。
// 既存46制度の genre 再タグ。以後の新規制度は data に genres を直接書く。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(fileURLToPath(import.meta.url));
const path = join(ROOT, 'data/programs.data.json');
const programs = JSON.parse(readFileSync(path, 'utf8'));

// 芸術全般が対象＝舞台にも音楽にも該当する制度（舞台＋音楽）
const alsoMusic = new Set([
  'kikin_engeki', 'kikin_chouiki', 'act_c1', 'act_c2', 'act_c3', 'act_startup',
  'act_chiiki', 'act_shakai', 'act_kansho', 'act_live_stage', 'suginami_wakate',
  'suginami_bunka', 'minato_support', 'osaka_city', 'osaka_pref', 'osaka_kids',
  'arts_kansai', 'cln_shakai', 'cln_career', 'aichi_pref', 'jafra', 'gekijo_kyodo',
  'renkei_kiban', 'air_kyodo', 'eujapan_mobility', 'bunka_kodomo', 'jpf_haken', 'shinshin_kaigai',
]);
// 音楽が主対象（音楽＋舞台）
const musicPrimary = new Set(['nomura', 'asahi', 'asahigroup']);

for (const p of programs) {
  if (musicPrimary.has(p.id)) p.genres = ['音楽', '舞台'];
  else if (alsoMusic.has(p.id)) p.genres = ['舞台', '音楽'];
  else p.genres = ['舞台'];
}

writeFileSync(path, JSON.stringify(programs) + '\n');
const music = programs.filter((p) => p.genres.includes('音楽')).length;
console.log(`retagged ${programs.length} programs. 舞台=${programs.filter((p) => p.genres.includes('舞台')).length}, 音楽=${music}`);
