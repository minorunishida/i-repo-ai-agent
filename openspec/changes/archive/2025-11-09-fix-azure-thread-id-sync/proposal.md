## Why
現在の実装では、ローカルで生成したスレッドID（`thread_${Date.now()}_${Math.random()...}`）をAzure側に送信しているが、Azure側には存在しないため404エラーが発生している。Azure Agent Serviceは新規スレッド作成時に独自のスレッドIDを返すため、そのIDを使用して会話を継続する必要がある。

## What Changes
- **BREAKING** ローカルで生成したスレッドIDではなく、Azureから返されたスレッドIDを使用する
- 新規スレッド作成時にAzureから返されたスレッドIDをクライアント側に返す（SSEストリームのヘッダーまたはイベント経由）
- クライアント側でAzureのスレッドIDを保存し、後続のリクエストで使用する
- 既存スレッドを使用する際は、Azure側のスレッドIDを検証する
- **ローカルストレージ構造の変更**: `Thread`インターフェースに`azureThreadId`フィールドを追加し、ローカルIDとAzure IDの両方を保持する

## Impact
- Affected specs: azure-agent
- Affected code:
  - `src/app/api/agent/route.ts` - AzureスレッドIDの取得とクライアントへの返却
  - `src/app/page.tsx` - AzureスレッドIDの受信と保存
  - `src/lib/threadStorage.ts` - AzureスレッドIDの保存と管理（`Thread`インターフェースに`azureThreadId`フィールド追加）
- **ローカルストレージ**: 既存の`ai-sdk-threads`キーに保存されるデータ構造が変更される（リリース前のため後方互換性は不要）

