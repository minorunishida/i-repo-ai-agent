## ADDED Requirements

### Requirement: Automatic Thread Creation on First Access
The system SHALL automatically create a conversation thread when user first accesses the application if no active thread exists.

#### Scenario: Initial thread creation
- **WHEN** user accesses the application for the first time or when no active thread exists
- **THEN** a new thread is automatically created
- **AND** the thread is saved to localStorage immediately
- **AND** the sidebar displays the newly created thread

#### Scenario: Thread persistence across sessions
- **WHEN** user sends messages in the auto-created thread
- **THEN** all messages are saved to the thread
- **AND** the thread title is updated based on the first user message

## MODIFIED Requirements

### Requirement: Responsive Layout
The system SHALL adapt to different screen sizes with appropriate breakpoints.

#### Scenario: Mobile layout
- **WHEN** viewed on mobile devices (< 768px)
- **THEN** the interface uses single column layout with appropriate spacing

#### Scenario: Desktop layout
- **WHEN** viewed on desktop devices (>= 1024px)
- **THEN** the interface uses centered layout with maximum width constraints

#### Scenario: Agent routing
- **WHEN** user accesses `/agent` path
- **THEN** the system redirects to `/agent/1` (default agent)

#### Scenario: Invalid agent index handling
- **WHEN** user accesses an agent path with non-existent index (e.g., `/agent/99`)
- **THEN** the system redirects to the default agent or shows an appropriate fallback
- **AND** no 404 error is shown for valid agent paths

