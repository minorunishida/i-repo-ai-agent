<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

全体像

フロント：useChat（@ai-sdk/react）

サーバ：Next.js API Route（Node ランタイム）

MSAL Node（クライアント資格情報フロー）で https://ai.azure.com/.default スコープの Bearer トークンを取得

Azure AI Foundry Project Endpoint に対して **Agent Service の「Create Thread and Run」**を stream: true で呼び出し（SSE）

受け取った SSE イベント（例: thread.message.delta） を Vercel の「UI Message Stream」（text-start / text-delta / text-end …）に変換して返却

Azure 側：Project Endpoint は
https://<aiservices-id>.services.ai.azure.com/api/projects/<project-name>（データプレーン・プロジェクト エンドポイント）を使用。SSE は [DONE] で終端。OAuth2 のスコープは https://ai.azure.com/.default。 
Microsoft Learn

参考：

Create Thread and Run（POST {endpoint}/threads/runs?api-version=v1、stream: true で SSE、data:[DONE] 終端、OAuth2 スコープ https://ai.azure.com/.default） 
Microsoft Learn

エージェントのイベント（例：thread.message.delta → 増分テキストの到着） 
Microsoft Learn

Vercel AI SDK の UI Message Stream（text-start/text-delta/text-end/finish などのパーツ、SSE で [DONE] マーカー終端） 
AI SDK

1) Azure 側の準備（サービスプリンシパル＆RBAC）

**アプリ登録（サービスプリンシパル）**を作成し、クライアント シークレットを発行（既存でも可）。

RBAC：サービスプリンシパルに Azure AI Foundry のプロジェクト/アカウントに対する最低限のロールを付与します。開発用途なら 「Azure AI User」（プロジェクトのデータ操作が可能）を対象スコープ（プロジェクト/リソースグループ/サブスクなど）で付与しておくと、エージェントの実行に必要なデータアクションが揃います。 
Microsoft Learn

CLI 例（ロール割り当て／スコープはご環境に合わせて変更）：

# サービスプリンシパルに「Azure AI User」を付与（例：リソースグループ スコープ）
az role assignment create \
  --assignee <APP_ID_OR_OBJECT_ID> \
  --role "Azure AI User" \
  --scope /subscriptions/<SUB_ID>/resourceGroups/<RG_NAME>


（公式ドキュメントにも同等の例があります） 
Microsoft Learn

補足：Agent Service REST 呼び出しは Project Endpoint に対し OAuth2（Entra ID） の Bearer トークンを使います。スコープは必ず https://ai.azure.com/.default を指定してください。 
Microsoft Learn

2) Next.js の環境変数（.env.local）
AZURE_TENANT_ID=<your-tenant-id>
AZURE_CLIENT_ID=<your-app-registration-client-id>
AZURE_CLIENT_SECRET=<your-client-secret>

# Project Endpoint（Azure AI Foundry ポータルの対象プロジェクトで確認）
AZURE_PROJECT_ENDPOINT=https://<aiservices-id>.services.ai.azure.com/api/projects/<project-name>

# 実行に使う Agent（ポータル/SDKで作成済みのID）
AZURE_AGENT_ID=<agent_xxx>


Project Endpoint の形式は上記のとおりです（services.ai.azure.com/api/projects/<project>）。 
Microsoft Learn

3) サーバ実装：Azure SSE → UI Message Stream ブリッジ

ランタイムは Node.js を使い、SSE を SSE にプロキシします。Vercel の AI SDK は UI Message Stream のプロトコルを公開しており、それに沿って text-start / text-delta / text-end / finish を送れば useChat 側で自然にストリーム結合されます。 
AI SDK

app/api/agent/route.ts
// app/api/agent/route.ts
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from 'ai';
import { ConfidentialClientApplication } from '@azure/msal-node';

export const runtime = 'nodejs';   // SSE プロキシは Node 実行を推奨
export const maxDuration = 60;

const PROJECT_ENDPOINT = process.env.AZURE_PROJECT_ENDPOINT!;
const AGENT_ID = process.env.AZURE_AGENT_ID!;

const cca = new ConfidentialClientApplication({
  auth: {
    clientId: process.env.AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
  },
});

async function getAccessToken(): Promise<string> {
  const res = await cca.acquireTokenByClientCredential({
    scopes: ['https://ai.azure.com/.default'],
  });
  if (!res?.accessToken) throw new Error('Failed to acquire token');
  return res.accessToken;
}

