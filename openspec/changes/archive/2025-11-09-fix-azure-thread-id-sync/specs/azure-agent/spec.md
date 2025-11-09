## MODIFIED Requirements

### Requirement: Thread-Based Context Continuity
システムはthreadIdを使用して会話コンテキストを維持し、エージェント切り替えやページリロード後も継続しなければならない（SHALL）。システムはAzure Agent Serviceから返されたスレッドIDを使用し、ローカルで生成したスレッドIDではなくAzure側のスレッドIDを保持しなければならない。

#### Scenario: Thread continuation across sessions
- **WHEN** ユーザーが会話を開始してスレッドを作成する
- **THEN** Azure Agent Serviceから返されたスレッドIDを使用する
- **AND** 後続のメッセージは同じAzureスレッドIDを使用する
- **AND** AzureスレッドIDはlocalStorageの`Thread.azureThreadId`フィールドに保存される
- **AND** ローカル管理用のID（`Thread.id`）も保持される

#### Scenario: Thread availability across agents
- **WHEN** ユーザーがエージェント間で切り替える
- **THEN** 同じAzureスレッドIDがすべてのエージェントで利用可能
- **AND** 会話コンテキストがシームレスに維持される

#### Scenario: Azure thread ID synchronization
- **WHEN** 新規スレッドがAzure側で作成される
- **THEN** Azureから返されたスレッドIDがクライアント側に送信される
- **AND** クライアント側でAzureスレッドIDが保存される
- **AND** 後続のリクエストでAzureスレッドIDが使用される

#### Scenario: Thread validation and fallback
- **WHEN** 既存スレッドにメッセージを追加しようとする
- **THEN** Azure側でスレッドが存在することを確認する
- **AND** スレッドが存在しない場合（404エラー）、新規スレッドを作成する

#### Scenario: Local storage persistence
- **WHEN** AzureスレッドIDが取得される
- **THEN** `Thread.azureThreadId`フィールドに保存される
- **AND** localStorageの`ai-sdk-threads`キーに保存される
- **AND** ページリロード後も`azureThreadId`が復元される


