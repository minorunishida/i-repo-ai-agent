## ADDED Requirements

### Requirement: Agent Name Internationalization
The system SHALL support multilingual agent names via comma-separated values in environment variables and display them according to the user's selected language.

#### Scenario: Environment variable parsing
- **WHEN** the agent API loads configuration from environment variables
- **THEN** it parses `AZURE_AGENT_ID_NAME` (and `AZURE_AGENT_ID{N}_NAME`) as comma-separated values in order: `en, ja, zh-Hans, zh-Hant, th`

#### Scenario: Language-specific agent name display
- **WHEN** the admin agents API receives a request with `lang` query parameter
- **THEN** it returns the agent name in the specified language based on the parsed comma-separated values

#### Scenario: Fallback for single-language names
- **WHEN** the environment variable contains a single value (no commas)
- **THEN** that value is used for all languages

#### Scenario: Fallback for missing translations
- **WHEN** the requested language index is not available in the comma-separated list
- **THEN** the system falls back to Japanese, then English, then the first available value


