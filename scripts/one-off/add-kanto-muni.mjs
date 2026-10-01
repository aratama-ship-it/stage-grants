// 関東圏の市区固有制度19件を追加（一回限り）。検証は data/verified_kanto_muni_2026-07-17.md。
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
  // ===== 東京23区 =====
  P('taito_shien', '台東区芸術文化支援制度', '台東区', '東京都台東区', '例年4〜5月（令和8年度分は終了）', false, '総額240万円を上限', '未確認', 'https://www.city.taito.lg.jp/bunka_kanko/bunkasien/shienikusei/shienseido/index.html', ['個人・団体とも可（在住/在勤要件なし・区外者も可・法人格不要）', '台東区内で実施し区の文化資源を活用', 'プロのアーティストの関与が条件'], '「市民プロデューサー」も対象。'),
  P('itabashi_katsudo', '板橋区 文化活動助成事業', '板橋区文化・国際交流財団', '東京都板橋区', '第2期 2026-08-01〜08-31（募集予定）', false, '一律10万円（対象経費10万円未満は実費）', '未確認', 'https://www.itabashi-ci.org/cul/joins/008.html', ['板橋区民が自主的に行う文化活動（個人・団体）', '広く区民を対象・先着順', '教室の発表会・定例の催しは対象外']),
  P('setagaya_chiiki', '世田谷区 地域文化芸術振興事業補助金', '世田谷区', '東京都世田谷区', '例年4月（令和8年度は未公表）', false, '上限20万円（オンライン10万）・1/2以内', '未確認', 'https://www.city.setagaya.lg.jp/', ['団体のみ（区内在住/在勤/在学者で構成・小団体可）', '事務所または主な活動拠点が区内', 'まちのにぎわい・魅力づくり']),
  P('shinagawa_kasseika', 'しながわ文化活性化事業助成金', '品川区', '東京都品川区', '例年2〜3月（説明会参加が必須）', false, '上限50万円・1/2', '未確認', 'https://www.city.shinagawa.tokyo.jp/', ['団体のみ（法人格 or 実績ある任意団体）', '区内実施・区民が文化芸術に触れる事業', '定款・執行・会計組織の確立']),
  P('sumida_katsudo', 'すみだ文化芸術活動助成', '墨田区文化振興財団', '東京都墨田区', '例年1月（令和8年度分は終了）', false, '上限100万円・1/2以内', '未確認', 'https://www.sumida-bunka.jp/category/sumida_grant/', ['団体のみ（5人以上・区民が主体）', '区内に主たる事務所または活動拠点', '原則1年以上の継続実績']),
  P('chiyoda_bunkajigyo', '千代田区 文化事業助成', '千代田区', '東京都千代田区', '例年1〜2月（令和8年度分は終了）', false, '上限200万円（人件費4/5・会場費9/10）', '未確認', 'https://www.city.chiyoda.lg.jp/koho/bunka/bunka/joseiboshu.html', ['非営利団体のみ（個人は対象外）', '区内に拠点があり区内・隣接区で開催', '区民無料または優先枠。1団体年1事業（最大3年）']),
  P('toshima_ouendan', 'としま文化応援団（助成事業）', '豊島区', '東京都豊島区', '要確認', false, '上限50万円・2/3以内', '未確認', 'https://toshima-bunka-ouendan.com/', ['団体（個人不可）', '子どもたちに文化芸術体験を届ける事業']),
  // ===== 神奈川（横浜以外） =====
  P('sagamihara_happyo', '相模原市 文化芸術発表・交流活動支援事業', '相模原市', '神奈川県相模原市', '複数期あり（第2期の締切は要確認）', false, '上限15万円・1/2以内（令和8年度）', '事後払い（実績報告後）', 'https://www.city.sagamihara.kanagawa.jp/kankou/bunka/1003559/1003564.html', ['個人・団体いずれも可（18歳以上・市内在住/在勤/在学）', '市民の自主的・創造的な発表活動（公演・展示・配信等）', '一般公開・非営利']),
  P('yamato_mahoroba', '大和市 文化芸術活動支援補助金（まほろば基金）', '大和市', '神奈川県大和市', '例年6月（令和8年度分は終了）', false, '定額 最大40万円（対象経費20万円以上）', '未確認', 'https://www.city.yamato.lg.jp/', ['市民および団体（個人も可と読める）', '舞台公演・演奏会等の文化芸術活動', '機材購入・運営費・賞金は対象外']),
  P('fujisawa_dantai', '藤沢市 文化芸術活動団体事業助成金', '藤沢市みらい創造財団', '神奈川県藤沢市', '例年1〜2月（令和8年度分は終了）', false, '上限50万円・1/2以内', '未確認', 'https://f-mirai.jp/', ['団体のみ（個人不可・市内に活動本拠）', '規約・経理監査組織が確立された広域的団体', '一般公開事業（会員限定は不可）']),
  P('yokosuka_shogai', '横須賀市 文化及び生涯学習事業助成', '横須賀市生涯学習財団', '神奈川県横須賀市', '2026-07-31（受付中）', true, '未確認（財団の後援事業に経費の一部）', '未確認', 'https://manabikan.net/sien.html', ['市内のグループおよび個人が対象', '広く市民に公開される文化・生涯学習事業', '財団の後援名義事業であること']),
  // ===== 埼玉（さいたま以外） =====
  P('kawaguchi_shinko', '川口市 文化振興助成事業', '川口市', '埼玉県川口市', '例年1〜2月（令和8年度分は終了）', false, '成果発表20万／刊行物10万・1/2以内', '未確認', 'https://www.city.kawaguchi.lg.jp/soshiki/01060/035/oshirase/41726.html', ['個人可（市内在住/在勤/在学 or 概ね4回以上の活動実績）', '成果発表事業・刊行物発行事業', '出演者・参加者に市内関係者を含む']),
  P('kawagoe_machidukuri', '川越市 文化芸術によるまちづくり事業費補助金', '川越市', '埼玉県川越市', '例年5月（令和8年度分は終了）', false, '上限10万円・1/3', '精算後払い', 'https://www.city.kawagoe.saitama.jp/kurashi/bunka/1003384/1003391/1003392.html', ['非営利の市民団体（実行委員会可・個人不可）', '5人以上・構成員の過半数が市民', '新規開催で鑑賞・体験参加の機会がある事業']),
  P('fukaya_dantai', '深谷市 文化団体活動事業補助金', '深谷市', '埼玉県深谷市', '例年6月（令和8年度分は終了）', false, '上限50万円・1/2', '未確認', 'https://www.city.fukaya.saitama.jp/soshiki/kyoiku/bunka/tanto/16408.html', ['団体のみ（個人不可・複数分野を統括する文化団体）', '市内に活動拠点・構成員の2/3以上が市内関係者', '入場料を徴収しない一般公開事業']),
  // ===== 千葉（千葉市以外） =====
  P('funabashi_shien', '船橋市 文化芸術活動支援補助金', '船橋市', '千葉県船橋市', '例年4〜5月（令和8年度分は終了）', false, '拡大30万／育成30万／大規模150万・2/3以内', '精算払（後払い）', 'https://www.city.funabashi.lg.jp/gakushu/004/p145101.html', ['個人・団体いずれも可（法人格不要・市内在住等）', '市内で実施し成果が市に広く波及する非営利事業', '育成事業は連続3年度まで（複数年支援）']),
  P('chiba_tsuchiya', '土屋文化振興財団 助成事業', '土屋文化振興財団（松戸市）', '千葉県', '2026-08-03（受付中・郵送消印有効）', true, '1件100万円以内', '未確認', 'http://www.tsuchiya-zaidan.or.jp/', ['千葉県在住または県内で活躍する個人・団体', '1度受給した者は再申請不可'], '松戸拠点の民間財団だが千葉県全域が対象。'),
  // ===== 北関東 =====
  P('tsukuba_kaijo', 'つくば市 芸術文化事業会場費補助金', 'つくば市', '茨城県つくば市', '第1回4月・第2回9月〜（令和8年度）', false, '上限5万円・1/2以内（会場費補助）', '未確認', 'https://www.city.tsukuba.lg.jp/soshikikarasagasu/shimimbubunkageijutsuka/gyomuannai/1/3/1001614.html', ['団体のみ（個人不可・つくば市民を半数以上含む非営利団体）', '公演・展覧会事業', '参加費・入場料を徴収しない事業']),
  P('oyama_shinko', '小山市 文化芸術振興活動事業助成金', '小山市', '栃木県小山市', '要確認（年度公募）', false, '若手育成 1人年最大50万／その他 対象経費の2/3', '概算払い可（第1・2号事業）', 'https://www1.g-reiki.net/oyama/reiki_honbun/e109RG00001549.html', ['市内在住・本市出身・市内中心に活動する市民団体等（個人可）', '創造普及／文化財保存活用／人材育成（若手芸術家育成）', '申請者が主催者本人・冠公演でない']),
  P('maebashi_shorei', '前橋市 文化芸術活動奨励金', '前橋市（審査: アーツカウンシル前橋）', '群馬県前橋市', '例年5月（次回は2026-05-29〆予定）', false, '個人上限5万／団体上限10万', '原則後払い（事前概算払い請求も可）', 'https://www.city.maebashi.gunma.jp/5/48892.html', ['個人・団体いずれも可（住所地または活動拠点が市内）', '全ジャンル（芸術・メディア芸術・伝統芸能・生活文化等）', '出演料・講師謝礼・企画料・調査費等に充当可']),
];

const ids = new Set(programs.map((p) => p.id));
let added = 0;
for (const p of add) if (!ids.has(p.id)) { programs.push(p); added++; }
writeFileSync(path, JSON.stringify(programs) + '\n');
console.log(`added ${added}. total=${programs.length}`);
