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
