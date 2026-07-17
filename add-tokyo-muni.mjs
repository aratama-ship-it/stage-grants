// 東京の区市（残り）の固有制度8件を追加。検証は data/verified_tokyo_muni_2026-07-17.md。
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
  P('chuo_suishin', '中央区文化推進事業助成', '中央区文化・国際交流振興協会', '東京都中央区', '例年10〜11月（令和8年度分は進行中）', false, '創造・発信 上限200万（自己負担1割）／団体活動 上限40万（自己負担5割）', '未確認', 'https://www.chuo-ci.jp/boshu/', ['区民・団体が対象（団体活動助成は活動歴3年以上の団体）', '「中央区らしさ」を有する文化の創造・発信事業', '区民への文化振興・発信']),
  P('katsushika_art', '葛飾区アートイベント助成', '葛飾区', '東京都葛飾区', '令和8年度実施中（事前相談必須）', false, '対象経費の1/2以内・上限50万円', '未確認', 'https://www.city.katsushika.lg.jp/tourism/1002757/1030209/1023621.html', ['区内で活動する文化芸術団体（法人格の有無問わず）', '区民を対象とするアートイベント（★音楽イベントは除く）', '事前相談が必須'], '音楽イベントは対象外。', ['舞台', '美術', '映像', '文芸・伝統芸能']),
  P('adachi_enchare', '足立区 えんチャレ（エンターテイメントチャレンジャー支援）', '足立区', '東京都足立区', '年2回募集（実演審査あり）', false, '施設の無料貸出（現金助成でない）', '現物支援（東京芸術センター等の無料貸出）', 'https://www.city.adachi.tokyo.jp/bunka/chiikibunka/bunka/enchare.html', ['原則18歳以上・プロまたはプロ志望の個人もしくは団体', '区内外問わず可（芸能事務所等の法人は除く）', 'ホール・地域学習センターを練習・公演の場として無料貸出']),
  P('nakano_seisaku', '中野区 区民公益活動助成（政策助成）', '中野区', '東京都中野区', '例年4月上旬（令和8年度分は終了）', false, '上限20万円・補助率2/3（チャレンジ基金は10/10）', '未確認', 'https://www.city.tokyo-nakano.lg.jp/kurashi/chiiki/kumin-josei/kuminkoekikatsudo.html', ['区民が自主的に組織する非営利団体（個人不可）', '「学習、文化・芸術の振興及び国際交流」が対象領域', '1年以上の公益活動実績'], '一般の区民公益活動助成（文化・芸術が対象領域に明記）。'),
  P('shinjuku_kyodo', '新宿区 協働推進基金助成金（一般事業助成）', '新宿区', '東京都新宿区', '例年4月（令和8年度分は終了）', false, '上限50万円・補助率2/3', '未確認', 'https://www.city.shinjuku.lg.jp/seikatsu/chiiki01_001012.html', ['NPO・ボランティア活動団体等（個人不可）', '地域課題解決を目的とする事業', '文化・芸術系NPOの採択実績あり'], '一般の公益活動助成（文化芸術専用ではないが文化芸術も対象になりうる）。'),
  P('tachikawa_machidukuri', '立川文化芸術のまちづくり事業補助金・奨励金', '立川市地域文化振興財団', '東京都立川市', '例年3〜4月（令和8年度分は終了）', false, '上限50万円・補助率3/4→2/3→1/2', '精算払（後払い）', 'https://www.tachikawa-chiikibunka.or.jp/', ['団体のみ（構成員5人以上・個人不可）', '主たる活動の場が立川市内', '同一事業への交付は通算3回まで']),
  P('kunitachi_shinko', '国立市文化芸術振興補助金', '国立市', '東京都国立市', '例年5〜6月（令和8年度分は終了）', false, '補助基本額の3/4以内・上限15万円', '精算払（後払い）', 'https://www.city.kunitachi.tokyo.jp/soshiki/Dept08/Div03/Sec01/gyomu/0076/bunka_geijyutsu/9390.html', ['市内の団体のみ（個店・個人は対象外）', 'コンサート・展覧会・上映会・演劇/ダンス等（市内実施・鑑賞者10名超）', 'コンクール・発表会・講演のみは対象外']),
  P('nishitokyo_kodomo', '西東京市 子どもの文化芸術事業補助金／伝統文化継承事業補助金', '西東京市', '東京都西東京市', '年度募集（詳細は要確認）', false, '未確認', '未確認', 'https://www.city.nishitokyo.lg.jp/soshiki/bunkasports/bunka/index.html', ['市内で行う子どもの文化芸術事業、または伝統芸能・民俗芸能の継承事業', '対象者区分・上限額は要確認'], '子ども向け・伝統継承の特化枠（一般の個人向け創作助成は確認できず）。'),
];

const ids = new Set(programs.map((p) => p.id));
let added = 0;
for (const p of add) if (!ids.has(p.id)) { programs.push(p); added++; }
writeFileSync(path, JSON.stringify(programs) + '\n');
console.log(`added ${added}. total=${programs.length}`);
