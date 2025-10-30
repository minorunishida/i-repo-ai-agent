## MODIFIED Requirements

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

#### Scenario: Resource links menu next to Language icon
- **WHEN** the user clicks the link icon placed immediately next to the Language icon
- **THEN** a menu appears with five items: i-Reporter Homepage, i-Reporter Knowledge Base, Support Web, Technical Support Request Form, and Genba Form Kaizen Club
- **AND** each item opens in a new tab with `noopener noreferrer`
- **AND** the link labels are localized consistently with the selected UI language
- **AND** the menu is keyboard accessible and exposes proper ARIA roles/labels


