## Why
Azure AI Foundry Agent ServiceとVercel AI SDKを統合したリアルタイムチャットアプリケーションを構築する必要がある。現在のプロジェクトには基本的な実装が存在せず、ストリーミング機能を持つチャット機能の基盤を整える必要がある。

## What Changes
- Azure Agent Serviceとの統合APIルートを実装
- useChatフックを使用したチャットUIを実装
- MSAL Nodeによる認証機能を追加
- SSE（Server-Sent Events）からUI Message Streamへの変換機能を実装
- 環境変数とAzure設定のセットアップ

## Impact
- Affected specs: azure-agent (新規作成)
- Affected code: 
  - `app/api/agent/route.ts` (新規作成)
  - `app/page.tsx` (新規作成)
  - `package.json` (新規作成)
  - `.env.local` (新規作成)
