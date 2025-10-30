## ADDED Requirements

### Requirement: Language Switcher and UI Localization
The system SHALL provide end-user language selection and localize UI strings.

#### Scenario: Switch language from header
- **WHEN** the user clicks the Language icon next to the dark mode toggle
- **THEN** a menu with languages (Japanese, English, Simplified Chinese, Traditional Chinese, Thai) appears
- **AND** selecting one updates UI texts immediately

#### Scenario: Persist selection
- **WHEN** the user reloads the page
- **THEN** the previously selected language is restored

#### Scenario: Update document language
- **WHEN** a language is selected
- **THEN** the `<html lang>` attribute reflects that language code


