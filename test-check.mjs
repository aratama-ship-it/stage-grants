// check.html の判定ロジックのスモークテスト（node:vm でスクリプトを実行し、代表シナリオを検証）
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const ROOT = dirname(fileURLToPath(import.meta.url));
const site = process.argv[2] ? resolve(process.argv[2]) : ROOT;
const html = readFileSync(join(site, 'check.html'), 'utf8');
const source = JSON.parse(readFileSync(join(ROOT, 'data/programs.data.json'), 'utf8'));

// メインスクリプト（tracking系を除く）を抽出
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((s) => !s.includes('__SITE_TRACKING'));
const code = scripts.join('\n') + '\nglobalThis.__test = { get ALL_PROGRAMS() { return ALL_PROGRAMS; }, PROGRAMS, programsReady, assess, genericRulesFor };';

// 最小限のDOMスタブ
const el = () => ({
  innerHTML: '', textContent: '', value: '', disabled: true, classList: { toggle() {}, add() {}, remove() {} }, dataset: {}, onclick: null,
  replaceChildren(...options) { this.options = options; },
  addEventListener() {}, setAttribute() {}, getAttribute() { return 'false'; }, focus() {},
});
async function startChecker(fetch) {
  const elements = new Map();
  const getElementById = id => {
    if (!elements.has(id)) elements.set(id, el());
    return elements.get(id);
  };
  const sandbox = {
    document: { getElementById, querySelectorAll: () => [], querySelector: () => el(), addEventListener() {} },
    window: { scrollTo() {}, addEventListener() {}, innerWidth: 1024 },
    fetch,
    AbortController, setTimeout, clearTimeout,
    Option: function Option(label, value) { this.text = label; this.value = value; },
    console: { warn() {} },
  };
  vm.runInNewContext(code, sandbox);
  await sandbox.__test.programsReady;
  return sandbox.__test;
}

const deliveredById = new Map();
const { ALL_PROGRAMS, PROGRAMS, assess, genericRulesFor } = await startChecker(async url => ({
  ok: true,
  json() {
    const records = JSON.parse(readFileSync(join(site, url), 'utf8'));
    for (const record of records) deliveredById.set(record.id, record);
    return records;
  },
}));
const profile = (over = {}) => ({
  applicantKind: 'organization', legalForm: 'voluntary_association', foundedYear: 2021,
  age: 34, worksCreated: 5, prefecture: '東京都', city: '', genres: ['演劇'],
  paidPerfs3yr: 2, yearsActive: 4, wardPerfs: 0, activityType: 'self_produced_performance',
  venuePref: '東京都', totalBudget: 4500000, doubleFunding: 'no', ...over,
});

let fail = 0;
const t = (name, cond) => { if (cond) console.log('  ✓ ' + name); else { console.error('  ✗ ' + name); fail++; } };

console.log('1. 全件ロード');
const sourceIds = new Set(source.map(p => p.id));
t('すべての掲載IDを重複なく判定対象にする', ALL_PROGRAMS.length === source.length &&
  new Set(ALL_PROGRAMS.map(p => p.id)).size === sourceIds.size && ALL_PROGRAMS.every(p => sourceIds.has(p.id)));
t('最終確認日は YYYY-MM-DD 形式', source.every((p) => !p.verified || /^\d{4}-\d{2}-\d{2}$/.test(p.verified)));
t('最終確認済み案件には確認元がある', source.every((p) => !p.verified || Boolean(p.verificationSource)));
const byId = new Map(ALL_PROGRAMS.map(p => [p.id, p]));
t('個別ルールを保持する', PROGRAMS.every(p => !sourceIds.has(p.id) || byId.get(p.id)?.rules === p.rules));
t('個別ルールの制度にも配信データの締切を使う', PROGRAMS.every(p =>
  !sourceIds.has(p.id) || byId.get(p.id)?.deadline === deliveredById.get(p.id)?.deadline));
if (site !== ROOT) {
  t('公開データに全制度の受付状態を含む', ALL_PROGRAMS.every(p => Boolean(p.statusLabel)));
  t('一部受付の表示が一致する', source.filter(p => p.applicationStatus === 'partial').every(p => byId.get(p.id)?.statusLabel === '一部受付'));
}
const unavailable = await startChecker(async () => ({ ok: false, status: 404 }));
t('制度データが取得できない場合は内蔵の個別ルールだけで判定できる',
  unavailable.ALL_PROGRAMS === unavailable.PROGRAMS);

