## Why
現在のAzure AI Foundry統合では単一スレッドでのみ動作しており、ユーザーが複数の会話を並行して行うことができない。また、ブラウザのローカルストレージを活用して会話履歴を永続化することで、ユーザーエクスペリエンスを大幅に向上させることができる。

## What Changes
- **BREAKING** 既存の単一スレッドモデルから複数スレッド管理モデルに変更
- 新規スレッド作成機能の追加
- スレッド切り替え機能の追加
- ローカルストレージを使用した最大10件のスレッド履歴保存
- スレッドメタデータ管理（作成日時、最終更新日時、プレビュー）
- スレッド管理UI（サイドバー、検索、削除機能）

## Impact
- Affected specs: azure-agent, ui
- Affected code: 
  - `src/app/api/agent/route.ts` - スレッドID管理の追加
  - `src/app/page.tsx` - スレッド管理UIの実装
  - 新規コンポーネント: ThreadSidebar, ThreadList, ThreadItem
  - ローカルストレージ管理ユーティリティ
