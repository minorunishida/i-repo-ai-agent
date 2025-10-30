## ADDED Requirements

### Requirement: URL-Consistent Agent Resolution
The server MUST accept `agentId` from UI and remain agnostic to URL, while client ensures URL and request stay consistent.

#### Scenario: Client derives agentId from URL
- **WHEN** a request is made after page load
- **THEN** client-side derives `agentId` from `/agent/{index}` and sends it; server continues allow-list validation

#### Scenario: Default mapping
- **WHEN** the page is at `/`
- **THEN** client uses default agent (index 1) which maps to `agentId` for the first configured entry

#### Scenario: Unknown index is not forwarded
- **WHEN** URL contains an unknown index
- **THEN** client shall not send an invalid `agentId`; it falls back to default before calling the server

