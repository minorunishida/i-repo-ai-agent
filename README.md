# AI SDK Chat

Azure AI Foundry Agent ServiceとVercel AI SDKを統合したリアルタイムチャットアプリケーションです。

## 機能

- Azure AI Foundry Agent Serviceとの統合
- リアルタイムストリーミングチャット
- useChatフックを使用したモダンなUI
- MSAL Nodeによる認証

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Azure Configuration
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-app-registration-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Project Endpoint（Azure AI Foundry ポータルの対象プロジェクトで確認）
AZURE_PROJECT_ENDPOINT=https://your-aiservices-id.services.ai.azure.com/api/projects/your-project-name

# エージェント設定（最大20個まで対応）
# Agent 1 (デフォルト)
AZURE_AGENT_ID=your-agent-id
AZURE_AGENT_ID_NAME=i-Reporter Expert,i-Reporter専門家,i-Reporter专家,i-Reporter專家,ผู้เชี่ยวชาญ i-Reporter

# Agent 2 (オプション)
# AZURE_AGENT_ID2=your-second-agent-id
# AZURE_AGENT_ID2_NAME=Technical Support,技術サポート,技术支持,技術支援,การสนับสนุนทางเทคนิค

# 注: エージェント名はカンマ区切りで5言語対応
# 順番: English, 日本語, 简体中文, 繁體中文, ไทย
# 単一言語の場合はカンマなしでそのまま記載
```

### 3. Azure設定

#### サービスプリンシパルの作成
1. Azure Portalでアプリ登録を作成
2. クライアントシークレットを発行
3. Azure AI Userロールを付与

#### RBAC設定
```bash
# サービスプリンシパルに「Azure AI User」を付与（例：リソースグループ スコープ）
az role assignment create \
  --assignee <APP_ID_OR_OBJECT_ID> \
  --role "Azure AI User" \
  --scope /subscriptions/<SUB_ID>/resourceGroups/<RG_NAME>
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

## アーキテクチャ

### メッセージフロー
1. **Client**: useChat sends UIMessage[] to `/api/agent`
2. **Server**: MSAL Node acquires Bearer token
3. **Azure**: Create Thread and Run with stream:true
4. **Streaming**: Azure SSE events → UI Message Stream conversion
5. **Client**: Real-time message updates via useChat

### 技術スタック
- **Frontend**: React, Next.js, TypeScript, @ai-sdk/react (useChat)
- **Backend**: Next.js API Routes (Node.js runtime)
- **Authentication**: MSAL Node (Client Credentials Flow)
- **AI Service**: Azure AI Foundry Agent Service
- **Streaming**: Server-Sent Events (SSE) → UI Message Stream

## トラブルシューティング

### よくあるエラー

#### 401/403（認可エラー）
- サービスプリンシパルにAzure AI Userロールが付与されているか確認
- スコープが`https://ai.azure.com/.default`であることを確認

#### 404/エンドポイント不正
- Project Endpoint形式（`...services.ai.azure.com/api/projects/<project>`）を再確認

#### ストリームが切れる/詰まる
- `Accept: text/event-stream`ヘッダーが送信されているか確認
- クライアント停止に合わせて`signal: req.signal`が上流fetchに渡されているか確認

## 開発

このプロジェクトはOpenSpecを使用して開発されています。

### 仕様の確認
```bash
openspec list --specs
openspec show azure-agent
```

### 変更の検証
```bash
openspec validate add-azure-agent-integration --strict
```
