## Purpose
Azure AI Foundry Agent ServiceとVercel AI SDKを統合し、リアルタイムストリーミングチャット機能を提供する。ユーザーはブラウザからAzure Agent Serviceと対話でき、ストリーミング形式でレスポンスを受信できる。
## Requirements
### Requirement: Azure Agent Service Integration
システムはAzure AI Foundry Agent Serviceと統合し、リアルタイムチャット機能を提供する必要がある。システムはSHALL Azure Agent Service APIと統合し、ストリーミング機能を提供する。

#### Scenario: Successful chat message streaming
- **WHEN** ユーザーがメッセージを送信する
- **THEN** Azure Agent Serviceからストリーミングレスポンスを受信し、リアルタイムで表示する

#### Scenario: Authentication with Azure
- **WHEN** APIルートが呼び出される
- **THEN** MSAL Nodeを使用してAzureからBearerトークンを取得し、Agent Serviceに認証する

#### Scenario: SSE to UI Message Stream conversion
- **WHEN** AzureからSSEイベントを受信する
- **THEN** Vercel AI SDKのUI Message Stream形式に変換してクライアントに送信する

### Requirement: Chat User Interface
システムはuseChatフックを使用したチャットインターフェースを提供する必要がある。システムはSHALL useChatフックを使用してリアルタイムチャットUIを実装する。

#### Scenario: Message display
- **WHEN** メッセージが受信される
- **THEN** チャットUIにメッセージが表示される

#### Scenario: Real-time streaming
- **WHEN** Azure Agent Serviceからストリーミングレスポンスが送信される
- **THEN** メッセージがリアルタイムで更新される

#### Scenario: User input handling
- **WHEN** ユーザーがメッセージを入力して送信する
- **THEN** メッセージがAPIルートに送信され、処理される

### Requirement: Error Handling
システムは適切なエラーハンドリングを提供する必要がある。システムはSHALL 認証エラー、APIエラー、ストリーム中断などのエラーを適切に処理する。

#### Scenario: Authentication failure
- **WHEN** Azure認証に失敗する
- **THEN** 適切なエラーメッセージを表示し、ユーザーに通知する

#### Scenario: API errors
- **WHEN** Azure Agent Service APIでエラーが発生する
- **THEN** HTTPステータスコードに応じた適切なエラーハンドリングを行う

#### Scenario: Stream interruption
- **WHEN** ストリーミング接続が中断される
- **THEN** 接続を適切にクリーンアップし、ユーザーに通知する

#### Scenario: Request validation
- **WHEN** 不正なリクエストが送信される
- **THEN** 適切なエラーメッセージとHTTPステータスコードを返す

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

### Requirement: Agent Name Internationalization
システムは環境変数のカンマ区切り値による多言語エージェント名をサポートし、ユーザーが選択した言語に応じて表示しなければならない（SHALL）。

#### Scenario: Environment variable parsing
- **WHEN** エージェントAPIが環境変数から設定を読み込む
- **THEN** `AZURE_AGENT_ID_NAME`（および `AZURE_AGENT_ID{N}_NAME`）をカンマ区切り値として、順番 `en, ja, zh-Hans, zh-Hant, th` でパースする

#### Scenario: Language-specific agent name display
- **WHEN** 管理用エージェントAPIが `lang` クエリパラメータ付きでリクエストを受信する
- **THEN** パースされたカンマ区切り値に基づいて、指定された言語のエージェント名を返す

#### Scenario: Fallback for single-language names
- **WHEN** 環境変数が単一値（カンマなし）を含む
- **THEN** その値をすべての言語で使用する

#### Scenario: Fallback for missing translations
- **WHEN** リクエストされた言語のインデックスがカンマ区切りリストにない
- **THEN** システムは日本語、次に英語、次に最初の利用可能な値の順にフォールバックする

