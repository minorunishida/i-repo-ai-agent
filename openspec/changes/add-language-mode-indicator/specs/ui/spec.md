## ADDED Requirements

### Requirement: Language Mode Indicator
UI SHALL display the currently selected language as a visible mode indicator near the language switcher.

#### Scenario: Show Japanese mode when `ja` is selected
- **WHEN** the user selects `ja`
- **THEN** the header shows a badge like "日本語モード"

#### Scenario: Show English mode when `en` is selected
- **WHEN** the user selects `en`
- **THEN** the header shows a badge like "English mode"

#### Scenario: Reflect changes immediately on selection
- **WHEN** the language is changed via the language switcher
- **THEN** the badge text updates immediately without page reload

#### Scenario: Accessible labeling
- **WHEN** using a screen reader
- **THEN** the language control exposes an aria-label/title including the current language


