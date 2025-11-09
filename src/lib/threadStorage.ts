import { AppLanguage, t } from './i18n';

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant' | 'function' | 'system' | 'data' | 'tool';
  content: string;
  timestamp: number;
}

export interface Thread {
  id: string;
  azureThreadId?: string; // Azureから返されたスレッドID
  agentId?: string; // このスレッドで使用されたエージェントID
  title: string;
  messages: ThreadMessage[];
  createdAt: number;
  updatedAt: number;
  preview: string;
}

export interface ThreadStorage {
  threads: Thread[];
  activeThreadId: string | null;
}

const STORAGE_KEY = 'ai-sdk-threads';
const MAX_THREADS = 10;

export class ThreadManager {
  private static instance: ThreadManager;
  private threads: Thread[] = [];
  private activeThreadId: string | null = null;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): ThreadManager {
    if (!ThreadManager.instance) {
      ThreadManager.instance = new ThreadManager();
    }
    return ThreadManager.instance;
  }

  private loadFromStorage(): void {
    // サーバーサイドでは実行しない
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: ThreadStorage = JSON.parse(stored);
        this.threads = data.threads || [];
        this.activeThreadId = data.activeThreadId || null;
      }
    } catch (error) {
      console.error('Failed to load threads from storage:', error);
      this.threads = [];
      this.activeThreadId = null;
    }
  }

  private saveToStorage(): void {
    // サーバーサイドでは実行しない
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const data: ThreadStorage = {
        threads: this.threads,
        activeThreadId: this.activeThreadId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save threads to storage:', error);
    }
  }

  private generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createPreview(messages: ThreadMessage[], language: AppLanguage = 'ja'): string {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.length > 50
        ? firstUserMessage.content.substring(0, 50) + '...'
        : firstUserMessage.content;
    }
    return t(language, 'newConversation');
  }

  private enforceMaxThreads(): void {
    if (this.threads.length > MAX_THREADS) {
      // 最も古いスレッドを削除
      this.threads.sort((a, b) => a.updatedAt - b.updatedAt);
      this.threads = this.threads.slice(-MAX_THREADS);
    }
  }

  public createThread(agentId?: string, language: AppLanguage = 'ja'): Thread {
    const threadId = this.generateThreadId();
    const now = Date.now();
    const defaultTitle = t(language, 'newConversation');

    const newThread: Thread = {
      id: threadId,
      azureThreadId: undefined, // 最初は未設定、Azure作成後に設定される
      agentId: agentId, // このスレッドで使用されたエージェントID
      title: defaultTitle,
      messages: [],
      createdAt: now,
      updatedAt: now,
      preview: defaultTitle,
    };

    this.threads.push(newThread);
    this.activeThreadId = threadId;
    this.enforceMaxThreads();
    this.saveToStorage();

    return newThread;
  }

  public updateAzureThreadId(threadId: string, azureThreadId: string): boolean {
    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return false;

    thread.azureThreadId = azureThreadId;
    thread.updatedAt = Date.now();
    this.saveToStorage();
    console.log(`Azure thread ID updated for thread ${threadId}:`, azureThreadId);
    return true;
  }

  public updateThreadAgentId(threadId: string, agentId: string): boolean {
    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return false;

    thread.agentId = agentId;
    thread.updatedAt = Date.now();
    this.saveToStorage();
    console.log(`Agent ID updated for thread ${threadId}:`, agentId);
    return true;
  }

  public getThreads(): Thread[] {
    return [...this.threads].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public getActiveThread(): Thread | null {
    if (!this.activeThreadId) return null;
    return this.threads.find(t => t.id === this.activeThreadId) || null;
  }

  public setActiveThread(threadId: string): boolean {
    const thread = this.threads.find(t => t.id === threadId);
    if (thread) {
      this.activeThreadId = threadId;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public addMessage(threadId: string, role: 'user' | 'assistant' | 'function' | 'system' | 'data' | 'tool', content: string): boolean {
    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return false;

    // 重複チェック：同じ内容のメッセージが既に存在するかチェック
    const existingMessage = thread.messages.find(msg =>
      msg.role === role &&
      msg.content === content &&
      (Date.now() - msg.timestamp) < 10000 // 10秒以内のメッセージは重複とみなす
    );

    if (existingMessage) {
      console.log('Duplicate message detected, skipping:', {
        role,
        content: content.substring(0, 50) + '...',
        existingTimestamp: existingMessage.timestamp
      });
      return false; // 重複メッセージは追加しない
    }

    const message: ThreadMessage = {
      id: this.generateMessageId(),
      role,
      content,
      timestamp: Date.now(),
    };

    thread.messages.push(message);
    thread.updatedAt = Date.now();

    // 言語を取得（デフォルトは日本語）
    const language: AppLanguage = (typeof window !== 'undefined' && window.localStorage.getItem('app_language') as AppLanguage) || 'ja';
    thread.preview = this.createPreview(thread.messages, language);

    // タイトルを自動更新（最初のユーザーメッセージの場合、またはタイトルがデフォルトの場合）
    if (message.role === 'user') {
      const userMessageCount = thread.messages.filter(m => m.role === 'user').length;
      const defaultTitle = t(language, 'newConversation');
      if (userMessageCount === 1 || thread.title === defaultTitle || this.isDefaultTitle(thread.title)) {
        const newTitle = this.generateThreadTitle(thread.messages, language);
        if (newTitle !== thread.title) {
          thread.title = newTitle;
        }
      }
    }

    console.log(`Message added to thread ${threadId}:`, {
      role: message.role,
      content: message.content.substring(0, 50) + '...',
      totalMessages: thread.messages.length,
      title: thread.title,
      allMessages: thread.messages.map(m => ({ role: m.role, content: m.content.substring(0, 20) + '...' }))
    });

    this.saveToStorage();
    return true;
  }

  public getMessages(threadId: string): ThreadMessage[] {
    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return [];

    // タイムスタンプ順にソートして返す
    return [...thread.messages].sort((a, b) => a.timestamp - b.timestamp);
  }

  public deleteThread(threadId: string): boolean {
    const index = this.threads.findIndex(t => t.id === threadId);
    if (index === -1) return false;

    this.threads.splice(index, 1);

    // 削除されたスレッドがアクティブだった場合、別のスレッドを選択
    if (this.activeThreadId === threadId) {
      this.activeThreadId = this.threads.length > 0 ? this.threads[0].id : null;
    }

    this.saveToStorage();
    return true;
  }

  public updateThreadTitle(threadId: string, title: string): boolean {
    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return false;

    thread.title = title;
    thread.updatedAt = Date.now();
    this.saveToStorage();
    return true;
  }

  private isDefaultTitle(title: string): boolean {
    // 各言語の「新しい会話」と比較
    const defaultTitles = [
      t('ja', 'newConversation'),
      t('en', 'newConversation'),
      t('zh-Hans', 'newConversation'),
      t('zh-Hant', 'newConversation'),
      t('th', 'newConversation'),
    ];
    return defaultTitles.includes(title);
  }

  public generateThreadTitle(messages: ThreadMessage[], language: AppLanguage = 'ja'): string {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      const content = firstUserMessage.content.trim();
      // 50文字以内でタイトルを生成
      if (content.length <= 50) {
        return content;
      } else {
        return content.substring(0, 47) + '...';
      }
    }
    return t(language, 'newConversation');
  }

  public autoUpdateThreadTitle(threadId: string, language: AppLanguage = 'ja'): boolean {
    const thread = this.threads.find(t => t.id === threadId);
    if (!thread || thread.messages.length === 0) {
      console.log('autoUpdateThreadTitle: Thread not found or no messages', {
        threadId,
        threadExists: !!thread,
        messageCount: thread?.messages.length || 0
      });
      return false;
    }

    const newTitle = this.generateThreadTitle(thread.messages, language);
    console.log('autoUpdateThreadTitle: Checking title update', {
      threadId,
      currentTitle: thread.title,
      newTitle,
      messageCount: thread.messages.length,
      firstUserMessage: thread.messages.find(m => m.role === 'user')?.content.substring(0, 30)
    });

    // タイトルがデフォルトタイトルの場合、または新しいタイトルが異なる場合は更新
    if (this.isDefaultTitle(thread.title) || newTitle !== thread.title) {
      const oldTitle = thread.title;
      thread.title = newTitle;
      thread.updatedAt = Date.now();
      this.saveToStorage();
      console.log('autoUpdateThreadTitle: Title updated', {
        threadId,
        oldTitle,
        newTitle
      });
      return true;
    }
    console.log('autoUpdateThreadTitle: Title unchanged', {
      threadId,
      title: thread.title
    });
    return false;
  }

  public searchThreads(query: string): Thread[] {
    const lowercaseQuery = query.toLowerCase();
    return this.threads.filter(thread =>
      thread.title.toLowerCase().includes(lowercaseQuery) ||
      thread.preview.toLowerCase().includes(lowercaseQuery) ||
      thread.messages.some(msg => msg.content.toLowerCase().includes(lowercaseQuery))
    );
  }

  public clearAllThreads(): void {
    this.threads = [];
    this.activeThreadId = null;
    this.saveToStorage();
  }

  public exportThreads(): string {
    return JSON.stringify({
      threads: this.threads,
      activeThreadId: this.activeThreadId,
      exportedAt: Date.now(),
    }, null, 2);
  }

  public importThreads(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (imported.threads && Array.isArray(imported.threads)) {
        this.threads = imported.threads;
        this.activeThreadId = imported.activeThreadId || null;
        this.enforceMaxThreads();
        this.saveToStorage();
        return true;
      }
    } catch (error) {
      console.error('Failed to import threads:', error);
    }
    return false;
  }
}

// シングルトンインスタンスをエクスポート
export const threadManager = ThreadManager.getInstance();
