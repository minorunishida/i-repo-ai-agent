## Why
エージェント選択を URL で明示できるようにして、直リンク・ブックマーク・共有を可能にしたい。`/` は既定（index=1）を意味し、`/agent/1` と同義。`/agent/2` などの形式で UI/サーバ両方が選択状態を同期する（クラウド種別は URL に露出しない）。

## What Changes
- ルーティングに `agent/[index]`（index: 1..N）を追加（または URL 読み取りロジックを導入）
- ページロード時にパスから agentIndex を解決 → UI の選択に反映（localStorage より URL 優先）
- UI 側でエージェント選択が変わった場合、URL も `pushState` で同期（フルリロードなし）
- 無効な index は 404 または 400 相当の UI 表示（デフォルトへフォールバック可）
- API 送信時は UI の選択（URL 同期済み）から `agentId` を確定し送信

## Impact
- Affected specs: `ui`, `azure-agent`
- Affected code: `src/app/page.tsx`（ルーティング連携）、`src/components/AgentPicker.tsx`（URL 同期）、`src/app/api/agent/route.ts`（既存のバリデーション前提でOK）
- Routing: App Router で `agent/[index]` 読み取り、またはカスタムフックで `pathname` 解析

