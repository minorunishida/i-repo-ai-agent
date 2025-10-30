## ADDED Requirements

### Requirement: Thread Management
システムは複数のチャットスレッドを管理し、新規スレッドの作成と既存スレッドの切り替えを提供する必要がある。システムはSHALL スレッド管理機能を提供し、ユーザーが複数の会話を並行して行えるようにする。

#### Scenario: Create new thread
- **WHEN** ユーザーが新規スレッドボタンをクリックする
- **THEN** 新しいスレッドIDが生成され、空のチャット画面が表示される

#### Scenario: Switch between threads
- **WHEN** ユーザーがスレッド一覧から既存スレッドを選択する
- **THEN** 選択されたスレッドの会話履歴が表示される

#### Scenario: Thread persistence
- **WHEN** ユーザーがページをリロードする
- **THEN** アクティブなスレッドとその会話履歴が復元される

### Requirement: Local Storage History
システムはブラウザのローカルストレージを使用してチャット履歴を保存し、最大10件のスレッド履歴を管理する必要がある。システムはSHALL ローカルストレージを使用してスレッド履歴を永続化する。

#### Scenario: Save thread history
- **WHEN** ユーザーがメッセージを送信する
- **THEN** スレッドの会話履歴がローカルストレージに保存される

#### Scenario: Load thread history
- **WHEN** アプリケーションが初期化される
- **THEN** ローカルストレージから最大10件のスレッド履歴が読み込まれる

#### Scenario: History limit management
- **WHEN** スレッド数が10件を超える
- **THEN** 最も古いスレッドが削除され、新しいスレッドが保存される

#### Scenario: Thread metadata
- **WHEN** スレッドが作成される
- **THEN** スレッドID、作成日時、最終更新日時、最初のメッセージのプレビューが保存される
