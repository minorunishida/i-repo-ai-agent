## ADDED Requirements

### Requirement: Multiple Azure Agent Registry
The system SHALL support multiple Azure Agent definitions and resolve `assistant_id` per request.

#### Scenario: Resolve assistant_id from request
- **WHEN** a request includes a valid `agentId`
- **THEN** the server resolves it to the configured `assistant_id` and uses it for the run

#### Scenario: Default agent fallback
- **WHEN** no `agentId` is provided
- **THEN** the server uses the configured default agent

#### Scenario: Reject unknown agentId
- **WHEN** an unknown `agentId` is provided
- **THEN** the server responds with 400 and a validation error without calling Azure

#### Scenario: Registry is allow-list
- **WHEN** the server processes a request
- **THEN** only `agentId` present in the server-side registry are allowed (no arbitrary IDs)

### Requirement: Streaming with Selected Agent
The system MUST preserve SSE streaming behavior when using the selected `assistant_id`.

#### Scenario: Stream continuity
- **WHEN** a run is created with a selected agent
- **THEN** the server proxies Azure SSE to UI Message Stream unchanged (text-start/delta/end/finish)

#### Scenario: Cancellation propagation
- **WHEN** the client cancels the stream
- **THEN** the server abort signal is propagated to the upstream fetch regardless of selected agent

### Requirement: Environment-Only Agent Configuration
The system SHALL load the agent registry exclusively from environment variables with sequential keys.

#### Scenario: Autodiscover sequential env keys
- **WHEN** the server starts
- **THEN** it autodetects `AZURE_AGENT_ID`, `AZURE_AGENT_ID_NAME`, `AZURE_AGENT_ID2`, `AZURE_AGENT_ID2_NAME`, ... and builds the registry

#### Scenario: Invalid env config is rejected
- **WHEN** env is missing required pairs (ID without NAME or vice versa), or duplicate defaults
- **THEN** the server fails fast at startup or logs explicit errors and skips invalid entries

### Requirement: Agent Execution Auditing
The system MUST record which agent handled each run.

#### Scenario: Log agent selection to server logs
- **WHEN** a run starts
- **THEN** the selected `agentId` and resolved `assistant_id` are logged with a request identifier

#### Scenario: Return agent info in response metadata
- **WHEN** the server returns the streaming response
- **THEN** it also returns lightweight metadata (e.g., headers like `x-agent-id`, `x-agent-name`) so clients can surface it

#### Scenario: Optional local file append
- **WHEN** file I/O is permitted
- **THEN** the server may append a line to a local audit file with timestamp, `agentId`, and request id

