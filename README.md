# Vyapar LLM Hub - VAANI Testing Dashboard

> **IMPORTANT: This README must be updated whenever code changes are made.** When adding new features, modifying existing functionality, or changing the architecture, update the relevant sections of this document to keep it accurate and useful.

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Components Documentation](#components-documentation)
- [Data Files](#data-files)
- [Key Features](#key-features)
- [API Integration](#api-integration)
- [Development Guide](#development-guide)
- [Deployment](#deployment)

---

## Project Overview

**Vyapar LLM Hub** is a testing and evaluation dashboard for **VAANI (Voice-to-Invoice)** - an AI-powered system that converts Hindi/Hinglish voice commands into structured business transactions for 63M+ Indian MSMEs.

### What is VAANI?

VAANI is a voice-to-invoice system that:
- Accepts voice input from the Vyapar mobile app
- Transcribes speech to text (using Whisper/Sarvam AI)
- Classifies intent (expense, payment_in, payment_out, sale_invoice, other)
- Extracts structured data using LLMs (Gemini 2.0 Flash)
- Generates follow-up questions using rule-based logic
- Creates invoices/transactions in the Vyapar accounting system

### Purpose of This Dashboard

This dashboard provides tools to:
1. **Test LLM models** - Compare outputs across different models
2. **Manage test cases** - 778+ test cases covering all transaction types
3. **Analyze performance** - Step-by-step timing analysis
4. **View system prompts** - Current production prompts
5. **Propose optimizations** - Optimized prompts with explanations
6. **Transcribe audio** - Test speech-to-text models

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Component library (based on Radix UI) |
| **Recharts** | Charts and visualizations |
| **XLSX** | Excel file export |
| **Lucide React** | Icon library |

---

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui base components
│   ├── DataScience.tsx  # Pipeline architecture documentation
│   ├── LoginForm.tsx    # Authentication form
│   ├── Metrics.tsx      # Performance metrics display
│   ├── ModelOverview.tsx # LLM model cards
│   ├── Navbar.tsx       # Navigation bar
│   ├── Playground.tsx   # Interactive model testing
│   ├── PlayGroundPrompts.tsx # Prompt testing interface
│   ├── Product.tsx      # System prompts, test cases, API testing
│   ├── ProductionInsights.tsx # Production analytics
│   ├── Speech2Text.tsx  # Audio transcription testing
│   └── UseCases.tsx     # Use case examples
├── data/
│   └── testCasesData.ts # 778+ test cases for all transaction types
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/
│   └── Index.tsx        # Main page with routing
└── index.css            # Global styles
```

---

## Components Documentation

### 1. `Index.tsx` - Main Page Router

**Location:** `src/pages/Index.tsx`

The main entry point that handles:
- **Authentication state** - `isLoggedIn` state controls access
- **Page routing** - `currentPage` state determines which component to render
- **Model selection** - Passes selected model ID to Playground

```typescript
// Available pages
'overview' | 'playground' | 'playground-prompts' | 'speech-to-text' |
'use-cases' | 'metrics' | 'prod-insights' | 'data-science' | 'product'
```

### 2. `Navbar.tsx` - Navigation

**Location:** `src/components/Navbar.tsx`

Responsive navigation bar with:
- Desktop horizontal menu
- Mobile hamburger menu
- Active page highlighting
- Logout functionality

**Nav Items:**
- Playground - Interactive model testing
- Playground Prompts - Prompt variations testing
- Speech to Text - Audio transcription
- Prod Insights - Production analytics
- Data Science - Architecture docs
- Product - Prompts & test cases

### 3. `LoginForm.tsx` - Authentication

**Location:** `src/components/LoginForm.tsx`

Simple login form that:
- Authenticates against `/api/ps/talk2bill-login`
- Stores JWT token in `localStorage`
- Calls `onLogin` callback on success

### 4. `Product.tsx` - Main Testing Hub

**Location:** `src/components/Product.tsx`

The most feature-rich component with **4 tabs**:

#### Tab 1: System Prompts
Displays current production system prompts with **syntax highlighting**:
- Intent Classification prompt
- Expense Rules & Extraction prompts
- Payment-In/Out prompts
- Sale Invoice Extraction prompt
- Other Intent Handler

**Syntax Highlighting Colors:**
| Element | Color |
|---------|-------|
| Section headers (TASK:, RULES:) | Amber |
| Numbered items (1., 2.) | Cyan |
| Bullet points | Pink |
| Placeholders ({user_input}) | Green |
| XML tags (<<HISTORY>>) | Purple |
| Quoted strings | Yellow |
| Keywords (None, null) | Orange |
| Logical operators (if, OR) | Pink |

#### Tab 2: Proposed Prompts
Optimized system prompts with:
- **Optimized prompt** for each transaction type (expense, payment_in, payment_out, sale_invoice)
- **Section explanations** - Each part of the prompt explained with importance levels (critical/high/medium)
- **AI critiques** - Improvement suggestions with priority (high/medium/low)
- **User input** - Submit your own optimization suggestions

**Data Structure:**
```typescript
proposedPrompts = {
  expense: {
    name: string,
    version: string,
    status: 'proposed' | 'approved',
    prompt: string,
    sections: Array<{
      title: string,
      content: string,
      explanation: string,
      importance: 'critical' | 'high' | 'medium'
    }>,
    critiques: Array<{
      issue: string,
      suggestion: string,
      priority: 'high' | 'medium' | 'low'
    }>
  },
  // ... payment_in, payment_out, sale_invoice
}
```

#### Tab 3: Test Cases
Comprehensive test case management with:
- **778+ pre-built test cases** imported from `testCasesData.ts`
- **Filtering** by type (expense, payment_in, etc.) and category
- **Custom category filter** - Select "+ Custom (Manual)" to view only manually added test cases
- **Search** functionality
- **Add/Delete** test cases - New test cases appear at the top of the list
- **Import/Export** - CSV and XLSX support
- **Run All Tests** - Run all filtered test cases against selected LLM model
- **Run 10 Random** - Quick testing with 10 randomly selected test cases from filtered results
- **Pagination** - 50 test cases per page with navigation controls (First, Previous, page numbers, Next, Last)
- **Timing analysis** - Step-by-step latency breakdown

**Audio Test (E2E Analysis):**
Upload audio files to test the complete voice-to-invoice pipeline:
- **File upload** - Supports WAV, MP3, M4A, OGG, WebM formats
- **Transaction type selection** - Choose expense, sale_invoice, payment_in, or payment_out
- **3-step processing**: Upload → Transcription → Data Extraction
- **End-to-end timing breakdown**:
  - Upload + STT (Speech-to-Text) time
  - Intent Classification time
  - Data Extraction time
  - Total E2E latency
- **Results display** - Shows transcription, translation, detected intent, and extracted invoice data
- **Visual progress bars** - Color-coded timing visualization with percentage breakdown

**Test Case Interface:**
```typescript
interface TestCase {
  id: number;
  type: 'expense' | 'sale_invoice' | 'payment_in' | 'payment_out' | 'other';
  input: string;           // The voice input text
  expectedIntent: string;  // Expected intent classification
  expectedOutput: any;     // Expected extracted data
  category: string;        // Test category (basic, multi-item, etc.)
  context?: string;        // Optional conversation context
}
```

**Timing Analysis:**
Tracks latency for each pipeline step:
- API Request time
- Server Processing time
- Intent Classification (LLM call)
- Data Extraction (LLM call)
- Validation
- Storage/S3
- Response Parse
- Total E2E

Displays statistics: min, max, avg, median, P95

#### Tab 4: API Testing
Interactive API testing interface for:
- `extract-json-text` - Text to invoice extraction
- `extract-json-alt` - Custom prompt extraction
- `talk2bill-json-verify` - Output verification
- `talk2bill-upload` - Audio transcription
- `talk2bill-voice-verify` - Transcription verification
- `talk2bill-login` - Authentication

### 5. `DataScience.tsx` - Architecture Documentation

**Location:** `src/components/DataScience.tsx`

Technical documentation with **3 tabs**:

#### Tab 1: How It Works
- End-to-end system flow diagram (Mobile App → S3 → STT → MongoDB → Scheduler → Talk2Bill → Response)
- Job status lifecycle (STT_IN_PROGRESS → STT_COMPLETED → T2I_IN_PROGRESS → T2I_COMPLETED → INVOICE_READY)
- Entry points/transaction types (expense=7, payment_in=3, payment_out=4)
- Pydantic data models (ExpenseModel, PaymentInModel, PaymentOutModel)
- Pre-defined questions (rule-based, not LLM-generated)
- Scheduler configuration (30 workers, 0.5s poll interval)

#### Tab 2: Pipeline Evolution
- Comparison: Old 5-Agent pipeline vs New Handler-based pipeline
- Key improvements: 4 LLM calls → 2 LLM calls (50% reduction)
- Latency improvement: 2-3s → 1-1.5s
- Handler Factory pattern explanation
- Transaction Handler types (ExpenseTransactionHandler, etc.)

#### Tab 3: Old Architecture
- Legacy 5-agent sequential pipeline
- Data flow example
- Agent descriptions

### 6. `ProductionInsights.tsx` - Analytics

**Location:** `src/components/ProductionInsights.tsx`

Production analytics dashboard displaying real VAANI production data (Nov 7 - Dec 22, 2025):

**Data Summary:**
| Metric | Value |
|--------|-------|
| Date Range | Nov 7 - Dec 22, 2025 (45 days) |
| Total Records | 19,526 |
| Unique Sessions | 11,249 |
| Total Items Tracked | 11,578 |
| Total Amount | ₹16.77 Cr |
| Invoice Completion Rate | 10.4% |

**Dashboard Tabs:**

1. **Overview Tab**
   - Daily voice requests area chart (45 days of data)
   - Intent distribution pie chart (Expense: 67.2%, Other: 30%, Unknown: 2.8%)
   - Processing status pie chart (T2I Completed: 86.8%, Invoice Ready: 10.4%, Failed: 2.8%)
   - Payment methods pie chart (Cash: 98.1%, Bank/UPI: 1.5%, Credit: 0.4%)

2. **Funnel Tab**
   - Conversion funnel visualization (Total → Expense Intent → Invoice Created)
   - Drop-off analysis cards
   - "YES" problem analysis - Users responding with "yes/okay" instead of expense details
   - Word count distribution chart
   - Projected impact table with improvement estimates

3. **Other Intent Tab** (NEW)
   - **Critical Metric**: Expense → Invoice conversion rate (14.7%)
   - Lost sessions counter (11,182 expense sessions that didn't convert)
   - "Other" intent breakdown with visual bars:
     - Yes/Okay responses: 36.7%
     - Greetings/Chat: 17.1%
     - Unclear/Other: 31.3%
     - Single Words: 8.3%
     - Questions: 6.2%
     - No/Cancel: 0.4%
   - Sample transcriptions with category badges
   - Key insights and problem analysis cards

4. **Categories Tab**
   - Top expense categories bar chart
   - Category insights cards (Food: 1,121, Fuel: 835, Salary: 698)

5. **Top Items Tab**
   - Most tracked items bar chart (Petrol: 1,009, Tea: 529, Samosa: 195)
   - Top 5 items stats grid

6. **Samples Tab**
   - Sample voice transcriptions with intent and category badges
   - Key insights summary

**Key Insights Displayed:**
- **14.7% expense → invoice conversion** - The critical metric to improve
- 36.7% of "other" intent are "yes/okay" responses
- 17.1% are greetings/random chat
- 67.2% expense intent rate (users understand the use case)
- Food & Fuel dominate categories
- Cash is 98.1% of payment methods

**Filter Options:**
- Date filter (by week or month)
- Intent filter
- Status filter
- Category filter

Uses **Recharts** for visualizations with custom tooltips and responsive containers.

### 7. `Speech2Text.tsx` - Audio Testing

**Location:** `src/components/Speech2Text.tsx`

Audio transcription testing:
- File upload (WAV, MP3)
- Drag-and-drop support
- Dual model comparison (Whisper vs Sarvam AI)
- Transcription and translation display
- Verification submission

### 8. `Playground.tsx` - Model Testing

**Location:** `src/components/Playground.tsx`

Interactive testing interface with:
- **37 pre-defined sample inputs** organized by transaction type
- **Transaction type filter** - Filter samples by expense, payment_in, payment_out, sale_invoice, other
- **Search functionality** - Search through sample inputs and categories
- **Collapsible sample panel** - Show/hide sample inputs section
- **Model selection** - GPT-4O Mini, GPT-3.5 Turbo, GPT-4.1 Nano, Gemini 2.0 Flash Lite
- **Multi-model comparison** - Run same input against multiple models
- **Detailed timing analysis** for each response:
  - Request preparation time
  - Network round-trip time
  - Response parsing time
  - Intent classification (server-side)
  - Data extraction (server-side)
  - Validation (server-side)
  - Total E2E time
- **Visual timing bars** - Color-coded progress bars for each step
- **Raw API response** - Collapsible view of complete API response
- **Correction submission** - Mark incorrect responses and submit corrections

**Sample Inputs by Type:**
| Type | Count | Categories |
|------|-------|------------|
| expense | 10 | basic, multi-item, with-payment, salary, quantity, bills, travel, rent, food |
| payment_in | 8 | basic, upi, bank, advance, dues, cash, invoice, partial |
| payment_out | 6 | basic, bank, advance, cheque, large, transport |
| sale_invoice | 8 | basic, quantity, paid, credit, gst, discount, service, multi-item |
| other | 5 | greeting, question, offtopic |

### 9. `PlayGroundPrompts.tsx` - Prompt Testing

**Location:** `src/components/PlayGroundPrompts.tsx`

Test different prompt variations:
- Custom system prompt input
- Model selection
- Side-by-side comparison
- Latency tracking

---

## Data Files

### `vyapar.talk2bill_jobs.json`

**Location:** `./vyapar.talk2bill_jobs.json` (root directory)

Production data export from MongoDB containing VAANI voice-to-invoice job records:

| Property | Description |
|----------|-------------|
| Date Range | Nov 7 - Dec 22, 2025 |
| Total Records | 19,526 |
| File Size | ~13.7 MB |

**Record Structure:**
```json
{
  "_id": { "$oid": "..." },
  "sessionId": "...",
  "createdAt": { "$date": "2025-11-07T12:43:10.292Z" },
  "status": "T2I_COMPLETED | INVOICE_READY | FAILED",
  "transcription": "Apple for 100 rupees.",
  "intent": "expense | other | unknown",
  "invoice": {
    "expense_category": "food",
    "items": [{ "item_name": "Apple", "item_amount": 100, "item_qty": 1 }],
    "payment_type": "cash"
  },
  "modelQuestion": "Great! Would you like to add another item?"
}
```

**Usage:** This file is analyzed to populate the ProductionInsights dashboard. To update the dashboard with new data, replace this file with a fresh MongoDB export.

---

### `testCasesData.ts`

**Location:** `src/data/testCasesData.ts`

Contains **778 test cases** generated programmatically:

| Type | Count | Categories |
|------|-------|------------|
| expense | 158 | basic, salary, multi-item, quantity, with-qty, cancellation, modification |
| sale_invoice | 243 | basic, quantity, multi-item, credit, gst |
| payment_in | 182 | basic, upi, bank, partial |
| payment_out | 157 | basic, upi, bank |
| other | 38 | greeting, question, offtopic |

**Generator Functions:**
- `generateExpenseTestCases()` - Generates expense test cases
- `generateSaleInvoiceTestCases()` - Generates sale invoice test cases
- `generatePaymentInTestCases()` - Generates payment in test cases
- `generatePaymentOutTestCases()` - Generates payment out test cases
- `generateOtherTestCases()` - Generates other/greeting test cases
- `generateAllTestCases()` - Combines all generators

---

## Key Features

### 1. Syntax Highlighting for Prompts

The `HighlightedPrompt` component (`Product.tsx:831-954`) provides intelligent syntax highlighting:

```typescript
// Patterns highlighted:
- Section headers: /^([A-Z][A-Z0-9_ ]+):/
- Numbered items: /^\s*(\d+\.)/
- Bullet points: /^\s*(-|\*)/
- Placeholders: /\{[a-z_]+\}/
- XML tags: /<<[A-Z_]+>>/
- Quoted strings: /"[^"]*"/
- Keywords: /\b(None|null|true|false)\b/
- Logical operators: /\b(if|OR|AND|NOT)\b/
- Emphasis: /\b(JSON|ONLY|REQUIRED|RULES?|FORMAT)\b/
- Types: /:\s*(str|float|int|bool|object|array)\b/
```

### 2. CSV/XLSX Import/Export

Test cases can be:
- **Imported** from CSV files with column validation
- **Exported** to CSV or XLSX format
- Sample CSV download available

**CSV Columns:**
```
type, input, expectedIntent, category, context, expectedOutput
```

### 3. Step-by-Step Timing Analysis

When running tests, timing is collected for each pipeline step:
- `api_request` - Time to send request
- `server_processing` - Server-side processing
- `response_parse` - JSON parsing time
- `intent_classification` - LLM intent detection (if returned by server)
- `data_extraction` - LLM data extraction (if returned by server)
- `validation` - Rule-based validation
- `storage` - Database/S3 operations
- `total` - End-to-end latency

Statistics calculated: min, max, avg, median, P95

### 4. Proposed Prompt Optimization

Each proposed prompt includes:
- Optimized prompt text with Hindi/Hinglish examples
- Section-by-section breakdown with explanations
- Importance levels (critical > high > medium)
- AI critiques with improvement suggestions
- User input for additional suggestions

---

## API Integration

### Base URL
```
https://analytics-staging.vyaparapp.in
```

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ps/talk2bill-login` | POST | User authentication |
| `/api/ps/extract-json-text` | POST | Extract data from text |
| `/api/ps/extract-json-alt` | POST | Custom prompt extraction |
| `/api/ps/talk2bill-json-verify` | POST | Submit verification |
| `/api/ps/talk2bill-upload` | POST | Upload audio file |
| `/api/ps/talk2bill-voice-verify` | POST | Verify transcription |

### Authentication
JWT token stored in `localStorage` as `authToken`, sent as `Authorization: Bearer <token>`.

---

## Development Guide

### Prerequisites
- Node.js 18+ (use nvm for version management)
- npm or yarn

### Setup
```bash
# Clone repository
git clone <repository-url>
cd talk2bill-test

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev      # Start dev server (port 8080)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Development Server
Runs at: `http://localhost:8080/talk2bill-test/`

### Adding New Test Cases

1. Edit `src/data/testCasesData.ts`
2. Add to appropriate generator function
3. Test cases are automatically included on page load

### Adding New Components

1. Create component in `src/components/`
2. Add to `navItems` in `Navbar.tsx`
3. Add case to `renderCurrentPage()` in `Index.tsx`

---

## Deployment

### GitHub Pages Deployment
After pushing all your changes, deploy to GitHub Pages:
```bash
npm run deploy
```
This command builds the project and deploys the `docs/` folder to GitHub Pages.

### Lovable Deployment
1. Open [Lovable Project](https://lovable.dev/projects/a6389be6-d72b-4545-b08b-3c7590294ad7)
2. Click Share → Publish

### Manual Deployment
```bash
npm run build
# Deploy docs/ folder to your hosting provider
```

---

## Changelog

### December 2024

#### Latest Changes (Dec 22, 2024)
- **48-Hour Persistent Sessions** - Users stay logged in for 48 hours:
  - Session stored in localStorage with timestamp
  - Auto-login on page refresh/revisit within 48 hours
  - Session info logged to console for debugging
  - Clean logout clears all session data
- **Debug Logging in Playground** - Comprehensive API debugging:
  - Console logs for all API requests/responses
  - Visual Debug Panel with color-coded logs
  - Shows: API URL, headers, request body, response status
  - Auto-expands on error with troubleshooting tips
  - Copy all logs button for sharing
- **Detailed Funnel Breakdown** - New section in Metrics tab:
  - Audio Submission funnel (11,000 → 5,462 → 5,047)
  - Expense Meaningfulness analysis (61% valid data)
  - Single vs Multi-item composition (78% single-item)
- **Metrics Tab** - New tab in Product section with Mixpanel data:
  - Key metrics cards (9.42% success, 1,092 users, 15% D1 retention)
  - Conversion funnel visualization with drop-off analysis
  - Retention curve (D1 to D30)
  - Exit reasons breakdown
  - User feedback scores and NPS (45.8)
  - Missing metrics checklist
- **Roadmap Tab** - New tab in Product section with all feature ideas:
  - 5 implementation phases
  - 8 feature categories with detailed features
  - Quick wins section
  - Key problems to solve
- **Enhanced Playground Samples** - Longer, realistic test inputs:
  - Multi-item examples with categories
  - Hover tooltips for full text preview
  - Transaction type selection required
- **Other Intent Analysis Tab** - New tab in Prod Insights for analyzing non-expense sessions:
  - Critical metric: 14.7% expense → invoice conversion rate (85.3% lost)
  - Breakdown of 5,860 "other" intent responses
  - Visual bars showing: Yes/Okay (36.7%), Greetings (17.1%), Unclear (31.3%), Questions (6.2%)
  - Sample transcriptions with issue analysis
  - Problem insights cards with recommendations
- **Updated Key Insights** - Removed "processing success rate" as it's not the critical metric:
  - Now focuses on expense → invoice conversion as the primary KPI
  - Highlights the "yes/okay" problem and greetings issue
- **Audio Test Feature** - New end-to-end audio testing in Test Cases tab:
  - Upload audio files (WAV, MP3, M4A, OGG, WebM) for full pipeline testing
  - Complete voice-to-invoice flow: Upload → STT → Intent → Extraction
  - Visual E2E timing breakdown with progress bars and percentages
  - Shows transcription, translation, detected intent, and extracted data
- **Production Insights Data Update** - Updated all analytics with new JSON data (Nov 7 - Dec 22, 2025):
  - Extended date range from 8 days to 45 days
  - Total records: 19,526 (up from 2,381)
  - Invoice completion rate improved to 10.4% (up from 8.8%)
  - Updated daily data chart with 45 days of usage
  - Updated status distribution: T2I Completed (86.8%), Invoice Ready (10.4%), Failed (2.8%)
  - Updated intent distribution: Expense (67.2%), Other (30%), Unknown (2.8%)
  - Updated top categories: Food (1,121), Fuel (835), Salary (698)
  - Updated top items: Petrol (1,009), Tea (529), Samosa (195)
  - Updated payment methods: Cash (98.1%), Bank/UPI (1.5%)
  - Updated conversion funnel with new totals
  - Updated drop-off analysis percentages
  - Added week-based date filters

#### Previous Changes
- **Playground Sample Inputs** - Added 37 pre-defined sample inputs organized by transaction type with filtering and search
- **Playground Timing Analysis** - Step-by-step timing breakdown for each model response with visual progress bars
- **Pagination for Test Cases** - 50 test cases per page with full navigation controls (First, Previous, page numbers with ellipsis, Next, Last)
- **New Test Cases at Top** - Manually added test cases now appear at the top of the list for immediate visibility
- **Custom Category Filter** - Easy filter to view only manually added test cases (shown as "+ Custom (Manual)" in dropdown)
- **Run 10 Random Tests** - Quick testing feature to run 10 randomly selected test cases from filtered results
- **Added Proposed Prompts Tab** - New tab in Product page with optimized prompts, section explanations, AI critiques, and user input
- **Syntax Highlighting** - Added color-coded syntax highlighting for system prompts for better readability
- **Removed System Prompts from Data Science** - Moved to Product page, Data Science now focuses on architecture documentation

#### Initial Features
- Added 778+ test cases with generator functions
- Implemented step-by-step timing analysis
- Added CSV/XLSX import/export functionality
- Created Production Insights dashboard with charts
- Added Speech-to-Text testing page

---

## Maintenance Notes

> **REMINDER:** Update this README whenever you:
> - Add a new component
> - Modify existing component functionality
> - Add new data structures
> - Change API integrations
> - Add new features
> - Modify the project structure

Keep the documentation accurate to help future developers understand the codebase quickly.

---

## License

Proprietary - Vyapar App

---

*Last Updated: December 22, 2024*
