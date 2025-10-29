'use client';

import { useChat } from 'ai/react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, error } =
    useChat({ api: '/api/agent' });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '32px', color: '#1f2937' }}>
          i-Repo
        </h1>
        
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '24px' }}>
          <div style={{ height: '400px', overflowY: 'auto', marginBottom: '16px', padding: '16px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0' }}>
                メッセージを入力してチャットを開始してください
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: message.role === 'user' ? '#3b82f6' : '#e5e7eb',
                    color: message.role === 'user' ? 'white' : '#1f2937',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#e5e7eb', color: '#1f2937', padding: '12px 16px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid #4b5563',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>入力中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              border: '1px solid #fca5a5', 
              color: '#991b1b', 
              padding: '12px 16px', 
              borderRadius: '6px', 
              marginBottom: '16px' 
            }}>
              エラーが発生しました: {error.message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="メッセージを入力..."
              style={{
                flex: 1,
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '10px 16px',
                fontSize: '16px',
                outline: 'none',
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '6px',
                border: 'none',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !input.trim() ? 0.5 : 1,
                fontWeight: '500',
              }}
            >
              送信
            </button>
            {isLoading && (
              <button
                type="button"
                onClick={stop}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                停止
              </button>
            )}
          </form>
        </div>

        <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '24px' }}>
          Azure AI Foundry Agent Service + Vercel AI SDK
        </div>
      </div>
    </div>
  );
}
