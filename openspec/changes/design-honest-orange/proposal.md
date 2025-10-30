# Design Change: Honest Orange Theme

## Why
現在のデザインをi-Reporterのブランドカラー「オネストオレンジ」を基調としたデザインに変更し、アイレポちゃんの浮遊アニメーションを追加することで、より親しみやすく魅力的なユーザーインターフェースを提供する。

## What Changes
- **BREAKING** カラーテーマをオネストオレンジ（#FF9500）を基調としたデザインに変更
- アイレポちゃんの浮遊アニメーションを追加
- ダークモード/ライトモードの両方でオネストオレンジテーマを適用
- チャットインターフェースの視覚的改善

## Impact
- Affected specs: ui
- Affected code:
  - `src/app/page.tsx` - メインレイアウトとカラーテーマ
  - `src/components/ThreadSidebar.tsx` - サイドバーのデザイン
  - 新規コンポーネント: `FloatingIrepochan` - アイレポちゃんの浮遊アニメーション
  - `src/styles/globals.css` - グローバルスタイルの更新
  - `tailwind.config.js` - カスタムカラーの追加

## Design Specifications
- **Primary Color**: #FF9500 (Honest Orange)
- **Secondary Colors**: 
  - Light Orange: #FFB84D
  - Dark Orange: #E6850A
  - Accent: #FF6B00
- **Floating Animation**: アイレポちゃんが回答中に浮遊するアニメーション
- **Theme Consistency**: ライトモード/ダークモード両方で統一されたデザイン
