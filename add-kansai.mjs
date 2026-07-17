// 関西圏（兵庫・堺市・和歌山・神戸市）の文化芸術助成を追加。一次検証は data/verified_kansai_2026-07-17.md。
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
    'hyogo_kikai',
    '兵庫県 芸術文化活動機会促進事業',
    '兵庫県（県民生活部文化スポーツ局芸術文化課）',
    '兵庫県',
    '例年3月頃募集（令和8年度分は3/16募集開始・予算到達により終了済み）',
    false,
    '未確認（対象経費に応じた定額または補助率制。上限額は要確認）',
    '未確認',
    'https://web.pref.hyogo.lg.jp/kk18/ac13_000000022.html',
    [
      '県内に活動拠点を有し、県内で一定の芸術文化活動の経歴を有する個人・団体',
      '対象事業: 音楽・演劇・舞踊等の公演、美術作品等の展示、メディア芸術の発表、文芸作品等の出版',
      '令和8年度分は予算額到達のため募集終了（次回は例年3月頃）',
    ],
    '個人が申請できる数少ない県レベル制度。助成額の具体的な上限・補助率は、類似する兵庫県の別事業（地域で親しむ舞台芸術応援事業等）と情報源が混在しており公開情報だけでは確定できず要確認。',
  ),
  P(
    'sakai_ouen',
    '堺市文化芸術活動応援補助金',
    '堺市',
    '大阪府堺市',
    '令和8年度分は2025年12月23日締切（終了）。次回は例年11月頃案内',
    false,
    'スタートアップ支援事業: 上限10万円（対象経費の1/2以内）／地域文化活動ステップアップ支援事業: 上限50万円（1/2以内）／市民文化活動推進事業: 上限100万円／都市魅力創造事業: 上限300万円',
    '未確認',
    'https://www.city.sakai.lg.jp/kanko/bunka/art_katsudoshien/bunka_ouenhojyo/r8/R8bosyu.html',
    [
      '個人・団体が対象（申請者の住所・所在地は問わず、堺市内で事業を実施すること）',
      '対象分野: 音楽・美術・写真・演劇・舞踊・文学・映画等のメディア芸術・芸能・伝統芸能・茶道・華道・書道等',
      '事務運営管理費は補助対象外',
    ],
    '4段階の補助区分あり。スタートアップ支援事業（個人・小規模向け・上限10万）が最も申請しやすい。令和8年度分は締切済み（次回は例年11月頃）。',
  ),
  P(
    'wakayama_bunka',
    '和歌山県文化振興事業補助事業',
    '和歌山県（企画政策局文化学術課）',
    '和歌山県',
    '例年2〜3月募集（令和7年度は2/3〜3/4）。令和8年度分の日程は要確認',
    false,
    '補助率1/2（上限額は公開情報からは未確認）',
    '未確認',
    'https://www.pref.wakayama.lg.jp/prefg/022100/kominrenkei/kominrenkei.html',
    [
      '県民の自主的かつ主体的な文化活動が対象',
      '文化活動の普及・向上、地域の活性化に寄与する事業',
      '対象者が個人限定か団体限定かは公開情報からは要確認',
    ],
    '上限額・対象者区分（個人可否）は交付要綱の詳細確認が必要。情報が薄いため判定はCHECK寄りになりやすい。',
  ),
  P(
    'kobe_katsudo',
    '神戸市 芸術文化活動助成',
    '神戸市',
    '兵庫県神戸市',
    '2026年度上半期は2/17〜2/24で終了。下半期分は例年8月頃募集',
    false,
    '会場使用料・付属設備使用料等の1/3（公的施設）または1/2（公的施設以外・野外）以内・上限30万円',
    '未確認',
    'https://www.city.kobe.lg.jp/a36708/kanko/bunka/gyose/support/top.html',
    [
      '★団体のみ対象（個人不可）。神戸市に所在地があり神戸市内を中心に活動する団体',
      '1年以上の活動実績（対外的な創作発表活動）・会員5名以上・会員の半数以上が神戸市民',
      '会場使用料等の補助が中心（実質的に会場費の現物に近い支援）',
    ],
    '個人不可・団体限定の会場費補助制度。',
  ),
];

const ids = new Set(programs.map((p) => p.id));
let added = 0;
for (const p of add) if (!ids.has(p.id)) { programs.push(p); added++; }
writeFileSync(path, JSON.stringify(programs) + '\n');
console.log(`added ${added}. total=${programs.length}`);
