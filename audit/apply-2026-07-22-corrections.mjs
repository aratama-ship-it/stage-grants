import { readFile, writeFile } from 'node:fs/promises';

const DATA_PATH = new URL('../data/programs.data.json', import.meta.url);
const VERIFIED = '2026-07-22';
const SOURCE = '主催者・自治体公式ページ';

const corrections = {
  affinis: {
    deadline: '2026年度助成対象決定済み（次回募集日程は要確認）',
    dlUrgent: false,
    src: 'https://www.affinis.or.jp/',
    note: '公式サイトリニューアルにより旧詳細URLがトップへ転送されるため、公式トップに更新。',
  },
  jcmf: {
    deadline: '2027年度：2026年9月1日〜10月31日必着（受付予定）',
    dlUrgent: false,
  },
  kikin_eigasai: {
    src: 'https://www.ntj.jac.go.jp/grant/',
  },
  kikin_dento: {
    src: 'https://www.ntj.jac.go.jp/grant/',
  },
  okayama_fukutake: {
    deadline: '2026年度応募受付終了（次回は要確認）',
    dlUrgent: false,
    src: 'https://www.fukutake.or.jp/',
  },
  kitami_kansho: {
    deadline: '令和8年度・随時募集中（予算の範囲内）',
    dlUrgent: true,
    note: '団体限定。小規模な芸術文化鑑賞事業が対象。',
  },
  hachinohe_machizukuri: {
    deadline: '2026年12月28日まで（4月10日受付開始）',
    dlUrgent: true,
    note: '個人・団体いずれも申請可。1申請者につき年度1回。',
  },
  himeji_kaijohi: {
    deadline: '通年受付（事業実施日の3か月前から1か月前まで）',
    dlUrgent: true,
    note: '個人・団体いずれも申請可。対象は市有文化施設の使用料。',
  },
  kurashiki_bunka_shinko: {
    deadline: '一般枠：次回2026年9月1日〜30日／全国大会等参加助成：随時',
    dlUrgent: true,
    note: '個人・団体いずれも申請可。現時点で随時受付なのは全国大会等参加助成。',
  },
  higashihiroshima_kurara: {
    deadline: '2026年4月1日〜2027年3月10日必着',
    dlUrgent: true,
    note: '東広島芸術文化ホールくらら大ホールで実施する事業が対象。',
  },
  yonago_art_start: {
    deadline: '現行の募集時期は公式ページに記載なし（要問い合わせ）',
    dlUrgent: false,
    note: '公式ページは制度と問い合わせ先の案内のみで、現在受付中とは判定していない。',
  },
  sakaiminato_art_start: {
    deadline: '事業開始日の30日前まで（事前連絡必須）',
    dlUrgent: true,
  },
  matsue_dentou_bunka: {
    deadline: '令和8年度の受付期間は公式ページに明記なし（事前問い合わせ）',
    dlUrgent: false,
    note: '令和8年度の制度ページは公開中だが、受付期間を確定できないため「受付中」扱いにしていない。',
  },
  uwajima_bunka_geijutsu: {
    deadline: '令和8年度・随時受付（予算上限で終了の可能性あり）',
    dlUrgent: true,
  },
  narashino_geibunkyo_kaijohi: {
    deadline: '2026年4月1日〜2027年2月26日',
    dlUrgent: true,
  },
  koga_matsuoka_bunka: {
    deadline: '申請時期は公式要綱に明記なし（古河市へ要問い合わせ）',
    dlUrgent: false,
  },
  sano_geijutsu_bunka: {
    deadline: '5万円申請は随時受付／通常募集は9〜10月（次年度実施事業）',
    dlUrgent: true,
  },
  ashikaga_geibun_zaidan: {
    deadline: '募集時期は公式ページに明記なし（事前問い合わせ）',
    dlUrgent: false,
  },
  takasaki_dentou_geinou: {
    deadline: '備品は令和8年度締切済み／活動は事前相談のうえ事業実施前に申請（予算上限あり）',
    dlUrgent: true,
  },
  fujioka_chiiki_community: {
    deadline: '申請期限は公式ページに明記なし（事前相談）',
    dlUrgent: false,
  },
  shingu_bunka_katsudo: {
    deadline: '2027年1月31日まで（予算上限で締切）',
    dlUrgent: true,
  },
  tottori_dentou_bihin: {
    deadline: '2026年4月1日から受付（締切日の記載なし、事業開始前に申請）',
    dlUrgent: true,
  },
  nikko_shimin_machizukuri: {
    deadline: '2027年1月31日まで（予算の範囲内）',
    dlUrgent: true,
  },
  tsuruoka_machikatsu: {
    deadline: '基本コース後期：2026年7月31日まで',
    dlUrgent: true,
  },
  itabashi_katsudo: {
    deadline: '第2期：2026年8月1日〜31日（受付予定）',
    dlUrgent: false,
  },
  matsudo_shimin_katsudo: {
    deadline: '2026年8月1日〜9月30日（令和9年度実施分）',
    dlUrgent: false,
    src: 'https://www.city.matsudo.chiba.jp/kurashi/shiminkatsudou/kyoudou_machidukuri/jyosei/josei_r9.html',
  },
  shirakawa_bunka_shinko: {
    deadline: '2026年9月30日まで（6月1日〜2027年3月末実施分）',
    dlUrgent: true,
  },
  katsushika_art: {
    deadline: '事業開始日の1か月前までに事前相談（2026年度実施事業）',
    dlUrgent: true,
    src: 'https://www2.city.katsushika.lg.jp/tourism/1002757/1030209/1023621.html',
  },
  sagamihara_happyo: {
    deadline: '2026年度の募集は終了（第2期交付申請も7月10日締切）',
    dlUrgent: false,
  },
  yamaguchi_ycfcp: {
    deadline: '2026年度募集終了（2026年3月30日締切）',
    dlUrgent: false,
    amount: '対象経費の1/2以内・上限20万円',
    src: 'https://www.ycfcp.or.jp/post-2411/',
  },
  toyonaka_shien: {
    name: '豊中市文化芸術振興助成金',
    funder: '豊中市（都市活力部魅力文化創造課）',
    deadline: '2026年度募集終了（2月2日〜3月4日17:00）',
    dlUrgent: false,
    amount: '一般枠：対象経費の1/2以内・上限100万円／クラウドファンディング枠：申込額が上限',
    src: 'https://www.city.toyonaka.osaka.jp/jinken_gakushu/bunka/miryokujosei/aaaa.html',
    note: '個人・団体いずれも申請可。事務所や活動拠点の所在地は問わない。',
    conditions: [
      '個人・団体いずれも申請可（活動拠点の所在地は不問）',
      '豊中市内で自ら実施する非営利の文化芸術事業',
      '子どもの文化芸術参加機会、または新たな魅力・価値の発見を目指す事業',
    ],
  },
  nagaokakyo_shorei: {
    deadline: '令和8年度は採択事業発表済み（募集終了、次回日程は要確認）',
    dlUrgent: false,
    src: 'https://www.city.nagaokakyo.lg.jp/0000015782.html',
    note: '令和8年度の公式採択事業一覧を確認。次回の募集要項・日程は未公表。',
  },
  akita_genki_hojo: {
    deadline: '令和8年度分は締切済み（7月15日締切）。次回は未確認',
    dlUrgent: false,
    src: 'https://www.pref.akita.lg.jp/pages/archive/97200',
    note: '令和8年度追加募集は7月15日17時必着で終了。',
  },
};

