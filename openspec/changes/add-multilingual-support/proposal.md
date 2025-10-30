## Why
プロダクトを多言語（日本語既定、英語、簡体字中国語、繁体字中国語、タイ語）で利用可能にし、UI と LLM 応答を選択言語に統一するため。

## What Changes
- ヘッダーに言語切替 UI（ダークモードボタン横）を追加
- 選択言語を永続化（localStorage）し、`<html lang>` に反映
- UI 文言を i18n 化（上記 5 言語）
- フロントエンドから API に `preferredLanguage` を送信
- サーバ（Agent API）が言語指示を内部注入し、エージェント応答を選択言語に統一

## Impact
- Affected specs: ui/spec.md, azure-agent/spec.md
- Affected code: `src/app/page.tsx`, `src/components/LanguageSwitcher.tsx`, `src/lib/i18n.ts`, `src/app/api/agent/route.ts`, `src/app/layout.tsx`


