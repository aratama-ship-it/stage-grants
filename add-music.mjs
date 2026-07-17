// 音楽特化7制度を programs.data.json に追加する一回限りのスクリプト（Phase B）。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(fileURLToPath(import.meta.url));
const path = join(ROOT, 'data/programs.data.json');
const programs = JSON.parse(readFileSync(path, 'utf8'));

const add = [
  { id: 'kao_music', name: '花王芸術・科学財団 音楽公演への助成', funder: '花王芸術・科学財団', region: '全国', deadline: '例年10〜11月（2026年度分は終了・次回は2026秋頃）', dlUrgent: false, amount: '上限100万円/件', payment: '開催月の月初めに銀行振込（実質前払い型）', cashflow: '開催時交付（実質前払い）', src: 'https://www.kao-foundation.or.jp/art/music_performance/', note: '4年連続受給は不可。国内開催を優先。', funderQ: '', conditions: ['日本のプロの音楽団体が主催（団体のみ・個人不可）', '創造的な音楽公演（オーケストラ・オペラ・室内楽等）', '高度な芸術水準で採算が取りにくいもの'], genres: ['音楽'] },
  { id: 'mutfa_music', name: '三菱UFJ信託芸術文化財団 クラシック音楽公演への助成', funder: '三菱UFJ信託芸術文化財団', region: '全国', deadline: '上期は11月末締切／下期(5月末)は終了', dlUrgent: false, amount: '1件30〜200万円', payment: '未確認', cashflow: '未確認', src: 'https://mutfa.jp/pages/61/', note: '「地域文化財団」は別法人（アマチュア対象）なので混同に注意。', funderQ: '', conditions: ['プロのクラシック音楽団体が主催（法人格は不要）', 'オペラ／オーケストラ・室内楽・合唱／音楽祭／作曲家団体公演／海外公演', '収支見込が赤字（経済的支援が必要）の公演'], genres: ['音楽'] },
  { id: 'rohm_music', name: 'ローム ミュージック ファンデーション 音楽活動への助成', funder: 'ローム ミュージック ファンデーション', region: '全国', deadline: '2026-07-21（受付中・2027年活動対象）', dlUrgent: true, amount: '1件最大250万円', payment: '未確認', cashflow: '未確認 → 要問い合わせ', src: 'https://www.rmf.or.jp/jp/recruitment/subsidy/index.html', note: '研究への助成・留学奨学金は別区分。', funderQ: '', conditions: ['個人・団体いずれも応募可', '音楽の公演（独奏・室内楽／オーケストラ・オペラ・音楽祭等）', '音楽文化の普及・発展に貢献する活動'], genres: ['音楽'] },
  { id: 'affinis', name: 'アフィニス オーケストラ助成', funder: 'アフィニス文化財団', region: '全国', deadline: '2026年度要項公開済（締切時期は要項参照）', dlUrgent: false, amount: '一企画50万〜100万円（1団体3件程度）', payment: '未確認', cashflow: '未確認', src: 'https://www.affinis.or.jp/guidance/points/', note: '別に団員個人向けの海外研修助成もあり。', funderQ: '', conditions: ['常設のプロオーケストラに限定（固定メンバー・専属事務局・年10回以上の自主演奏会等）', '主催する自主演奏会（定期・特別・シリーズ）'], genres: ['音楽'] },
  { id: 'kakehashi', name: 'かけはし芸術文化振興財団 公演活動助成', funder: 'かけはし芸術文化振興財団（旧ローランド芸術文化振興財団）', region: '全国', deadline: '例年10月〜1月上旬（次回は2026秋頃）', dlUrgent: false, amount: '概ね10〜200万円', payment: '未確認', cashflow: '未確認', src: 'https://www.kakehashi-foundation.jp/activity/support/', note: '旧・ローランド芸術文化振興財団。', funderQ: '', conditions: ['個人・団体いずれも応募可', '電子技術・電子楽器を応用した芸術文化が必須条件', '国内でのコンサート等の公演活動'], genres: ['音楽'] },
  { id: 'jcmf', name: '日本室内楽振興財団 助成', funder: '日本室内楽振興財団（大阪）', region: '全国', deadline: '例年9〜10月（2026年度分は終了・次回は2026秋頃）', dlUrgent: false, amount: '補助率1/3以内・実額10〜100万円', payment: '精算払（後払い）。事業報告書＋領収証提出後に交付', cashflow: '後払い（立替必須）', src: 'https://jcmf.or.jp/about-jcmf/subsidy/', note: '「大阪国際室内楽コンクール」主催団体。声楽は対象外。', funderQ: '', conditions: ['室内楽（原則2〜9重奏・声楽は対象外）の演奏活動・調査研究・教育普及', '演奏者（個人・団体）または音楽ホール等の事業者', '日本在住・国内での事業（アマチュアは対象外）'], genres: ['音楽'] },
  { id: 'jfm_muneji', name: '宗次エンジェル基金 公演活動支援事業（日本演奏連盟）', funder: '日本演奏連盟', region: '全国', deadline: '前期終了（後期は追って発表）', dlUrgent: false, amount: '演奏者数に応じ10〜20万円（定額）', payment: '精算払（公演終了後4週間以内に報告→送金）', cashflow: '後払い（立替必須）', src: 'https://www.jfm.or.jp/recruitment/activity_support.html', note: '名古屋発の宗次エンジェル基金が原資、事務は東京の日本演奏連盟。', funderQ: '', conditions: ['申請主体・出演者全員が日本演奏連盟の正会員（在籍1年以上）に限定', 'クラシック音楽の有料公演（無料・配信のみは対象外）', '1募集期間に1公演のみ採択'], genres: ['音楽'] },
];

const ids = new Set(programs.map((p) => p.id));
let added = 0;
for (const p of add) if (!ids.has(p.id)) { programs.push(p); added++; }
writeFileSync(path, JSON.stringify(programs) + '\n');
console.log(`added ${added} music programs. total=${programs.length}, 音楽=${programs.filter((p) => (p.genres || []).includes('音楽')).length}`);
