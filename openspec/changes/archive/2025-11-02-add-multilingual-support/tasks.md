## 1. Implementation
- [x] 1.1 `src/lib/i18n.ts` を作成（言語定義、辞書、保存/取得ヘルパー）
- [x] 1.2 `src/components/LanguageSwitcher.tsx` を実装（UI、永続化、外部 onChange）
- [x] 1.3 `src/app/page.tsx` を i18n 対応（UI 文言、`preferredLanguage` 送出、`<html lang>` 更新）
- [x] 1.4 `src/app/api/agent/route.ts` が `preferredLanguage` を受け、言語指示を内部注入
- [x] 1.5 `src/app/layout.tsx` の `html lang` 既定を `ja` として維持
- [x] 1.6 `src/lib/agentUtils.ts` を作成（カンマ区切りエージェント名のパース関数）
- [x] 1.7 `src/app/api/admin/agents/route.ts` を更新（`lang` クエリパラメータ対応、多言語名返却）
- [x] 1.8 `src/app/api/agent/route.ts` の `loadRegistry` を更新（言語対応）
- [x] 1.9 `src/components/AgentPicker.tsx` を更新（`lang` パラメータ付きAPI呼び出し、言語変更時の再取得）

## 2. QA
- [x] 2.1 言語切替が即時反映される
- [x] 2.2 再読み込み後も選択が保持される
- [x] 2.3 LLM 応答が選択言語で返る（新規/既存スレッド）
- [x] 2.4 SSE ストリーミングに影響がない
- [x] 2.5 エージェント名が選択言語で表示される
- [x] 2.6 言語切替時にエージェント名も更新される
- [x] 2.7 単一言語のエージェント名（カンマなし）も正常に動作する


