## MODIFIED Requirements

### Requirement: URL-Driven Agent Selection
UI SHALL parse and reflect agent selection from URL path. The root path `/` SHALL set agent to unselected state (null) to maintain consistency between routing path and agent selection.

#### Scenario: Root path sets agent to unselected
- **WHEN** the page is loaded at `/`
- **THEN** the agent is set to unselected state (`agentId` is `null`)
- **AND** the URL remains `/`
- **AND** no agent is selected in the picker

#### Scenario: Parse explicit agent index
- **WHEN** the page is loaded at `/agent/2`
- **THEN** the active agent becomes index `2` and the picker reflects it
- **AND** the URL remains `/agent/2`

#### Scenario: URL precedence over localStorage
- **WHEN** both URL and localStorage have selections
- **THEN** URL wins and localStorage is updated accordingly

#### Scenario: Consistent routing path
- **WHEN** user accesses the application
- **THEN** the URL path reflects the agent selection state:
  - `/` means no agent selected
  - `/agent/{index}` means agent with that index is selected
- **AND** the routing path and agent selection are always synchronized

#### Scenario: Thread selection updates URL
- **WHEN** user selects a thread from the sidebar
- **THEN** the URL is immediately updated to `/agent/{index}` where index corresponds to the thread's agentId
- **AND** the routing path and agent selection are synchronized

#### Scenario: Invalid agent index fallback
- **WHEN** user accesses `/agent/{index}` where the index does not exist (e.g., `/agent/13` when only agents 1-5 are configured)
- **THEN** the system automatically redirects to `/agent/1`
- **AND** the default agent (index 1) is used

