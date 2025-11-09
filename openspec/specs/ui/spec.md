# ui Specification

## Purpose
Modern, accessible chat interface with glassmorphism design, optimized for 80% vertical screen utilization and enhanced user experience.
## Requirements
### Requirement: Modern Chat Interface Design
The system SHALL provide a modern, visually appealing chat interface with glassmorphism effects, gradients, and micro-interactions that follows 2024 design trends.

#### Scenario: Modern visual design
- **WHEN** user views the chat interface
- **THEN** the interface displays glassmorphism effects, subtle gradients, and modern typography with proper visual hierarchy

#### Scenario: Vertical space optimization
- **WHEN** user accesses the interface
- **THEN** the layout utilizes 80% of the vertical screen space efficiently

#### Scenario: Micro-interactions
- **WHEN** user interacts with buttons, inputs, or messages
- **THEN** appropriate hover effects, transitions, and micro-animations provide visual feedback

### Requirement: Enhanced Color System
The system SHALL use a modern color palette with gradients and glassmorphism effects instead of basic flat colors.

#### Scenario: Gradient backgrounds
- **WHEN** user views the interface
- **THEN** subtle gradients are applied to backgrounds and key elements

#### Scenario: Glassmorphism effects
- **WHEN** user views chat messages and containers
- **THEN** glassmorphism effects with backdrop blur and transparency are applied

### Requirement: Improved Typography and Spacing
The system SHALL use modern typography scales and improved spacing for better visual hierarchy.

#### Scenario: Typography hierarchy
- **WHEN** user views different text elements
- **THEN** clear typography hierarchy with appropriate font weights and sizes is displayed

#### Scenario: Consistent spacing
- **WHEN** user views the interface
- **THEN** consistent spacing system is applied throughout all components

### Requirement: Enhanced Dark Mode
The system SHALL provide an improved dark mode experience with modern color schemes and proper contrast ratios.

#### Scenario: Dark mode toggle
- **WHEN** user enables dark mode
- **THEN** the interface switches to a modern dark color scheme with proper contrast ratios

#### Scenario: System preference detection
- **WHEN** user has system dark mode enabled
- **THEN** the interface automatically adapts to the system preference

#### Scenario: Input field text visibility in dark mode
- **WHEN** user types in input fields while in dark mode
- **THEN** the text is clearly visible with sufficient contrast (light text on dark background)
- **AND** placeholder text is visible but distinguishable from input text

#### Scenario: Consistent background on scroll in dark mode
- **WHEN** user scrolls the page in dark mode
- **THEN** the background gradient remains consistent throughout the entire viewport
- **AND** no white or light backgrounds appear unexpectedly

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

### Requirement: Performance-Optimized Animations
The system SHALL include smooth, performance-optimized animations and transitions.

#### Scenario: Smooth transitions
- **WHEN** user interacts with interface elements
- **THEN** smooth transitions and animations are displayed without performance impact

#### Scenario: Reduced motion support
- **WHEN** user has reduced motion preferences enabled
- **THEN** animations are disabled or simplified to respect accessibility preferences

### Requirement: Responsive Layout
The system SHALL adapt to different screen sizes with appropriate breakpoints.

#### Scenario: Mobile layout
- **WHEN** viewed on mobile devices (< 768px)
- **THEN** the interface uses single column layout with appropriate spacing

#### Scenario: Desktop layout
- **WHEN** viewed on desktop devices (>= 1024px)
- **THEN** the interface uses centered layout with maximum width constraints

### Requirement: Accessibility Support
The system SHALL meet basic accessibility standards for keyboard navigation and screen readers.

#### Scenario: Keyboard navigation
- **WHEN** user navigates using keyboard only
- **THEN** all interactive elements are accessible via Tab key

#### Scenario: Screen reader support
- **WHEN** accessed with screen reader
- **THEN** proper ARIA labels and semantic HTML are used

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

#### Scenario: Agent names update with language
- **WHEN** the user changes the language
- **THEN** the agent picker fetches and displays agent names in the selected language
- **AND** the agent names are updated immediately without requiring page reload

#### Scenario: Resource links menu next to Language icon
- **WHEN** the user clicks the link icon placed immediately next to the Language icon
- **THEN** a menu appears with five items: i-Reporter Homepage, i-Reporter Knowledge Base, Support Web, Technical Support Request Form, and Genba Form Kaizen Club
- **AND** each item opens in a new tab with `noopener noreferrer`
- **AND** the link labels are localized consistently with the selected UI language
- **AND** the menu is keyboard accessible and exposes proper ARIA roles/labels

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

### Requirement: Agent Selection Control
システムは会話が始まったらエージェント切り替えを無効化し、会話の混在を防がなければならない（SHALL）。

#### Scenario: Agent picker disabled during conversation
- **WHEN** 会話が始まったら（メッセージがある状態）
- **THEN** エージェント選択UIは無効化される
- **AND** エージェント切り替えができない状態になる

#### Scenario: Agent picker re-enabled on new thread
- **WHEN** 新しいスレッドが作成される
- **THEN** エージェント選択UIが再有効化される
- **AND** エージェント切り替えが可能になる

#### Scenario: Active thread deletion prevention
- **WHEN** ユーザーがアクティブなスレッド（現在表示中のスレッド）を削除しようとする
- **THEN** 削除ボタンは表示されない
- **AND** アクティブなスレッドは削除できない

