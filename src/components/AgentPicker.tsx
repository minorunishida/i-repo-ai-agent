'use client';

import { AppLanguage } from '@/lib/i18n';
import { useEffect, useRef, useState } from 'react';

type Agent = { agentId: string; name: string; index: number };

type Props = {
  language: AppLanguage;
  value?: string | null;
  onChange: (agentId: string) => void;
};

const STORAGE_KEY = 'agent_id';

export function getSavedAgentId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function saveAgentId(agentId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, agentId);
}

export default function AgentPicker({ language, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/agents', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { agents: Agent[] };
        if (!cancelled) setAgents(data.agents || []);
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = agents.find((a) => a.agentId === value) || agents[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-3 h-10 leading-none rounded-xl glass-card hover:scale-105 transition-all duration-200 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select agent"
        title="Select agent"
        disabled={loading || !!error}
      >
        <span>{current ? current.name : 'Agent'}</span>
        <svg className="w-4 h-4 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && !loading && !error && (
        <div className="absolute right-0 mt-2 min-w-[14rem] max-w-xs rounded-xl glass-card py-2 z-50" role="listbox">
          {agents.map((a) => (
            <button
              key={a.agentId}
              role="option"
              aria-selected={a.agentId === current?.agentId}
              onClick={() => {
                onChange(a.agentId);
                saveAgentId(a.agentId);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-100 break-words ${a.agentId === current?.agentId ? 'font-semibold' : ''}`}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

      {open && loading && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl glass-card py-3 px-4 z-50 text-sm text-gray-600 dark:text-gray-300">
          Loading...
        </div>
      )}

      {open && error && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl glass-card py-3 px-4 z-50 text-sm text-red-600 dark:text-red-300">
          {String(error)}
        </div>
      )}
    </div>
  );
}


