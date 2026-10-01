// 山形県の残り市を追加。天童市「文化芸術振興基金」は実在しないことを確認済み（追加なし）。福島市・郡山市は文化芸術との接点が確認できず追加なし。
// 一次検証は data/verified_yamagata_fukushima_recheck_2026-07-18.md。
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
  P('tsuruoka_machikatsu', '鶴岡市市民まちづくり活動促進事業（鶴岡まち活）まちづくり基本コース', '鶴岡市（地域振興課）', '山形県鶴岡市', '令和8年度: 前期4/1〜5/8／後期7/1〜7/31（後期は予算状況により実施しない場合あり）', false, '対象経費の2/3以内、上限20万円', '原則精算払い（概算払いは要相談）', 'https://www.city.tsuruoka.lg.jp/kurashi/katsudo/shuminkoeki/tiiki0120220419.html', ['5人以上で構成され半数以上が市内在住の団体（個人不可）', '定款・規約等を定め適切な会計処理を行っていること'], '一般のまちづくり活動助成だが、障がいのある方のアート作品展示会・創作ワークショップ事業（UNiiKA）の採択実績を確認。'),
  P('yamagata_community_fund', '山形市コミュニティファンド 分野補助（文化分野）', '公益財団法人やまがた市民活動支援センター（山形市公民連携室所管）', '山形県山形市', '令和8年度分は締切済み（4/1〜4/30）。次回は例年4月頃と推測・要確認', false, '文化分野: 総額10万円以内。学術・文化・芸術・スポーツ育成ファンド: 30万円', '銀行振込。原則概算払いで交付決定後に交付し、事業終了後の実績報告に基づき精算', 'https://yamagata-cf.jp/aboutfand/bunyahojyo/', ['山形市内で原則1年以上継続活動している団体（個人不可）', '定款・規約等を有し独立した経理を行っていること', '「文化」が市発展計画の重点19分野の一つとして正式に位置づけ'], '一般の市民活動ファンドだが、文学活動振興・映画バリアフリー上映会・音楽イベント等の文化芸術系採択実績を複数確認。'),
  P('yonezawa_kyodo_teian', '米沢市協働提案制度補助金', '米沢市（企画調整部コミュニティ推進課）', '山形県米沢市', '年度により変動（例年4月頃募集、事前相談必須）。令和9年度分の最新募集要領は未確認', false, '上限50万円（補助対象経費－事業収入と50万円のいずれか低い額、補助率10/10）', '交付決定後に事業実施、補助対象経費の実支出額（収入控除後）と50万円のいずれか低い額を交付', 'https://www.city.yonezawa.yamagata.jp/material/files/group/1/2505094.pdf', ['構成員5人以上の団体（個人不可）', '不特定多数の市民の利益増進を目的に自主的・自発的に活動する団体', '公開プレゼンテーション（参加必須）を経て審査'], '一般の協働提案制度だが、行政課題カテゴリに「芸術文化の振興」「文化財の保存と活用」が正式に明記され、雲井龍雄顕彰会・米沢盆踊り保存会等の採択実績を確認。'),
];

const ids = new Set(programs.map((p) => p.id));
let added = 0;
for (const p of add) if (!ids.has(p.id)) { programs.push(p); added++; }
writeFileSync(path, JSON.stringify(programs) + '\n');
console.log(`added ${added}. total=${programs.length}`);
