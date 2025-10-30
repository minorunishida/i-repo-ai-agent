## Why
現在のチャットUIはインラインスタイルで実装されており、保守性と一貫性に課題がある。Tailwind CSSを導入することで、デザインシステムの統一、レスポンシブ対応の改善、保守性の向上を実現する。

## What Changes
- インラインスタイルをTailwind CSSクラスに変換
- レスポンシブデザインの改善
- デザインシステムの統一
- ダークモード対応の基盤整備
- アクセシビリティの向上

## Impact
- Affected specs: ui (新規作成)
- Affected code: src/app/page.tsx, src/app/globals.css, tailwind.config.js
- Breaking changes: なし（UIの見た目は維持）
