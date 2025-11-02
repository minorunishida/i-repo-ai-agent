import { redirect } from 'next/navigation';

export default function AgentIndexPage() {
  // デフォルトでエージェント1にリダイレクト
  redirect('/agent/1');
}

