# VAANI User Flow Diagrams

Visual diagrams for Create mode user flows. These diagrams can be rendered in GitHub, Notion, or any Mermaid-compatible viewer.

---

## 1. Master User Journey

```mermaid
journey
    title VAANI User Journey
    section Discovery
      See VAANI intro: 5: User
      Enable or Skip: 3: User
    section Setup
      Grant mic permission: 4: User
      Test microphone: 4: User
      Select language: 5: User
    section Onboarding
      View carousel: 3: User
      Complete tutorial: 4: User
    section First Use
      Click mic button: 5: User
      Speak transaction: 5: User
      Review & save: 5: User
    section Mastery
      Use keyboard shortcuts: 5: User
      Multi-item commands: 5: User
```

---

## 2. Entry Points Flowchart

```mermaid
flowchart TD
    A[User Opens Vyapar App] --> B{First time with VAANI?}

    B -->|YES| C[VAANI Intro Modal]
    B -->|NO| D[Mic Button Visible]

    C --> E{User Choice}
    E -->|Enable VAANI| F[Permission Request]
    E -->|Skip| G[Main App - VAANI Hidden]

    F --> H{Permission Granted?}
    H -->|YES| I[Mic Test + Language Setup]
    H -->|NO| J[Permission Denied Screen]

    I --> K[Onboarding Carousel]
    K --> L[Transaction Page + Mic Button]

    D --> M{User Action}
    M -->|Click Mic| N[Voice Modal Opens]
    M -->|Press Ctrl+V| N
    M -->|Right-click Row| N

    J --> O{User Action}
    O -->|Open Settings| P[Grant Permission Externally]
    O -->|Use Manual| G
    P --> I

    N --> Q[Create Mode Active]

    style C fill:#e3f2fd
    style N fill:#e8f5e9
    style J fill:#ffebee
    style Q fill:#e8f5e9
```

---

## 3. Create Mode State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: Modal Opens

    Idle --> Listening: Click Mic / Auto-start

    Listening --> Processing: Silence Detected (2s)
    Listening --> Idle: User Cancels

    Processing --> AskingQuestion: Missing Required Field
    Processing --> EdgeCase: Edge Case Detected
    Processing --> Success: All Fields Extracted

    AskingQuestion --> Processing: User Answers
    AskingQuestion --> Idle: User Cancels

    EdgeCase --> Success: User Confirms
    EdgeCase --> Listening: User Wants to Retry

    Success --> FormPrefill: Auto (2s delay)

    FormPrefill --> Saved: User Saves
    FormPrefill --> Idle: User Cancels

    Saved --> [*]: Transaction Complete

    note right of Listening
        Real-time transcription
        Waveform animation
        Auto-stops on silence
    end note

    note right of Processing
        AI Pipeline:
        1. Intent Detection
        2. Entity Extraction
        3. Missing Fields Check
        4. Apply Defaults
        5. Category AI
    end note

    note right of EdgeCase
        Types:
        - Similar Items
        - Party Disambiguation
        - Multiple Items
    end note
