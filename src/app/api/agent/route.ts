// app/api/agent/route.ts
import { ConfidentialClientApplication } from '@azure/msal-node';
import { formatStreamPart } from 'ai';

export const runtime = 'nodejs';   // SSE プロキシは Node 実行を推奨
export const maxDuration = 60;

const PROJECT_ENDPOINT = process.env.AZURE_PROJECT_ENDPOINT;
const AGENT_ID = process.env.AZURE_AGENT_ID;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;

// 環境変数のチェック
if (!PROJECT_ENDPOINT || !AGENT_ID || !CLIENT_ID || !TENANT_ID || !CLIENT_SECRET) {
  console.error('Missing required environment variables');
}

const cca = new ConfidentialClientApplication({
  auth: {
    clientId: CLIENT_ID || 'dummy',
    authority: `https://login.microsoftonline.com/${TENANT_ID || 'dummy'}`,
    clientSecret: CLIENT_SECRET || 'dummy',
  },
});

async function getAccessToken(): Promise<string> {
  const res = await cca.acquireTokenByClientCredential({
    scopes: ['https://ai.azure.com/.default'],
  });
  if (!res?.accessToken) throw new Error('Failed to acquire token');
  return res.accessToken;
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

export async function GET() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed. Use POST instead.' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function POST(req: Request) {
  try {
    // 環境変数のチェック
    const missingVars: string[] = [];
    if (!PROJECT_ENDPOINT) missingVars.push('AZURE_PROJECT_ENDPOINT');
    if (!AGENT_ID) missingVars.push('AZURE_AGENT_ID');
    if (!CLIENT_ID) missingVars.push('AZURE_CLIENT_ID');
    if (!TENANT_ID) missingVars.push('AZURE_TENANT_ID');
    if (!CLIENT_SECRET) missingVars.push('AZURE_CLIENT_SECRET');
    
    if (missingVars.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Environment variables not configured',
          missing: missingVars,
          hint: 'Please check your .env.local file and restart the dev server'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // リクエストボディの検証
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: String(error) }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = await getAccessToken();

    // Azure Agent Serviceからストリーミングレスポンスを取得
    const url = `${PROJECT_ENDPOINT}/threads/runs?api-version=v1`;
    const requestBody = {
      assistant_id: AGENT_ID,
      stream: true,
      thread: { 
        messages: messages.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: [{ type: 'text', text: m.content }],
        }))
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(requestBody),
      signal: req.signal,
    });

    if (!res.ok || !res.body) {
      const t = await res.text().catch(() => '');
      throw new Error(`Agent stream failed: ${res.status} ${t}`);
    }

    // Azure SSEをAI SDKのストリーム形式に変換
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await pumpSse(res.body!, ({ event, data }) => {
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode(formatStreamPart('finish_message', { finishReason: 'stop' })));
              controller.close();
              return;
            }

            if (!data) return;

            try {
              const obj = JSON.parse(data);
              const ev = event ?? obj?.type ?? obj?.event ?? '';

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
                    controller.enqueue(encoder.encode(formatStreamPart('text', deltaText)));
                  }
                }
              }

              // 完了イベントが明示で来る場合
              if (typeof ev === 'string' && ev.includes('message.completed')) {
                controller.enqueue(encoder.encode(formatStreamPart('finish_message', { finishReason: 'stop' })));
                controller.close();
              }
            } catch {
              // JSON でない data は無視
            }
          });
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
