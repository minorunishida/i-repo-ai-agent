// GET /api/admin/agents - expose allowed agents from env (id, name)
import { AppLanguage } from '@/lib/i18n';
import { parseAgentName } from '@/lib/agentUtils';

export const runtime = 'nodejs';

type AgentEntry = { agentId: string; name: string; assistantId: string; index: number };

function loadRegistry(lang: AppLanguage = 'ja'): AgentEntry[] {
  const out: AgentEntry[] = [];
  const pushIfValid = (idx: number) => {
    const idKey = idx === 1 ? 'AZURE_AGENT_ID' : `AZURE_AGENT_ID${idx}`;
    const nameKey = idx === 1 ? 'AZURE_AGENT_ID_NAME' : `AZURE_AGENT_ID${idx}_NAME`;
    const assistantId = process.env[idKey as keyof NodeJS.ProcessEnv];
    const nameEnv = process.env[nameKey as keyof NodeJS.ProcessEnv];
    if (assistantId && nameEnv) {
      const agentId = idx === 1 ? 'default' : `agent${idx}`;
      const name = parseAgentName(nameEnv, lang);
      out.push({ agentId, name, assistantId, index: idx });
    }
  };
  for (let i = 1; i <= 20; i++) pushIfValid(i);
  return out;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get('lang') || 'ja') as AppLanguage;

  const registry = loadRegistry(lang);
  if (registry.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No agent configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const body = registry.map(({ agentId, name, index }) => ({ agentId, name, index }));
  return new Response(JSON.stringify({ agents: body }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}


