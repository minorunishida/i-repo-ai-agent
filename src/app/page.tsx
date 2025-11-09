'use client';

import AgentPicker, { getSavedAgentId, saveAgentId } from '@/components/AgentPicker';
import FloatingIrepochan from '@/components/FloatingIrepochan';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ResourceLinks from '@/components/ResourceLinks';
import ThreadSidebar from '@/components/ThreadSidebar';
import { AppLanguage, getSavedLanguage, saveLanguage, t } from '@/lib/i18n';
import { Thread, threadManager } from '@/lib/threadStorage';
import { parseUrlsToElements } from '@/lib/urlUtils';
import { useChat } from 'ai/react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>('ja');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Array<{ agentId: string; name: string; index: number }>>([]);
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const lastSavedMessageCount = useRef<number>(0);
  const requestThreadIdRef = useRef<string | null>(null); // リクエスト送信時のスレッドIDを記録
  const loadingThreadRef = useRef<string | null>(null); // 読み込み中のスレッドID

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, error, setMessages, data } =
    useChat({
      api: '/api/agent',
      body: {
        threadId: activeThreadId,
        azureThreadId: currentThread?.azureThreadId,
        preferredLanguage: language,
        agentId: agentId || undefined,
      },
      onFinish: (message) => {
        // ストリーミング完了後に、リクエスト送信時のスレッドIDをクリア
        const requestThreadId = requestThreadIdRef.current;
        requestThreadIdRef.current = null;

        // ストリーミング完了後にメッセージを保存
        if (requestThreadId && message.role === 'assistant') {
          console.log('Streaming finished, saving assistant message:', {
            role: message.role,
            content: message.content.substring(0, 50) + '...',
            contentLength: message.content.length,
            threadId: requestThreadId
          });

          const success = threadManager.addMessage(
            requestThreadId,
            message.role as 'user' | 'assistant' | 'function' | 'system' | 'data' | 'tool',
            message.content
          );

          if (success) {
            // タイトルを自動更新
            const titleUpdated = threadManager.autoUpdateThreadTitle(requestThreadId, language);

            // 更新されたスレッド情報を取得して反映
            const updatedThread = threadManager.getActiveThread();
            if (updatedThread) {
              setCurrentThread(updatedThread);
              console.log('Thread updated after assistant message:', {
                threadId: updatedThread.id,
                title: updatedThread.title,
                titleUpdated,
                messageCount: updatedThread.messages.length
              });
            }

            lastSavedMessageCount.current = messages.length;

            console.log('Assistant message saved successfully');
          } else {
            console.log('Failed to save assistant message (duplicate or error)');
          }
        }
      },
    });

  // 言語・ダークモード初期化
  useEffect(() => {
    const savedLang = getSavedLanguage();
    setLanguage(savedLang);
    const savedAgent = getSavedAgentId();
    setAgentId(savedAgent);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = savedLang;
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // エージェント一覧の取得（URL同期用）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/agents', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setAgents(data.agents || []);
      } catch (e) {
        // 失敗時は agents 空のまま（デフォルト処理にフォールバック）
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // URL → UI 同期（/agent/{index} または / → 未選択）
  useEffect(() => {
    // スレッド選択中の場合はスキップ（handleThreadSelectで処理中）
    if (isSelectingThreadRef.current) return;

    if (!agents || agents.length === 0) return;
    const parseIndexFromPath = (p: string | null): number | null => {
      if (!p || p === '/') return null; // ルートパスは未選択状態
      const parts = p.split('/').filter(Boolean);
      if (parts.length >= 2 && parts[0] === 'agent') {
        const n = parseInt(parts[1], 10);
        return Number.isFinite(n) && n >= 1 ? n : null;
      }
      return null;
    };
    const idx = parseIndexFromPath(pathname);

    // ルートパス（/）の場合はエージェントを未選択状態にする
    if (idx === null) {
      if (agentId !== null) {
        setAgentId(null);
        // localStorageはクリアしない（ユーザーの選択を保持）
      }
      return;
    }

    // エージェントindexが指定されている場合
    const target = agents.find(a => a.index === idx);

    // 存在しないエージェントindexの場合、index 1 にフォールバックしてリダイレクト
    if (!target) {
      const fallback = agents.find(a => a.index === 1) || agents[0];
      if (fallback) {
        console.log(`Agent index ${idx} not found, redirecting to ${fallback.index}`);
        router.replace(`/agent/${fallback.index}`);
      }
      return;
    }

    // agentIdが異なる場合のみ更新（無限ループを防ぐ）
    if (agentId !== target.agentId) {
      setAgentId(target.agentId);
      saveAgentId(target.agentId);
    }
  }, [pathname, agents, router, agentId]); // agentIdを依存関係に追加（nullチェックのため）

  // 言語変更時に <html lang> を更新
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // スレッド管理の初期化（初回のみ実行）
  const threadInitializedRef = useRef(false);
  const isSelectingThreadRef = useRef(false); // スレッド選択中フラグ
  useEffect(() => {
    // agentsが読み込まれるまで待つ
    if (!agents || agents.length === 0) return;
    // 既に初期化済みの場合はスキップ
    if (threadInitializedRef.current) return;
    // activeThreadIdが既に設定されている場合はスキップ（スレッド選択済み）
    if (activeThreadId) return;
    // スレッド選択中の場合はスキップ（handleThreadSelectで処理中）
    if (isSelectingThreadRef.current) return;

    let activeThread = threadManager.getActiveThread();

    // アクティブなスレッドがない場合のみ自動的に作成
    if (!activeThread) {
      console.log('No active thread found, creating new thread automatically');
      activeThread = threadManager.createThread(agentId || undefined, language);
    } else if (activeThread.agentId && activeThread.agentId !== agentId) {
      // スレッドのagentIdと現在のagentIdが異なる場合、スレッドのagentIdに切り替える
      // URL同期のuseEffectが処理するため、ここではsetAgentIdだけを呼ぶ
      console.log('Thread agentId differs from current, switching agent:', {
        threadAgentId: activeThread.agentId,
        currentAgentId: agentId
      });
      setAgentId(activeThread.agentId);
      saveAgentId(activeThread.agentId);
      threadInitializedRef.current = true;
      return;
    }

    // 既存のスレッドがある場合は、そのまま使用
    setActiveThreadId(activeThread.id);
    setCurrentThread(activeThread);

    // スレッドのメッセージをuseChatに設定
    const threadMessages = activeThread.messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map((msg, index) => ({
        id: msg.id || `msg-${index}-${Date.now()}`,
        role: msg.role as 'user' | 'assistant',
        content: msg.content || '',
      }))
      .filter(msg => msg.content.trim().length > 0);

    setMessages(threadMessages);
    lastSavedMessageCount.current = threadMessages.length;
    threadInitializedRef.current = true;
  }, [agents, agentId, router]);

  // dataイベントを監視してAzureスレッドIDを保存
  useEffect(() => {
    if (data && Array.isArray(data) && requestThreadIdRef.current) {
      data.forEach((item: any) => {
        if (item.type === 'azure-thread-id' && item.threadId) {
          const requestThreadId = requestThreadIdRef.current;
          console.log('Azure thread ID received from stream:', {
            azureThreadId: item.threadId,
            localThreadId: requestThreadId
          });

          if (requestThreadId) {
            const success = threadManager.updateAzureThreadId(requestThreadId, item.threadId);
            if (success) {
              // 現在アクティブなスレッドの場合のみ、currentThreadを更新
              if (requestThreadId === activeThreadId) {
                setCurrentThread(threadManager.getActiveThread());
              }
              console.log('Azure thread ID saved successfully to thread:', requestThreadId);
            }
          }
        }
      });
    }
  }, [data, activeThreadId]);

  // activeThreadIdが変更されたときに、スレッドのメッセージを確実に読み込む
  useEffect(() => {
    // スレッド選択中の場合はスキップ（handleThreadSelectで処理中）
    if (isSelectingThreadRef.current) return;
    // 既に読み込み中のスレッドの場合はスキップ
    if (loadingThreadRef.current === activeThreadId) return;

    if (activeThreadId) {
      const thread = threadManager.getThreads().find(t => t.id === activeThreadId);
      if (thread && thread.messages.length > 0) {
        // メッセージが空、またはlastSavedMessageCountが0で、スレッドにメッセージがある場合は読み込む
        if (messages.length === 0 || (messages.length === 0 && lastSavedMessageCount.current === 0)) {
          const threadMessages = thread.messages
            .filter(msg => msg.role === 'user' || msg.role === 'assistant')
            .map((msg, index) => ({
              id: msg.id || `msg-${index}-${Date.now()}`,
              role: msg.role as 'user' | 'assistant',
              content: msg.content || '',
            }))
            .filter(msg => msg.content.trim().length > 0);

          if (threadMessages.length > 0) {
            loadingThreadRef.current = activeThreadId;
            console.log('Loading thread messages on activeThreadId change:', {
              threadId: activeThreadId,
              messageCount: threadMessages.length,
              currentMessagesLength: messages.length
            });
            // メッセージを確実に設定（useChatの再初期化を防ぐため、同期的に実行）
            setMessages(threadMessages);
            lastSavedMessageCount.current = threadMessages.length;
            // 読み込み完了後にフラグをリセット
            setTimeout(() => {
              loadingThreadRef.current = null;
            }, 100);
          }
        }
      }
    }
  }, [activeThreadId, messages.length, setMessages]);

  // メッセージが変更されたときにローカルストレージに保存（ユーザーメッセージのみ）
  useEffect(() => {
    if (activeThreadId && messages.length > lastSavedMessageCount.current) {
      // リクエスト送信時のスレッドIDを記録
      requestThreadIdRef.current = activeThreadId;

      const thread = threadManager.getActiveThread();
      if (thread) {
        // 新しいメッセージのみを追加（ユーザーメッセージのみ）
        const newMessages = messages.slice(lastSavedMessageCount.current);
        const userMessages = newMessages.filter(msg => msg.role === 'user');

        console.log('Checking for new user messages:', {
          activeThreadId,
          lastSavedCount: lastSavedMessageCount.current,
          currentMessagesCount: messages.length,
          newMessagesCount: newMessages.length,
          userMessagesCount: userMessages.length,
          userMessages: userMessages.map(m => ({ role: m.role, content: m.content.substring(0, 20) + '...' }))
        });

        if (userMessages.length > 0) {
          userMessages.forEach(message => {
            threadManager.addMessage(
              activeThreadId,
              message.role as 'user' | 'assistant' | 'function' | 'system' | 'data' | 'tool',
              message.content
            );
          });

          // タイトルを自動更新
          const titleUpdated = threadManager.autoUpdateThreadTitle(activeThreadId, language);

          // 更新されたスレッド情報を取得して反映
          const updatedThread = threadManager.getActiveThread();
          if (updatedThread) {
            setCurrentThread(updatedThread);
            console.log('Thread updated after user message:', {
              threadId: updatedThread.id,
              title: updatedThread.title,
              titleUpdated,
              messageCount: updatedThread.messages.length
            });
          }

          lastSavedMessageCount.current = messages.length;
        }
      }
    } else if (activeThreadId && messages.length === 0) {
      // メッセージが空の場合、lastSavedMessageCountをリセット
      console.log('Messages cleared, resetting lastSavedMessageCount:', {
        activeThreadId,
        lastSavedCount: lastSavedMessageCount.current,
        currentMessagesCount: messages.length
      });
      lastSavedMessageCount.current = 0;
    }
  }, [messages.length, activeThreadId]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (lang: AppLanguage) => {
    saveLanguage(lang);
    setLanguage(lang);
  };

  const handleNewThread = useCallback(() => {
    // 現在のメッセージを保存（もしあれば）
    if (activeThreadId && messages.length > 0) {
      const thread = threadManager.getActiveThread();
      if (thread) {
        const newMessages = messages.slice(thread.messages.length);
        newMessages.forEach(message => {
          threadManager.addMessage(
            activeThreadId,
            message.role as 'user' | 'assistant' | 'function' | 'system' | 'data' | 'tool',
            message.content
          );
        });
      }
    }

    // 新しいスレッドは常にエージェント未選択状態で作成
    const newThread = threadManager.createThread(undefined, language);
    setActiveThreadId(newThread.id);
    setCurrentThread(newThread);
    setMessages([]);
    lastSavedMessageCount.current = 0;

    // エージェントを未選択状態にして、ルートパスに遷移
    setAgentId(null);
    router.replace('/');

    console.log('New thread created:', {
      threadId: newThread.id,
      agentId: newThread.agentId,
      lastSavedMessageCount: lastSavedMessageCount.current
    });
  }, [activeThreadId, messages, router]);

  const handleThreadSelect = useCallback((threadId: string) => {
    // 同じスレッドを再度選択した場合は何もしない
    if (activeThreadId === threadId) {
      console.log('Same thread selected, skipping:', threadId);
      return;
    }

    // スレッド選択中フラグを設定
    isSelectingThreadRef.current = true;

    // 現在のメッセージを保存（もしあれば）
    // messagesを直接参照せず、useChatのmessagesを取得するため、refを使用
    const currentMessages = messages;
    if (activeThreadId && currentMessages.length > 0) {
      const currentThread = threadManager.getActiveThread();
      if (currentThread) {
        const newMessages = currentMessages.slice(currentThread.messages.length);
        newMessages.forEach(message => {
          threadManager.addMessage(
            activeThreadId,
            message.role as 'user' | 'assistant' | 'function' | 'system' | 'data' | 'tool',
            message.content
          );
        });
      }
    }

    if (threadManager.setActiveThread(threadId)) {
      const thread = threadManager.getActiveThread();
      if (thread) {
        // スレッドのメッセージを先に準備
        const threadMessages = thread.messages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant') // user/assistantのみ
          .map((msg, index) => ({
            id: msg.id || `msg-${index}-${Date.now()}`,
            role: msg.role as 'user' | 'assistant',
            content: msg.content || '',
          }))
          .filter(msg => msg.content.trim().length > 0); // 空のメッセージを除外

        console.log('Loading thread messages:', {
          threadId,
          agentId: thread.agentId,
          messageCount: threadMessages.length,
          messages: threadMessages,
          originalMessages: thread.messages,
          filteredMessages: thread.messages.filter(msg => msg.role === 'user' || msg.role === 'assistant')
        });

        // メッセージを設定する前に、スレッド初期化フラグを設定して再実行を防ぐ
        threadInitializedRef.current = true;
        loadingThreadRef.current = threadId; // 読み込み中フラグを設定

        // 状態を一括で更新（メッセージを先に設定）
        // Reactのバッチ更新を確実にするため、同期的に実行
        setActiveThreadId(threadId);
        setCurrentThread(thread);
        // メッセージを確実に設定（useEffectで上書きされないように）
        setMessages(threadMessages);
        lastSavedMessageCount.current = threadMessages.length;

        // スレッドのagentIdにエージェントを切り替えて、URLパスに即座に遷移（エージェント選択の整合性を保つ）
        // メッセージ設定後に実行することで、メッセージがクリアされるのを防ぐ
        if (thread.agentId) {
          // スレッドにagentIdがある場合、そのagentIdに対応するURLパスに遷移
          const entry = agents.find(a => a.agentId === thread.agentId);
          if (entry) {
            // 現在のagentIdと異なる場合、または未選択状態の場合のみ更新
            if (agentId !== thread.agentId) {
              console.log('Switching agent to match thread:', {
                threadAgentId: thread.agentId,
                currentAgentId: agentId
              });
              setAgentId(thread.agentId);
              saveAgentId(thread.agentId);
              // スレッド選択時にURLパスに即座に遷移（メッセージ設定後に実行）
              // メッセージが確実に設定された後にURLを変更するため、少し遅延させる
              // requestAnimationFrameを2回使って、レンダリングサイクルを確実に待つ
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  router.replace(`/agent/${entry.index}`);
                  // URL遷移後にフラグをリセット（さらに遅延させて、メッセージが確実に保持されるように）
                  setTimeout(() => {
                    loadingThreadRef.current = null;
                    isSelectingThreadRef.current = false;
                  }, 300);
                });
              });
            } else {
              // agentIdが同じ場合はフラグをリセット
              setTimeout(() => {
                loadingThreadRef.current = null;
                isSelectingThreadRef.current = false;
              }, 100);
            }
          } else {
            setTimeout(() => {
              loadingThreadRef.current = null;
              isSelectingThreadRef.current = false;
            }, 100);
          }
        } else {
          // スレッドにagentIdがない場合はルートパスに遷移（エージェント未選択状態）
          if (agentId !== null) {
            setAgentId(null);
            // メッセージ設定後に実行
            // requestAnimationFrameを2回使って、レンダリングサイクルを確実に待つ
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                router.replace('/');
                // URL遷移後にフラグをリセット（さらに遅延させて、メッセージが確実に保持されるように）
                setTimeout(() => {
                  loadingThreadRef.current = null;
                  isSelectingThreadRef.current = false;
                }, 300);
              });
            });
          } else {
            setTimeout(() => {
              loadingThreadRef.current = null;
              isSelectingThreadRef.current = false;
            }, 100);
          }
        }

        console.log('Messages set:', threadMessages);
      } else {
        isSelectingThreadRef.current = false;
      }
    } else {
      isSelectingThreadRef.current = false;
    }
  }, [activeThreadId, agentId, agents, router, messages]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen gradient-bg p-4 sm:p-6 overflow-hidden">
      {/* アイレポちゃんの浮遊アニメーション */}
      <FloatingIrepochan isResponding={isLoading} />

      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="flex-1 flex overflow-hidden">
        {/* スレッドサイドバー */}
        <ThreadSidebar
          activeThreadId={activeThreadId}
          onThreadSelect={handleThreadSelect}
          onNewThread={handleNewThread}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          language={language}
        />

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col ml-4 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text">
              {t(language, 'appTitle')}
            </h1>
            <div className="flex items-center gap-2">
              <AgentPicker
                language={language}
                value={agentId}
                onChange={(nextId) => {
                  // メッセージがない場合は、現在のスレッドのagentIdを更新するだけ
                  if (messages.length === 0 && activeThreadId) {
                    threadManager.updateThreadAgentId(activeThreadId, nextId);
                    const updatedThread = threadManager.getActiveThread();
                    if (updatedThread) {
                      setCurrentThread(updatedThread);
                    }
                  }

                  setAgentId(nextId);
                  saveAgentId(nextId);
                  const entry = agents.find(a => a.agentId === nextId);
                  const nextIndex = entry?.index || 1;
                  const nextPath = `/agent/${nextIndex}`;
                  router.replace(nextPath);
                }}
                disabled={messages.length > 0}
              />
              <LanguageSwitcher value={language} onChange={handleLanguageChange} />

              <button
                onClick={toggleDarkMode}
                className="p-3 h-10 w-10 leading-none rounded-xl glass-card hover:scale-105 transition-all duration-200 flex items-center justify-center"
                aria-label={t(language, 'toggleDark')}
                title={t(language, 'toggleDark')}
              >
            {isDarkMode ? (
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
              </button>

              <ResourceLinks language={language} />
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex-1 glass-card rounded-2xl p-6 flex flex-col animate-scale-in min-h-0 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto mb-6 scrollbar-thin">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center animate-fade-in">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                      {t(language, 'emptyPromptLead')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      {t(language, 'emptyPromptSub')}
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`max-w-[85%] sm:max-w-[70%] ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}>
                    <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                      {message.role === 'assistant' ? parseUrlsToElements(message.content) : message.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start mb-4 animate-slide-up">
                  <div className="message-assistant">
                    <div className="flex items-center gap-3">
                      <div className="loading-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      <span className="text-sm font-medium">{t(language, 'thinking')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl mb-4 animate-slide-down">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">エラーが発生しました: {error.message}</span>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder={agentId === null ? 'エージェントを選択してください' : t(language, 'inputPlaceholder')}
                  className="input-modern pr-12"
                  disabled={isLoading || agentId === null}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || agentId === null}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t(language, 'sending')}</span>
                    </div>
                  ) : (
                    t(language, 'send')
                  )}
                </button>
                {isLoading && (
                  <button
                    type="button"
                    onClick={stop}
                    className="btn-secondary"
                  >
                    {t(language, 'stop')}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-slow"></div>
              <span>{t(language, 'footerBrand')}</span>
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
