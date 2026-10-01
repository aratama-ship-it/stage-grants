// 京都府内・大阪府内の残り市を追加（豊中市・長岡京市）。一次検証は data/verified_kansai2_2026-07-17.md。
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
  P(
    'toyonaka_shien',
    '豊中市 文化芸術活動支援助成金',
    '豊中市（都市活力部文化芸術課）',
    '大阪府豊中市',
    '例年7月頃募集（直近の募集時期は要確認）',
    false,
    '個人 上限10万円／団体 上限20万円',
    '未確認',
    'https://www.city.toyonaka.osaka.jp/jinken_gakushu/bunka/sienjosei.html',
    [
      '個人は市内在住・在勤・在学、団体は市内で活動実績があること',
      '1年以上の文化芸術活動実績があり、出演料・チケット収入等の文化芸術活動に関わる収入があること',
      '地域の人々を元気にする芸術作品等の制作が対象',
    ],
    '個人が申請できる市レベル制度。別途「豊中市文化芸術振興助成金」（1/2以内・上限100万・子ども向け機会創出等）もあるが対象者詳細は未確認のため今回は見送り。',
  ),
  P(
    'nagaokakyo_shorei',
    '長岡京市文化奨励事業補助金',
    '長岡京市',
    '京都府長岡京市',
    '10月1日〜翌年3月20日実施事業が対象（募集時期は例年あり・要確認）',
    false,
    '上限50万円（補助率は未確認）',
    '未確認',
    'https://www.city.nagaokakyo.lg.jp/0000012313.html',
    [
      '市民に広く公開される文化・芸術活動が対象（文学・音楽・美術・写真・演劇・舞踊・伝統芸能等）',
      '1団体につき年1回のみ申請可（★団体向けの制度である可能性が高く、個人の可否は要確認）',
      '実施期間は10月1日〜翌年3月20日',
    ],
    '個人可否・補助率は公開情報からは未確認。',
  ),
];

const ids = new Set(programs.map((p) => p.id));
let added = 0;
for (const p of add) if (!ids.has(p.id)) { programs.push(p); added++; }
writeFileSync(path, JSON.stringify(programs) + '\n');
console.log(`added ${added}. total=${programs.length}`);
