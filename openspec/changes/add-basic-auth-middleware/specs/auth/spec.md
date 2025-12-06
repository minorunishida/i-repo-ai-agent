## ADDED Requirements

### Requirement: Basic Authentication via Middleware
The system SHALL enforce HTTP Basic authentication for all application routes (pages and API routes) using Next.js Middleware.

#### Scenario: Authorized request succeeds
- **WHEN** a request includes an `Authorization: Basic ...` header whose credentials match `BASIC_AUTH_USER` / `BASIC_AUTH_PASS`
- **THEN** the request SHALL proceed to the intended route without modification to the response

#### Scenario: Unauthorized request is challenged
- **WHEN** a request lacks the `Authorization` header or provides invalid Basic credentials
- **THEN** the response SHALL be `401 Unauthorized`
- **AND** the response SHALL include `WWW-Authenticate: Basic realm="Secure Area"`
- **AND** the request SHALL NOT be forwarded to the route handler

#### Scenario: Static assets bypass authentication
- **WHEN** a request targets static or framework assets (e.g., `/_next/static/*`, `/_next/image*`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`)
- **THEN** the request SHALL bypass Basic authentication and proceed normally

#### Scenario: Environment variables required
- **WHEN** `BASIC_AUTH_USER` or `BASIC_AUTH_PASS` is missing
- **THEN** the system SHALL fail closed (e.g., respond with an error rather than allow unauthenticated access)

