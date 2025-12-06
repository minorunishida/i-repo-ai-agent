## Why
ステージング/本番を含む全ページ・全APIへのアクセスをBasic認証で保護し、未認証の閲覧を防ぐため。

## What Changes
- Next.jsの`middleware.ts`でHTTP Basic認証を導入し、全ページ/全APIを保護する
- 認証失敗時は`401`と`WWW-Authenticate: Basic realm="Secure Area"`を返す
- 認証情報は`.env`の`BASIC_AUTH_USER` / `BASIC_AUTH_PASS`から読み込む（ローカル/本番で有効）
- フレームワーク/静的アセット（`/_next/static/*`、`/_next/image*`、`/favicon.ico`、`/robots.txt`、`/sitemap.xml`など）は認証対象外とする
- 環境変数が未設定の場合はフォールトトレラントに閉じる（許可せずにエラーを返す）方針とする

## Impact
- Affected specs: `auth/spec.md`
- Affected code: `middleware.ts`、環境変数のドキュメント（`.env.example` など）

