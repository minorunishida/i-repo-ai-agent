## MODIFIED Requirements
### Requirement: Preferred Language Propagation to Agent
システムはユーザーが選択した言語をAPIに送信し、エージェント応答がその言語で返るようにしなければならない（SHALL）。

#### Scenario: New thread language instruction
- **WHEN** クライアントが新規スレッドを作成してRunを開始する
- **THEN** リクエストには `preferredLanguage` が含まれ
- **AND** サーバはその言語で回答するよう先頭に言語指示メッセージを注入する

#### Scenario: Existing thread language instruction
- **WHEN** 既存スレッドでRunを開始する
- **THEN** サーバは言語リマインドのメッセージを追加しない
- **AND** 新規スレッド作成時に既に設定された言語指示が継続して適用される

