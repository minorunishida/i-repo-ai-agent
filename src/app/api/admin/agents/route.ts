// GET /api/admin/agents - expose allowed agents from env (id, name)
export const runtime = 'nodejs';

type AgentEntry = { agentId: string; name: string; assistantId: string; index: number };

function loadRegistry(): AgentEntry[] {
  const out: AgentEntry[] = [];
  const pushIfValid = (idx: number) => {
    const idKey = idx === 1 ? 'AZURE_AGENT_ID' : `AZURE_AGENT_ID${idx}`;
    const nameKey = idx === 1 ? 'AZURE_AGENT_ID_NAME' : `AZURE_AGENT_ID${idx}_NAME`;
    const assistantId = process.env[idKey as keyof NodeJS.ProcessEnv];
    const name = process.env[nameKey as keyof NodeJS.ProcessEnv];
    if (assistantId && name) {
      const agentId = idx === 1 ? 'default' : `agent${idx}`;
      out.push({ agentId, name, assistantId, index: idx });
    }
  };
  for (let i = 1; i <= 20; i++) pushIfValid(i);
  return out;
}

export async function GET() {
  const registry = loadRegistry();
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


