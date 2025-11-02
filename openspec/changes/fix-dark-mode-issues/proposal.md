## Why
ダークモード時に2つの致命的なUI問題が発生しており、ユーザビリティを著しく損なっている：
1. スクロール時に背景が途中から白くなり、デザインの一貫性が失われる
2. 入力フォームのテキストが黒背景に黒文字で表示され、入力内容が見えない

## What Changes
- **背景スクロール問題**: `min-h-screen` を `h-screen` に変更し、親要素でフルスクリーン固定、overflow制御を適切に設定
- **入力フォーム視認性**: `.input-modern` に `text-gray-900 dark:text-gray-100` を追加し、ダークモードでテキストが見えるようにする
- **その他のテキスト要素**: 同様の問題がないか全体をチェックし、必要に応じて修正

## Impact
- Affected specs: ui/spec.md
- Affected code: `src/app/globals.css`, `src/app/page.tsx`

