## Why
既存スレッドでRunを開始する際に、毎回言語リマインドメッセージが追加されてしまう問題がある。言語指示は新規スレッド作成時のみ必要であり、既存スレッドでは初回に既に設定されているため、毎回追加する必要はない。

## What Changes
- 既存スレッドへの言語リマインド追加処理を削除
- 新規スレッド作成時のみ言語指示を追加（既存の実装は維持）
- 仕様を更新して、既存スレッドでは言語リマインドを追加しないことを明記

## Impact
- Affected specs: `azure-agent` (Preferred Language Propagation to Agent要件)
- Affected code: `src/app/api/agent/route.ts` (264-281行目の既存スレッドへの言語リマインド追加処理を削除)

