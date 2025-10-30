'use client';

import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';
import ThreadSidebar from '@/components/ThreadSidebar';
import { threadManager, Thread } from '@/lib/threadStorage';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const lastSavedMessageCount = useRef<number>(0);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, error, setMessages } =
    useChat({ 
      api: '/api/agent',
      body: {
        threadId: activeThreadId,
      },
      onFinish: (message) => {
        // ストリーミング完了後にメッセージを保存
        if (activeThreadId && message.role === 'assistant') {
          console.log('Streaming finished, saving assistant message:', {
            role: message.role,
            content: message.content.substring(0, 50) + '...',
            contentLength: message.content.length,
            threadId: activeThreadId
          });
          
          const success = threadManager.addMessage(
            activeThreadId,
            message.role as 'user' | 'assistant' | 'function' | 'system' | 'data' | 'tool',
            message.content
          );
          
          if (success) {
            // タイトルを自動更新
            threadManager.autoUpdateThreadTitle(activeThreadId);
            
            setCurrentThread(threadManager.getActiveThread());
            lastSavedMessageCount.current = messages.length;
            
            console.log('Assistant message saved successfully');
          } else {
            console.log('Failed to save assistant message (duplicate or error)');
          }
        }
      },
    });

  // Dark mode toggle
  useEffect(() => {
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

  // スレッド管理の初期化
  useEffect(() => {
    const activeThread = threadManager.getActiveThread();
    if (activeThread) {
      setActiveThreadId(activeThread.id);
      setCurrentThread(activeThread);
      // スレッドのメッセージをuseChatに設定
      const threadMessages = activeThread.messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant') // user/assistantのみ
        .map((msg, index) => ({
          id: msg.id || `msg-${index}-${Date.now()}`,
          role: msg.role as 'user' | 'assistant',
          content: msg.content || '',
        }))
        .filter(msg => msg.content.trim().length > 0); // 空のメッセージを除外
      
      console.log('Initializing with thread:', {
        threadId: activeThread.id,
        title: activeThread.title,
        messageCount: threadMessages.length,
        messages: threadMessages,
        originalMessages: activeThread.messages
      });
      
      setMessages(threadMessages);
      lastSavedMessageCount.current = threadMessages.length;
    }
  }, []);

  // メッセージが変更されたときにローカルストレージに保存（ユーザーメッセージのみ）
  useEffect(() => {
    if (activeThreadId && messages.length > lastSavedMessageCount.current) {
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
          threadManager.autoUpdateThreadTitle(activeThreadId);
          
          setCurrentThread(threadManager.getActiveThread());
          lastSavedMessageCount.current = messages.length;
        }
      }
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

  const handleNewThread = () => {
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
    
    const newThread = threadManager.createThread();
    setActiveThreadId(newThread.id);
    setCurrentThread(newThread);
    setMessages([]);
    lastSavedMessageCount.current = 0;
  };

  const handleThreadSelect = (threadId: string) => {
    // 現在のメッセージを保存（もしあれば）
    if (activeThreadId && messages.length > 0) {
      const currentThread = threadManager.getActiveThread();
      if (currentThread) {
        const newMessages = messages.slice(currentThread.messages.length);
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
        setActiveThreadId(threadId);
        setCurrentThread(thread);
        
        // スレッドのメッセージをuseChatに設定
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
          messageCount: threadMessages.length,
          messages: threadMessages,
          originalMessages: thread.messages,
          filteredMessages: thread.messages.filter(msg => msg.role === 'user' || msg.role === 'assistant')
        });
        
        setMessages(threadMessages);
        lastSavedMessageCount.current = threadMessages.length;
        console.log('Messages set:', threadMessages);
      }
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen gradient-bg p-4 sm:p-6">
      <div className="max-w-6xl mx-auto h-[80vh] flex">
        {/* スレッドサイドバー */}
        <ThreadSidebar
          activeThreadId={activeThreadId}
          onThreadSelect={handleThreadSelect}
          onNewThread={handleNewThread}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
        
        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col ml-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text">
              i-Repo
            </h1>
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-xl glass-card hover:scale-105 transition-all duration-200"
              aria-label="Toggle dark mode"
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
          </div>
          
          {/* Chat Container */}
          <div className="flex-1 glass-card rounded-2xl p-6 flex flex-col animate-scale-in">
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
                      メッセージを入力してチャットを開始してください
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      AIアシスタントがお手伝いします
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
                      {message.content}
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
                      <span className="text-sm font-medium">アイれぽちゃんAIが考えています...</span>
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
                  placeholder="メッセージを入力..."
                  className="input-modern pr-12"
                  disabled={isLoading}
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
                  disabled={isLoading || !input.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>送信中</span>
                    </div>
                  ) : (
                    '送信'
                  )}
                </button>
                {isLoading && (
                  <button
                    type="button"
                    onClick={stop}
                    className="btn-secondary"
                  >
                    停止
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-slow"></div>
              <span>i-Repo Agent Service</span>
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
