# 文化芸術 助成金ナビ（プロトタイプ）

文化芸術・クリエイターのための助成金・補助金を、締切・助成額・「いつ入金されるか（支給時期）」・応募条件つきで探せる無料サイト。
まずは舞台芸術（演劇・舞踊・ダンス・サーカス）から、全国＋東京・大阪・名古屋の46制度を収録。

## 公開URL
GitHub Pages で公開（静的HTML・外部依存なし）。

## 構成
- `index.html` … トップ（メディアのハブ）
- `check.html` … 適格性チェック（判定ツール・看板機能）
- `grants.html` / `grants/<id>.html` … 制度一覧・制度別ページ（SEOの主力）
- `calendar.html` … 締切カレンダー・募集状況
- `regions/<地域>.html` / `genres/butai.html` … 地域別・ジャンル別まとめ
- `about.html` / `privacy.html` / `disclaimer.html` … サイト説明・プライバシー・免責/情報訂正
- `data/programs.data.json` … 制度データ（単一の情報源）
- `build.mjs` … 静的サイトジェネレータ（Node・依存なし）

## 更新方法
1. `data/programs.data.json` を編集（制度の追加・更新）
2. `node build.mjs` で全ページを再生成
3. コミットして push（GitHub Pages に反映）
※ 判定ツール `check.html` はロジック（ルール関数）を含むため別管理。制度追加時は本体の PROGRAMS 配列と data の両方を更新する。

## 解析・広告の有効化（Phase C）
既定では解析・広告はオフ（Cookie追跡なし・同意バナーも出ない、クリーンな状態）。有効化するには:
1. `build.mjs` の `ANALYTICS_GA4`（GA4測定ID `G-...`）や `ADSENSE_CLIENT`（AdSense承認後の `ca-pub-...`）に値を入れる
2. `node build.mjs` で再生成 → push
3. すると全ページに同意バナー（同意/拒否）が出て、**「同意」時のみ**解析・広告スクリプトが読み込まれる（`assets/tracking.js`）。AdSenseは自動広告想定
- 送客ゾーン（制度ページ・判定結果下の「次のステップ」）は現状 情報提供リンク。報酬が発生する契約後は `nextSteps()` の各項目を `sponsored:true` にすると「広告」表示＋景表法対応になる
- プライバシー/免責/情報訂正の各ページを用意済み

## ご注意
開発中のプロトタイプです。掲載情報・判定結果は募集要項の明示内容に基づく参考情報で、採択可能性や最終的な適格性を保証しません。応募前に必ず各助成元の最新の募集要項をご確認ください。
