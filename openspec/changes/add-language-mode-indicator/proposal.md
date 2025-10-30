## Why
ユーザーが現在選択中の言語を即座に把握できず、意図しない言語で操作してしまうリスクがあるため。UI 上で「日本語モード」等の明示を行い、認知負荷を下げる。

## What Changes
- ヘッダーの言語スイッチャーの近くに「現在の言語モード」バッジを表示（例: 「日本語モード」）。
- i18n に表示用のキー（languageModeLabel, currentLanguage）を追加して各言語で翻訳。
- アクセシビリティ属性（aria-label/title）にも反映。

## Impact
- Affected specs: ui/spec.md（表示要件の追加）
- Affected code: src/app/page.tsx, src/components/LanguageSwitcher.tsx（隣接表示/配置）, src/lib/i18n.ts（辞書追加）

