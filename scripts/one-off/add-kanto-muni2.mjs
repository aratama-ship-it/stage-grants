// 関東の残り市を再深掘り（第2弾）。一次検証は data/verified_kanto_muni2_2026-07-17.md。
// 今回の一次調査（約26市）で新規に確認できた市固有の文化芸術助成は 秦野市・熊谷市 の2件のみ。
// 多くの市は「独自助成なし」または「国／県（芸術文化振興基金・いばらき文化振興財団等）の案内ページのみ」だった。
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
    'hadano_kikin',
    '秦野市文化振興基金活用事業助成制度',
    '秦野市（文化スポーツ部 文化振興課）',
    '神奈川県秦野市',
    '2026年8月28日締切（令和8年度）',
    true,
    '個人 上限10万円／団体 上限30万円（対象経費・自己負担額の1/2以内）',
    '精算払（事業完了または年度終了後30日以内に事業実績報告書を提出）',
    'https://www.city.hadano.kanagawa.jp/www/contents/1522215215295/index.html',
    [
      '市内在住・在勤の個人、または市内に活動拠点を持つ団体（市の文化振興・普及に寄与すると認められる市外団体も対象になりうる）',
      '一般に公開され、その年度内に完了する文化芸術活動（作品発表・展示・公演・講演・シンポジウム等）',
      '政治・宗教・営利・法令違反を目的とする活動は対象外',
    ],
    '個人が単独で申請できる数少ない市レベルの制度。令和8年度は8月28日まで募集（タウンニュース2026-05-22で確認）。秦野市文化振興基金を活用。',
  ),
  P(
    'kumagaya_kikin',
    '熊谷市文化振興基金助成対象事業',
    '熊谷市（社会教育課）',
    '埼玉県熊谷市',
    '例年4月〜7月31日（最新年度の開催・締切は要確認）',
    false,
    '上限20万円',
    '未確認（市の助成のため精算払＝後払いの可能性が高いが要確認）',
    'https://www.city.kumagaya.lg.jp/kurashi/service/hojyojyoseikin/index.html',
    [
      '熊谷市民が自主的・自発的に行う文化活動',
      '申請は社会教育課へ（事前相談のうえ申請）',
      '個人／団体の別・在住要件の詳細は要確認',
    ],
    '熊谷市文化振興基金を活用した助成。前年度実績では4/1〜7/31募集・上限20万円。最新年度の要綱・対象者区分・支払方式は要確認。※別に民間の「熊谷正寿文化財団」の芸術助成（美術中心・別枠）も存在。',
  ),
];

const ids = new Set(programs.map((p) => p.id));
let added = 0;
for (const p of add) if (!ids.has(p.id)) { programs.push(p); added++; }
writeFileSync(path, JSON.stringify(programs) + '\n');
console.log(`added ${added}. total=${programs.length}`);