// useChat の UIMessage[] → Agent Service の message ブロックへ変換（今回は text のみ）
function toAgentThreadMessages(ui: UIMessage[]) {
  return ui.map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.parts
      .filter((p) => p.type === 'text')
      .map((p) => ({ type: 'text', text: p.text })),
  }));
}

// 素朴な SSE パーサ：\n\n 区切りで event/data を取り出す
async function pumpSse(
  body: ReadableStream<Uint8Array>,
  onEvent: (ev: { event?: string; data?: string }) => void
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      let eventType: string | undefined;
      const dataLines: string[] = [];

      for (const line of raw.split(/\r?\n/)) {
        if (line.startsWith('event:')) eventType = line.slice(6).trim();
        if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
      }
      const data = dataLines.length ? dataLines.join('\n') : undefined;
      onEvent({ event: eventType, data });
    }
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const token = await getAccessToken();

  const stream = createUIMessageStream({
    async execute({ writer }) {
      // 1 リクエスト = そのまま Create Thread and Run を stream:true で開始
      const url = `${PROJECT_ENDPOINT}/threads/runs?api-version=v1`;
      const body = {
        assistant_id: AGENT_ID,
        stream: true,
        thread: { messages: toAgentThreadMessages(messages) },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(body),
        signal: req.signal, // useChat の stop() で中断可能
      });

      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => '');
        throw new Error(`Agent stream failed: ${res.status} ${t}`);
      }

      const textId = `agent-${Date.now()}`;
      let started = false;

      await pumpSse(res.body, ({ event, data }) => {
        if (data === '[DONE]') {
          if (started) writer.write({ type: 'text-end', id: textId });
          writer.write({ type: 'finish' });
          return;
        }

        if (!data) return;

        // Azure 側のイベントは "thread.message.delta" 等。
        // data には JSON 文字列が入り、MessageDeltaChunk などの形式で content 配列に差分が来る。
        // バージョン差異に備え、複数のパターンを許容してテキストを抽出する。
        try {
          const obj = JSON.parse(data);

          // イベントタイプ（無ければ obj.type/obj.event から推測）
          const ev = event ?? obj?.type ?? obj?.event ?? '';

          // message.delta 系のイベントから増分テキストを取り出す
          if (typeof ev === 'string' && ev.includes('message.delta')) {
            const contentBlocks =
              obj?.data?.delta?.content ??
              obj?.delta?.content ??
              obj?.content ??
              [];

            for (const b of contentBlocks) {
              const deltaText =
                b?.text?.value ??
                b?.text ??
                b?.delta?.text ??
                b?.value ??
                '';

              if (deltaText) {
                if (!started) {
                  writer.write({ type: 'text-start', id: textId });
                  started = true;
                }
                writer.write({ type: 'text-delta', id: textId, delta: deltaText });
              }
            }
          }

          // 完了イベントが明示で来る場合（互換対応）
          if (typeof ev === 'string' && ev.includes('message.completed')) {
            if (started) writer.write({ type: 'text-end', id: textId });
            writer.write({ type: 'finish' });
          }
        } catch {
          // JSON でない data は無視
        }
      });
    },
  });

  return createUIMessageStreamResponse({ stream });
}


Create Thread and Run の stream: true は SSE を返し、Run が終端に到達すると data: [DONE] が来ます（そこで text-end と finish を送ってクローズ）。 
Microsoft Learn
+1

Azure からのイベントは thread.message.delta → テキスト差分、thread.message.completed → 完了 など。受け取った差分を text-delta に写していけば useChat が連結します。 
Microsoft Learn

メモ：サーバー側で SSE を扱う場合も、Vercel AI SDK の UI Message Stream を使えば プロトコル規約に沿って useChat と安全にやり取りできます（仕様は公式の Stream Protocols を参照）。 
AI SDK

4) クライアント実装（useChat）
'use client';
import { useChat } from '@ai-sdk/react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, status, stop, error } =
    useChat({ api: '/api/agent' }); // ここを本ルートに

  // あなたの shadcn/ui レイアウトに合わせてレンダリング
  return (
    <form onSubmit={handleSubmit}>
      {/* メッセージ表示 */}
      {/* 入力、送信 / 停止ボタン（status===streaming なら stop()） */}
    </form>
  );
}


