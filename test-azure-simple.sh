#!/bin/bash

# Azure AI Foundry への疎通テスト
# .env.local からサービスプリンシパル情報を読み込んでリクエスト可能か確認

set -e

# .env.localから環境変数を読み込み
if [ -f .env.local ]; then
  echo "📄 .env.local から環境変数を読み込み中..."
  # .env.localの各行を読み込んで環境変数として設定
  export $(grep -v '^#' .env.local | grep -v '^$' | xargs)
fi

# 環境変数のチェック
MISSING_VARS=()
[ -z "$AZURE_TENANT_ID" ] && MISSING_VARS+=("AZURE_TENANT_ID")
[ -z "$AZURE_CLIENT_ID" ] && MISSING_VARS+=("AZURE_CLIENT_ID")
[ -z "$AZURE_CLIENT_SECRET" ] && MISSING_VARS+=("AZURE_CLIENT_SECRET")
[ -z "$AZURE_PROJECT_ENDPOINT" ] && MISSING_VARS+=("AZURE_PROJECT_ENDPOINT")
[ -z "$AZURE_AGENT_ID" ] && MISSING_VARS+=("AZURE_AGENT_ID")

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo "❌ エラー: 以下の環境変数が設定されていません:"
  printf '   %s\n' "${MISSING_VARS[@]}"
  echo ""
  echo ".env.local ファイルに必要な環境変数を設定してください"
  exit 1
fi

echo "✅ 必要な環境変数がすべて設定されています"
echo ""
echo "設定情報:"
echo "  Tenant ID: $AZURE_TENANT_ID"
echo "  Client ID: $AZURE_CLIENT_ID"
echo "  Project Endpoint: $AZURE_PROJECT_ENDPOINT"
echo "  Agent ID: $AZURE_AGENT_ID"
echo ""

echo "ステップ1: OAuth2 トークンの取得中..."
TOKEN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${AZURE_CLIENT_ID}" \
  -d "client_secret=${AZURE_CLIENT_SECRET}" \
  -d "scope=https://ai.azure.com/.default" \
  -d "grant_type=client_credentials")

HTTP_STATUS=$(echo "$TOKEN_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$TOKEN_RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" != "200" ]; then
  echo "❌ トークン取得失敗 (HTTP $HTTP_STATUS)"
  echo ""
  echo "レスポンス:"
  echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
  echo ""
  echo "トラブルシューティング:"
  echo "1. Client ID が正しいか確認"
  echo "2. Client Secret が有効か確認（期限切れの可能性）"
  echo "3. Tenant ID が正しいか確認"
  exit 1
fi

# トークンの抽出
if command -v jq &> /dev/null; then
  TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.access_token')
  ERROR=$(echo "$RESPONSE_BODY" | jq -r '.error // empty')
else
  TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
  ERROR=$(echo "$RESPONSE_BODY" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
fi

if [ -n "$ERROR" ] || [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ トークン取得失敗"
  echo "エラー: $ERROR"
  echo "レスポンス: $RESPONSE_BODY"
  exit 1
fi

echo "✅ トークン取得成功"
echo "  トークン（最初の30文字）: ${TOKEN:0:30}..."
echo ""

echo "ステップ2: Azure AI Foundry Agent Service へのリクエスト送信中..."
echo ""

echo "リクエスト内容:"
echo "  URL: ${AZURE_PROJECT_ENDPOINT}/threads/runs?api-version=v1"
echo "  メソッド: POST"
echo "  メッセージ: \"こんにちは、テストメッセージです\""
echo ""

# 一時ファイルでレスポンスを保存
TEMP_RESPONSE=$(mktemp)

# set -eを一時的に無効にして、curlのエラーコードを取得できるようにする
set +e

# HTTPステータスコードとレスポンスボディを同時に取得（ストリーミングを無効にして最初の数行のみ取得）
curl -s -w "\nHTTP_STATUS:%{http_code}" --max-time 10 \
  -X POST "${AZURE_PROJECT_ENDPOINT}/threads/runs?api-version=v1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d "{
    \"assistant_id\": \"${AZURE_AGENT_ID}\",
    \"stream\": true,
    \"thread\": {
      \"messages\": [
        {
          \"role\": \"user\",
          \"content\": [
            {
              \"type\": \"text\",
              \"text\": \"こんにちは、テストメッセージです\"
            }
          ]
        }
      ]
    }
  }" > "$TEMP_RESPONSE" 2>&1