```

---

## 4. Transaction Type Decision Flow

```mermaid
flowchart TD
    A[User Speaks] --> B[AI Intent Detection]

    B --> C{Detected Intent}

    C -->|Expense| D[Expense Flow]
    C -->|Sale| E[Sale Flow]
    C -->|Purchase| F[Purchase Flow]
    C -->|Payment In| G[Payment In Flow]
    C -->|Payment Out| H[Payment Out Flow]
    C -->|Unknown| I[Error: Can't Understand]

    D --> J{Has Item + Amount?}
    E --> K{Has Party + Item + Amount?}
    F --> L{Has Supplier + Item + Amount?}
    G --> M{Has Party + Amount?}
    H --> N{Has Party + Amount?}

    J -->|NO| O[Ask Missing Field]
    J -->|YES| P[Check Similar Items]

    K -->|NO| O
    K -->|YES| Q[Check Party Match]

    L -->|NO| O
    L -->|YES| Q

    M -->|NO| O
    M -->|YES| Q

    N -->|NO| O
    N -->|YES| Q

    O --> B

    P --> R{Similar Items Found?}
    R -->|YES| S[Similar Items Selection]
    R -->|NO| T[Success]

    Q --> U{Multiple Parties Match?}
    U -->|YES| V[Party Disambiguation]
    U -->|NO| T

    S --> T
    V --> T

    T --> W[Form Pre-fill]
    I --> X[Retry or Type]

    style T fill:#c8e6c9
    style I fill:#ffcdd2
```

---

## 5. Expense Flow Detail

```mermaid
flowchart TD
    A["User: 'Chai samosa 140 rupees'"] --> B[Intent: EXPENSE]

    B --> C[Extract Entities]
    C --> D["item: chai samosa<br/>amount: 140"]

    D --> E{All Required?}
    E -->|YES| F[Apply Defaults]
    E -->|NO| G[Ask Question]

    G --> H["'What did you spend ₹140 on?'"]
    H --> I[User Answers]
    I --> C

    F --> J["date: today<br/>payment: cash"]

    J --> K[Category AI]
    K --> L["category: Food & Beverages"]

    L --> M{Similar Items in History?}

    M -->|YES| N[Similar Items Selection]
    M -->|NO| O[Success Screen]

    N --> P{User Selection}
    P -->|Existing Item| O
    P -->|Create New| O

    O --> Q[Form Pre-fill]
    Q --> R[User Reviews]
    R --> S{Action}

    S -->|Save| T[Transaction Saved]
    S -->|Edit| U[Edit Fields]
    S -->|Cancel| V[Discard]

    U --> R

    style A fill:#fff3e0
    style T fill:#c8e6c9
    style V fill:#ffcdd2
```

---

## 6. Sale Flow Detail

```mermaid
flowchart TD
    A["User: 'Sale to Ramesh, rice 5kg 250'"] --> B[Intent: SALE]

    B --> C[Extract Entities]
    C --> D["party: Ramesh<br/>item: rice<br/>qty: 5<br/>unit: kg<br/>amount: 250"]

    D --> E{All Required?}
    E -->|YES| F[Party Lookup]
    E -->|NO| G[Ask Question]

    G --> H["'Who is the customer?'<br/>'What did you sell?'<br/>'What is the amount?'"]
    H --> I[User Answers]
    I --> C

    F --> J{How Many Matches?}

    J -->|0| K[Create New Party]
    J -->|1| L[Use Matched Party]
    J -->|2+| M[Party Disambiguation]

    M --> N[Show Party Options]
    N --> O{User Selection}
    O -->|Select Existing| L
    O -->|Create New| K

    K --> P[Apply Defaults]
    L --> P

    P --> Q["date: today<br/>payment: cash<br/>invoice: auto"]

    Q --> R[Success Screen]
    R --> S[Form Pre-fill]

    S --> T[User Reviews & Saves]

    style A fill:#e3f2fd
    style T fill:#c8e6c9
```

---

## 7. Payment Flows

### Payment In

```mermaid
flowchart TD
    A["User: 'Received 5000 from Sharma ji'"] --> B[Intent: PAYMENT_IN]

    B --> C[Extract Entities]
    C --> D["party: Sharma ji<br/>amount: 5000"]

    D --> E{Party + Amount?}
    E -->|YES| F[Party Lookup]
    E -->|NO| G["Ask: 'Who paid you?' / 'How much?'"]

    G --> H[User Answers] --> C

    F --> I{Matches Found}
    I -->|0| J[Create New]
    I -->|1| K[Use Match]
    I -->|2+| L[Disambiguate]

    L --> M[User Selects]
    M --> K

    J --> N[Apply Defaults]
    K --> N

    N --> O[Check Pending Invoices]
    O --> P{Link to Invoice?}

    P -->|Optional| Q[Show Invoice Options]
    Q --> R[Form Pre-fill]

    P -->|Skip| R

    R --> S[Save]

    style A fill:#e8f5e9
    style S fill:#c8e6c9
```

### Payment Out

```mermaid
flowchart TD
    A["User: 'Paid 3000 to Kumar'"] --> B[Intent: PAYMENT_OUT]

    B --> C[Extract Entities]
    C --> D["party: Kumar<br/>amount: 3000"]

    D --> E{Party + Amount?}
    E -->|YES| F[Supplier Lookup]
    E -->|NO| G["Ask: 'Who did you pay?' / 'How much?'"]

    G --> H[User Answers] --> C

    F --> I{Matches Found}
    I -->|0| J[Create New]
    I -->|1| K[Use Match]
    I -->|2+| L[Disambiguate]

    L --> M[User Selects]
    M --> K

    J --> N[Apply Defaults]
    K --> N

    N --> O[Check Pending Bills]
    O --> P{Link to Bill?}

    P -->|Optional| Q[Show Bill Options]
    Q --> R[Form Pre-fill]

    P -->|Skip| R

    R --> S[Save]

    style A fill:#fff3e0
    style S fill:#c8e6c9
```

---

## 8. Edge Case Handling

```mermaid
flowchart TD
    A[AI Processing Complete] --> B{All Fields Extracted?}

    B -->|NO| C[Ask Question Flow]
    B -->|YES| D{Check Edge Cases}

    C --> E[User Answers]
    E --> A

    D --> F{Similar Items?<br/>Expense Only}
    D --> G{Multiple Parties?<br/>Sale/Purchase/Payment}
    D --> H{Multiple Items?<br/>Any Type}

    F -->|YES| I[Similar Items Screen]
    F -->|NO| J{Next Check}

    G -->|YES| K[Disambiguation Screen]
    G -->|NO| L{Next Check}

    H -->|YES| M[Multi-Item Confirm]
    H -->|NO| N[No Edge Cases]

    I --> O[User Selects]
    K --> O
    M --> O

    O --> P[Success]
    J --> G
    L --> H
    N --> P

    P --> Q[Form Pre-fill]

    style P fill:#c8e6c9
    style I fill:#fff9c4
    style K fill:#fff9c4
    style M fill:#fff9c4
```

---

## 9. Error Handling Flow

```mermaid
flowchart TD
    A[User Speaks] --> B{Voice Captured?}

    B -->|NO - No Audio| C[No Audio Error]
    B -->|YES| D{Network OK?}

    D -->|NO| E[Network Error]
    D -->|YES| F{Speech Recognized?}

    F -->|NO| G[Recognition Failed]
    F -->|YES| H{Intent Understood?}

    H -->|NO| I[Can't Understand Error]
    H -->|YES| J[Continue Processing]

    C --> K[Test Microphone]
    C --> L[Retry]

    E --> M[Retry Now]
    E --> N[Save Draft]

    G --> O[Retry]
    G --> P[Type Instead]

    I --> Q[Show Examples]
    I --> R[Retry]
    I --> S[Type Instead]

    K --> T{Fixed?}
    T -->|YES| A
    T -->|NO| U[Manual Entry]

    L --> A
    M --> A
    N --> V[Draft Saved - Sync Later]
    O --> A
    P --> W[Manual Form]
    Q --> A
    R --> A
    S --> W

    style C fill:#ffcdd2
    style E fill:#ffcdd2
    style G fill:#ffcdd2
    style I fill:#ffcdd2
    style J fill:#c8e6c9
```

---

## 10. Find Mode (WIP)

```mermaid
flowchart TD
    A[Find Tab Clicked] --> B{Feature Status}

    B -->|Coming Soon| C[WIP Screen]

    C --> D["🚧 Coming Soon 🚧"]
    D --> E[Show Example Queries]

    E --> F["• What were my sales yesterday?<br/>• How much did I spend on fuel?<br/>• Who owes me money?<br/>• Show top selling items"]

    F --> G[Notify Me Button]
    G --> H{User Clicks}

    H -->|Yes| I[Capture Email/Notification Pref]
    H -->|No| J[Stay on Screen]

    I --> K[Confirmation Toast]

    style C fill:#fff9c4
    style D fill:#fff9c4
```

---

## 11. Mode Status Overview

```mermaid
pie showData
    title Feature Launch Status
    "Create Mode (LIVE)" : 100
    "Find Mode (WIP)" : 0
```

---

## 12. Transaction Type Distribution (Target)

```mermaid
pie showData
    title Expected Voice Transaction Distribution
    "Expense" : 40
    "Sale" : 30
    "Purchase" : 15
    "Payment In" : 8
    "Payment Out" : 7
```

---

## 13. Success Funnel

```mermaid
flowchart TD
    A["Modal Opens<br/>100%"] --> B["User Speaks<br/>Target: 90%"]
    B --> C["AI Extracts<br/>Target: 85%"]
    C --> D["Form Shown<br/>Target: 80%"]
    D --> E["User Saves<br/>Target: 85%"]

    style A fill:#e3f2fd
    style B fill:#bbdefb
    style C fill:#90caf9
    style D fill:#64b5f6
    style E fill:#42a5f5
```

---

## How to Use These Diagrams

1. **GitHub**: These diagrams render automatically in GitHub markdown
2. **Notion**: Use the Mermaid code block feature
3. **VS Code**: Install "Markdown Preview Mermaid Support" extension
4. **Online**: Use [mermaid.live](https://mermaid.live) to view/edit

---

*Diagrams created for VAANI Create Mode Launch*
