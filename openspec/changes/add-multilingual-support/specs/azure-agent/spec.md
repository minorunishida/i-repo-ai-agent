## ADDED Requirements

### Requirement: Preferred Language Propagation to Agent
The system SHALL propagate the user's preferred language to the Agent API and ensure assistant responses in that language.

#### Scenario: New thread language instruction
- **WHEN** the client starts a new run (Create Thread and Run)
- **THEN** the request includes `preferredLanguage`
- **AND** the server injects a system instruction to answer in that language

#### Scenario: Existing thread language instruction
- **WHEN** the client continues an existing thread
- **THEN** the server prepends a language reminder message before starting the run


