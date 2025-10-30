## 1. Implementation
- [ ] 1.1 `src/lib/i18n.ts` を作成（言語定義、辞書、保存/取得ヘルパー）
- [ ] 1.2 `src/components/LanguageSwitcher.tsx` を実装（UI、永続化、外部 onChange）
- [ ] 1.3 `src/app/page.tsx` を i18n 対応（UI 文言、`preferredLanguage` 送出、`<html lang>` 更新）
- [ ] 1.4 `src/app/api/agent/route.ts` が `preferredLanguage` を受け、言語指示を内部注入
- [ ] 1.5 `src/app/layout.tsx` の `html lang` 既定を `ja` として維持

## 2. QA
- [ ] 2.1 言語切替が即時反映される
- [ ] 2.2 再読み込み後も選択が保持される
- [ ] 2.3 LLM 応答が選択言語で返る（新規/既存スレッド）
- [ ] 2.4 SSE ストリーミングに影響がない


