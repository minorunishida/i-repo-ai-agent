## MODIFIED Requirements
### Requirement: Agent Selection Control
システムは会話が始まったらエージェント切り替えを無効化し、会話の混在を防がなければならない（SHALL）。

#### Scenario: Agent picker disabled during conversation
- **WHEN** 会話が始まったら（メッセージがある状態）
- **THEN** エージェント選択UIは無効化される
- **AND** エージェント切り替えができない状態になる

#### Scenario: Agent picker re-enabled on new thread
- **WHEN** 新しいスレッドが作成される
- **THEN** エージェント選択UIが再有効化される
- **AND** エージェント切り替えが可能になる

#### Scenario: Active thread deletion prevention
- **WHEN** ユーザーがアクティブなスレッド（現在表示中のスレッド）を削除しようとする
- **THEN** 削除ボタンは表示されない
- **AND** アクティブなスレッドは削除できない

