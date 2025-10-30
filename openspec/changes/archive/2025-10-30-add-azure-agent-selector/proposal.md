## Why
現在は `.env` の `AZURE_AGENT_ID` による 1 対 1 固定ですが、ユースケースごとに異なる Azure Agent（ツール構成・システムプロンプト・権限など）を切り替えたい要求が増えています。ユーザーが UI から任意の Agent を選択し、その選択がサーバ経由で Azure Agent Service の `assistant_id` に反映される必要があります。

## What Changes
- 複数 Agent を定義可能なレジストリ（名称と `assistant_id` のマップ）を導入（開発者の手作業ファイルは不要。環境変数のみで構成）
- 環境変数フォーマット：`AZURE_AGENT_ID`, `AZURE_AGENT_ID_NAME`, `AZURE_AGENT_ID2`, `AZURE_AGENT_ID2_NAME`, ... と連番で自動検出（Name は UI に表示、ID は Azure の `assistant_id`）
- サーバ API（`/api/agent`）が選択された Agent を受け取り、その `assistant_id` で "Create Thread and Run (stream:true)" を実行
- 不正な `agentId` は 400 を返すバリデーションとデフォルト Agent のフォールバック
- クライアントに Agent ピッカー（ドロップダウン）を追加し、選択状態を永続化（例: localStorage）
- i18n: Agent 名表示はローカライズ可能なラベルを許容
- アクセシビリティ: キーボード操作と ARIA 対応
- 監査/可観測性: 実行時に「どのエージェントでアクセスしたか」を記録（サーバログ・レスポンスヘッダ、任意でローカルファイル）

## Impact
- Affected specs: `azure-agent`, `ui`
- Affected code: `src/app/api/agent/route.ts`（`assistant_id` 動的化）、`src/components/AgentPicker.tsx`、`src/app/page.tsx` ほか
- Configuration: `.env` の単一 `AZURE_AGENT_ID` から、`AZURE_AGENT_ID(_N)` と `AZURE_AGENT_ID(_N)_NAME` 連番へ

