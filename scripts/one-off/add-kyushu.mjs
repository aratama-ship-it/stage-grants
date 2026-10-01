// 九州の主要市を追加。一次検証は data/verified_kyushu_2026-07-17.md。
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
    'sasebo_cf',
    '佐世保市クラウドファンディング型プロジェクト応援事業（文化）補助金',
    '佐世保市（文化スポーツ部文化国際課）',
    '長崎県佐世保市',
    '第2次募集：2026年7月8日〜7月31日（受付中）',
    true,
    '1プロジェクト上限500万円。クラウドファンディングで集まった寄附額に、申請回数に応じて上乗せ（1回目は同額＝実質倍額、2回目2/3、3回目1/3、4・5回目は上乗せなし）',
    '精算払（概算払も可）',
    'https://www.city.sasebo.lg.jp/bunspo/bunkak/event/crowdfunding-boshur7.html',
    [
      '文化芸術活動を行う個人またはグループ・団体（法人含む）',
      '市内に住所地・団体所在地・活動場所のいずれかがあること。文化芸術事業の実施実績があること',
      '補助金交付は通算5回まで。申請前に市担当課の事前レクチャー受講が必須',
    ],
    '★個人可・現在まさに公募中（第2次募集は7/31締切）。クラウドファンディングで集めた寄附額を市が上乗せする方式で、上限500万円と九州の市レベルでは破格の規模。',
  ),
  P(
    'nobeoka_chiiki',
    '延岡市地域文化振興補助金',
    '延岡市（商工観光文化部歴史・文化都市推進課）',
    '宮崎県延岡市',
    '令和8年度分は締切済み（5/29）。令和9年度分は例年5月頃と推測・要確認',
    false,
    '通常事業: 補助率50%以内・上限30万円／10年単位の記念事業: 80%以内／市の重点施策テーマ該当事業: 100%以内（いずれも上限30万円）',
    '原則精算払（必要と認められた場合は概算払も可）',
    'https://www.city.nobeoka.miyazaki.jp/soshiki/93/48362.html',
    [
      '団体または個人（事業主催者）。市内に活動拠点・事務局を有し、会員の半数以上が延岡市住民であること',
      '文化・芸術活動の展示発表事業、芸術家・実演団体招聘による鑑賞事業、文化芸術交流事業',
      '年度内1団体・個人につき1事業のみ申請可。事前相談必須、外部有識者による検討会議でのプレゼン審査あり',
    ],
    '★個人可。市の重点施策テーマ（西南の役後150年・国スポ機運醸成等）に該当すると補助率100%まで上がる。',
  ),
  P(
    'miyakonojo_bunka',
    '都城市文化芸術振興補助金',
    '都城市（地域振興課文化振興担当）',
    '宮崎県都城市',
    '令和8年度分は締切済み（5/8）。令和9年度分は例年4月告知・5月上旬締切と推測・要確認',
    false,
    '補助対象経費－収入額の1/2以内（千円未満切捨て）・上限30万円。5万円未満の事業は対象外',
    '精算払（事業完了後3か月以内または年度末のいずれか早い日までに実績報告）',
    'https://www.city.miyakonojo.miyazaki.jp/soshiki/20/83649.html',
    [
      '団体のみ（個人不可）。文化・芸術活動を目的とし、市内を活動拠点とする団体。構成員の過半数が市内住所',
      '人材育成事業・研究調査活動事業・成果発表事業・外部講師招聘事業',
      '外部委託中心の事業、学校・企業主催の事業、稽古・習いごとの発表会は対象外',
    ],
    '団体限定。同市には別途「文化芸術全国大会等参加費補助金」（大会出場奨励型）もあるが制作助成でないため除外。',
  ),
  P(
    'beppu_ikusei',
    '別府市文化活動育成・奨励事業補助金',
    '別府市（文化国際課）',
    '大分県別府市',
    '創作・発表型は例年1月末締切（令和9年1月末見込み）',
    false,
    '参加人数に応じ上限額が変動: 20人未満10万円／20〜30人未満15万円／30〜40人未満20万円／40〜50人未満25万円／50人以上30万円（同一団体の年度合算上限30万円）',
    '精算払（事業完了後30日以内または年度末3/31のいずれか早い日までに実績報告）',
    'https://www.city.beppu.oita.jp/gakusyuu/bunkakatudou/detail1.html',
    [
      '団体のみ（個人不可）。設立後10年未満の団体、または市内学校に属する学生団体',
      '構成員の4分の3以上が別府市民、活動拠点が市内。継続活動見込みがあること',
      '同一団体・同一事業での交付は過去3回まで（学生団体を除く）',
    ],
    '団体限定。別枠で大会出場奨励型（旅費等1/2・上限30万）もあるが制作助成でないため除外。',
  ),
  P(
    'kagoshima_katsuseika',
    '鹿児島市文化芸術活動活性化補助金',
    '鹿児島市（市民文化部文化振興課）',
    '鹿児島県鹿児島市',
    '令和8年度分は締切済み（2025/12/1〜2026/2/2）。次回は例年12月頃募集開始と推測・要確認',
    false,
    '上限20万円・補助率1/2（対象経費×50%と対象経費－収入額のいずれか低い方）',
    '未確認',
    'https://www.city.kagoshima.lg.jp/shimin/shiminbunka/bunkashinko/bunka/bunka/jigyo/hojyokin2.html',
    [
      '団体のみ（個人での単独申請は不可）。市内に主たる事務所または活動拠点を有する文化芸術団体等（法人格不要）',
      '身近な場所での文化芸術鑑賞機会創出、異ジャンル融合創造事業、次代の担い手育成、地域文化財の保存活用継承等',
      '同一団体の通算交付は3回まで（3回受給後3年経過でさらに3回可）',
    ],
    '団体限定。個人アーティストは実行委員会形式などグループ化が前提と考えられる（要問合せ）。',
  ),
];

const ids = new Set(programs.map((p) => p.id));
let added = 0;
for (const p of add) if (!ids.has(p.id)) { programs.push(p); added++; }
writeFileSync(path, JSON.stringify(programs) + '\n');
console.log(`added ${added}. total=${programs.length}`);
