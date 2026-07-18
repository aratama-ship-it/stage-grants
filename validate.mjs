// データ欠損チェック。build前に実行して異常があれば非ゼロ終了。
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(fileURLToPath(import.meta.url));
const programs = JSON.parse(readFileSync(join(ROOT, 'data/programs.data.json'), 'utf8'));

const PREFS = ['北海道','青森','岩手','宮城','秋田','山形','福島','茨城','栃木','群馬','埼玉','千葉','東京','神奈川','新潟','富山','石川','福井','山梨','長野','岐阜','静岡','愛知','三重','滋賀','京都','大阪','兵庫','奈良','和歌山','鳥取','島根','岡山','広島','山口','徳島','香川','愛媛','高知','福岡','佐賀','長崎','熊本','大分','宮崎','鹿児島','沖縄'];
const GENRE_TAGS = new Set(['舞台','音楽','美術','映像','文芸・伝統芸能']);
const REQUIRED = ['id','name','funder','region','deadline','amount','src'];

const errors = [];
const ids = new Set();
for (const p of programs) {
  for (const k of REQUIRED) if (!p[k] || String(p[k]).trim() === '') errors.push(`${p.id || '(no id)'}: ${k} が空`);
  if (ids.has(p.id)) errors.push(`${p.id}: id重複`);
  ids.add(p.id);
  const regionOk = /全国|関西|東京以外/.test(p.region) || PREFS.some((s) => p.region.includes(s));
  if (!regionOk) errors.push(`${p.id}: region「${p.region}」が判別不能（都道府県名/全国/関西を含めること）`);
  if (!Array.isArray(p.genres) || p.genres.length === 0) errors.push(`${p.id}: genres が空`);
  else for (const g of p.genres) if (!GENRE_TAGS.has(g)) errors.push(`${p.id}: 不明なジャンルタグ「${g}」`);
  if (!Array.isArray(p.conditions) || p.conditions.length === 0) errors.push(`${p.id}: conditions が空`);
  if (p.src && !/^https?:\/\//.test(p.src)) errors.push(`${p.id}: src がURLでない`);
}
if (errors.length) {
  console.error(`NG: ${errors.length}件の問題`);
  errors.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
console.log(`OK: ${programs.length}件すべて必須フィールド・地域・ジャンル・出典が有効`);