const verifiedIds = new Set([
  'affinis', 'jcmf', 'okayama_fukutake',
  'kitami_kansho', 'hachinohe_machizukuri', 'himeji_kaijohi',
  'kurashiki_bunka_shinko', 'higashihiroshima_kurara', 'yonago_art_start',
  'sakaiminato_art_start', 'matsue_dentou_bunka', 'uwajima_bunka_geijutsu',
  'narashino_geibunkyo_kaijohi', 'koga_matsuoka_bunka', 'sano_geijutsu_bunka',
  'ashikaga_geibun_zaidan', 'takasaki_dentou_geinou', 'fujioka_chiiki_community',
  'shingu_bunka_katsudo', 'tottori_dentou_bihin', 'nikko_shimin_machizukuri',
  'tsuruoka_machikatsu', 'itabashi_katsudo', 'matsudo_shimin_katsudo',
  'shirakawa_bunka_shinko', 'katsushika_art', 'sagamihara_happyo',
  'yamaguchi_ycfcp', 'toyonaka_shien', 'akita_genki_hojo',
]);

const programs = JSON.parse(await readFile(DATA_PATH, 'utf8'));
const seen = new Set();

for (const program of programs) {
  const correction = corrections[program.id];
  if (!correction) continue;
  Object.assign(program, correction);
  if (verifiedIds.has(program.id)) {
    program.verified = VERIFIED;
    program.verificationSource = SOURCE;
  }
  seen.add(program.id);
}

const missing = Object.keys(corrections).filter((id) => !seen.has(id));
if (missing.length) throw new Error(`Missing program ids: ${missing.join(', ')}`);

await writeFile(DATA_PATH, `${JSON.stringify(programs)}\n`);
console.log(`Applied ${seen.size} corrections; ${verifiedIds.size} manually verified.`);
