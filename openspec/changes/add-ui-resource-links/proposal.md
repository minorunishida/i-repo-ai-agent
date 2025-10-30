## Why
ヘッダーの言語アイコン横に、ユーザーがよく参照する外部リソース（i-Reporterナレッジベース、サポートウェブ、現場帳票カイゼン部）への導線を追加し、支援情報へのアクセス性を向上させる。

## What Changes
- ヘッダーの言語スイッチャー横にリンクアイコンを追加し、3つの外部リンクメニューを表示
- リンクラベルは UI の表示言語に連動して多言語化
- 新規コンポーネント `src/components/ResourceLinks.tsx` を導入
- `i18n` に関連キー（openLinks/linkKnowledgeBase/linkSupportWeb/linkKaizenClub）を追加

## Impact
- Affected specs: `ui/spec.md`（Language Switcher and UI Localization の拡張）
- Affected code: `src/components/LanguageSwitcher.tsx`（隣接配置想定）, `src/components/ResourceLinks.tsx`, `src/lib/i18n.ts`, `src/app/page.tsx`


