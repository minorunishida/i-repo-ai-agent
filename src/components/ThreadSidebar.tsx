'use client';

import { useState, useEffect } from 'react';
import { threadManager, Thread } from '@/lib/threadStorage';

interface ThreadSidebarProps {
  activeThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ThreadSidebar({
  activeThreadId,
  onThreadSelect,
  onNewThread,
  isCollapsed,
  onToggleCollapse,
}: ThreadSidebarProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    // 初期化時にスレッドを読み込み
    setThreads(threadManager.getThreads());
    
    // スレッド変更を監視するためのポーリング（実際の実装ではイベントベースにする）
    const interval = setInterval(() => {
      setThreads(threadManager.getThreads());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const filteredThreads = searchQuery
    ? threadManager.searchThreads(searchQuery)
    : threads;

  const handleDeleteThread = (threadId: string) => {
    if (threadManager.deleteThread(threadId)) {
      setThreads(threadManager.getThreads());
      if (activeThreadId === threadId) {
        onNewThread(); // 削除されたスレッドがアクティブだった場合、新規スレッドを作成
      }
    }
    setShowDeleteConfirm(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 1週間以内
      return date.toLocaleDateString('ja-JP', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border-r border-white/20 dark:border-gray-700/20 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-3 rounded-xl glass-card hover:scale-105 transition-all duration-200 mb-4"
          aria-label="スレッド一覧を表示"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={onNewThread}
          className="p-3 rounded-xl glass-card hover:scale-105 transition-all duration-200"
          aria-label="新しいスレッドを作成"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border-r border-white/20 dark:border-gray-700/20 flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-white/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            会話履歴
          </h2>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors"
            aria-label="サイドバーを閉じる"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 新規スレッドボタン */}
        <button
          onClick={onNewThread}
          className="w-full btn-primary flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新しい会話
        </button>

        {/* 検索ボックス */}
        <div className="relative">
          <input
            type="text"
            placeholder="会話を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full input-modern pl-10"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* スレッド一覧 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredThreads.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? '検索結果が見つかりません' : '会話履歴がありません'}
          </div>
        ) : (
          <div className="p-2">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className={`group relative p-3 rounded-xl mb-2 cursor-pointer transition-all duration-200 ${
                  activeThreadId === thread.id
                    ? 'bg-primary-500/20 border border-primary-500/30'
                    : 'hover:bg-white/10 dark:hover:bg-gray-800/50'
                }`}
                onClick={() => onThreadSelect(thread.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {thread.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {thread.preview}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(thread.updatedAt)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {thread.messages.length}件
                      </span>
                    </div>
                  </div>
                  
                  {/* 削除ボタン */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(thread.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                    aria-label="スレッドを削除"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              会話を削除
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              この会話を削除しますか？この操作は元に戻せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDeleteThread(showDeleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
