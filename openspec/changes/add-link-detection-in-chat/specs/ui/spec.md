## ADDED Requirements
### Requirement: URL Link Detection and Styling in Chat Messages
システムはAIからの回答メッセージ内のURLを自動的に検出し、テーマカラーでスタイリングされたクリック可能なリンクとして表示しなければならない（SHALL）。リンクは別タブで開き、セキュリティのため適切な属性を設定しなければならない。

#### Scenario: URL detection in assistant messages
- **WHEN** AIからの回答メッセージにURLが含まれる
- **THEN** URLが自動的に検出され、クリック可能なリンクとして表示される
- **AND** リンクはテーマカラー（honest-500/600）でスタイリングされる

#### Scenario: Link opens in new tab
- **WHEN** ユーザーがメッセージ内のリンクをクリックする
- **THEN** リンクは別タブ（`target="_blank"`）で開く
- **AND** セキュリティのため `rel="noopener noreferrer"` が設定される

#### Scenario: Link visibility in light mode
- **WHEN** ライトモードでメッセージ内のリンクを表示する
- **THEN** リンクはテーマカラー（honest-500/600）で表示され、十分な視認性がある

#### Scenario: Link visibility in dark mode
- **WHEN** ダークモードでメッセージ内のリンクを表示する
- **THEN** リンクはダークモードでも視認性の高い色で表示される
- **AND** 背景色とのコントラスト比が十分に確保される

#### Scenario: Multiple URLs in a message
- **WHEN** 1つのメッセージに複数のURLが含まれる
- **THEN** すべてのURLが正しく検出され、それぞれが個別のリンクとして表示される

#### Scenario: URL detection accuracy
- **WHEN** メッセージに様々な形式のURL（http://, https://, www. など）が含まれる
- **THEN** 適切な形式のURLが正しく検出され、リンク化される