useChat は UI Message Stream を既定で理解します。サーバーが createUIMessageStreamResponse を返せば、そのままストリーミング表示されます。 
AI SDK
+1

5) 永続スレッドで会話を継続したい場合（オプション）

スレッドを毎回新規作成せず、同じ threadId に ユーザー発話を追加 → Run 開始の 2 ステップに分けます。

Message 追加：POST {endpoint}/threads/{threadId}/messages（Messages - Create Message）

Run 開始（SSE）：POST {endpoint}/threads/{threadId}/runs?api-version=v1（Runs - Create Run、stream:true）
それぞれ Bearer トークンは同様です。 
Microsoft Learn
+1

サーバー側の差分（イメージ）：

// 例: body に threadId と "今回追加する" ユーザー発話（最後の1件）を送る
const urlMsg = `${PROJECT_ENDPOINT}/threads/${threadId}/messages?api-version=v1`;
await fetch(urlMsg, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role: 'user',
    content: [{ type: 'text', text: lastUserText }],
  }),
  signal: req.signal,
});

const urlRun = `${PROJECT_ENDPOINT}/threads/${threadId}/runs?api-version=v1`;
await fetch(urlRun, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'text/event-stream' },
  body: JSON.stringify({ assistant_id: AGENT_ID, stream: true }),
  signal: req.signal,
});
// あとは前述と同じ SSE→UI Message Stream 変換


Threads / Messages / Runs の概念は公式の用語集がまとまっています。 
Microsoft Learn

6) 動作確認（ローカル）
# フロントのフォームから送ってもよいですが、API を直接叩くなら:
curl -N -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"id":"u1","role":"user","parts":[{"type":"text","text":"こんにちは、自己紹介して"}]}]}'

7) よくあるハマりどころ

401/403（認可エラー）：

サービスプリンシパルに Azure AI User などの 適切な RBAC が付いているか、スコープが合っているか確認。 
Microsoft Learn

トークンの スコープ が https://ai.azure.com/.default であること。 
Microsoft Learn

404/エンドポイント不正：

Project Endpoint 形式（...services.ai.azure.com/api/projects/<project>）を再確認。 
Microsoft Learn

ストリームが切れる/詰まる：

Accept: text/event-stream を送る。

クライアント停止に合わせて signal: req.signal を上流 fetch に渡す（useChat().stop() で中断可能）。

イベントの型差：

thread.message.delta などのイベント名は SDK/バージョンで若干の差異が報告されています。防御的に JSON をパースし、data.delta.content[*].text / .delta.text / .value のように複数経路を試す設計にしておくと堅牢です。 
GitHub

参考リンク（公式）

Agent Service（REST）

Create Thread and Run（stream:true で SSE、[DONE] 終端、OAuth2 スコープ）。エンドポイント形式も記載。 
Microsoft Learn

Threads / Messages / Runs の各 API 一覧。 
Microsoft Learn
+2
Microsoft Learn
+2

概念（Threads / Runs / Messages）。 
Microsoft Learn

イベント ストリーミング（SDK ドキュメント）

thread.message.delta などのイベント列。 
Microsoft Learn

Vercel AI SDK

UI Message Stream の仕様（text-start / text-delta / text-end / finish、SSE [DONE]）。 
AI SDK

サーバから任意データをストリーミングする実装（createUIMessageStream / createUIMessageStreamResponse）。 
AI SDK

RBAC / 権限

Azure AI Foundry の RBAC（Azure AI User などの組み込みロール、CLI 例を含む）。 
Microsoft Learn

仕上げのチェックリスト

 .env.local（Tenant/Client/Secret/Project Endpoint/Agent ID）を設定

 サービスプリンシパルに Azure AI User（など最小権限）を付与（RG/プロジェクト等の適切なスコープ） 
Microsoft Learn

 app/api/agent/route.ts を上記の実装に差し替え

 クライアントは useChat({ api: '/api/agent' })

 必要に応じて 永続スレッド化（messages 追加 → runs 実行） 
Microsoft Learn
+1

この構成で、サービスプリンシパル（クライアント資格情報フロー） × Azure Agent Service × useChat ストリーミングが実現できます。もし、スレッド永続や**ツール（File Search / Code Interpreter / Bing Grounding など）**を組み込みたい場合は、その前提で API ルートを拡張したサンプルも用意できます。

