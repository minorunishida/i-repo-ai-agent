## Why
AIからの回答に含まれるURLを自動的に検出し、クリック可能なリンクとして表示することで、ユーザーが簡単に外部リソースにアクセスできるようにする。現在はURLがプレーンテキストとして表示されるため、コピー&ペーストが必要で使い勝手が悪い。

## What Changes
- AI回答メッセージ内のURLを自動検出してリンク化する機能を追加
- テーマカラー（honest-500/600）を使用したリンクスタイル
- ダークモードでも視認性の高いリンクスタイル
- リンクは別タブ（`target="_blank"`）で開き、セキュリティのため `rel="noopener noreferrer"` を付与
- メッセージ表示コンポーネントでURL検出とリンク変換を実装

## Impact
- Affected specs: `ui` capability
- Affected code:
  - `src/app/page.tsx` (メッセージ表示部分)
  - `src/app/globals.css` (リンクスタイル)
  - 新規: URL検出ユーティリティ関数

