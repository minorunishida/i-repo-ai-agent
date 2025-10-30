## ADDED Requirements

### Requirement: URL-Driven Agent Selection
UI SHALL parse and reflect agent selection from URL path.

#### Scenario: Root path equals default agent
- **WHEN** the page is loaded at `/`
- **THEN** the active agent is set to index `1` (same as `/agent/1`)

#### Scenario: Parse explicit agent index
- **WHEN** the page is loaded at `/agent/2`
- **THEN** the active agent becomes index `2` and the picker reflects it

#### Scenario: URL precedence over localStorage
- **WHEN** both URL and localStorage have selections
- **THEN** URL wins and localStorage is updated accordingly

### Requirement: Agent Picker Updates URL
The system MUST synchronize UI selection back to URL without full reload.

#### Scenario: PushState on selection
- **WHEN** user selects another agent in the picker
- **THEN** the URL updates to `/agent/{index}` using history API without page reload

#### Scenario: Keep thread/state intact
- **WHEN** URL is updated by selection
- **THEN** current UI state (thread, messages in memory) remains intact

### Requirement: Invalid URL Handling
UI SHALL handle invalid indexes gracefully.

#### Scenario: Out-of-range index
- **WHEN** the URL contains an index that is not configured
- **THEN** UI shows a non-blocking notice and falls back to default agent (index 1)

