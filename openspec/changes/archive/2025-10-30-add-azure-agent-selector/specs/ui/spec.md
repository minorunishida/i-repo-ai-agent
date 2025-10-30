## ADDED Requirements

### Requirement: Agent Picker in Header
UI SHALL provide an agent selection control allowing users to choose the active Azure Agent.

#### Scenario: Show agent names in picker
- **WHEN** the user opens the picker
- **THEN** it lists available agents by human-friendly name from the registry

#### Scenario: Apply selection to next messages
- **WHEN** the user selects an agent
- **THEN** subsequent requests are sent with that `agentId` until changed

#### Scenario: Persist selection
- **WHEN** the page reloads
- **THEN** the last selected agent remains active (e.g., via localStorage)

#### Scenario: Accessible control
- **WHEN** navigating with keyboard or screen reader
- **THEN** the picker is operable via keyboard and exposes proper ARIA labeling

#### Scenario: Mobile responsive
- **WHEN** viewed on small screens
- **THEN** the picker remains usable without overlapping critical UI

### Requirement: Agent Indicator
UI MUST display the currently selected agent near the picker.

#### Scenario: Update indicator on selection
- **WHEN** an agent is selected
- **THEN** the indicator updates immediately without page reload

### Requirement: Error and Fallback Handling
UI SHALL handle unavailable agents gracefully.

#### Scenario: Unknown/disabled agent
- **WHEN** an agent is not available in the registry
- **THEN** UI falls back to default and shows a non-blocking notice

### Requirement: Display Runtime Agent Info
UI SHALL surface which agent is currently active.

#### Scenario: Show agent name near stream
- **WHEN** a stream starts
- **THEN** UI displays the selected agent name, using response metadata when available

