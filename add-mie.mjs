// 三重県の主要市を追加。一次検証は data/verified_mie_2026-07-18.md。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(fileURLToPath(import.meta.url));
const path = join(ROOT, 'data/programs.data.json');
const programs = JSON.parse(readFileSync(path, 'utf8'));
const A = ['舞台', '音楽', '美術', '映像', '文芸・伝統芸能'];
const P = (id, name, funder, region, deadline, dlUrgent, amount, cashflow, src, conditions, note = '', genres = A) =>
  ({ id, name, funder, region, deadline, dlUrgent, amount, payment: cashflow, cashflow, src, note, funderQ: '', conditions, genres });

const add = [
  P('yokkaichi_shimin_bunka', '四日市市市民文化事業支援補助金', '四日市市（シティプロモーション部文化課）', '三重県四日市市', '令和8年度分は締切済み（4/1〜5/8）。次回は例年4月下旬〜5月上旬と推測・要確認', false, '全市的事業: 上限20万円（対象経費の1/2以内）／地区事業: 上限10万円（対象経費の1/2以内）', '原則事業完了払い。前払い希望の場合は交付決定額の2/3の範囲内で前払い可', 'https://www.city.yokkaichi.lg.jp/www/contents/1771306289222/index.html', ['四日市市内に住所または活動の本拠を持つ文化的事業を行う団体（個人不可）', '市にゆかりのある伝統文化等の普及振興が目的', '全市的事業は書類審査＋面接審査、地区事業は書類審査のみ'], '団体限定。前払い（交付決定額の2/3まで）に対応。'),
  P('kameyama_bunka_sozo', '亀山市文化芸術創造事業補助金（かめやま文化年関連事業）', '亀山市（市民文化部文化課）', '三重県亀山市', '3年に1度の「かめやま文化年」に連動した期間限定公募（前回2024年度、次回は2027年度見込み・現在は募集期間外）', false, '補助対象経費の1/2以内、上限50万円', '未確認', 'https://www.city.kameyama.mie.jp/kamebun/article/2024030500048/', ['亀山市内に主たる活動拠点を有する3人以上の団体（個人不可）', '新たな文化芸術創造、子どもの文化芸術活動参画機会の充実、まちのにぎわい・魅力創出につながる事業'], '団体限定。3年に1度の「かめやま文化年」開催年のみ募集する変則的な公募サイクル。次回は2027年度見込み。'),
  P('suzuka_machizukuri', '鈴鹿市まちづくり応援補助金（まちづくり事業部門／協働事業部門）', '鈴鹿市（地域振興部地域協働課）', '三重県鈴鹿市', '令和8年度分は締切済み（まちづくり事業部門3/2〜3/31、協働事業部門3/2〜4/30）。次回は例年同時期と推測・要確認', false, 'ふみだそうコース: 定額5万円（10/10）／そだてようコース: 上限20万円（9/10以内、公開プレゼン審査）／さかせようコース（協働事業部門）: 上限30万円（10/10、公開プレゼン審査）', '原則精算払い（事業実施前に資金が必要な場合は概算払いも可）', 'https://www.city.suzuka.lg.jp/kurashi/machi/1016219/1016224.html', ['団体構成員3名以上、市民活動団体等（個人不可）', '定款・規約または会則等を有すること'], '一般のまちづくり応援補助金だが、過去に劇団の20周年記念演劇公演（20万円）が採択された実績あり。'),
];

const ids = new Set(programs.map((p) => p.id));
let added = 0;
for (const p of add) if (!ids.has(p.id)) { programs.push(p); added++; }
writeFileSync(path, JSON.stringify(programs) + '\n');
console.log(`added ${added}. total=${programs.length}`);
