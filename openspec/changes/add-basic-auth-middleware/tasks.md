## 1. Implementation
- [x] 1.1 `middleware.ts` にBasic認証を追加し、全ページ/全APIを保護する（静的/フレームワーク資産は除外）
- [x] 1.2 `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` を環境変数から読み込み、未設定時は許可せずにエラー応答とする
- [x] 1.3 認証失敗時に `WWW-Authenticate: Basic realm="Secure Area"` を返す
- [x] 1.4 `env.example`（.env.local のサンプル）に必要な環境変数を追記する

## 2. Validation
- [x] 2.1 `openspec validate add-basic-auth-middleware --strict`
- [ ] 2.2 Manual: 正しいBasic認証でページ/APIが正常に閲覧できること
- [ ] 2.3 Manual: 認証無し/誤りで `401` が返り、`WWW-Authenticate: Basic realm="Secure Area"` が含まれること
- [ ] 2.4 Manual: `_next/static`、`_next/image`、`favicon.ico`、`robots.txt`、`sitemap.xml` 等の静的資産が認証なしで取得できること
- [ ] 2.5 Manual: 環境変数が未設定の場合にアクセスが許可されない（閉じる）こと

## 3. Rollout
- [ ] 3.1 ローカル/本番環境に `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` を設定する
- [ ] 3.2 デプロイ後に全ページ/主要APIが認証下で動作することを確認する

