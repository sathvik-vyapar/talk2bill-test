# VAANI User Flow Document
## Detailed User Flows for Desktop & Mobile Apps

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Owner:** Product Management & Design, Vyapar  
**Status:** Active Development  
**Audience:** Designers, Engineers, QA, Product Managers

---

## Table of Contents

1. [Document Overview](#document-overview)
2. [Flow Conventions & Symbols](#flow-conventions--symbols)
3. [Desktop App User Flows](#desktop-app-user-flows)
   - [First-Time Setup Flow](#first-time-setup-flow)
   - [Create Mode - All Transaction Types](#create-mode---all-transaction-types)
   - [Find Mode Flow](#find-mode-flow)
   - [Minimize & Notification Flow](#minimize--notification-flow)
   - [Language Settings Flow](#language-settings-flow)
   - [Hide VAANI Flow](#hide-vaani-flow)
   - [Exit & Survey Flow](#exit--survey-flow)
   - [Error Handling Flow](#error-handling-flow)
4. [Mobile App User Flows](#mobile-app-user-flows-roadmap)
5. [Cross-Platform Behaviors](#cross-platform-behaviors)
6. [Edge Cases & Special Scenarios](#edge-cases--special-scenarios)
7. [Screen Specifications](#screen-specifications)
8. [Interaction Patterns](#interaction-patterns)

---

## Document Overview

### Purpose
This document provides detailed user flows for VAANI voice assistant across Vyapar's desktop and mobile applications. It serves as the single source of truth for:
- **Designers:** Understanding complete user journeys and screen transitions
- **Engineers:** Implementing state management and navigation logic
- **QA:** Creating comprehensive test cases covering all scenarios
- **Product:** Validating user experience and identifying gaps

### Scope
**In Scope:**
- Desktop app (Windows/Mac) - MVP & Post-MVP
- Mobile app (iOS/Android) - Roadmap
- All transaction types: Expenses, Sales, Purchases, Payments In/Out
- Create Mode and Find Mode
- Language settings, error handling, exit flows

**Out of Scope:**
- Backend API specifications (separate document)
- AI model training details (separate document)
- Analytics event tracking (separate document)

### Document Structure
Each flow includes:
1. **Entry Points:** How users access this flow
2. **Preconditions:** Required system/user state
3. **Main Flow:** Step-by-step user journey
4. **Alternative Paths:** Deviations from happy path
5. **Edge Cases:** Unusual but possible scenarios
6. **Exit Points:** How users leave this flow
7. **Success Metrics:** How we measure flow performance

---

## Flow Conventions & Symbols

### Visual Elements
- 🟢 **Green:** Happy path / Success state
- 🟡 **Yellow:** Warning / Caution needed
- 🔴 **Red:** Error state
- 🔵 **Blue:** Information / Question
- ⚪ **White:** Neutral / Processing

### User Actions
- **Click/Tap:** Primary interaction
- **Voice:** Spoken input
- **Type:** Keyboard input
- **Swipe:** Mobile gesture
- **Long Press:** Hold for context menu
- **Keyboard Shortcut:** Desktop only (e.g., Ctrl+V)

### System Actions
- **Auto-proceed:** System advances without user input
- **Background process:** Happens while user does other things
- **Notify:** Desktop notification or mobile push
- **Save draft:** Auto-save partial data

### Flow Notation
- `[Screen Name]` - Indicates a distinct screen/state
- `{Condition}` - Decision point or branching logic
- `→` - Flow direction
- `⟲` - Loop back to previous state
- `||` - Parallel processes

---

## Desktop App User Flows

---

## First-Time Setup Flow

### Entry Points
1. User opens Vyapar desktop app with VAANI enabled
2. User clicks mic button for first time
3. User navigates to Settings → VAANI

### Preconditions
- Vyapar desktop app installed
- VAANI feature flag enabled for user
- Internet connection available

### Main Flow

#### Step 1: App Launch Introduction
**When:** First app launch after VAANI enabled

```
[App Opens] 
→ [VAANI Introduction Screen]
   - Title: "Introducing VAANI - Your Voice Assistant"
   - 3 Key Benefits:
     * "Speak to add transactions - 3x faster"
     * "Works in 10 Indian languages"
     * "Hands-free while you work"
   - Two buttons:
     * "Enable VAANI" (Primary, blue)
     * "Skip for Now" (Secondary, gray)

→ {User Action}
   |
   ├─ "Enable VAANI" → [Check Microphone Permission]
   └─ "Skip for Now" → [Main App] (VAANI disabled, can enable later)
```

#### Step 2: Microphone Permission Request
**Platform-Specific:** OS-level permission dialog

**Windows:**
```
[System Permission Dialog - Windows]
→ "Vyapar wants to use your microphone"
   - Allow button
   - Deny button

→ {User Choice}
   |
   ├─ Allow → [Microphone Test Screen]
   └─ Deny → [Permission Denied Screen]
```

**Mac:**
```
[System Permission Dialog - Mac]
→ "Vyapar would like to access the microphone"
   - Don't Allow button
   - OK button

→ {User Choice}
   |
   ├─ OK → [Microphone Test Screen]
   └─ Don't Allow → [Permission Denied Screen]
```

#### Step 3: Permission Denied Handling

```
[Permission Denied Screen]
→ Content:
   - Icon: 🎤🚫 (mic with red slash)
   - Heading: "Microphone Access Needed"
   - Explanation: "VAANI needs microphone access to understand your voice commands"
   - Platform-specific instructions:
     
     WINDOWS:
     "1. Click the Windows button
      2. Go to Settings → Privacy → Microphone
      3. Turn on 'Allow apps to access your microphone'
      4. Find Vyapar and toggle it ON"
     
     MAC:
     "1. Click Apple menu → System Preferences
      2. Click Security & Privacy → Privacy
      3. Select Microphone from the list
      4. Check the box next to Vyapar"
   
   - Buttons:
     * "Open System Settings" (Primary) → Opens OS settings
     * "Use Manual Entry" (Secondary) → Returns to app without VAANI

→ {User Action}
   |
   ├─ Opens Settings → [User grants permission externally] → [Retry Permission Check]
   └─ Use Manual Entry → [Main App] (VAANI disabled)
```

#### Step 4: Microphone Test

```
[Microphone Test Screen]
→ Content:
   - Icon: 🎤 (animated when sound detected)
   - Heading: "Let's Test Your Microphone"
   - Instructions: "Say something to test... Try: 'Chai 50 rupees'"
   - Visual:
     * Sound level bars (animated when audio detected)
     * "Listening..." indicator
     * "✓ Sound detected!" when audio level > threshold
   
   - Buttons:
     * "Continue" (Primary, enabled after sound detected)
     * "Skip" (Secondary, always enabled)
     * "Microphone Not Working?" (Link) → Opens troubleshooting

→ {User Speaks}
   |
   ├─ Audio Detected (>5 seconds) → "Continue" button lights up
   └─ No Audio (>10 seconds) → [Show troubleshooting tips]

→ User Clicks "Continue" → [Language Selection Screen]
→ User Clicks "Skip" → [Language Selection Screen]
```

**Troubleshooting Tips (Expandable):**
```
- "Check if microphone is plugged in (external mic)"
- "Check if Vyapar has permission in System Settings"
- "Try speaking louder or closer to microphone"
- "Check if another app is using the microphone"
```

#### Step 5: Language Selection

```
[Language Selection Screen]
→ Content:
   - Heading: "Choose Your Language"
   - Subheading: "You can change this later in Settings"
   
   - Speaking Language Section:
     * Label: "I will speak in:" (Default selection)
     * Grid of 10 languages (2 columns × 5 rows):
       1. हिंदी Hindi
       2. English
       3. தமிழ் Tamil
       4. తెలుగు Telugu
       5. বাংলা Bengali
       6. मराठी Marathi
       7. ગુજરાતી Gujarati
       8. ಕನ್ನಡ Kannada
       9. മലയാളം Malayalam
       10. ਪੰਜਾਬੀ Punjabi
     * Visual: Radio buttons, selected language highlighted in blue
   
   - Listening Language Section:
     * Label: "VAANI will respond in:"
     * Current: "English" (only option, grayed)
     * Note: "More languages coming soon"
   
   - Button: "Continue" (Primary, enabled when language selected)

→ User Selects Language → Highlight selection
→ User Clicks "Continue" → [Onboarding Carousel]
```

#### Step 6: Onboarding Carousel

```
[Onboarding Carousel - 3 Slides]

SLIDE 1: "Speak to Add Transactions"
→ Visual: Animation of person speaking, transaction appearing
   - Text: "Just say 'Chai 50 rupees' and VAANI fills the form"
   - Subtext: "Works for Expenses, Sales, Purchases, Payments"

SLIDE 2: "Ask Questions About Your Business"
→ Visual: Animation of voice query, chart appearing
   - Text: "Ask 'What were my sales yesterday?' and get instant answers"
   - Subtext: "Query your data in your own language"

SLIDE 3: "Hands-Free & Fast"
→ Visual: Animation of shopkeeper using voice while working
   - Text: "3x faster than typing - speak while you work"
   - Subtext: "Perfect for busy shop owners, vendors, and distributors"

→ Navigation:
   - Dot indicators (3 dots, current slide highlighted)
   - "Next" button (slides 1-2)
   - "Get Started" button (slide 3)
   - "Skip" link (all slides)

→ {User Action}
   |
   ├─ "Next" → Next slide
   ├─ "Skip" → [Transaction Page with Mic Button Visible]
   └─ "Get Started" → [Transaction Page with Mic Button Visible]
```

#### Step 7: First-Time Mic Button Highlight

```
[Transaction Page - First Time]
→ Floating Mic Button (bottom right, orange, pulsing animation)
→ Tooltip appears after 2 seconds:
   "Click here or press Ctrl+V to use VAANI"
   - Arrow pointing to mic button
   - Auto-dismiss after 5 seconds or user interaction

→ User Clicks Mic Button → [Voice Modal Opens - Create Mode]
```

### Alternative Paths

#### Path A: User Previously Denied Permission
```
[User Clicks Mic Button]
→ System checks permission status
→ {Permission Status = Denied}
→ [Permission Previously Blocked Screen]
   - Similar to Permission Denied, but different messaging:
   - "Microphone Access Was Blocked"
   - "You previously denied microphone access. To use VAANI, please enable it in System Settings."
   - Buttons: "Open Settings" / "Remind Me Later"
```

#### Path B: User Skips Onboarding, Returns Later
```
[User Opens Settings]
→ [VAANI Settings]
→ "Enable VAANI" toggle (currently OFF)
→ User toggles ON
→ [Microphone Permission Request]
→ ... continues from Step 2 ...
```

### Success Metrics
- **Permission Grant Rate:** % of users who allow mic access (Target: 80%)
- **Language Selection Distribution:** Track which languages are most used
- **Onboarding Completion Rate:** % who finish all 3 slides (Target: 60%)
- **Time to First Voice Transaction:** Median time from first launch to first transaction (Target: <3 minutes)

---

## Create Mode - All Transaction Types

### Entry Points
1. User clicks floating mic button (orange, bottom right)
2. User presses keyboard shortcut: **Ctrl+V**
3. User right-clicks transaction row → "Add via Voice"

### Preconditions
- Microphone permission granted
- Internet connection available (MVP requirement)
- User is on a transaction page (Expenses, Sales, Purchases, Payments)

### Main Flow - Happy Path

#### Step 1: Modal Opens

```
[Transaction Page]
→ User Clicks Mic Button / Presses Ctrl+V
→ [Voice Modal Opens - Maximized]

Modal Structure:
┌─────────────────────────────────────┐
│ [Transaction Type Dropdown ▼] [X]   │ ← Header
├─────────────────────────────────────┤
│ [Create] [Find]                     │ ← Tabs (Create is active)
├─────────────────────────────────────┤
│                                     │
│        🎤 Large Mic Icon            │
│     (Not animated yet)              │
│                                     │
│   "Click mic or say 'Start'"        │ ← Body
│                                     │
│   Keyboard: Space = Push to talk    │
│             ESC = Close             │
│                                     │
├─────────────────────────────────────┤
│ [Minimize] [Settings ⚙️] [Help ?]  │ ← Footer
└─────────────────────────────────────┘

→ Transaction Type Dropdown shows:
   - Default based on current page context
   - If on Expenses page → "Expense" selected
   - If on Sales page → "Sale" selected
   - If on Neutral/Home → "Sale" selected (default)
   - Can click dropdown to change type

→ Auto-starts listening after 0.5 seconds
→ [Listening State]
```

#### Step 2: Listening State

```
[Listening State]

Modal Updates:
┌─────────────────────────────────────┐
│ [Expense ▼]            [Minimize] [X]│
├─────────────────────────────────────┤
│ [Create] [Find]                     │
├─────────────────────────────────────┤
│                                     │
│        🎤 Large Mic Icon            │
│     (Animated pulsing)              │
│                                     │
│        🔊🔊🔊🔊🔊                    │ ← Waveform animation
│                                     │
│      "Listening..."                 │
│                                     │
│   [Real-time transcription]         │ ← Shows as user speaks
│                                     │
├─────────────────────────────────────┤
│ Volume: [▮▮▮▮▮▯▯▯▯▯] 50%           │ ← Volume indicator
└─────────────────────────────────────┘

→ User Speaks: "Chai samosa 140 rupees"
→ Transcription appears in real-time:
   "Chai..." → "Chai samosa..." → "Chai samosa 140 rupees"

→ {Voice Detection}
   |
   ├─ Voice Detected → Continue transcribing
   ├─ Silence for 2 seconds after speech → Auto-stop, process
   └─ No audio for 5 seconds → [No Audio Detected Error]

→ User Finishes Speaking (2 sec silence detected)
→ [Processing State]
```

**User Actions During Listening:**
- **Click Mic:** Stop listening, process what was said
- **Press Space:** Push-to-talk (hold to speak, release to process)
- **Click Minimize:** Minimize modal (listening continues)
- **Click X:** Show exit confirmation
- **Click Dropdown:** Change transaction type

#### Step 3: Processing State

```
[Processing State]

Modal Updates:
┌─────────────────────────────────────┐
│ [Expense ▼]                      [X]│
├─────────────────────────────────────┤
│ [Create] [Find]                     │
├─────────────────────────────────────┤
│                                     │
│        ⏳ Processing Icon           │
│        (Spinner animation)          │
│                                     │
│   "Understanding your request..."   │
│                                     │
│   "Chai samosa 140 rupees"         │ ← Transcription shown
│                                     │
│   Processing time: 1.2s             │ ← Timer (for debugging, can hide)
│                                     │
│                                     │
│   [Cancel] button                   │ ← Allows canceling if too slow
│                                     │
└─────────────────────────────────────┘

→ AI Processing (5-agent pipeline):
   1. Intent Detection: "expense" ✓
   2. Entity Extraction: item="chai samosa", amount=140 ✓
   3. Missing Fields Check: category=?, date=?, payment=?
   4. Apply Defaults: date=today, payment=cash
   5. Category AI: "chai samosa" → "Food & Beverages" (from Excel DB)

→ {Extraction Result}
   |
   ├─ All Necessary Fields Present → [Apply Defaults] → [Check Edge Cases]
   └─ Missing Necessary Field → [Ask Question Screen]
```

#### Step 4A: All Fields Captured - Check Edge Cases

```
[Processing Complete - Edge Case Check]

→ {Edge Case Detection}
   |
   ├─ Similar Items Found (Expense only) → [Similar Items Selection]
   ├─ Ambiguous Party/Supplier → [Disambiguation Screen]
   ├─ Multiple Items (3-10) → [Multiple Items Confirmation]
   └─ No Edge Cases → [Success Screen]

EDGE CASE 1: Similar Items (Expense Only)
────────────────────────────────────────
[Similar Items Selection Screen]

┌─────────────────────────────────────┐
│ Select the item you meant           │
├─────────────────────────────────────┤
│                                     │
│ You said: "Chai samosa"             │
│                                     │
│ Similar items from your history:    │
│                                     │
│ ○ Chai + Samosa                     │
│   Category: Food | Last used: Dec 20│
│   Avg amount: ₹50                   │
│                                     │
│ ○ Chai, Samosa, Biscuit             │
│   Category: Food | Last used: Dec 15│
│   Avg amount: ₹80                   │
│                                     │
│ ○ Tea & Snacks                      │
│   Category: Food | Last used: Dec 10│
│   Avg amount: ₹60                   │
│                                     │
│ ─────────────────────────           │
│                                     │
│ ● None of these - Create new item  │
│                                     │
├─────────────────────────────────────┤
│         [Confirm Selection]         │
└─────────────────────────────────────┘

→ User Selects Item → [Success Screen]


EDGE CASE 2: Disambiguation (Payments, Sales, Purchases)
─────────────────────────────────────────────────────────
[Disambiguation Screen]

┌─────────────────────────────────────┐
│ Which "Ramesh" do you mean?         │
├─────────────────────────────────────┤
│                                     │
│ You mentioned: "Ramesh"             │
│                                     │
│ Multiple parties found:             │
│                                     │
│ ○ Ramesh Kumar (9876543210)        │
│   Last transaction: Dec 20, ₹5000  │
│                                     │
│ ○ Ramesh Sharma (9988776655)       │
│   Last transaction: Dec 15, ₹3000  │
│                                     │
│ ○ Ramesh Textiles                   │
│   Last transaction: Dec 10, ₹8000  │
│                                     │
│ ─────────────────────────           │
│                                     │
│ ● None of these - Create new party │
│                                     │
├─────────────────────────────────────┤
│         [Confirm Selection]         │
└─────────────────────────────────────┘

→ User Selects Party → [Success Screen]


EDGE CASE 3: Multiple Items (Expenses, Sales, Purchases)
─────────────────────────────────────────────────────────
[Multiple Items Confirmation Screen]

┌─────────────────────────────────────┐
│ Confirm Items                       │
├─────────────────────────────────────┤
│                                     │
│ I heard 3 items:                    │
│                                     │
│ ☑ Petrol          ₹500             │
│ ☑ Chai            ₹50              │
│ ☑ Samosa          ₹80              │
│                                     │
│ Total: ₹630                         │
│                                     │
│ ─────────────────────────           │
│                                     │
│ [Edit Amount] [Remove]              │ ← Per item actions
│                                     │
├─────────────────────────────────────┤
│ [Add All] [Add Selected Only]       │
└─────────────────────────────────────┘

→ User Confirms → [Success Screen]
```

#### Step 4B: Missing Necessary Field - Ask Question

```
[Ask Question Screen]

Example: Missing Item Name (User said "500 rupees")
┌─────────────────────────────────────┐
│ [Expense ▼]                      [X]│
├─────────────────────────────────────┤
│ [Create] [Find]                     │
├─────────────────────────────────────┤
│                                     │
│        🔵 Question Icon             │
│                                     │
│   "What did you spend ₹500 on?"     │ ← Static question from config
│                                     │
│        🎤 Mic Icon                  │
│     (Listening for answer)          │
│                                     │
│   🔊 Waveform (animated)            │
│                                     │
│   [Type Instead] button             │ ← Option to type
│                                     │
└─────────────────────────────────────┘

→ User Speaks Answer: "Petrol"
→ [Processing State] (re-process with new info)
→ {Check if all fields now present}
   |
   ├─ Still Missing Another Field → [Ask Next Question]
   └─ All Fields Present → [Apply Defaults] → [Check Edge Cases] → [Success]

→ User Clicks "Type Instead"
→ [Text Input Field Appears]
   ┌─────────────────────────┐
   │ What did you buy?       │
   │ [____________]          │
   │      [Submit]           │
   └─────────────────────────┘
→ User Types → Submit → Process
```

**Question Examples by Transaction Type:**

**Expense:**
- Missing Item: "What did you spend ₹{amount} on?"
- Missing Amount: "How much did you spend on {item}?"
- Missing Both: "Please tell me the item and amount. Example: Chai 50 rupees"

**Sale:**
- Missing Party: "Who is the customer?"
- Missing Item: "What did you sell to {party}?"
- Missing Amount: "What is the sale amount?"
- Missing All: "Tell me customer name, item, and amount. Example: Sale to Ramesh, rice 5 kg, 250 rupees"

**Payment In:**
- Missing Party: "Who made the payment?"
- Missing Amount: "How much did {party} pay?"
- Missing Both: "Tell me who paid and how much. Example: Received 5000 from Sharma ji"

**Payment Out:**
- Missing Party: "Who did you pay?"
- Missing Amount: "How much did you pay {party}?"
- Missing Both: "Tell me who you paid and how much. Example: Paid 3000 to Kumar"

**Purchase:**
- Missing Supplier: "Who did you purchase from?"
- Missing Item: "What did you purchase from {supplier}?"
- Missing Amount: "What is the purchase amount?"
- Missing All: "Tell me supplier, item, and amount. Example: Purchased 10 kg onions from Kumar, 500 rupees"

#### Step 5: Success Screen

```
[Success Screen]

┌─────────────────────────────────────┐
│                                     │
│         ✅ Large Checkmark          │
│        (Green, animated)            │
│                                     │
│      "Got it! Filling the form"     │
│                                     │
│   ─────────────────────────────    │
│   Item: Chai samosa                 │
│   Amount: ₹140                      │
│   Category: Food & Beverages        │
│   Date: Today                       │
│   Payment: Cash                     │
│   ─────────────────────────────    │
│                                     │
│   Auto-closing in 2 seconds...      │
│                                     │
└─────────────────────────────────────┘

→ Wait 2 seconds (countdown visible)
→ [Modal Closes with slide-out animation]
→ [Form Pre-fills on Right Panel]
```

#### Step 6: Form Pre-filled

```
[Transaction Page - Form Panel Visible]

Left Side: Transaction List (existing)
Right Side: Form Pre-filled

┌─────────────────────────────────────┐
│ Add Expense                    [X]  │ ← Form header
├─────────────────────────────────────┤
│                                     │
│ 🎤 Voice Badge: "Added via Voice"   │ ← Indicator
│                                     │
│ Item Name: Chai samosa        [📝] │ ← Edit icon
│ Amount: ₹140                  [📝] │
│ Category: Food & Beverages    [📝] │
│ Date: Dec 23, 2024           [📝] │
│ Payment Type: Cash            [📝] │
│                                     │
│ ─────────────────────────────      │
│                                     │
│ [💾 Save] [Cancel]                 │
│                                     │
│ Keyboard: Ctrl+S = Save             │
│           Tab = Next field          │
│           ESC = Cancel              │
│                                     │
└─────────────────────────────────────┘

→ User Reviews Form
→ {User Action}
   |
   ├─ Clicks Save / Presses Ctrl+S → [Validate Form]
   ├─ Clicks Edit Icon → [Field becomes editable] → User edits → Save
   ├─ Clicks Cancel / Presses ESC → [Cancel Confirmation Dialog]
   └─ Changes nothing → Waits → Form remains

VALIDATION:
→ {All Required Fields Valid?}
   |
   ├─ Yes → [Save Success]
   └─ No → [Validation Error Screen]

[Validation Error Screen]
┌─────────────────────────────────────┐
│ ❌ Please fix these errors:         │
│                                     │
│ • Amount cannot be zero             │
│ • Item name is required             │
│                                     │
│ [Go Back to Form]                   │
└─────────────────────────────────────┘

→ Fields with errors highlighted in red
→ User Fixes → Clicks Save Again → Validates

[Save Success]
┌─────────────────────────────────────┐
│ ✅ Expense Added Successfully       │
│                                     │
│ Chai samosa - ₹140                  │
│                                     │
│ [Undo (5 sec)] [Add Another]        │
└─────────────────────────────────────┘
→ Toast notification (auto-dismiss in 5 seconds)
→ Form closes
→ Transaction appears in list with 🎤 voice badge
→ Desktop notification (optional): "Expense saved"

→ {User Action in Toast}
   |
   ├─ Clicks "Undo" (within 5 sec) → Delete transaction, reopen form
   ├─ Clicks "Add Another" → [Voice Modal Opens Again]
   └─ Waits → Toast dismisses, return to transaction list
```

### Transaction Type Variations

#### Expense Form Fields
**Necessary Fields:**
- Item Name
- Amount

**Optional Fields (Defaults Applied):**
- Category (AI suggests, user can change)
- Date (defaults to today)
- Payment Type (defaults to Cash)
- Notes (optional, blank)

#### Sale Form Fields
**Necessary Fields:**
- Party Name (customer)
- Item Name
- Amount

**Optional Fields:**
- Quantity (defaults to 1)
- Unit (defaults to piece/kg based on item)
- Payment Type (defaults to Cash)
- Date (defaults to today)
- Invoice Number (auto-generated)
- Notes (optional)

#### Purchase Form Fields
**Necessary Fields:**
- Supplier Name
- Item Name
- Amount

**Optional Fields:**
- Quantity (defaults to 1)
- Unit (defaults to piece/kg)
- Payment Type (defaults to Cash)
- Date (defaults to today)
- Bill Number (optional)
- Notes (optional)

#### Payment In Form Fields
**Necessary Fields:**
- Party Name (who paid)
- Amount

**Optional Fields:**
- Payment Method (defaults to Cash)
- Date (defaults to today)
- Reference/Note (optional)
- Against Invoice (optional link to sale)

#### Payment Out Form Fields
**Necessary Fields:**
- Party Name (whom paid)
- Amount

**Optional Fields:**
- Payment Method (defaults to Cash)
- Date (defaults to today)
- Reference/Note (optional)
- Against Bill (optional link to purchase)

### Alternative Paths

#### Path A: User Changes Transaction Type Mid-Flow

```
[User in Listening State]
→ User Clicks Transaction Type Dropdown
→ Selects "Sale" (was "Expense")

→ {Has User Spoken Anything?}
   |
   ├─ No → Simply switch type, continue listening
   └─ Yes → [Show Warning]

[Transaction Type Switch Warning]
┌─────────────────────────────────────┐
│ ⚠️ Switch Transaction Type?         │
│                                     │
│ You've already started entering     │
│ an Expense. Switching will clear    │
│ this data.                          │
│                                     │
│ [Cancel] [Yes, Switch Type]         │
└─────────────────────────────────────┘

→ User Clicks "Yes, Switch Type"
→ Clear captured data
→ Reset to Listening State with new type

→ User Clicks "Cancel"
→ Keep current type, return to previous state
```

#### Path B: User Minimizes Modal

```
[User Clicks "Minimize" Button]
→ [Modal Minimizes to Widget]

[Minimized Widget - Bottom Right Corner]
┌──────────────────────┐
│ 🎤 VAANI             │
│ Listening...         │ ← Current state
│ [Expand] [X]         │
└──────────────────────┘

→ Widget stays on screen even if user navigates pages
→ Listening/Processing continues in background
→ {Processing Completes}
→ [Badge Appears on Widget]

[Widget with Notification Badge]
┌──────────────────────┐
│ 🎤 VAANI        [1]  │ ← Red badge with number
│ Response ready       │
│ [Expand] [X]         │
└──────────────────────┘

→ User Clicks Widget or Badge
→ [Modal Expands] showing result (Success/Question/Edge Case)

→ User can continue interacting in minimized state:
   - Speak answers to questions (widget shows "Listening...")
   - Confirm edge cases (widget shows "Confirm?")
   - All interactions work, just in compact form
```

#### Path C: User Navigates to Different Page

```
[Voice Modal Open - User is in Listening State]
→ User Clicks Different Menu Item (e.g., Sales page)
→ Page Changes

→ {Has User Interacted with Voice?}
   |
   ├─ No (just opened modal) → Transaction type updates to match new page
   └─ Yes (already spoke) → State preserved, type doesn't change

Example:
- User on Expenses page → Opens VAANI → Type = "Expense"
- User navigates to Sales page → Type STILL "Expense" (preserves state)
- User minimizes modal, navigates to Sales page → Type STILL "Expense"
- User closes modal, navigates to Sales page, opens VAANI → Type = "Sale" (new session)
```

### Error Scenarios

#### Error 1: Voice Recognition Failed

```
[Error: Voice Recognition Failed]
┌─────────────────────────────────────┐
│ ❌ Couldn't catch that clearly      │
│                                     │
│ I had trouble understanding.        │
│ Please try again.                   │
│                                     │
│ Tips:                               │
│ • Speak clearly and slowly          │
│ • Reduce background noise           │
│ • Move closer to microphone         │
│                                     │
│ [Retry] [Type Instead] [Close]      │
└─────────────────────────────────────┘

→ User Clicks "Retry" → [Listening State]
→ User Clicks "Type Instead" → [Form Opens Blank]
→ User Clicks "Close" → [Exit Confirmation]
```

#### Error 2: Network Error

```
[Error: Network Error]
┌─────────────────────────────────────┐
│ ❌ Connection Lost                  │
│                                     │
│ Check your internet and try again.  │
│                                     │
│ Your voice data has been saved      │
│ and will be processed when you're   │
│ back online.                        │
│                                     │
│ [Retry Now] [Work Offline] [Close]  │
└─────────────────────────────────────┘

→ User Clicks "Retry Now" → Re-attempt API call
→ User Clicks "Work Offline" → Save draft locally, show notification
→ User Clicks "Close" → [Save Draft Confirmation]
```

#### Error 3: No Audio Detected

```
[Error: No Audio Detected]
┌─────────────────────────────────────┐
│ ⚠️ No sound detected                │
│                                     │
│ I haven't heard anything for 5      │
│ seconds. Please check:              │
│                                     │
│ • Is your microphone working?       │
│ • Is Vyapar allowed to use mic?     │
│ • Try the microphone test           │
│                                     │
│ [Test Microphone] [Retry] [Close]   │
└─────────────────────────────────────┘

→ User Clicks "Test Microphone" → [Microphone Test Screen]
→ User Clicks "Retry" → [Listening State]
```

### Success Metrics
- **Voice Transaction Completion Rate:** % who go from listening to saved (Target: 85%)
- **Multi-turn Completion Rate:** % who complete when questions asked (Target: 80%)
- **Edge Case Handling:** % who successfully handle edge cases (Target: 90%)
- **Time to Transaction:** Median seconds from listening to form pre-fill (Target: <8 seconds)
- **Edit Rate:** % who edit voice-filled forms before saving (Target: <20%)

---

## Find Mode Flow

### Entry Points
1. User clicks "Find" tab in voice modal
2. User presses keyboard shortcut: **Ctrl+F** (when modal open)

### Preconditions
- Voice modal is open
- User has existing transactions in database
- Internet connection available

### Main Flow

#### Step 1: Switch to Find Mode

```
[Voice Modal - Create Tab Active]
→ User Clicks "Find" Tab
→ [Find Mode Interface]

┌─────────────────────────────────────┐
│ [Transaction Type ▼]            [X] │
├─────────────────────────────────────┤
│ [Create] [Find] ← Find is active    │
├─────────────────────────────────────┤
│                                     │
│        🔍 Search Icon               │
│                                     │
│   "Ask me anything about your       │
│    transactions..."                 │
│                                     │
│   Example questions:                │
│   • "What were my sales yesterday?" │
│   • "How much did I spend on fuel?" │
│   • "Who owes me money?"            │
│   • "Show payments from Ramesh"     │
│                                     │
│        🎤 Mic Icon                  │
│     (Ready to listen)               │
│                                     │
│   [Click to Ask]                    │
│                                     │
└─────────────────────────────────────┘

→ User Clicks Mic or Says "Start"
→ [Find Mode Listening]
```

#### Step 2: Listening for Query

```
[Find Mode Listening]
┌─────────────────────────────────────┐
│        🔍🎤 Icons                    │
│                                     │
│      "Listening to your query..."   │
│                                     │
│   🔊🔊🔊🔊 Waveform                  │
│                                     │
│   [Real-time transcription]         │
│                                     │
└─────────────────────────────────────┘

→ User Asks: "What were my total sales yesterday?"
→ Transcription: "What were my total sales yesterday?"
→ [Processing Query]
```

#### Step 3: Processing Query

```
[Find Mode Processing]
┌─────────────────────────────────────┐
│        ⏳ Processing Icon            │
│                                     │
│   "Searching your transactions..."  │
│                                     │
│   Query: "What were my total        │
│           sales yesterday?"         │
│                                     │
│   Analyzing 1,247 transactions...   │ ← Progress indicator
│                                     │
└─────────────────────────────────────┘

→ AI Processing:
   1. Understand intent: Query about sales, filter by date (yesterday)
   2. Execute database query: SELECT SUM(amount) FROM sales WHERE date = YESTERDAY
   3. Format natural language response
   4. Generate visualization (if applicable)

→ {Query Result}
   |
   ├─ Data Found → [Show Results]
   └─ No Data Found → [No Results Screen]
```

#### Step 4: Show Results

```
[Find Mode Results]
┌─────────────────────────────────────┐
│ Your Query:                         │
│ "What were my total sales yesterday?"│
├─────────────────────────────────────┤
│                                     │
│ 📊 Answer:                          │
│                                     │
│ Your total sales yesterday were     │
│ ₹24,500 across 12 transactions.     │
│                                     │
│ ─────────────────────────────      │
│                                     │
│ 📈 Sales Breakdown:                 │
│ [Bar Chart Visualization]           │
│ - Morning (6-12): ₹8,000           │
│ - Afternoon (12-6): ₹12,500        │
│ - Evening (6-12): ₹4,000           │
│                                     │
│ ─────────────────────────────      │
│                                     │
│ Top Sale: ₹5,000 to Ramesh Kumar   │
│                                     │
│ ─────────────────────────────      │
│ Related Transactions: (12)          │
│                                     │
│ 1. Sale to Ramesh - ₹5,000         │
│ 2. Sale to Priya - ₹3,200          │
│ 3. Sale to Sharma - ₹2,800         │
│ ... [View All]                      │
│                                     │
├─────────────────────────────────────┤
│ [📋 Copy] [📥 Export CSV]           │
│ [🔍 Ask Another] [✅ Done]          │
└─────────────────────────────────────┘

→ User Clicks "Copy" → Copies answer text to clipboard
→ User Clicks "Export CSV" → Downloads transactions as CSV
→ User Clicks "Ask Another" → Return to [Find Mode Listening]
→ User Clicks "Done" → [Modal Closes]
```

#### Step 5: No Results Found

```
[Find Mode No Results]
┌─────────────────────────────────────┐
│ 🔍 No matching transactions found   │
│                                     │
│ I couldn't find any data for:       │
│ "Show sales from last week"         │
│                                     │
│ Suggestions:                        │
│ • Try a different date range        │
│ • Check if you have sales recorded  │
│ • Try: "Show all sales this month"  │
│                                     │
│ [Try Again] [Close]                 │
└─────────────────────────────────────┘

→ User Clicks "Try Again" → [Find Mode Listening]
```

### Example Queries & Responses

**Query 1:** "How much did I spend on groceries this month?"
```
Response:
"You spent ₹18,450 on groceries this month across 23 transactions.

Breakdown:
- Week 1: ₹4,200
- Week 2: ₹5,800
- Week 3: ₹3,950
- Week 4: ₹4,500

Top expense: ₹2,500 at Reliance Fresh on Dec 15"
```

**Query 2:** "Who owes me money?"
```
Response:
"3 customers have pending payments totaling ₹45,000:

1. Ramesh Kumar: ₹20,000 (Invoice #1234, Due: Dec 20)
2. Sharma Traders: ₹15,000 (Invoice #1245, Due: Dec 25)
3. Priya Store: ₹10,000 (Invoice #1250, Due: Dec 30)

Would you like to send payment reminders?"
```

**Query 3:** "What were my top selling items?"
```
Response:
"Your top 5 selling items this month:

1. Rice (Basmati) - 250 kg sold, ₹75,000
2. Wheat Flour - 180 kg sold, ₹32,400
3. Sugar - 150 kg sold, ₹12,000
4. Cooking Oil - 80 liters sold, ₹16,000
5. Dal (Toor) - 120 kg sold, ₹21,600

Rice is your best seller, accounting for 32% of revenue."
```

### Success Metrics
- **Find Mode Discovery:** % of users who try Find mode (Target: 30% within 14 days)
- **Query Success Rate:** % of queries that return useful results (Target: 85%)
- **Query Complexity:** Distribution of simple vs complex queries
- **Export Usage:** % who export CSV or copy results (Target: 20%)

---

## Minimize & Notification Flow

### Minimize Behavior

```
[Modal in Any State]
→ User Clicks "Minimize" Button (bottom left)
→ [Modal Minimizes to Widget]

[Minimized Widget - Bottom Right Corner]
┌───────────────────────┐
│ 🎤 VAANI              │
│ [Status Text]         │ ← Dynamic based on state
│ [Expand ↗] [Close ✕] │
└───────────────────────┘

Status Text Examples:
- "Listening..."
- "Processing..."
- "Question asked"
- "Response ready"
- "Draft saved"
```

### Notification Badge System

```
[Widget with Notification Badge]
┌───────────────────────┐
│ 🎤 VAANI         [!]  │ ← Red badge
│ Response ready        │
│ [Expand ↗] [Close ✕] │
└───────────────────────┘

Badge Triggers:
1. Processing completes while minimized
2. VAANI asks question while minimized
3. Edge case needs confirmation
4. Form is ready to review

Badge Interaction:
→ User Clicks Widget → Badge disappears, modal expands
→ Badge pulses every 3 seconds to draw attention
→ Badge shows number if multiple notifications
```

### Widget States

**State 1: Listening (Minimized)**
```
┌───────────────────────┐
│ 🎤 VAANI              │
│ 🔊 Listening...       │
│ [Expand ↗] [Close ✕] │
└───────────────────────┘
→ Waveform animation (small version)
→ User can continue speaking
```

**State 2: Processing (Minimized)**
```
┌───────────────────────┐
│ 🎤 VAANI              │
│ ⏳ Processing...      │
│ [Expand ↗] [Close ✕] │
└───────────────────────┘
→ Spinner animation
```

**State 3: Question Asked (Minimized)**
```
┌───────────────────────┐
│ 🎤 VAANI         [?]  │ ← Question badge
│ Question asked        │
│ [Expand ↗] [Close ✕] │
└───────────────────────┘
→ User clicks → Expands to show question
→ User can speak answer even without expanding
```

**State 4: Form Ready (Minimized)**
```
┌───────────────────────┐
│ 🎤 VAANI         [✓]  │ ← Success badge
│ Form ready            │
│ [Expand ↗] [Close ✕] │
└───────────────────────┘
→ User clicks → Expands to show pre-filled form
```

**State 5: Draft Auto-Saved (Minimized)**
```
┌───────────────────────┐
│ 🎤 VAANI         [📝] │ ← Draft badge
│ Draft saved           │
│ [Expand ↗] [Close ✕] │
└───────────────────────┘
→ User can resume later
→ Click → Expands to form with saved data
```

### Success Metrics
- **Minimize Usage:** % of users who minimize modal (Target: 40%)
- **Badge Response Time:** Median seconds to click badge after appearance (Target: <5 sec)
- **Minimized Completion:** % of transactions completed while minimized (Target: 25%)

---

## Language Settings Flow

### Entry Points
1. During first-time setup → Language Selection Screen
2. From voice modal → Click Settings ⚙️ icon → Languages
3. From main app Settings → VAANI → Languages

### Main Flow

```
[Voice Modal Settings Icon Clicked]
→ [VAANI Settings Screen]

┌─────────────────────────────────────┐
│ VAANI Settings                 [X]  │
├─────────────────────────────────────┤
│                                     │
│ 🗣️ Language Settings                │
│                                     │
│ [Change Speaking Language]          │
│ [Change Listening Language]         │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ ⚙️ Other Settings                   │
│                                     │
│ [ ] Enable desktop notifications    │
│ [ ] Auto-minimize after success     │
│ [  ] Microphone sensitivity: ▮▮▮▯▯ │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ 📊 Usage Stats                      │
│                                     │
│ Voice transactions this month: 47   │
│ Average time per transaction: 8s    │
│                                     │
│ [View Full History]                 │
│                                     │
├─────────────────────────────────────┤
│ [Save Changes] [Cancel]             │
└─────────────────────────────────────┘

→ User Clicks "Change Speaking Language"
→ [Speaking Language Selection]
```

### Speaking Language Selection

```
[Speaking Language Selection Screen]
┌─────────────────────────────────────┐
│ Speaking Language              [X]  │
├─────────────────────────────────────┤
│                                     │
│ Select the language you'll speak in│
│                                     │
│ Current: हिंदी Hindi               │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ 🔘 हिंदी Hindi         [Selected]  │
│ ○  English                          │
│ ○  தமிழ் Tamil                      │
│ ○  తెలుగు Telugu                    │
│ ○  বাংলা Bengali                    │
│ ○  मराठी Marathi                    │
│ ○  ગુજરાતી Gujarati                 │
│ ○  ಕನ್ನಡ Kannada                    │
│ ○  മലയാളം Malayalam                 │
│ ○  ਪੰਜਾਬੀ Punjabi                   │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ ℹ️ You can mix languages naturally  │
│   (Hinglish works perfectly!)      │
│                                     │
├─────────────────────────────────────┤
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘

→ User Selects Language → Radio button updates
→ User Clicks "Save"
→ [Confirmation Toast]

Toast: "✅ Speaking language changed to English"
→ Auto-dismiss in 3 seconds
→ Return to Settings or Voice Modal
```

### Listening Language Selection

```
[Listening Language Selection Screen]
┌─────────────────────────────────────┐
│ Listening Language             [X]  │
├─────────────────────────────────────┤
│                                     │
│ Select language for VAANI's        │
│ responses                           │
│                                     │
│ Current: English                    │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ 🔘 English              [Selected]  │
│                                     │
│ ⏸️ More languages coming soon:      │
│                                     │
│ 🔒 हिंदी Hindi         Coming Soon  │
│ 🔒 தமிழ் Tamil          Coming Soon  │
│ 🔒 తెలుగు Telugu        Coming Soon  │
│ 🔒 বাংলা Bengali        Coming Soon  │
│ 🔒 मराठी Marathi        Coming Soon  │
│ 🔒 ગુજરાતી Gujarati      Coming Soon  │
│ 🔒 ಕನ್ನಡ Kannada        Coming Soon  │
│ 🔒 മലയാളം Malayalam     Coming Soon  │
│ 🔒 ਪੰਜਾਬੀ Punjabi       Coming Soon  │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ ℹ️ Currently, VAANI responds in     │
│   English text. Voice responses in  │
│   your language are coming in 2025. │
│                                     │
│ [Notify Me When Available]          │
│                                     │
├─────────────────────────────────────┤
│ [OK]                                │
└─────────────────────────────────────┘

→ User Clicks Locked Language
→ [Coming Soon Tooltip]
   "Hindi responses will be available in Q2 2025.
    We'll notify you when ready!"

→ User Clicks "Notify Me When Available"
→ [Email/Notification Preference Dialog]
→ User provides email → "✅ We'll notify you!"
```

### Success Metrics
- **Language Distribution:** Track which speaking languages are most used
- **Language Switching:** % of users who change default language (Target: 15%)
- **Coming Soon Interest:** # of users who request notification (Target: 30%)

---

## Hide VAANI Flow

### Entry Points
1. Right-click on floating mic button → Context menu
2. Settings → VAANI → Hide Options

### Main Flow - Hide for 1 Hour

```
[User Right-Clicks Floating Mic Button]
→ [Context Menu Appears]

┌──────────────────────────┐
│ ⚙️ VAANI Settings        │
│ 📖 Help & Tutorial       │
│ ────────────────────     │
│ 🙈 Hide for 1 Hour       │ ← This option
│ ❌ Disable VAANI         │
└──────────────────────────┘

→ User Clicks "Hide for 1 Hour"
→ [Hide Confirmation Dialog]

┌─────────────────────────────────────┐
│ Hide VAANI for 1 Hour?              │
├─────────────────────────────────────┤
│                                     │
│ The VAANI mic button will be hidden │
│ for 1 hour. You can re-enable it    │
│ anytime from Settings.              │
│                                     │
│ ℹ️ This is temporary. VAANI will    │
│   reappear automatically after 60   │
│   minutes.                          │
│                                     │
│ [Cancel] [Yes, Hide for 1 Hour]     │
└─────────────────────────────────────┘

→ User Clicks "Yes, Hide for 1 Hour"
→ [Mic Button Disappears]
→ [Timer Starts: 60 Minutes]
→ [Confirmation Toast]

Toast: "VAANI hidden for 1 hour. Re-enable in Settings anytime."

→ [After 60 Minutes]
→ [Desktop Notification]

Notification:
Title: "VAANI is back!"
Message: "Your voice assistant is ready to use again."
Icon: 🎤
Action: Click to open voice modal

→ [Mic Button Reappears]
```

### Permanent Disable (via Settings)

```
[Settings → VAANI]
→ [VAANI Settings Screen]

┌─────────────────────────────────────┐
│ VAANI Settings                      │
├─────────────────────────────────────┤
│                                     │
│ ⚙️ General                          │
│                                     │
│ [✓] Enable VAANI voice assistant    │ ← Toggle
│                                     │
│ When disabled, the mic button will  │
│ be hidden and voice features will   │
│ be unavailable.                     │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ [Save Changes]                      │
└─────────────────────────────────────┘

→ User Unchecks "Enable VAANI"
→ [Disable Confirmation Dialog]

┌─────────────────────────────────────┐
│ Disable VAANI?                      │
├─────────────────────────────────────┤
│                                     │
│ This will:                          │
│ • Hide the mic button               │
│ • Disable all voice features        │
│ • Keep your voice history safe      │
│                                     │
│ You can re-enable VAANI anytime     │
│ from Settings.                      │
│                                     │
│ [Cancel] [Disable VAANI]            │
└─────────────────────────────────────┘

→ User Clicks "Disable VAANI"
→ Mic button removed
→ Voice features disabled
→ Settings updated
→ Toast: "VAANI disabled. Enable anytime in Settings."
```

### Early Re-enable (Before 1 Hour)

```
[User Opens Settings While Hidden]
→ [VAANI Settings]

┌─────────────────────────────────────┐
│ VAANI is currently hidden           │
│                                     │
│ Time remaining: 42 minutes          │
│                                     │
│ [Show VAANI Now]                    │
└─────────────────────────────────────┘

→ User Clicks "Show VAANI Now"
→ Timer cancelled
→ Mic button reappears
→ Toast: "VAANI re-enabled"
```

### Success Metrics
- **Hide Usage:** % of users who use "Hide for 1 Hour" (Target: <10% - indicates feature not annoying)
- **Early Re-enable:** % who re-enable before 1 hour (Target: 30%)
- **Permanent Disable:** % who permanently disable (Target: <5%)

---

## Exit & Survey Flow

### Exit Triggers
1. User clicks X button on modal
2. User presses ESC key
3. User clicks "Cancel" on form

### Exit Decision Tree

```
[User Initiates Exit]
→ {Has User Entered Any Data?}
   |
   ├─ No Data Entered → [Exit Survey - No Data]
   └─ Partial Data Entered → [Exit Survey - Save Draft]
```

### Exit Survey - No Data

```
[Exit Survey - No Data Screen]
┌─────────────────────────────────────┐
│ Before you go...                    │
├─────────────────────────────────────┤
│                                     │
│ 😊 How was your experience?         │
│                                     │
│ ⭐⭐⭐⭐⭐ (5-star rating)            │
│                                     │
│ Quick feedback (optional):          │
│                                     │
│ [💤 Too slow]                       │
│ [❓ Didn't understand me]           │
│ [✨ Worked great!]                  │
│ [🤔 Confusing]                      │
│ [⌨️ Prefer typing]                  │
│ [🧪 Just testing]                   │
│                                     │
│ ────────────────────────────────   │
│ Any other feedback? (optional)      │
│ [___________________________]       │
│                                     │
├─────────────────────────────────────┤
│ [Submit Feedback] [Skip] [Continue] │
└─────────────────────────────────────┘

→ User Clicks "Submit Feedback"
→ [Thank You Screen] → Close modal

→ User Clicks "Skip"
→ Close modal immediately

→ User Clicks "Continue"
→ Return to previous state (Listening/Form/etc.)
```

### Exit Survey - Save Draft

```
[Exit Survey - Save Draft Screen]
┌─────────────────────────────────────┐
│ Save your progress?                 │
├─────────────────────────────────────┤
│                                     │
│ You've already entered:             │
│                                     │
│ • Item: Chai samosa                 │
│ • Amount: ₹140                      │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ What would you like to do?          │
│                                     │
│ [💾 Save as Draft]                  │
│   (Continue later)                  │
│                                     │
│ [🗑️ Discard]                        │
│   (Don't save)                      │
│                                     │
│ [↩️ Continue Editing]               │
│   (Go back)                         │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ ❓ Why are you leaving? (optional)  │
│                                     │
│ [Got interrupted]                   │
│ [Made a mistake]                    │
│ [Taking too long]                   │
│ [Other reason]                      │
│                                     │
├─────────────────────────────────────┤
│ [Proceed] [Cancel]                  │
└─────────────────────────────────────┘

→ User Selects "Save as Draft" + Clicks "Proceed"
→ [Draft Saved Confirmation]

[Draft Saved Confirmation]
┌─────────────────────────────────────┐
│ ✅ Draft Saved                      │
│                                     │
│ Your transaction has been saved.    │
│ You can complete it anytime from    │
│ the Drafts section.                 │
│                                     │
│ [View Drafts] [Done]                │
└─────────────────────────────────────┘

→ User Clicks "Done" → Close modal
→ User Clicks "View Drafts" → [Drafts List Screen]

[Drafts List Screen]
┌─────────────────────────────────────┐
│ Voice Drafts                   [X]  │
├─────────────────────────────────────┤
│                                     │
│ 📝 Draft 1 - Expense                │
│    Chai samosa - ₹140               │
│    Saved: 2 minutes ago             │
│    [Resume] [Delete]                │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ 📝 Draft 2 - Sale                   │
│    Rice to Ramesh - ₹250            │
│    Saved: 1 day ago                 │
│    [Resume] [Delete]                │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ [Clear All Drafts]                  │
│                                     │
└─────────────────────────────────────┘

→ User Clicks "Resume" → [Form Pre-fills with Draft Data]
→ User Clicks "Delete" → Confirm → Delete draft
```

### First-Time User Survey

```
[After First Voice Transaction Saved]
→ {Is this user's first ever voice transaction?}
   |
   └─ Yes → [First-Time Experience Survey]

[First-Time Experience Survey]
┌─────────────────────────────────────┐
│ 🎉 Congratulations!                 │
│                                     │
│ You just created your first         │
│ transaction using voice!            │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ How was it?                         │
│                                     │
│ 😍 Amazing!                         │
│ 😊 Good                             │
│ 😐 Okay                             │
│ 😕 Confusing                        │
│ 😤 Frustrating                      │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ What did you like? (Select all)     │
│                                     │
│ ☐ Faster than typing                │
│ ☐ Easy to use                       │
│ ☐ Understood me well                │
│ ☐ Hands-free convenience            │
│ ☐ Fun to use                        │
│                                     │
│ What can we improve? (Select all)   │
│                                     │
│ ☐ Recognition accuracy              │
│ ☐ Speed                             │
│ ☐ Ask fewer questions               │
│ ☐ Better examples                   │
│ ☐ Other: [________]                 │
│                                     │
├─────────────────────────────────────┤
│ [Submit] [Skip]                     │
└─────────────────────────────────────┘

→ User Submits → [Thank You Screen]
→ User Skips → Close survey
```

### Error-Triggered Survey

```
[After 2+ Errors in Single Session]
→ {User closes modal}
→ [Error Experience Survey]

[Error Experience Survey]
┌─────────────────────────────────────┐
│ We noticed some issues...           │
│                                     │
│ Sorry about the trouble! Can you    │
│ help us understand what went wrong? │
│                                     │
│ What issues did you face?           │
│                                     │
│ ☐ Didn't understand my voice        │
│ ☐ Too many questions asked          │
│ ☐ Confusing interface               │
│ ☐ Network/internet issues           │
│ ☐ Wrong category/amounts extracted  │
│ ☐ Too slow                          │
│ ☐ Other: [________]                 │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ Tell us more (optional):            │
│ [___________________________]       │
│ [___________________________]       │
│                                     │
│ ☐ Include error logs (helps us fix) │
│                                     │
├─────────────────────────────────────┤
│ [Submit] [Skip]                     │
└─────────────────────────────────────┘

→ Logs attached if user opts in
→ Submit → [Thank You] → Close
```

### Random Sample Survey

```
[Random 10% of Successful Transactions]
→ {User saves transaction successfully}
→ {Random selection: 10% chance}
→ [Usage Pattern Survey]

[Usage Pattern Survey]
┌─────────────────────────────────────┐
│ Quick question!                     │
│                                     │
│ How often do you use VAANI?         │
│                                     │
│ ○ First time (trying it out)        │
│ ○ Rarely (once a week or less)      │
│ ○ Sometimes (few times a week)      │
│ ○ Often (daily or multiple/day)     │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ What do you mainly use it for?      │
│                                     │
│ ☐ Speed (faster than typing)        │
│ ☐ Convenience (hands-free)          │
│ ☐ While driving/moving              │
│ ☐ Don't like typing                 │
│ ☐ Language preference (Hindi/etc)   │
│ ☐ Just trying it out                │
│                                     │
├─────────────────────────────────────┤
│ [Submit] [Skip]                     │
└─────────────────────────────────────┘
```

### Thank You Screen (Universal)

```
[Thank You Screen - After Any Survey]
┌─────────────────────────────────────┐
│                                     │
│         ❤️ Thank You!               │
│                                     │
│   Your feedback helps us improve    │
│   VAANI for everyone.               │
│                                     │
│   - The Vyapar Team                 │
│                                     │
│         [Done]                      │
│                                     │
└─────────────────────────────────────┘

→ Auto-dismiss in 3 seconds OR
→ User clicks "Done"
→ Return to transaction page
```

### Success Metrics
- **Survey Completion Rate:** % who complete survey when shown (Target: 40%)
- **Net Promoter Score (NPS):** From first-time survey (Target: NPS > 50)
- **Feedback Quality:** % of surveys with actionable feedback (Target: 60%)
- **Draft Usage:** % who resume saved drafts (Target: 70%)

---

## Error Handling Flow

### Error Categories

#### 1. Voice Recognition Errors
- Speech-to-text failed
- Audio quality too low
- Language detection failed
- Accent/dialect not recognized

#### 2. Network Errors
- No internet connection
- API timeout
- Rate limit exceeded
- Server error (5xx)

#### 3. Validation Errors
- Invalid amount (negative, zero, too large)
- Invalid date (future date for transaction)
- Missing required fields
- Duplicate transaction detected

#### 4. System Errors
- Microphone access lost mid-session
- Unexpected AI error
- Database write failed
- Unknown error

### Error Flow Matrix

```
[Error Occurs]
→ {Error Type}
   |
   ├─ Voice Recognition → [Voice Error Screen] → Retry/Type/Close
   ├─ Network → [Network Error Screen] → Retry/Offline/Close
   ├─ Validation → [Validation Error Screen] → Fix/Close
   └─ System → [System Error Screen] → Report/Retry/Close
```

### Detailed Error Screens

#### Voice Recognition Error

```
[Voice Recognition Error Screen]
┌─────────────────────────────────────┐
│ ❌ Couldn't Understand You          │
├─────────────────────────────────────┤
│                                     │
│ I had trouble understanding what    │
│ you said.                           │
│                                     │
│ What I heard:                       │
│ "mfrd asdk 500"                     │ ← Garbled transcription
│                                     │
│ ────────────────────────────────   │
│                                     │
│ 💡 Tips to improve:                 │
│                                     │
│ • Speak clearly and at normal pace  │
│ • Reduce background noise           │
│ • Speak closer to microphone        │
│ • Try using headset mic             │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ [🎤 Try Again]                      │
│ [⌨️ Type Instead]                   │
│ [🔧 Test Microphone]                │
│ [✕ Close]                           │
│                                     │
└─────────────────────────────────────┘

→ Try Again → [Listening State]
→ Type Instead → [Manual Form Entry]
→ Test Microphone → [Microphone Test Screen]
→ Close → [Exit Survey]
```

#### Network Error

```
[Network Error Screen]
┌─────────────────────────────────────┐
│ ❌ Connection Lost                  │
├─────────────────────────────────────┤
│                                     │
│ I couldn't reach the server.        │
│ Please check your internet and      │
│ try again.                          │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ ✅ Your voice data has been saved   │
│                                     │
│ Don't worry! We've saved what you   │
│ said. When you're back online,      │
│ we'll process it automatically.     │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ [🔄 Retry Now]                      │
│ [📝 Work Offline]                   │
│ [✕ Close]                           │
│                                     │
│ Network status: Checking... 🔴       │
│                                     │
└─────────────────────────────────────┘

→ Retry Now → Check connection → Re-attempt API call
→ Work Offline → [Save Draft Locally] → Desktop notification
→ Close → [Exit with Draft Saved]

[Auto-Retry Behavior]
→ Network detected → Desktop notification
   "Internet connection restored. Processing your voice command..."
→ Re-process voice data in background
→ Show result in notification
```

#### Validation Error (on Form Save)

```
[Validation Error Screen]
┌─────────────────────────────────────┐
│ ❌ Please Fix These Errors          │
├─────────────────────────────────────┤
│                                     │
│ We found some issues:               │
│                                     │
│ • Amount cannot be zero or negative │
│   Current value: ₹-50               │
│                                     │
│ • Item name is required             │
│   Current value: (blank)            │
│                                     │
│ • Date cannot be in the future      │
│   Current value: Dec 25, 2025       │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ [Go Back to Form]                   │
│                                     │
└─────────────────────────────────────┘

→ Click "Go Back to Form"
→ [Form with Errors Highlighted]
   - Fields with errors have red border
   - Error message below each field
   - Auto-focus on first error field
→ User Fixes → Clicks Save → Re-validate
```

#### System Error

```
[System Error Screen]
┌─────────────────────────────────────┐
│ ❌ Something Went Wrong             │
├─────────────────────────────────────┤
│                                     │
│ An unexpected error occurred.       │
│ We've been notified and will        │
│ investigate.                        │
│                                     │
│ Error Code: VN-1234-5678            │ ← For support reference
│                                     │
│ ────────────────────────────────   │
│                                     │
│ [🔄 Retry]                          │
│ [📧 Report Issue]                   │
│ [✕ Close]                           │
│                                     │
│ ────────────────────────────────   │
│                                     │
│ Show technical details ▼            │ ← Expandable
│                                     │
└─────────────────────────────────────┘

→ Click "Show technical details"
→ [Technical Details Expanded]
   Stack trace (truncated):
   Error: AI model timeout
   at processVoice()
   at extractEntities()
   ...
   
   [Copy Error Details]
   
→ Click "Report Issue"
→ [Report Issue Dialog]

[Report Issue Dialog]
┌─────────────────────────────────────┐
│ Report Issue                        │
├─────────────────────────────────────┤
│                                     │
│ What were you trying to do?         │
│ [___________________________]       │
│ [___________________________]       │
│                                     │
│ ☑ Include error logs                │
│ ☑ Include voice recording           │
│   (helps us reproduce the issue)    │
│                                     │
│ Your email (optional):              │
│ [___________________________]       │
│                                     │
│ We'll follow up if needed.          │
│                                     │
├─────────────────────────────────────┤
│ [Submit Report] [Cancel]            │
└─────────────────────────────────────┘

→ Submit → "✅ Thank you! Report sent."
```

### Error Recovery Patterns

#### Pattern 1: Graceful Degradation
```
Voice Recognition Failed
→ Offer "Type Instead"
→ Manual form entry with same fields
→ No data loss
```

#### Pattern 2: Retry with Guidance
```
Error Occurs
→ Show specific error message
→ Provide actionable tips
→ Offer retry with same input
→ Track retry count (max 3)
→ If 3 retries fail → Offer alternative (Type/Support)
```

#### Pattern 3: Offline Fallback
```
Network Error
→ Save draft locally (IndexedDB/SQLite)
→ Desktop notification when online
→ Auto-process in background
→ Show success notification
→ Sync to server
```

#### Pattern 4: Error Reporting
```
Unexpected Error
→ Auto-capture error logs
→ Generate unique error ID
→ Offer user to report issue
→ Optional: attach voice recording
→ Send to support system
→ Thank user for feedback
```

### Success Metrics
- **Error Rate:** % of voice sessions with errors (Target: <10%)
- **Error Recovery Rate:** % of users who succeed after error (Target: 70%)
- **Retry Success Rate:** % of retries that succeed (Target: 60%)
- **Error Report Rate:** % of system errors that get reported (Target: 25%)

---

## Mobile App User Flows (Roadmap)

### Overview
Mobile app flows will largely mirror desktop flows with adaptations for:
- Touch interactions (no keyboard shortcuts)
- Smaller screen real estate
- Background/foreground transitions
- Native mobile patterns (bottom sheets, swipe gestures)

### Key Differences from Desktop

#### 1. Entry Point
```
[Transaction Screen - Mobile]
→ Floating Action Button (FAB) - bottom right
→ Color: Orange gradient
→ Icon: 🎤 Microphone
→ Size: 56dp × 56dp (Material Design standard)
→ Tap → [Voice Modal - Full Screen]
```

#### 2. Modal Presentation
```
[Desktop: Overlay Modal]
vs.
[Mobile: Bottom Sheet → Full Screen]

Mobile Flow:
→ Tap FAB
→ Bottom sheet slides up (half screen)
→ Shows: "Tap to speak" + waveform preview
→ User taps center → Bottom sheet expands to full screen
→ [Full Screen Voice Interface]
```

#### 3. Minimize Behavior
```
[Desktop: Minimize to Widget]
vs.
[Mobile: Minimize to Persistent Notification]

Mobile Flow:
→ User swipes down on modal
→ Modal minimizes to notification shade
→ Notification shows:
   - "VAANI Listening..." / "Processing..."
   - Tap to expand
   - Swipe to close
→ Processing continues in background
→ Notification updates when ready
```

#### 4. Voice Activation
```
[Desktop: Ctrl+V or Click Mic]
vs.
[Mobile: Tap FAB or "Hey VAANI" (future)]

Mobile Options:
→ Tap FAB (primary method)
→ Long-press FAB (push-to-talk mode)
→ "Hey VAANI" hotword (Phase 3 roadmap)
→ Headset button (if supported)
```

#### 5. Form Pre-fill
```
[Desktop: Right Panel]
vs.
[Mobile: Slide-up Sheet]

Mobile Flow:
→ Success screen shown
→ Auto-dismiss after 2 sec
→ Form slides up from bottom
→ Covers full screen
→ User can swipe between fields
→ Save button at bottom
```

#### 6. Language Settings
```
[Desktop: Settings Modal]
vs.
[Mobile: Native Settings Screen]

Mobile Flow:
→ Settings → VAANI
→ Native mobile settings UI
→ List items for each option
→ Tap "Speaking Language" → Full screen list
→ Large touch targets (48dp min)
```

### Mobile-Specific Features

#### Push-to-Talk Mode
```
[Long Press FAB]
→ Haptic feedback (vibrate 50ms)
→ Start recording
→ Visual: Pulsing ring around FAB
→ User holds and speaks
→ Release → Stop recording & process
→ Visual feedback: Ring animates outward
```

#### Background Processing
```
[User Minimizes App While Processing]
→ Voice modal in background
→ Persistent notification shown
→ Processing continues
→ {Processing Complete}
→ Notification updates: "Tap to review"
→ Badge on app icon (iOS)
```

#### Offline Queue (Phase 3)
```
[User Speaks While Offline]
→ Voice saved locally
→ "Saved offline - will sync when online"
→ Offline queue icon in notification shade
→ {Network Detected}
→ Auto-sync in background
→ Notification: "3 transactions synced"
```

### Mobile UI Mockup (Text Description)

```
[Voice Modal - Full Screen Mobile]
┌─────────────────────────────┐
│ ← Back   Expense ▼  ⚙️ •••  │ ← Top bar (48dp)
├─────────────────────────────┤
│ [Create] [Find]             │ ← Tabs (44dp each)
├─────────────────────────────┤
│                             │
│                             │
│         🎤                  │ ← Large mic (120dp)
│    (Animated)               │
│                             │
│  ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈          │ ← Waveform
│                             │
│    "Listening..."           │ ← Status text (18sp)
│                             │
│  "Chai samosa 140 rupees"   │ ← Transcription (16sp)
│                             │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│ 🔊 Volume: ▮▮▮▮▮▯▯▯▯▯       │ ← Volume indicator
│                             │
│ Tap mic to stop            │ ← Helper text
│ Swipe down to minimize      │
│                             │
└─────────────────────────────┘

Touch Targets:
- Back button: 44dp × 44dp
- Dropdown: 44dp height
- Settings: 44dp × 44dp
- Mic (to stop): 120dp × 120dp
- Entire screen swipeable to minimize
```

### Mobile Success Metrics
- **Mobile Adoption:** % of mobile users who try voice (Target: 50%)
- **Mobile Retention:** 30-day voice retention on mobile (Target: 55%)
- **Background Success:** % of background sessions that complete (Target: 85%)
- **Offline Sync:** % of offline transactions that sync successfully (Target: 98%)

---

## Cross-Platform Behaviors

### Desktop ↔ Mobile Sync

#### Draft Synchronization
```
[User Creates Draft on Desktop]
→ Saves to MongoDB with:
   - user_id
   - device_id: "desktop_win_abc123"
   - draft_data: {...}
   - created_at: timestamp
   - synced: true

[User Opens Mobile App]
→ Fetch drafts from server
→ {Draft Found}
→ Notification badge on Drafts icon
→ User Opens Drafts
→ "📝 Draft from Desktop - 5 min ago"
→ Tap to Resume → Pre-fill form
```

#### Settings Synchronization
```
[User Changes Language on Desktop]
→ Updates: user_settings.speaking_language = "Hindi"
→ Syncs to server

[User Opens Mobile App]
→ Fetches latest settings
→ Speaking language = "Hindi"
→ No setup needed, works immediately
```

#### Voice History Synchronization
```
[User Creates Transaction via Desktop Voice]
→ Entry in voice_history:
   - transaction_id
   - voice_transcript
   - device: "desktop"
   - timestamp

[User Views History on Mobile]
→ Settings → Voice History
→ Shows all voice transactions (desktop + mobile)
→ Filter by device, date, type
```

### Consistent Behavior Across Platforms

#### 1. Transaction Type Defaults
- **Rule:** Default = Current page context
- **Desktop:** Based on active page (Expenses/Sales/etc.)
- **Mobile:** Based on screen user is on
- **Both:** User can override via dropdown

#### 2. Language Preferences
- **Stored:** Server-side (user_settings table)
- **Applied:** Immediately on both platforms
- **Override:** Per-device settings NOT supported (confusing)

#### 3. Error Messages
- **Same:** Error text consistent across platforms
- **Different:** Presentation (desktop modal vs mobile notification)

#### 4. Validation Rules
- **Same:** Business logic (amount > 0, date not future, etc.)
- **Same:** Required fields per transaction type
- **Same:** Category matching algorithm

### Platform-Specific Adaptations

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Entry Point | Floating button | FAB |
| Modal Size | 600px × 700px | Full screen |
| Minimize | Widget (bottom right) | Notification |
| Keyboard Shortcuts | Yes (Ctrl+V, ESC, etc.) | No |
| Push-to-Talk | Space bar | Long-press FAB |
| Form | Right panel | Bottom sheet |
| Settings | Modal | Native screen |
| Voice History | Modal with export | Native list |
| Offline | Desktop notifications | Push notifications |

---

## Edge Cases & Special Scenarios

### Scenario 1: Very Long Transaction Lists (10+ Items)

```
[User Says: "Petrol 500, chai 50, samosa 80, biscuit 30, water 20, notebook 60..."]
→ AI detects 12 items

→ {Item Count > 10}
→ [Too Many Items Error]

[Too Many Items Screen]
┌─────────────────────────────────────┐
│ ⚠️ Too Many Items                   │
│                                     │
│ I heard 12 items, but I can only    │
│ process 10 at a time.               │
│                                     │
│ Please tell me:                     │
│ • The first 10 items now            │
│ • Then add the remaining 2 after    │
│                                     │
│ [Got It, Try Again]                 │
└─────────────────────────────────────┘

→ User Speaks First 10 Items
→ [Process Successfully]
→ After Saved: "Would you like to add 2 more items now?"
   [Yes, Add More] [No, Later]
```

### Scenario 2: Duplicate Transaction Detection

```
[User Creates: "Petrol 500"]
→ AI Checks Recent Transactions
→ {Similar Transaction Found}
   - Item: "Petrol"
   - Amount: ₹500
   - Created: 5 minutes ago

→ [Duplicate Warning Screen]

[Duplicate Warning]
┌─────────────────────────────────────┐
│ ⚠️ Possible Duplicate                │
│                                     │
│ You already added a similar         │
│ transaction 5 minutes ago:          │
│                                     │
│ Petrol - ₹500 (Dec 23, 2:45 PM)    │
│                                     │
│ Did you mean to create another one? │
│                                     │
│ [Yes, Create New] [No, It's Same]   │
└─────────────────────────────────────┘

→ "Yes, Create New" → Proceed normally
→ "No, It's Same" → Cancel, return to transaction list
```

### Scenario 3: Accidental Voice Activation

```
[User Accidentally Clicks Mic]
→ Modal Opens
→ Starts Listening
→ User Doesn't Speak (Confused)

→ {No Audio for 5 seconds}
→ [No Audio Detected] → Offers retry/close

OR

[User Speaks Unintentionally]
→ "Hello? Is anyone there?" (not an expense)
→ AI Detects: Intent = "other"

→ [Unrecognized Command]
┌─────────────────────────────────────┐
│ 🤔 I Didn't Understand That         │
│                                     │
│ You said: "Hello? Is anyone there?" │
│                                     │
│ I can help you with:                │
│ • Adding expenses                   │
│ • Creating sales                    │
│ • Recording payments                │
│ • Asking about your data            │
│                                     │
│ Try saying: "Chai 50 rupees"        │
│                                     │
│ [Try Again] [See Examples] [Close]  │
└─────────────────────────────────────┘
```

### Scenario 4: Mid-Conversation Interruption

```
[User in Middle of Multi-Turn Conversation]
→ VAANI asks: "What did you spend ₹500 on?"
→ [User Gets Phone Call]
→ Closes modal without answering

→ {Voice Session Abandoned}
→ Auto-save draft with partial data:
   - Amount: ₹500
   - Status: "Incomplete - Awaiting item name"

→ [Desktop Notification After 5 Minutes]
   "You have an incomplete transaction. Resume now?"
   [Resume] [Dismiss]

→ User Clicks "Resume"
→ [Modal Opens with Context]
   "You were adding an expense of ₹500.
    What did you spend it on?"
→ User Continues from Where Left Off
```

### Scenario 5: Language Mixing Mid-Sentence

```
[User Speaks: "Sharma ji को paid 5000 rupees"]
→ Hinglish: Hindi + English in same sentence

→ AI Processing:
   - Detects: Hindi + English mixed
   - Parses: Party = "Sharma ji", Action = "paid", Amount = 5000
   - Intent: Payment Out

→ [Success]
   Party: Sharma ji
   Amount: ₹5,000
   Type: Payment Out

→ No error, handles naturally
```

### Scenario 6: Unclear Amount

```
[User Speaks: "Chai paanch sau rupees"]
→ Transcription: "Chai paanch sau rupees"
→ AI Must Understand: "paanch sau" = 500 in Hindi

→ {Number Word Detection}
   - "paanch" = 5
   - "sau" = 100
   - "paanch sau" = 5 × 100 = 500

→ [Success]
   Item: Chai
   Amount: ₹500

Supported Number Words:
- Hindi: ek, do, teen, paanch, sau, hazaar
- English: one, two, five, hundred, thousand
- Devanagari: १, २, ३, ५००
```

### Scenario 7: Ambiguous Date

```
[User Speaks: "Petrol 500 yesterday"]
→ "yesterday" is ambiguous (what time zone?)

→ AI Uses User's Device Timezone
→ Device timezone: Asia/Kolkata (IST)
→ Current date: Dec 23, 2024
→ "yesterday" = Dec 22, 2024

→ [Confirmation]
   Date: Dec 22, 2024
   (Auto-confirmed, user can edit in form)
```

### Scenario 8: Party Name with Honorifics

```
[User Speaks: "Received payment from Ramesh ji"]
→ "ji" is honorific (respectful suffix in Hindi/Urdu)

→ AI Should Preserve:
   Party Name: "Ramesh ji" (not "Ramesh")

→ When Searching Similar Parties:
   - Match: "Ramesh ji"
   - Also suggest: "Ramesh" (without ji)
   - User chooses which one
```

### Scenario 9: Network Intermittency

```
[User Speaks → Processing Starts → Network Drops → Reconnects]

Timeline:
00:00 - User speaks: "Chai 50"
00:02 - Voice sent to API
00:03 - Network drops (API call fails)
00:04 - Auto-retry #1 (fails)
00:05 - Network reconnects
00:06 - Auto-retry #2 (succeeds)
00:07 - Show result

→ User sees: Processing indicator (3-7 seconds)
→ No error shown (retry succeeded)
→ Transaction created successfully

Max Retries: 3
Retry Interval: 1 second (exponential backoff)
```

### Scenario 10: User Changes Mind Mid-Flow

```
[Flow Started]
→ User Says: "Petrol 500"
→ VAANI Asks: "When did you spend this?"
→ User Realizes: "Wait, it was 600, not 500"

→ [User Can Say: "Change amount to 600"]
OR
→ [User Clicks "Start Over" Button]

→ {User Says "Change amount"}
→ AI Detects: Edit command
→ Update amount: 500 → 600
→ Continue with same question: "When did you spend this?"

→ {User Clicks "Start Over"}
→ Confirm: "Start over? Your current input will be lost."
→ [Yes] → Reset to listening state
```

---

## Screen Specifications

### Desktop Screen Dimensions

| Screen | Width | Height | Modal Type |
|--------|-------|--------|------------|
| Voice Modal | 600px | 700px | Centered overlay |
| Minimized Widget | 280px | 80px | Fixed bottom-right |
| Form Panel | 400px | 100% | Right sidebar |
| Settings Modal | 500px | 600px | Centered overlay |
| Language Selection | 450px | 550px | Centered overlay |
| Error Screens | 500px | 400px | Centered overlay |
| Survey Screens | 480px | 520px | Centered overlay |

### Mobile Screen Dimensions

| Screen | Width | Height | Type |
|--------|-------|--------|------|
| Voice Modal | 100% | 100% | Full screen |
| Bottom Sheet (collapsed) | 100% | 50% | Slide-up |
| FAB | 56dp | 56dp | Floating |
| Form Sheet | 100% | 100% | Full screen |
| Settings | 100% | 100% | Native |
| Notification | 100% | 64dp | Persistent |

### Typography

**Desktop:**
- Heading: 24px, Roboto Medium
- Body: 16px, Roboto Regular
- Caption: 14px, Roboto Regular
- Button: 16px, Roboto Medium

**Mobile:**
- Heading: 20sp, Roboto Medium
- Body: 16sp, Roboto Regular
- Caption: 12sp, Roboto Regular
- Button: 16sp, Roboto Medium

### Color Palette

**Primary:**
- Orange (Mic Button): #FF9800
- Orange Hover: #FB8C00
- Orange Pressed: #F57C00

**Status:**
- Success Green: #4CAF50
- Error Red: #F44336
- Warning Yellow: #FFC107
- Info Blue: #2196F3

**Grayscale:**
- Text Primary: #212121
- Text Secondary: #757575
- Border: #E0E0E0
- Background: #FAFAFA
- Modal Overlay: rgba(0, 0, 0, 0.5)

---

## Interaction Patterns

### Voice Activation Patterns

**Pattern 1: Click-to-Start**
```
User Clicks Mic → Start Listening Immediately
→ Visual: Waveform animates
→ Audio: Optional beep sound (user setting)
```

**Pattern 2: Push-to-Talk (Desktop)**
```
User Holds Space Bar → Start Listening
User Releases Space Bar → Stop & Process
→ Visual: Pulsing ring around mic
```

**Pattern 3: Push-to-Talk (Mobile)**
```
User Long-Presses FAB → Start Listening
User Releases → Stop & Process
→ Haptic: Vibrate on press & release
```

### Form Interaction Patterns

**Pattern 1: Tab Navigation (Desktop)**
```
Form Opens → Focus on First Field
User Presses Tab → Move to Next Field
User Presses Shift+Tab → Move to Previous Field
User Presses Ctrl+S → Save Form
User Presses ESC → Cancel Form
```

**Pattern 2: Swipe Navigation (Mobile)**
```
Form Opens → Scroll to Top
User Swipes Up → Scroll to Next Section
User Swipes Left/Right → No Action (prevent accidental navigation)
User Taps Field → Show Keyboard
User Taps Save → Validate & Save
```

### Minimized Widget Interactions

**Desktop Widget:**
```
Hover → Show tooltip with full status
Click Widget Body → Expand to full modal
Click X → Close/cancel session
Right-Click → Context menu (Settings, Help)
```

**Mobile Notification:**
```
Tap Notification → Expand to full screen
Swipe Left → Dismiss (cancel session)
Swipe Right → No action
Long-Press → Notification options (Android)
```

### Error Recovery Patterns

**Pattern 1: Immediate Retry**
```
Error Shown → "Retry" button prominent
User Clicks Retry → Same action attempted
Success → Continue flow
Failure (3rd time) → Offer alternative
```

**Pattern 2: Guided Recovery**
```
Error Shown → Tips displayed
User Follows Tip → Retry enabled
User Retries → Higher success rate
```

**Pattern 3: Graceful Degradation**
```
Voice Fails → "Type Instead" offered
User Types → Manual form entry
Same validation → Same outcome
```

---

## Success Metrics Summary

### Adoption Metrics
| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| Voice Activation Rate | 50% | TBD | % users who click mic in first 7 days |
| Weekly Active Voice Users | 30% | TBD | % of active users using voice weekly |
| Voice Transaction Ratio | 40% | TBD | Voice transactions / Total transactions |
| Mobile Adoption (when live) | 50% | TBD | % mobile users trying voice |

### Quality Metrics
| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| Transaction Accuracy | 95% | TBD | % saved without manual edits |
| Voice Recognition Accuracy | 90% | TBD | % transcriptions correct |
| Multi-turn Completion | 85% | TBD | % completing multi-turn flows |
| Error Rate | <10% | TBD | % sessions with errors |

### Efficiency Metrics
| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| Time to Transaction | <8 sec | TBD | Listening → form pre-filled |
| Questions Per Transaction | <1.5 | TBD | Avg clarifying questions |
| Edit Rate | <20% | TBD | % who edit voice-filled forms |

### Engagement Metrics
| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| Find Mode Discovery | 30% | TBD | % trying Find within 14 days |
| Daily Transactions | 5-8 | TBD | Avg transactions per active user |
| 30-Day Retention | 60% | TBD | % still using after 30 days |

---

## Appendix

### Voice Command Examples by Transaction Type

**Expenses:**
- "Chai 50"
- "Petrol 500 rupees"
- "Grocery shopping 2500"
- "Lunch and dinner 800"
- "Electricity bill 1200 yesterday"

**Sales:**
- "Sale to Ramesh, rice 5 kg, 250 rupees"
- "Sharma ji bought wheat 10 kg, 400"
- "Sold vegetables to Priya 150"
- "Invoice for Kumar, dal 3 kg, 180 rupees"

**Payments In:**
- "Received 5000 from Sharma ji"
- "Ramesh paid 3000"
- "Got payment 10000 from Kumar Traders"
- "Cash 2000 from Priya"

**Payments Out:**
- "Paid 3000 to Kumar"
- "Gave 5000 to supplier"
- "Cleared Sharma ji's bill 8000"
- "Paid rent 15000"

**Purchases:**
- "Purchased 10 kg onions from Kumar 500 rupees"
- "Bought rice 50 kg from wholesaler 1500"
- "Tomatoes 20 kg 600 from Sharma"

**Find Mode:**
- "What were my sales yesterday?"
- "How much did I spend on fuel this month?"
- "Who owes me money?"
- "Show all payments from Ramesh"
- "What's my total expense this week?"
- "Top selling items this month"

### Keyboard Shortcuts Reference

**Desktop Only:**

| Shortcut | Action | Context |
|----------|--------|---------|
| Ctrl+V | Open voice modal | Anywhere in app |
| ESC | Close modal / Cancel | In modal |
| Space | Push-to-talk | In listening state |
| Ctrl+S | Save form | In form |
| Ctrl+N | Add another | After save success |
| Tab | Next field | In form |
| Shift+Tab | Previous field | In form |
| Ctrl+F | Switch to Find mode | In modal |
| Ctrl+1 to Ctrl+5 | Switch transaction type | In modal |
| Ctrl+K | Keyboard mode (power user) | Anywhere |
| ? or Ctrl+/ | Show shortcuts | In modal |

### Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Dec 2024 | Initial comprehensive user flow document | Product Team |

---

**End of Document**

**Document Maintained By:** Product Management & Design Team  
**Last Reviewed:** December 2024  
**Next Review:** March 2025 (post-MVP launch)
