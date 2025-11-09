## 1. Implementation
- [x] 1.1 `src/app/page.tsx` の `parseIndexFromPath` 関数を修正し、`/` ルートの場合は `null` を返すようにする
- [x] 1.2 URL同期のuseEffectを修正し、`/` ルートの場合は `agentId` を `null` に設定する
- [x] 1.3 `handleThreadSelect` 関数内で、スレッド選択時にそのスレッドのagentIdに対応するURLパス（`/agent/{index}`）に即座に遷移する処理を追加
- [x] 1.4 存在しないエージェントindexへのアクセス時のフォールバック処理を確認（既存実装を維持）
- [x] 1.5 エージェント未選択状態でもアプリケーションが正常に動作することを確認（AgentPickerで未選択状態を表示、チャット入力を無効化）
- [x] 1.7 エージェント未選択状態でチャット入力と送信ボタンを無効化
- [x] 1.8 スレッド選択時のエージェント選択の整合性を改善（スレッドのagentIdに応じてURLパスに遷移）
- [x] 1.6 `src/app/agent/page.tsx` の既存リダイレクト処理を確認・調整（既存実装を維持）

## 2. Validation
- [x] 2.1 `openspec validate fix-root-route-agent-sync --strict`
- [x] 2.2 Manual: `/` にアクセスしてエージェントが未選択状態（`agentId` が `null`）になることを確認
- [x] 2.3 Manual: `/agent/1` に直接アクセスして正常に動作し、エージェント1が選択されることを確認
- [x] 2.4 Manual: エージェント選択時にURLが `/agent/{index}` に正しく更新されることを確認
- [x] 2.5 Manual: エージェント未選択状態（`/`）からエージェントを選択すると、URLが `/agent/{index}` に更新されることを確認
- [x] 2.6 Manual: スレッド（履歴）を選択した際に、そのスレッドのエージェントIDに対応するURLパスに遷移することを確認
- [x] 2.7 Manual: 存在しないエージェントindex（例：`/agent/13`）にアクセスした場合、`/agent/1` にリダイレクトされることを確認
- [x] 2.8 Manual: ブラウザの戻る/進むボタンで正常に動作することを確認

## 3. Rollout
- [x] 3.1 既存のエージェント選択機能に影響がないことを確認
- [x] 3.2 既存のスレッド管理機能に影響がないことを確認