CURL_EXIT=$?
set -e

# HTTPステータスコードを抽出
HTTP_STATUS=$(grep "HTTP_STATUS:" "$TEMP_RESPONSE" | tail -1 | cut -d':' -f2 | tr -d '[:space:]')
RESPONSE_BODY=$(grep -v "HTTP_STATUS:" "$TEMP_RESPONSE" | head -5)

# レスポンスの最初の数行を表示
if [ -s "$TEMP_RESPONSE" ]; then
  echo "レスポンス:"
  echo "=========================================="
  echo "$RESPONSE_BODY"
  echo "=========================================="
else
  echo "⚠️  レスポンスが空です"
fi

# エラーメッセージを抽出・表示
ERROR_MESSAGE=""
ERROR_CODE=""
PRINCIPAL_ID=""

if command -v jq &> /dev/null && echo "$RESPONSE_BODY" | jq -e '.error' > /dev/null 2>&1; then
  ERROR_CODE=$(echo "$RESPONSE_BODY" | jq -r '.error.code // empty')
  ERROR_MESSAGE=$(echo "$RESPONSE_BODY" | jq -r '.error.message // empty')
  
  # Principal IDを抽出
  if echo "$ERROR_MESSAGE" | grep -q "principal"; then
    PRINCIPAL_ID=$(echo "$ERROR_MESSAGE" | grep -o '`[^`]*`' | head -1 | tr -d '`')
  fi
fi

echo ""

# 結果の判定
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
  echo "✅ リクエスト成功！サービスプリンシパルでリクエスト可能です (HTTP $HTTP_STATUS)"
  rm -f "$TEMP_RESPONSE"
elif [ -n "$ERROR_CODE" ]; then
  echo "❌ リクエスト失敗"
  echo ""
  echo "HTTPステータス: ${HTTP_STATUS:-不明}"
  echo "エラーコード: $ERROR_CODE"
  if [ -n "$ERROR_MESSAGE" ]; then
    echo "エラーメッセージ: $ERROR_MESSAGE"
  fi
  
  if [ -n "$PRINCIPAL_ID" ]; then
    echo ""
    echo "サービスプリンシパルID: $PRINCIPAL_ID"
    echo "使用中のClient ID: $AZURE_CLIENT_ID"
    
    # Azure CLIでObject IDを取得（オプション）
    if command -v az &> /dev/null; then
      OBJECT_ID=$(az ad sp show --id "$AZURE_CLIENT_ID" --query 'id' -o tsv 2>/dev/null || echo '')
      if [ -n "$OBJECT_ID" ]; then
        echo "Object ID (Azure): $OBJECT_ID"
        if [ "$PRINCIPAL_ID" != "$OBJECT_ID" ]; then
          echo "⚠️  エラーメッセージのPrincipal IDとObject IDが一致していません"
        fi
      fi
    fi
  fi
  
  echo ""
  if [ "$ERROR_CODE" = "PermissionDenied" ]; then
    echo "🔧 解決方法:"
    echo "1. サービスプリンシパルに 'Azure AI User' ロールを付与してください"
    echo "2. ロールのスコープは、プロジェクトを含むリソースグループまたはサブスクリプションに設定してください"
    echo ""
    echo "コマンド例:"
    echo "  az role assignment create \\"
    echo "    --assignee $AZURE_CLIENT_ID \\"
    echo "    --role 'Azure AI User' \\"
    echo "    --scope /subscriptions/<SUB_ID>/resourceGroups/<RG_NAME>"
    echo ""
    echo "詳細: https://aka.ms/FoundryPermissions"
  fi
  
  rm -f "$TEMP_RESPONSE"
  exit 1
else
  echo "❌ リクエスト失敗（HTTPステータス: ${HTTP_STATUS:-不明}, 終了コード: $CURL_EXIT）"
  echo ""
  echo "考えられる原因:"
  echo "1. サービスプリンシパルに 'Azure AI User' ロールが付与されていない"
  echo "2. ロールのスコープがプロジェクトを含むリソースグループに設定されていない"
  echo "3. Project Endpoint の URL が正しくない"
  echo "4. Agent ID が存在しない、またはアクセス権限がない"
  echo ""
  
  rm -f "$TEMP_RESPONSE"
  exit 1
fi
