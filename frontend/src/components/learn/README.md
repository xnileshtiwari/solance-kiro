# Learn Page Components

This directory contains modular components for the learn page, separated for better maintainability.

## Components

### QuestionHeader
Displays the current question with level indicator and loading skeleton.

### ModeToggle
Toggle button to switch between Normal Mode and Assist Mode.

### NormalMode
Direct answer input interface where students submit their complete answer.

### AssistMode
Step-by-step guided learning interface using BlockInterface.

### BackgroundBlobs
Animated background decorative elements.

## Hook

### useLearnPage (in hooks/useLearnPage.ts)
Custom hook that manages all the learn page state and logic:
- Question initialization
- Mode switching
- Answer submission
- Session completion
- Error handling

## Usage

```tsx
import { useLearnPage } from '../../../hooks/useLearnPage';
import { QuestionHeader, ModeToggle, NormalMode, AssistMode } from '../../../components';

const { mode, session, handleModeToggle, ... } = useLearnPage(subjectId);
```
