// app/api/agent/route.ts
import { ConfidentialClientApplication } from '@azure/msal-node';
import { appendFile } from 'node:fs/promises';
import { formatStreamPart } from 'ai';

export const runtime = 'nodejs';   // SSE プロキシは Node 実行を推奨
export const maxDuration = 60;

const PROJECT_ENDPOINT = process.env.AZURE_PROJECT_ENDPOINT;
const AGENT_ID = process.env.AZURE_AGENT_ID;
const AGENT_NAME = process.env.AZURE_AGENT_ID_NAME;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;

// 環境変数のチェック
if (!PROJECT_ENDPOINT || !CLIENT_ID || !TENANT_ID || !CLIENT_SECRET) {
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
    console.log('API Route called');
    
    // 環境変数のチェック
    const missingVars: string[] = [];
    if (!PROJECT_ENDPOINT) missingVars.push('AZURE_PROJECT_ENDPOINT');
    if (!CLIENT_ID) missingVars.push('AZURE_CLIENT_ID');
    if (!TENANT_ID) missingVars.push('AZURE_TENANT_ID');
    if (!CLIENT_SECRET) missingVars.push('AZURE_CLIENT_SECRET');
    
    console.log('Environment variables check:', {
      PROJECT_ENDPOINT: !!PROJECT_ENDPOINT,
      AGENT_ID: !!AGENT_ID,
      CLIENT_ID: !!CLIENT_ID,
      TENANT_ID: !!TENANT_ID,
      CLIENT_SECRET: !!CLIENT_SECRET,
      missingVars
    });
    
    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars);
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
      console.log('Request body received:', {
        hasMessages: !!body.messages,
        messageCount: body.messages?.length || 0,
        hasThreadId: !!body.threadId,
        threadId: body.threadId
      });
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: String(error) }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, preferredLanguage } = body;
    const requestedAgentId: string | undefined = body.agentId;
    let { threadId } = body;

    // 環境変数から複数Agentを自動検出
    type AgentEntry = { agentId: string; name: string; assistantId: string; index: number };
    const registry: AgentEntry[] = [];
    const pushIfValid = (idx: number) => {
      const idKey = idx === 1 ? 'AZURE_AGENT_ID' : `AZURE_AGENT_ID${idx}`;
      const nameKey = idx === 1 ? 'AZURE_AGENT_ID_NAME' : `AZURE_AGENT_ID${idx}_NAME`;
      const assistantId = process.env[idKey as keyof NodeJS.ProcessEnv];
      const name = process.env[nameKey as keyof NodeJS.ProcessEnv];
      if (assistantId && name) {
        const agentId = idx === 1 ? 'default' : `agent${idx}`;
        registry.push({ agentId, name, assistantId, index: idx });
      }
    };
    // 1..20 程度までスキャン（必要なら拡張）
    for (let i = 1; i <= 20; i++) pushIfValid(i);
    // デフォルト解決
    const defaultAgent = registry.find((e) => e.index === 1) || registry[0];
    if (!defaultAgent) {
      console.error('No valid agent entries found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'No agent configured',
          hint: 'Set AZURE_AGENT_ID and AZURE_AGENT_ID_NAME at least'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // リクエストで指定されたagentIdの解決（allow-list）
    const resolved = requestedAgentId
      ? registry.find((e) => e.agentId === requestedAgentId)
      : defaultAgent;
    if (requestedAgentId && !resolved) {
      console.warn('Unknown agentId requested:', requestedAgentId);
      return new Response(
        JSON.stringify({ error: 'Unknown agentId', agentId: requestedAgentId }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const active = resolved!;
    console.log('Using agent:', { agentId: active.agentId, name: active.name, assistantId: active.assistantId });
    const auditPath = process.env.AGENT_AUDIT_PATH;
    const reqId = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    if (auditPath) {
      const line = `${new Date().toISOString()}\t${reqId}\t${active.agentId}\t${active.name}\n`;
      appendFile(auditPath, line).catch((e) => console.warn('Audit append failed:', e));
    }

    const languageInstruction = (lang?: string): string | null => {
      const l = String(lang || '').trim();
      if (!l) return null;
      switch (l) {
        case 'ja':
          return '以後の回答は必ず日本語で返答してください。説明やコードコメントも日本語で統一してください。';
        case 'en':
          return 'From now on, respond strictly in English. Keep all explanations and code comments in English.';
        case 'zh-Hans':
          return '接下来请务必使用简体中文回答。包括说明与代码注释也请统一为简体中文。';
        case 'zh-Hant':
          return '接下來請務必使用繁體中文回答。包含說明與程式碼註解也請統一為繁體中文。';
        case 'th':
          return 'ต่อไปนี้กรุณาตอบเป็นภาษาไทยเท่านั้น รวมถึงคำอธิบายและคำอธิบายในโค้ดด้วย';
        default:
          return null;
      }
    };
    const langHint = languageInstruction(preferredLanguage);
    
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages array:', { messages });
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Getting access token...');
    const token = await getAccessToken();
    console.log('Access token obtained successfully');

    // Azure Agent Serviceからストリーミングレスポンスを取得
    let url: string;
    let requestBody: any;

    if (threadId) {
      console.log('Using existing thread:', threadId);
      // 既存スレッドにメッセージを追加してRunを開始
      const addMessageUrl = `${PROJECT_ENDPOINT}/threads/${threadId}/messages?api-version=v1`;
      const addMessageBody = {
        role: 'user',
        content: [{ type: 'text', text: messages[messages.length - 1]?.content || '' }],
      };

      console.log('Adding message to thread:', {
        url: addMessageUrl,
        body: addMessageBody
      });

      // メッセージを追加
      const addMessageRes = await fetch(addMessageUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addMessageBody),
      });

      if (!addMessageRes.ok) {
        const errorText = await addMessageRes.text();
        console.error('Failed to add message to thread:', {
          status: addMessageRes.status,
          statusText: addMessageRes.statusText,
          error: errorText
        });
        
        // スレッドが存在しない場合は、新規スレッドを作成
        if (addMessageRes.status === 404) {
          console.log('Thread not found, creating new thread instead');
          threadId = null; // 新規スレッド作成にフォールバック
        } else {
          throw new Error(`Failed to add message to thread: ${addMessageRes.status} - ${errorText}`);
        }
      } else {
        console.log('Message added to thread successfully');
      }

      // 言語リマインドを必要に応じて追加
      if (langHint) {
        try {
          await fetch(addMessageUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              role: 'user',
              content: [{ type: 'text', text: langHint }],
            }),
          });
          console.log('Language hint appended to existing thread');
        } catch (e) {
          console.warn('Failed to append language hint:', e);
        }
      }
    }
    
    if (!threadId) {
      console.log('Creating new thread');
      // 新規スレッドを作成してRunを開始
      url = `${PROJECT_ENDPOINT}/threads/runs?api-version=v1`;
      requestBody = {
        assistant_id: active.assistantId,
        stream: true,
        thread: {
          messages: [
            ...(langHint
              ? [{ role: 'user', content: [{ type: 'text', text: langHint }] }]
              : []),
            ...messages.map((m: any) => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: [{ type: 'text', text: m.content }],
            })),
          ],
        },
      };
    } else {
      // Runを開始
      url = `${PROJECT_ENDPOINT}/threads/${threadId}/runs?api-version=v1`;
      requestBody = {
        assistant_id: active.assistantId,
        stream: true,
      };
    }

    console.log('Making request to Azure Agent Service:', {
      url,
      hasRequestBody: !!requestBody,
      stream: requestBody.stream
    });

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

    console.log('Azure Agent Service response:', {
      status: res.status,
      statusText: res.statusText,
      hasBody: !!res.body,
      headers: Object.fromEntries(res.headers.entries())
    });

    if (!res.ok || !res.body) {
      const t = await res.text().catch(() => '');
      console.error('Agent stream failed:', {
        status: res.status,
        statusText: res.statusText,
        error: t
      });
      throw new Error(`Agent stream failed: ${res.status} ${t}`);
    }

    // Azure SSEをAI SDKのストリーム形式に変換
    const encoder = new TextEncoder();
    let azureThreadId: string | null = null;
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await pumpSse(res.body!, ({ event, data }) => {
            if (data === '[DONE]') {
              // スレッドIDをログに出力（デバッグ用）
              if (azureThreadId && !threadId) console.log('Azure thread ID created:', azureThreadId);
              controller.enqueue(encoder.encode(formatStreamPart('finish_message', { finishReason: 'stop' })));
              controller.close();
              return;
            }

            if (!data) return;

            try {
              const obj = JSON.parse(data);
              const ev = event ?? obj?.type ?? obj?.event ?? '';

              // スレッドIDを取得（新規作成の場合）
              if (!threadId && (obj?.thread_id || obj?.data?.thread_id)) {
                azureThreadId = obj?.thread_id || obj?.data?.thread_id;
                console.log('Azure thread ID received:', azureThreadId);
              }

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
                // スレッドIDをログに出力（デバッグ用）
                if (azureThreadId && !threadId) {
                  console.log('Azure thread ID created:', azureThreadId);
                }
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

    const responseHeaders: HeadersInit = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'x-agent-id': active.agentId,
      'x-agent-name': encodeURIComponent(active.name),
    };

    // 新規スレッド作成の場合は、スレッドIDをヘッダーに含める
    if (!threadId) {
      // ストリーム開始時にスレッドIDを取得するためのフラグ
      responseHeaders['x-thread-creation'] = 'true';
    }

    return new Response(stream, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('API Error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
