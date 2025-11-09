## MODIFIED Requirements

### Requirement: Thread Preview Display in Sidebar
UI SHALL display agent name in the preview section (below the title) for threads in the conversation history sidebar. The title (top) SHALL display the user-generated title as-is, and the preview (bottom) SHALL display the agent name corresponding to the thread's `agentId`.

#### Scenario: Display agent name in preview
- **WHEN** a thread is displayed in the sidebar
- **AND** the thread has an `agentId` set
- **THEN** the preview section (below the title) SHALL display the agent name corresponding to the thread's `agentId`
- **AND** the title section (top) SHALL display the original thread title (user message or generated title)
- **AND** the agent name SHALL be retrieved from `/api/admin/agents?lang=${language}` and be internationalized

#### Scenario: Display original preview when agent info unavailable
- **WHEN** a thread is displayed in the sidebar
- **AND** the agent information cannot be retrieved from the API
- **OR** the thread's `agentId` is not found in the agent list
- **OR** the thread has no `agentId` set
- **THEN** the preview section SHALL display the original preview (first user message) as a fallback
- **AND** no error SHALL be shown to the user

#### Scenario: Internationalization of agent names
- **WHEN** the user changes the application language
- **AND** threads are displayed in the sidebar
- **THEN** the agent names in the preview section SHALL be updated to match the selected language
- **AND** the agent names SHALL be retrieved from `/api/admin/agents?lang=${language}` with the current language parameter

