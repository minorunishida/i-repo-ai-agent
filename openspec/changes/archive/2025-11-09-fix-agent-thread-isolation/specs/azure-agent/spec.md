## MODIFIED Requirements
### Requirement: Thread-Based Context Continuity
システムはthreadIdを使用して会話コンテキストを維持し、エージェント切り替えやページリロード後も継続しなければならない（SHALL）。システムはAzure Agent Serviceから返されたスレッドIDを使用し、ローカルで生成したスレッドIDではなくAzure側のスレッドIDを保持しなければならない。システムは会話が始まったらエージェント切り替えを無効化し、会話の混在を防がなければならない。

#### Scenario: Thread continuation across sessions
- **WHEN** ユーザーが会話を開始してスレッドを作成する
- **THEN** Azure Agent Serviceから返されたスレッドIDを使用する
- **AND** 後続のメッセージは同じAzureスレッドIDを使用する
- **AND** AzureスレッドIDはlocalStorageの`Thread.azureThreadId`フィールドに保存される
- **AND** ローカル管理用のID（`Thread.id`）も保持される

#### Scenario: Agent switch prevention during conversation
- **WHEN** 会話が始まったら（メッセージがある状態）
- **THEN** エージェント切り替えは無効化される
- **AND** 会話の混在を防ぐ

#### Scenario: Agent switch re-enable on new thread
- **WHEN** 新しいスレッドが作成される
- **THEN** エージェント切り替えが再有効化される
- **AND** 新しい会話を開始できる

