// 高知県の主要市を追加。一次検証は data/verified_kochi_2026-07-18.md。
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
  P('kochi_machizukuri_fund', '公益信託 高知市まちづくりファンド', '高知市（受託: 株式会社四国銀行）', '高知県高知市', '令和8年度分は締切済み（4/1〜6/8）。次回は例年4月頃〜6月上旬と推測・要確認', false, 'コースにより異なる: 学生まちづくり=上限5万円／ふくしでまちづくり・はじめの一歩=各上限10万円／一歩前へ=上限30万円／拠点整備=上限100万円／たまご=上限3万円。いずれも助成率100%', '選考結果に基づき速やかに交付（前払いに近い運用。拠点整備コースのみ金額確定をもって給付）', 'https://kochi-machifun.org/course/', ['活動拠点が高知市内にある18歳以上の構成員3名以上の団体（個人不可）。構成員の1/3以上が高知市民', '市民の自主的なまちづくり活動全般が対象（文化芸術専用ではない）'], '文化芸術専用ではない一般のまちづくり助成金だが、過去に落語会・音楽ステージ等の文化芸術系活動の採択実績あり。助成率100%で決定後速やかに交付という前払いに近い運用が貴重。'),
  P('kami_teiannagata', '香美市提案型市民主役事業補助金', '香美市（地域創生課政策調整係）', '高知県香美市', '令和8年度分は締切済み（5/19〜6/19）。次回は例年5〜6月頃と推測・要確認', false, 'チャレンジコース: 補助率100%・上限20万円（書類審査のみ）／にぎわいコース: 補助率80%・上限100万円（書類提出＋審査会での提案説明）', '概算払い制度あり（事業実施前に一部受領可）。事業完了後は実績報告書提出のうえ精算', 'https://www.city.kami.lg.jp/soshiki/4/teianngata.html', ['5人以上で構成され、構成員の半数以上が市内在住/在勤/在学、活動拠点が市内にある団体（個人不可）', '活用例として「音楽イベント」「アートイベント」が公式ページに明記'], '対象活用例に音楽・アートイベントが明記。概算払い（一部前払い）に対応。'),
  P('shimanto_shimantopia', 'しまんとぴあ市民企画応援事業', '四万十市総合文化センター しまんとぴあ（指定管理者: 株式会社ケイミックスパブリックビジネス）', '高知県四万十市', '令和8年度分は締切済み（5/8〜6/25）。次回は例年春頃と推測・要確認', false, 'プランA（ロビー活用企画）: 会場費免除＋企画制作費支援 最大5万円／プランB（ホール活用企画、2団体以上の出演・協働が推奨）: 会場費免除＋企画制作費支援 最大10万円', '運営補助金として精算払い（企画終了後、報告書・領収書提出後に支払額確定。個人・任意団体への支払いは源泉徴収あり）', 'https://www.city.shimanto.lg.jp/site/shimantopia/', ['四万十市内または幡多地域を拠点に活動し、市内在住/在勤/在学の人が在籍する3名以上の団体、または個人も可', '原則オリジナル公演であること。市民が企画・出演・当日運営を担うこと', '代表者が未成年の場合は成人との連名が必須'], '★個人可。市の文化施設が運営する企画支援で、会場費免除＋公演制作アドバイス・広報協力も付帯。過去にオペラコンサート等の実績あり。'),
];

const ids = new Set(programs.map((p) => p.id));
let added = 0;
for (const p of add) if (!ids.has(p.id)) { programs.push(p); added++; }
writeFileSync(path, JSON.stringify(programs) + '\n');
console.log(`added ${added}. total=${programs.length}`);
