// 盛岡市再検証で判明した岩手県文化振興事業団の詳細情報でiwate_bunshinエントリを更新。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(fileURLToPath(import.meta.url));
const path = join(ROOT, 'data/programs.data.json');
const programs = JSON.parse(readFileSync(path, 'utf8'));

const target = programs.find((p) => p.id === 'iwate_bunshin');
if (!target) throw new Error('iwate_bunshin not found');

target.amount = '区分により異なる（上限額あり、1万円未満切捨て）。文化活動成果発表事業・大会等参加事業・研修事業等: 1/2以内・上限100万円／若手芸術家・民俗芸能後継者等育成事業: 2/3以内・上限50万円（発表会開催時100万円）／障がい者芸術活動支援事業: 1/2以内・上限100万円。助成額が5万円未満と算定される事業は対象外';
target.deadline = '令和8年度分は締切済み（〜2/9）。募集ページは現在「締め切りました」表記。次回は例年12月頃告知・翌2月上旬締切と推測';
target.payment = target.cashflow = '原則精算払い（実績報告書提出後、団体名義口座へ振込。個人名義口座への振込は不可）。事業の性質上必要と認められる場合は前金払いも可（要件あり）';
target.conditions = [
  '区分により個人可否が異なる（「文化団体等」＝団体または個人と定義されるが、区分ごとに個別条件あり）',
  '例: 郷土研究誌の発行事業は個人不可／文化団体備品整備事業は広域団体等に限定',
  '成果発表・大会参加・研修・刊行物発行・団体備品整備等、幅広いメニューを用意',
];
target.note = '盛岡市文化国際課は市内応募者向けの提出取次窓口であり、実体は岩手県文化振興事業団の県レベル制度（盛岡市固有の別制度ではない）。2026-07-17に募集要項PDF原文で金額・支払方式を再確認・更新。';
target.src = 'https://www.iwate-bunshin.jp/cat03/r8_kikin/';

writeFileSync(path, JSON.stringify(programs) + '\n');
console.log('updated iwate_bunshin');