console.log('2. 全制度×代表プロファイルでエラーなく判定できる');
const profiles = [profile(), profile({ applicantKind: 'individual', genres: ['美術'] }), profile({ prefecture: '三重県', city: '津市', genres: ['文芸・伝統芸能'] }), profile({ prefecture: '愛媛県', city: '松山市', genres: ['音楽', '映像'] })];
let crashed = 0;
for (const pf of profiles) for (const pr of ALL_PROGRAMS) {
  try { const a = assess(pr, pf); if (!['eligible', 'needs_check', 'ineligible'].includes(a.verdict)) crashed++; }
  catch { crashed++; }
}
t(`${ALL_PROGRAMS.length}件×${profiles.length}プロファイル=全${ALL_PROGRAMS.length * profiles.length}判定がエラーゼロ`, crashed === 0);

console.log('3. 地域マッチング（汎用エンジン）');
const himeji = ALL_PROGRAMS.find((p) => p.id === 'himeji_bunka_katsudo');
t('姫路市民→姫路市制度は不一致にならない', assess(himeji, profile({ prefecture: '兵庫県', city: '姫路市', applicantKind: 'individual' })).verdict !== 'ineligible');
t('東京都民→姫路市制度は不一致', assess(himeji, profile()).verdict === 'ineligible');
t('兵庫県民(市未入力)→姫路市制度は要確認どまり', assess(himeji, profile({ prefecture: '兵庫県' })).verdict !== 'ineligible');

console.log('4. 誤FAIL対策（団体要件の扱い）');
const yokkaichi = ALL_PROGRAMS.find((p) => p.id === 'yokkaichi_shimin_bunka'); // 「個人不可」明記 → FAILでよい
const a1 = assess(yokkaichi, profile({ prefecture: '三重県', city: '四日市市', applicantKind: 'individual' }));
t('「個人不可」明記の制度は個人にFAIL', a1.verdict === 'ineligible');
const kashihara = ALL_PROGRAMS.find((p) => p.id === 'kashihara_shimin_katsudo'); // 「5人以上…個人不可」明記 → FAILが正しい
const a2 = assess(kashihara, profile({ prefecture: '奈良県', city: '橿原市', applicantKind: 'individual' }));
t('「個人不可」明記（橿原市）も個人にFAIL', a2.verdict === 'ineligible');
const synth = { rules: genericRulesFor({ region: '全国', genres: ['舞台'], conditions: ['5人以上の団体で構成されることが望ましい'] }) };
const a3 = assess(synth, profile({ applicantKind: 'individual' }));
t('人数要件のみ（個人不可の明記なし）は個人にFAILせず要確認', a3.verdict !== 'ineligible');
const kyoto = ALL_PROGRAMS.find((p) => p.id === 'kyoto_shorei'); // 「個人（1名）またはグループ（2名以上）」→ 個人OK明記
const a4 = assess(kyoto, profile({ prefecture: '京都府', city: '京都市', applicantKind: 'individual' }));
t('個人OK明記＋人数表記あり（京都市）は個人にFAILしない', a4.verdict !== 'ineligible');
t('個人OK明記の制度に「団体要件の可能性」を出さない', !a4.results.some((r) => /団体要件の可能性/.test(r.txt)));

console.log('5. ジャンル判定（未検証の一括タグは美術/映像/文芸をCHECKに倒す）');
const generic5 = ALL_PROGRAMS.find((p) => p.generic && p.genres.length === 5);
const g1 = assess(generic5, profile({ genres: ['美術'], prefecture: '東京都' }));
t('5ジャンル一括タグ制度で美術選択→ジャンル項目がPASSでなくCHECK', g1.results.some((r) => r.result === 'needs_check' && /対象分野/.test(r.txt)));

console.log('6. 個別ルール（手厚い66件）が壊れていない');
const act = ALL_PROGRAMS.find((p) => p.id === 'act_c1');
t('都内団体・演劇→ACT-Iは該当可能性あり', assess(act, profile()).verdict === 'eligible');
t('都外→ACT-Iは不一致', assess(act, profile({ prefecture: '大阪府' })).verdict === 'ineligible');
const pola = ALL_PROGRAMS.find((p) => p.id === 'pola_zaigai');
t('39歳個人・美術→ポーラ在外研修は不一致でない', assess(pola, profile({ applicantKind: 'individual', age: 39, genres: ['美術'] })).verdict !== 'ineligible');
t('45歳個人・美術→ポーラ在外研修は年齢で不一致', assess(pola, profile({ applicantKind: 'individual', age: 45, genres: ['美術'] })).verdict === 'ineligible');

if (fail) { console.error(`\nNG: ${fail}件失敗`); process.exit(1); }
console.log('\nOK: 全テスト通過');
