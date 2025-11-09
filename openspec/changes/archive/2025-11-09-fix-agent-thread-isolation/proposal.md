## Why
エージェントを切り替えた後に会話を開始すると、どのエージェントと会話したかが分からなくなり、会話が混在してしまう問題がある。現在の実装では、スレッドにエージェントIDが紐づいていないため、エージェント切り替え時に適切なスレッドを切り替えられていない。また、ストレージとも整合性が取れていない。

## What Changes
- 会話が始まったら（メッセージがある状態）エージェント切り替えを無効化（disable）する
- 新しいスレッドを作成すれば、またエージェント切り替え可能になる
- `AgentPicker`コンポーネントに`disabled`プロパティを追加
- メッセージがある時はエージェント切り替えボタンを無効化する

## Impact
- Affected specs: `ui` (Agent Selection要件)
- Affected code:
  - `src/components/AgentPicker.tsx` - `disabled`プロパティを追加
  - `src/app/page.tsx` - メッセージがある時に`AgentPicker`を無効化する処理を追加

