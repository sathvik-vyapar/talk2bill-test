import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Code, Play, Plus, Trash2, Copy, Check, ChevronDown, ChevronUp,
  FileText, Zap, Search, Filter, Download, Upload, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle, Sparkles, Loader2,
  Eye, EyeOff, ChevronRight, Server, Send, Terminal, FileSpreadsheet, X, Info,
  Lightbulb, MessageCircle, Wand2, BookOpen, Mic, FileAudio, Volume2, Map, Target, Rocket,
  TrendingUp, TrendingDown, BarChart3, Users, Star, LogOut, Activity
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { testCasesData, TestCase } from '@/data/testCasesData';

// Pipeline Steps for timing analysis
const PIPELINE_STEPS = [
  { id: 'api_request', name: 'API Request', description: 'Time to send request to server' },
  { id: 'server_processing', name: 'Server Processing', description: 'Time for server to process (includes all backend steps)' },
  { id: 'intent_classification', name: 'Intent Classification', description: 'LLM call to classify intent' },
  { id: 'data_extraction', name: 'Data Extraction', description: 'LLM call to extract structured data' },
  { id: 'validation', name: 'Validation', description: 'Rule-based validation and missing fields check' },
  { id: 'storage', name: 'Storage/S3', description: 'Database or S3 storage operations' },
  { id: 'response_parse', name: 'Response Parse', description: 'Time to parse JSON response' },
  { id: 'total', name: 'Total E2E', description: 'Total end-to-end time' },
];

// Actual System Prompts from Production Code
const systemPrompts = {
  intentClassification: {
    name: 'Intent Classification',
    description: 'Classifies user query as transaction type or "other" based on conversation history',
    prompt: `Classify user query as "{transaction_type}" or "other" based on conversation history.

**Rules**:
{all_rules}

**Response**: {"intent": "{transaction_type}"} or {"intent": "other"}

**Examples**:
{all_examples}

<<HISTORY>>
{history}
<<HISTORY>>

<<USER_QUERY>>
{user_query}
<<USER_QUERY>>`,
  },
  expenseRules: {
    name: 'Expense Rules',
    description: 'Rules for classifying expense intent',
    prompt: `EXPENSE CREATION RULES:
- If user is answering expense questions (amount, category, item, payment) → "expense"
- Short responses (numbers, words) in expense context → "expense"
- Direct expense creation requests → "expense"
- Changes in expense creation requests → "expense"
- Cancellation of expense creation requests → "expense"
- Requests to add more items (e.g., "I want to add more items") → "expense"

**CONTEXT CHECK**:
Look at last model question:
- Contains "add another" / "add more" / "more items" → User response = "expense"
- Asks for amount/category/payment → User response = "expense"
- Otherwise → Check if expense-related

**Expense Categories**: electricity, petrol, salary, food, transport, utilities, medical, shopping etc`,
  },
  expenseExtraction: {
    name: 'Expense Extraction',
    description: 'Extracts expense information from user input and merges with existing invoice',
    prompt: `Extract expense information from user input and merge with existing invoice data. Return ONLY updated JSON.

CATEGORIZATION:
- Examples: food, petrol/diesel, salary, utilities, medical, transport, shopping, etc.

CATEGORY EXTRACTION RULES:
- If the user explicitly states a category (e.g., "category is X", "create a category called X"):
  - Set expense_category to EXACTLY what the user said (verbatim)
- Only if NO explicit category is provided:
  - You MAY infer a category from the item(s) using the lexicon below

CATEGORY INFERENCE LEXICON:
- food: milk, apple, banana, rice, wheat, bread, egg, tea, chai, coffee, sugar, oil, biryani
- petrol: petrol, diesel, gas
- utilities: electricity, water, internet, phone
- medical: doctor, medicine, hospital
- transport: taxi, bus, auto
- shopping: clothes, groceries, stationery, office supplies

INFERENCE RULES:
- item_name = specific object/person (e.g., "bike", "chai", "Ram"), NOT full description
- item_amount = TOTAL cost for this line item
- item_qty = quantity purchased
- Extract numbers as amounts: "100", "Rs 100", "100 rupees" → item_amount: 100
- Default qty: 1 if not specified

**PAYMENT TYPE EXTRACTION RULES**:
- Extract the EXACT payment method or bank/service name
- Examples: "paid through sbi bank" → payment_type: "sbi bank"
- Default to "cash" only if nothing mentioned

INPUT:
Current Invoice: {current_invoice}
Recent history: {history}
User Input: "{user_input}"

RESPONSE FORMAT (JSON ONLY):
{
    "expense_category": "category",
    "items": [{"item_name": "name", "item_amount": amount, "item_qty": qty}],
    "payment_type": "payment_method"
}`,
  },
  expenseMissingFields: {
    name: 'Expense Missing Fields',
    description: 'Checks for missing fields and generates follow-up questions',
    prompt: `You are VAANI, an expense tracker assistant.

Check extracted_data for missing/invalid fields and ask questions to fill gaps.

REQUIRED_FIELDS = ["expense_category", "items", "payment_type"]
REQUIRED_ITEM_FIELDS = ["item_name", "item_amount", "item_qty"]

VALIDATION:
- expense_category, payment_type: non-empty strings
- items: non-empty array
- item_name: non-empty string
- item_amount, item_qty: positive numbers

**NOTE**: Ask up to 3 missing fields in one friendly question.

**COMPLETION DETECTION**:
- If all required fields are valid → {"question": "", "status": "complete"}

**QUESTION PRIORITY**:
- If items exist with valid fields but expense_category missing → "Which category is this expense?"
- If item_name missing (with valid amount) → "What did you spend [amounts] on?"

FORMAT:
- Continue: {"question": "...", "status": "continue"}
- Complete: {"question": "", "status": "complete"}

INPUT:
- Extracted Data: {extracted_data}
- User Input: "{user_input}"
- History: {history}`,
  },
  paymentInRules: {
    name: 'Payment-In Rules',
    description: 'Rules for classifying payment-in intent',
    prompt: `PAYMENT-IN CREATION RULES:
- If user is answering payment-in questions (customer name, amount) → "payment_in"
- Short responses (numbers, names, words) in payment-in context → "payment_in"
- Direct payment-in creation requests → "payment_in"
- Changes in payment-in creation requests → "payment_in"
- Cancellation of payment-in creation requests → "payment_in"

**CONTEXT CHECK**:
Look at last model question:
- Contains "add another" / "more payments" / "another payment" → User response = "payment_in"
- Asks for customer name / amount → User response = "payment_in"
- Otherwise → Check if payment-in related (incoming money)`,
  },
  paymentInExtraction: {
    name: 'Payment-In Extraction',
    description: 'Extracts payment-in information from user input',
    prompt: `Extract payment-in information from user input. Return ONLY JSON.

PARTY MATCHING RULES:
- Extract party/customer name exactly as spoken
- Accept any string as party name (person, business, etc.)
- DO NOT extract generic words related to money/payment as party names

FIELD EXTRACTION:
- party_name: Optional, only if clearly mentioned. If unclear → set to null.
- amount: Optional, only if clearly mentioned. If unclear → set to null.
- phone: Optional (10 digits if provided)
- date: Optional (default: null if not mentioned)
- payment_type: Optional (default: "cash" if not mentioned)
- description: Optional (any notes/remarks)

DATE HANDLING:
- "yesterday", "tomorrow", "25th" → parse appropriately
- Always return date in ISO format - YYYY-MM-DD

EXAMPLES:
"Received 5000 from Sharma ji"
→ {"party_name": "Sharma ji", "amount": 5000, "payment_type": "cash"}

"Ramesh ne 2500 UPI kiya for last month bill"
→ {"party_name": "Ramesh", "amount": 2500, "payment_type": "upi", "description": "last month bill"}

INPUT:
Current Payment: {current_payment}
User Input: "{user_input}"
Today's date: {current_date}

OUTPUT FORMAT:
{
    "party_name": "name",
    "amount": amount,
    "phone": "phone_number",
    "date": "date",
    "payment_type": "payment_method",
    "description": "notes"
}`,
  },
  paymentOutRules: {
    name: 'Payment-Out Rules',
    description: 'Rules for classifying payment-out intent',
    prompt: `PAYMENT-OUT CREATION RULES:
- If user is answering payment-out questions (customer name, amount) → "payment_out"
- Short responses (numbers, names, words) in payment-out context → "payment_out"
- Direct payment-out creation requests → "payment_out"
- Changes in payment-out creation requests → "payment_out"
- Cancellation of payment-out creation requests → "payment_out"

**CONTEXT CHECK**:
Look at last model question:
- Contains "add another" / "more payments" / "another payment" → User response = "payment_out"
- Asks for customer name / amount → User response = "payment_out"
- Otherwise → Check if payment-out related (outgoing money)`,
  },
  paymentOutExtraction: {
    name: 'Payment-Out Extraction',
    description: 'Extracts payment-out information from user input',
    prompt: `Extract payment-out information from user input. Return ONLY JSON.

PARTY MATCHING RULES:
- Extract party/customer name exactly as spoken
- Accept any string as party name (person, business, etc.)

FIELD EXTRACTION:
- party_name: Optional, only if clearly mentioned
- amount: Optional, only if clearly mentioned
- phone: Optional (10 digits if provided)
- date: Optional (default: null)
- payment_type: Optional (default: "cash")
- description: Optional

INPUT:
Current Payment: {current_payment}
User Input: "{user_input}"
Today's date: {current_date}

OUTPUT FORMAT:
{
    "party_name": "name",
    "amount": amount,
    "payment_type": "payment_method"
}`,
  },
  saleInvoiceExtraction: {
    name: 'Sale Invoice Extraction',
    description: 'Extracts sale invoice information including customer, items, quantities, and amounts',
    prompt: `Extract sale invoice information from user input. Return ONLY JSON.

CUSTOMER MATCHING RULES:
- Extract customer name exactly as spoken
- Accept any string as customer name (person, business, etc.)

FIELD EXTRACTION:
- customer_name: Name of the buyer
- items: Array of {item_name, quantity, rate, amount}
- payment_status: paid, unpaid, partial
- payment_type: cash, UPI, card, credit, bank transfer
- invoice_number: If mentioned
- discount: If mentioned

QUANTITY + RATE HANDLING:
- "5 kg rice at 40/kg" → qty: 5, rate: 40, amount: 200
- "10 pieces at 50 each" → qty: 10, rate: 50, amount: 500
- Total amount = quantity × rate

GST HANDLING:
- If GST mentioned, extract GST percentage
- Calculate taxable amount and GST amount

EXAMPLES:
"Sold 5 bags cement to Sharma ji at 350 per bag"
→ {"customer_name": "Sharma ji", "items": [{"item_name": "cement", "quantity": 5, "rate": 350, "amount": 1750}]}

"Cash sale of 10 kg rice 40 per kg"
→ {"items": [{"item_name": "rice", "quantity": 10, "rate": 40, "amount": 400}], "payment_type": "cash", "payment_status": "paid"}

INPUT:
Current Invoice: {current_invoice}
User Input: "{user_input}"

OUTPUT FORMAT:
{
    "customer_name": "name",
    "items": [{"item_name": "name", "quantity": qty, "rate": rate, "amount": total}],
    "payment_status": "paid|unpaid|partial",
    "payment_type": "payment_method"
}`,
  },
  otherIntent: {
    name: 'Other Intent Handler',
    description: 'Handles non-transaction queries with helpful responses',
    prompt: `You are a transaction tracking assistant handling non-transaction queries.
Your name is VAANI.

INPUT:
- User: "{user_input}"
- History: {conversation_history}
- Supported Categories: {supported_categories}

RULES:
1. If user says "yes", "yeah", "sure" → ask about transactions with status "continue"
2. If user says "no", "done", "finished" → return {"question": "", "status": "complete"}
3. If past 3 questions similar → return {"question": "", "status": "complete"}
4. Otherwise: Brief helpful response + redirect to supported transactions (max 2 sentences)

RESPONSE PATTERNS:
- Greetings: "Hello! I'm VAANI, your {categories} helper. What would you like to track?"
- Personal questions: "Sorry, I only help with {categories} tracking. What would you like to record?"
- Capabilities: "I help track your {categories}. What transaction would you like to add?"

FORMAT:
- Normal: {"question": "response_with_redirect", "status": "continue"}
- Complete: {"question": "", "status": "complete"}`,
  },
};

// Proposed Optimized System Prompts with Explanations
const proposedPrompts = {
  expense: {
    name: 'Expense Transaction',
    version: '2.0',
    status: 'proposed',
    prompt: `You are VAANI, an expense tracker for Indian MSMEs. Extract expense data from Hindi/Hinglish voice input.

TASK: Parse user input and return structured JSON for expense creation.

INPUT CONTEXT:
- Current Invoice: {current_invoice}
- Conversation History: {history}
- User Input: "{user_input}"

EXTRACTION RULES:
1. item_name: Extract the specific item/service (not full description)
   - "chai ke liye 50 rupay" → "chai"
   - "Ramesh ki salary" → "Ramesh" (for salary category)

2. item_amount: Total cost for this line item
   - Accept: "100", "Rs 100", "100 rupees", "sau rupay"
   - Handle lakh/crore: "2 lakh" → 200000

3. item_qty: Quantity (default: 1)
   - "5 kg rice" → qty: 5
   - "do coffee" → qty: 2

4. expense_category: Infer from item or use explicit category
   - User says "category X" → use verbatim
   - Infer: chai→food, petrol→fuel, Ramesh salary→salary

5. payment_type: Extract exact method
   - "PhonePe se" → "phonepe"
   - "SBI bank" → "sbi bank"
   - Default: "cash"

OUTPUT FORMAT (JSON only):
{
  "expense_category": "category",
  "items": [{"item_name": "name", "item_amount": amount, "item_qty": qty}],
  "payment_type": "method"
}`,
    sections: [
      {
        title: 'Role Definition',
        content: 'You are VAANI, an expense tracker for Indian MSMEs. Extract expense data from Hindi/Hinglish voice input.',
        explanation: 'Sets the assistant identity and primary task. Specifying Hindi/Hinglish helps the model understand it will receive transliterated input.',
        importance: 'critical'
      },
      {
        title: 'Task Statement',
        content: 'TASK: Parse user input and return structured JSON for expense creation.',
        explanation: 'Clear, concise task definition. Using "structured JSON" primes the model for formatted output.',
        importance: 'critical'
      },
      {
        title: 'Input Context',
        content: 'INPUT CONTEXT:\n- Current Invoice: {current_invoice}\n- Conversation History: {history}\n- User Input: "{user_input}"',
        explanation: 'Provides the model with all necessary context. The invoice state helps with multi-turn conversations. History enables context-aware extraction.',
        importance: 'high'
      },
      {
        title: 'Extraction Rules',
        content: 'Detailed field-by-field extraction rules with examples',
        explanation: 'Specific examples for each field prevent ambiguity. Hindi examples (sau rupay, do coffee) improve accuracy on transliterated input.',
        importance: 'critical'
      },
      {
        title: 'Output Format',
        content: 'Explicit JSON schema with field names and types',
        explanation: 'Providing the exact JSON structure ensures consistent output format that can be reliably parsed.',
        importance: 'critical'
      }
    ],
    critiques: [
      {
        issue: 'Missing edge case handling',
        suggestion: 'Add rules for handling corrections ("nahi 200 nahi, 250") and deletions ("last item hatao")',
        priority: 'medium'
      },
      {
        issue: 'No date extraction',
        suggestion: 'Add date parsing for "kal ka expense", "monday ko kharcha"',
        priority: 'low'
      },
      {
        issue: 'Category list not exhaustive',
        suggestion: 'Include full 50+ category list or use semantic matching instruction',
        priority: 'medium'
      }
    ]
  },
  payment_in: {
    name: 'Payment In Transaction',
    version: '2.0',
    status: 'proposed',
    prompt: `You are VAANI, a payment tracker for Indian MSMEs. Extract payment-in (money received) data.

TASK: Parse user input about incoming payments and return structured JSON.

INPUT CONTEXT:
- Current Payment: {current_payment}
- User Input: "{user_input}"
- Today's Date: {current_date}

EXTRACTION RULES:
1. party_name: Customer/payer name (exactly as spoken)
   - "Sharma ji se 5000 mile" → "Sharma ji"
   - "Ramesh ne payment di" → "Ramesh"
   - Skip generic words: "payment", "rupees", "cash"

2. amount: Payment amount received
   - "paanch hazaar" → 5000
   - "2.5 lakh" → 250000

3. payment_type: Mode of payment
   - UPI apps: "phonepe", "gpay", "paytm"
   - Bank: "bank transfer", "neft", "rtgs"
   - Default: "cash"

4. date: If mentioned (ISO format YYYY-MM-DD)
   - "kal" → yesterday's date
   - "25 tarikh" → 25th of current month

5. description: Any notes or invoice reference

OUTPUT FORMAT (JSON only):
{
  "party_name": "name",
  "amount": number,
  "payment_type": "method",
  "date": "YYYY-MM-DD",
  "description": "notes"
}`,
    sections: [
      {
        title: 'Role Definition',
        content: 'You are VAANI, a payment tracker for Indian MSMEs. Extract payment-in (money received) data.',
        explanation: 'Clearly specifies this is for incoming money, not outgoing. The term "payment-in" matches accounting terminology.',
        importance: 'critical'
      },
      {
        title: 'Party Name Rules',
        content: 'Extract customer name exactly as spoken, skip generic payment words',
        explanation: 'The skip list prevents "payment" or "rupees" from being extracted as party names - a common error.',
        importance: 'high'
      },
      {
        title: 'Amount Handling',
        content: 'Handle Hindi numerals and lakh/crore notation',
        explanation: 'Indian number system uses lakh (100,000) and crore (10,000,000) which must be converted properly.',
        importance: 'high'
      },
      {
        title: 'Date Parsing',
        content: 'Parse relative dates (kal, aaj) to ISO format',
        explanation: 'Providing current_date context enables accurate relative date conversion.',
        importance: 'medium'
      }
    ],
    critiques: [
      {
        issue: 'No phone number extraction',
        suggestion: 'Add rule to extract 10-digit phone numbers when mentioned',
        priority: 'low'
      },
      {
        issue: 'Missing partial payment handling',
        suggestion: 'Add instruction for "5000 mein se 3000 mile" (partial payment scenarios)',
        priority: 'medium'
      }
    ]
  },
  payment_out: {
    name: 'Payment Out Transaction',
    version: '2.0',
    status: 'proposed',
    prompt: `You are VAANI, a payment tracker for Indian MSMEs. Extract payment-out (money paid) data.

TASK: Parse user input about outgoing payments and return structured JSON.

INPUT CONTEXT:
- Current Payment: {current_payment}
- User Input: "{user_input}"
- Today's Date: {current_date}

EXTRACTION RULES:
1. party_name: Supplier/payee name (exactly as spoken)
   - "Mohan ko 10000 diye" → "Mohan"
   - "Supplier ABC ko payment" → "Supplier ABC"

2. amount: Payment amount paid
   - "das hazaar" → 10000
   - Extract from context: "advance mein 5000" → 5000

3. payment_type: Mode of payment
   - "cash diya", "naqad" → "cash"
   - "NEFT kiya" → "neft"
   - "cheque se" → "cheque"

4. description: Purpose or invoice reference
   - "last month ka bill" → "last month ka bill"
   - "advance payment" → "advance"

OUTPUT FORMAT (JSON only):
{
  "party_name": "name",
  "amount": number,
  "payment_type": "method",
  "description": "notes"
}`,
    sections: [
      {
        title: 'Role Definition',
        content: 'Extract payment-out (money paid) data',
        explanation: 'Differentiates from payment_in by specifying this is outgoing money to suppliers.',
        importance: 'critical'
      },
      {
        title: 'Party Name Extraction',
        content: 'Supplier/payee name exactly as spoken',
        explanation: 'Unlike payment_in (customers), payment_out focuses on suppliers/vendors the business pays.',
        importance: 'high'
      },
      {
        title: 'Hindi Payment Terms',
        content: 'Handle Hindi terms: naqad (cash), diya (gave), cheque se (by cheque)',
        explanation: 'Including common Hindi payment vocabulary improves extraction accuracy.',
        importance: 'medium'
      }
    ],
    critiques: [
      {
        issue: 'No advance vs final payment distinction',
        suggestion: 'Add rule to flag if payment is advance, partial, or final settlement',
        priority: 'medium'
      },
      {
        issue: 'Missing bill/invoice linkage',
        suggestion: 'Add instruction to extract bill numbers when mentioned',
        priority: 'low'
      }
    ]
  },
  sale_invoice: {
    name: 'Sale Invoice Transaction',
    version: '2.0',
    status: 'proposed',
    prompt: `You are VAANI, a sales tracker for Indian MSMEs. Extract sale invoice data from voice input.

TASK: Parse user input about sales and return structured JSON for invoice creation.

INPUT CONTEXT:
- Current Invoice: {current_invoice}
- User Input: "{user_input}"

EXTRACTION RULES:
1. customer_name: Buyer name (exactly as spoken)
   - "Sharma ji ko cement becha" → "Sharma ji"

2. items: Array of sold items
   - item_name: Product name
   - quantity: Number of units/kg/pieces
   - rate: Price per unit
   - amount: quantity × rate (calculate if both given)

   Examples:
   - "5 bag cement 350 per bag" → qty:5, rate:350, amount:1750
   - "10 kg rice 40 rupay kilo" → qty:10, rate:40, amount:400

3. payment_status: paid | unpaid | partial
   - "cash le liya" → "paid"
   - "baad mein denge" → "unpaid"
   - "5000 abhi, 3000 baaki" → "partial"

4. payment_type: If payment received
   - Same rules as payment_in

5. discount: If mentioned
   - "100 rupay discount" → 100
   - "10% off" → calculate from total

OUTPUT FORMAT (JSON only):
{
  "customer_name": "name",
  "items": [{"item_name": "name", "quantity": qty, "rate": rate, "amount": total}],
  "payment_status": "paid|unpaid|partial",
  "payment_type": "method",
  "discount": amount
}`,
    sections: [
      {
        title: 'Role Definition',
        content: 'Sales tracker for invoice creation',
        explanation: 'Positions the model for B2B sales context common in MSMEs.',
        importance: 'critical'
      },
      {
        title: 'Item Extraction',
        content: 'Array structure with quantity, rate, and calculated amount',
        explanation: 'The most complex extraction - must handle unit conversions (kg, pieces, bags) and calculate totals.',
        importance: 'critical'
      },
      {
        title: 'Payment Status',
        content: 'Tri-state: paid, unpaid, partial',
        explanation: 'Critical for accounting - distinguishes cash sales from credit sales.',
        importance: 'high'
      },
      {
        title: 'Indian Commerce Terms',
        content: 'Handle terms like "becha" (sold), "baaki" (remaining), "abhi" (now)',
        explanation: 'These Hindi commerce terms are essential for accurate sale parsing.',
        importance: 'high'
      }
    ],
    critiques: [
      {
        issue: 'No GST handling',
        suggestion: 'Add GST extraction: "18% GST lagao", "GST inclusive", "without tax"',
        priority: 'high'
      },
      {
        issue: 'Missing unit normalization',
        suggestion: 'Standardize units: "dozen" → 12, "gross" → 144',
        priority: 'medium'
      },
      {
        issue: 'No return/credit note handling',
        suggestion: 'Add rules for "wapas aaya", "return", "credit note"',
        priority: 'medium'
      }
    ]
  }
};

// Note: Test cases are now imported from '@/data/testCasesData'
// The testCasesData contains 500+ test cases covering all transaction types

// Available Models
const availableModels = [
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', provider: 'Google', status: 'active' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', status: 'active' },
  { id: 'gpt-4o-mini', name: 'GPT-4O Mini', provider: 'OpenAI', status: 'active' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', status: 'active' },
];

// Production API Definitions
const productionAPIs = [
  {
    id: 'extract-json-text',
    name: 'Extract JSON from Text',
    endpoint: '/api/ps/extract-json-text',
    method: 'POST',
    description: 'Extract structured transaction data from natural language text using the specified LLM model. Used in Playground for text-to-invoice conversion.',
    inputSchema: {
      modelName: { type: 'string', required: true, description: 'Model ID (e.g., gemini-2.0-flash-lite)', example: 'gemini-2.0-flash-lite' },
      text: { type: 'string', required: true, description: 'Natural language input text', example: 'Add petrol expense for 500 rupees' },
      transactionType: { type: 'string', required: false, description: 'Transaction type hint (expense, sale_invoice, payment_in, payment_out)', example: 'expense' }
    },
    outputSchema: {
      invoice: { type: 'object', description: 'Extracted transaction data with items, amounts, etc.' },
      metadata: { type: 'object', description: 'Additional metadata from the extraction' }
    },
    category: 'extraction'
  },
  {
    id: 'extract-json-alt',
    name: 'Extract JSON with Custom Prompt',
    endpoint: '/api/ps/extract-json-alt',
    method: 'POST',
    description: 'Extract data using a custom system prompt. Useful for testing new prompt variations or specialized extraction logic.',
    inputSchema: {
      modelName: { type: 'string', required: true, description: 'Model ID', example: 'gemini-2.0-flash-lite' },
      sys_prompt: { type: 'string', required: true, description: 'Custom system prompt', example: 'Extract expense data from user input. Return JSON with item_name and item_amount.' },
      text: { type: 'string', required: true, description: 'User input text', example: 'Chai samosa 140 rupees' }
    },
    outputSchema: {
      output: { type: 'object', description: 'Extracted data based on custom prompt' },
      metadata: { type: 'object', description: 'Processing metadata' }
    },
    category: 'extraction'
  },
  {
    id: 'talk2bill-json-verify',
    name: 'Verify JSON Output',
    endpoint: '/api/ps/talk2bill-json-verify',
    method: 'POST',
    description: 'Submit verification data to mark model outputs as correct/incorrect. Used for collecting training data and model improvement.',
    inputSchema: {
      input: { type: 'string', required: true, description: 'Original user input', example: 'Add 500 rupees petrol' },
      responses: { type: 'array', required: true, description: 'Array of model responses with modelId, modelName, originalResponse, isIncorrect', example: '[{"modelId":"gemini-2.0-flash-lite","modelName":"Gemini 2.0 Flash Lite","originalResponse":"{}","isIncorrect":false}]' },
      correctedOutput: { type: 'string', required: true, description: 'The correct/expected output', example: '{"item_name":"petrol","item_amount":500}' }
    },
    outputSchema: {
      success: { type: 'boolean', description: 'Whether verification was saved successfully' }
    },
    category: 'verification'
  },
  {
    id: 'talk2bill-upload',
    name: 'Upload Audio for Transcription',
    endpoint: '/api/ps/talk2bill-upload',
    method: 'POST',
    description: 'Upload audio file and get transcriptions from both Whisper and Sarvam speech-to-text models. Returns transcription and translation.',
    inputSchema: {
      file: { type: 'file', required: true, description: 'Audio file (WAV, MP3, etc.)', example: 'recording.wav' }
    },
    outputSchema: {
      message: { type: 'string', description: 'Status message' },
      data: {
        type: 'object',
        description: 'Transcription results',
        properties: {
          whisper: { transcription: 'string', translation: 'string' },
          sarvam: { transcription: 'string', translation: 'string' },
          s3_info: { bucket: 'string', key: 'string', region: 'string' }
        }
      }
    },
    category: 'speech'
  },
  {
    id: 'talk2bill-voice-verify',
    name: 'Verify Voice Transcription',
    endpoint: '/api/ps/talk2bill-voice-verify',
    method: 'POST',
    description: 'Submit verification data for voice transcriptions. Mark which model outputs were incorrect and provide correct transcription/translation.',
    inputSchema: {
      whisperTranscription: { type: 'object', required: true, description: '{ text: string, isIncorrect: boolean }', example: '{"text":"petrol 500","isIncorrect":false}' },
      whisperTranslation: { type: 'object', required: true, description: '{ text: string, isIncorrect: boolean }', example: '{"text":"petrol 500","isIncorrect":false}' },
      sarvamTranscription: { type: 'object', required: true, description: '{ text: string, isIncorrect: boolean }', example: '{"text":"petrol 500","isIncorrect":false}' },
      sarvamTranslation: { type: 'object', required: true, description: '{ text: string, isIncorrect: boolean }', example: '{"text":"petrol 500","isIncorrect":false}' },
      correctTranscription: { type: 'string', required: true, description: 'Correct transcription', example: 'petrol ke liye 500 rupay' },
      correctTranslation: { type: 'string', required: true, description: 'Correct translation', example: 'petrol for 500 rupees' },
      s3_info: { type: 'object', required: true, description: '{ bucket, key, region }', example: '{"bucket":"talk2bill","key":"audio/123.wav","region":"ap-south-1"}' }
    },
    outputSchema: {
      success: { type: 'boolean', description: 'Whether verification was saved successfully' }
    },
    category: 'verification'
  },
  {
    id: 'talk2bill-login',
    name: 'User Authentication',
    endpoint: '/api/ps/talk2bill-login',
    method: 'POST',
    description: 'Authenticate user and receive JWT token. Token is used for all subsequent API calls.',
    inputSchema: {
      username: { type: 'string', required: true, description: 'Username', example: 'user' },
      password: { type: 'string', required: true, description: 'Password', example: '****' }
    },
    outputSchema: {
      data: { type: 'string', description: 'JWT authentication token' }
    },
    category: 'auth'
  }
];

interface StepTiming {
  step: string;
  duration: number;
  startTime?: number;
  endTime?: number;
}

interface TestResult {
  status: 'passed' | 'failed' | 'running' | 'error';
  output: any;
  latency: number;
  rawResponse?: string;
  stepTimings?: StepTiming[];
  serverTimings?: Record<string, number>; // From server response if available
}

// Audio test result interface
interface AudioTestResult {
  status: 'idle' | 'uploading' | 'transcribing' | 'processing' | 'completed' | 'error';
  transcription?: string;
  translation?: string;
  intent?: string;
  extractedData?: any;
  error?: string;
  timings: {
    upload: number;
    transcription: number;
    intentClassification: number;
    dataExtraction: number;
    total: number;
  };
}

interface TimingStats {
  step: string;
  min: number;
  max: number;
  avg: number;
  median: number;
  p95: number;
  count: number;
}

// Syntax highlighting component for system prompts
const HighlightedPrompt = ({ text }: { text: string }) => {
  const highlightPrompt = (prompt: string) => {
    const lines = prompt.split('\n');

    return lines.map((line, lineIndex) => {
      const elements: React.ReactNode[] = [];
      let currentIndex = 0;

      // Helper to add text segment
      const addSegment = (text: string, className: string, key: string) => {
        if (text) {
          elements.push(
            <span key={key} className={className}>{text}</span>
          );
        }
      };

      // Check for section headers (all caps followed by colon)
      const headerMatch = line.match(/^(\*\*)?([A-Z][A-Z0-9_ ]+):(\*\*)?/);
      if (headerMatch) {
        addSegment(line.substring(0, headerMatch[0].length), 'text-amber-400 font-bold', `${lineIndex}-header`);
        currentIndex = headerMatch[0].length;
      }

      // Check for numbered rules (1., 2., etc.)
      const numberedMatch = line.match(/^(\s*)(\d+\.)\s/);
      if (numberedMatch && currentIndex === 0) {
        addSegment(numberedMatch[1], 'text-gray-100', `${lineIndex}-space`);
        addSegment(numberedMatch[2], 'text-cyan-400 font-bold', `${lineIndex}-number`);
        addSegment(' ', 'text-gray-100', `${lineIndex}-sp`);
        currentIndex = numberedMatch[0].length;
      }

      // Check for bullet points
      const bulletMatch = line.match(/^(\s*)(-|\*)\s/);
      if (bulletMatch && currentIndex === 0) {
        addSegment(bulletMatch[1], 'text-gray-100', `${lineIndex}-space`);
        addSegment(bulletMatch[2], 'text-pink-400', `${lineIndex}-bullet`);
        addSegment(' ', 'text-gray-100', `${lineIndex}-sp`);
        currentIndex = bulletMatch[0].length;
      }

      // Process the rest of the line
      const remaining = line.substring(currentIndex);
      let lastIndex = 0;

      // Patterns to highlight
      const patterns = [
        { regex: /\{[a-z_]+\}/g, className: 'text-green-400' }, // {placeholders}
        { regex: /<<[A-Z_]+>>/g, className: 'text-purple-400 font-semibold' }, // <<TAGS>>
        { regex: /"[^"]*"/g, className: 'text-yellow-300' }, // "quoted strings"
        { regex: /→/g, className: 'text-cyan-300 font-bold' }, // arrows
        { regex: /\b(None|null|true|false)\b/g, className: 'text-orange-400' }, // keywords
        { regex: /\b(if|OR|AND|NOT)\b/g, className: 'text-pink-400 font-semibold' }, // logical
        { regex: /\b(JSON|ONLY|REQUIRED|NOTE|IMPORTANT|EXAMPLES?|RULES?|FORMAT|OUTPUT|INPUT)\b/gi, className: 'text-amber-300 font-semibold' }, // emphasis words
        { regex: /:\s*(str|float|int|bool|object|array|number|string)\b/g, className: 'text-blue-400' }, // types
      ];

      // Find all matches and sort by position
      const allMatches: { start: number; end: number; className: string; text: string }[] = [];

      patterns.forEach(({ regex, className }) => {
        let match;
        const re = new RegExp(regex.source, regex.flags);
        while ((match = re.exec(remaining)) !== null) {
          allMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            className,
            text: match[0]
          });
        }
      });

      // Sort by start position
      allMatches.sort((a, b) => a.start - b.start);

      // Remove overlapping matches (keep first)
      const filteredMatches: typeof allMatches = [];
      let lastEnd = 0;
      for (const match of allMatches) {
        if (match.start >= lastEnd) {
          filteredMatches.push(match);
          lastEnd = match.end;
        }
      }

      // Build elements from matches
      let segmentKey = 0;
      for (const match of filteredMatches) {
        // Add text before match
        if (match.start > lastIndex) {
          addSegment(remaining.substring(lastIndex, match.start), 'text-gray-100', `${lineIndex}-${segmentKey++}`);
        }
        // Add matched text with highlight
        addSegment(match.text, match.className, `${lineIndex}-${segmentKey++}`);
        lastIndex = match.end;
      }

      // Add remaining text
      if (lastIndex < remaining.length) {
        addSegment(remaining.substring(lastIndex), 'text-gray-100', `${lineIndex}-${segmentKey++}`);
      }

      // If no elements were added, add the whole line
      if (elements.length === 0) {
        addSegment(line, 'text-gray-100', `${lineIndex}-full`);
      }

      return (
        <div key={lineIndex} className="leading-relaxed">
          {elements}
        </div>
      );
    });
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm max-h-[600px] overflow-y-auto font-mono">
      {highlightPrompt(text)}
    </div>
  );
};

const Product = () => {
  const [activeTab, setActiveTab] = useState('prompts');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>('intentClassification');
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  // Proposed prompts state
  const [selectedProposedPrompt, setSelectedProposedPrompt] = useState<keyof typeof proposedPrompts>('expense');
  const [userOptimizationInput, setUserOptimizationInput] = useState('');
  const [showAllSections, setShowAllSections] = useState(true);

  // Test cases state
  const [testCases, setTestCases] = useState<TestCase[]>(testCasesData);
  const [filteredType, setFilteredType] = useState('all');
  const [filteredCategory, setFilteredCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash-lite');
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<Record<number, TestResult>>({});
  const [expandedResults, setExpandedResults] = useState<Record<number, boolean>>({});

  // Timing analysis state
  const [showTimingAnalysis, setShowTimingAnalysis] = useState(false);
  const [timingStats, setTimingStats] = useState<TimingStats[]>([]);

  // Audio test state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioTestResult, setAudioTestResult] = useState<AudioTestResult>({
    status: 'idle',
    timings: { upload: 0, transcription: 0, intentClassification: 0, dataExtraction: 0, total: 0 }
  });
  const [audioTestType, setAudioTestType] = useState<string>('expense');
  const audioInputRef = useRef<HTMLInputElement>(null);

  // New test case form - synced with filter
  const [newTestCase, setNewTestCase] = useState({
    type: 'expense',
    input: '',
    expectedIntent: 'expense',
    category: 'custom',
    context: '',
  });

  // API Testing state
  const [selectedAPI, setSelectedAPI] = useState<string>('extract-json-text');
  const [apiInputs, setApiInputs] = useState<Record<string, string>>({});
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiLatency, setApiLatency] = useState<number>(0);
  const [apiError, setApiError] = useState<string | null>(null);

  // Import/Export state
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync new test case type with filter
  React.useEffect(() => {
    if (filteredType !== 'all') {
      setNewTestCase(prev => ({
        ...prev,
        type: filteredType,
        expectedIntent: filteredType,
      }));
    }
  }, [filteredType]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(key);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const filteredTestCases = testCases.filter((tc) => {
    const matchesType = filteredType === 'all' || tc.type === filteredType;
    const matchesCategory = filteredCategory === 'all' || tc.category === filteredCategory;
    const matchesSearch = searchQuery === '' || tc.input.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTestCases.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTestCases = filteredTestCases.slice(startIndex, endIndex);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredType, filteredCategory, searchQuery]);

  const uniqueCategories = [...new Set(testCases.map(tc => tc.category))].sort((a, b) => {
    // Put 'custom' at the top for easy access to manually added test cases
    if (a === 'custom') return -1;
    if (b === 'custom') return 1;
    return a.localeCompare(b);
  });

  const toggleResultExpand = (id: number) => {
    setExpandedResults(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const addTestCase = () => {
    if (!newTestCase.input.trim()) return;
    const newId = Math.max(...testCases.map(tc => tc.id)) + 1;
    // Add new test case at the beginning of the array
    setTestCases([{
      id: newId,
      type: newTestCase.type as TestCase['type'],
      input: newTestCase.input,
      expectedIntent: newTestCase.expectedIntent,
      expectedOutput: null,
      category: newTestCase.category || 'custom',
      context: newTestCase.context || undefined,
    }, ...testCases]);
    setNewTestCase({ ...newTestCase, input: '', context: '' });
    // Reset to first page to see the newly added test case
    setCurrentPage(1);
  };

  const deleteTestCase = (id: number) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
    const newResults = { ...testResults };
    delete newResults[id];
    setTestResults(newResults);
  };

  // Run single test with step timing
  const runSingleTest = async (tc: TestCase) => {
    setTestResults(prev => ({
      ...prev,
      [tc.id]: { status: 'running', output: null, latency: 0 }
    }));

    const timings: StepTiming[] = [];
    const startTime = Date.now();
    let requestSentTime = 0;
    let responseReceivedTime = 0;
    let parseStartTime = 0;
    let parseEndTime = 0;

    try {
      // Step 1: API Request
      const requestStartTime = Date.now();
      timings.push({ step: 'api_request', duration: 0, startTime: requestStartTime });

      const response = await fetch('https://analytics-staging.vyaparapp.in/api/ps/talk2bill/extract-json-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          modelName: selectedModel,
          text: tc.input.trim(),
          transactionType: tc.type,
          includeTimings: true // Request server to include timing breakdown
        })
      });

      requestSentTime = Date.now();
      timings[0].duration = requestSentTime - requestStartTime;
      timings[0].endTime = requestSentTime;

      responseReceivedTime = Date.now();
      const serverProcessingTime = responseReceivedTime - requestSentTime;

      // Step 2: Server Processing (total time server took)
      timings.push({
        step: 'server_processing',
        duration: serverProcessingTime,
        startTime: requestSentTime,
        endTime: responseReceivedTime
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      // Step 3: Response Parse
      parseStartTime = Date.now();
      const data = await response.json();
      parseEndTime = Date.now();

      timings.push({
        step: 'response_parse',
        duration: parseEndTime - parseStartTime,
        startTime: parseStartTime,
        endTime: parseEndTime
      });

      // Extract server-side timings if available
      const serverTimings: Record<string, number> = {};
      if (data.timings || data.metadata?.timings) {
        const st = data.timings || data.metadata?.timings;
        if (st.intent_classification) {
          timings.push({ step: 'intent_classification', duration: st.intent_classification });
          serverTimings.intent_classification = st.intent_classification;
        }
        if (st.data_extraction) {
          timings.push({ step: 'data_extraction', duration: st.data_extraction });
          serverTimings.data_extraction = st.data_extraction;
        }
        if (st.validation) {
          timings.push({ step: 'validation', duration: st.validation });
          serverTimings.validation = st.validation;
        }
        if (st.storage) {
          timings.push({ step: 'storage', duration: st.storage });
          serverTimings.storage = st.storage;
        }
      }

      const totalLatency = Date.now() - startTime;
      timings.push({ step: 'total', duration: totalLatency, startTime, endTime: Date.now() });

      // Compare with expected output (simple comparison)
      const passed = data.invoice && tc.expectedOutput ?
        JSON.stringify(data.invoice).includes(JSON.stringify(tc.expectedOutput).slice(1, -1)) :
        true;

      setTestResults(prev => ({
        ...prev,
        [tc.id]: {
          status: passed ? 'passed' : 'failed',
          output: data.invoice || data,
          latency: totalLatency,
          rawResponse: JSON.stringify(data, null, 2),
          stepTimings: timings,
          serverTimings: Object.keys(serverTimings).length > 0 ? serverTimings : undefined
        }
      }));
    } catch (error) {
      const latency = Date.now() - startTime;
      timings.push({ step: 'total', duration: latency, startTime, endTime: Date.now() });

      setTestResults(prev => ({
        ...prev,
        [tc.id]: {
          status: 'error',
          output: { error: error instanceof Error ? error.message : 'Unknown error' },
          latency,
          rawResponse: String(error),
          stepTimings: timings
        }
      }));
    }
  };

  // Calculate timing statistics
  const calculateTimingStats = (): TimingStats[] => {
    const completedResults = Object.values(testResults).filter(
      r => r.status !== 'running' && r.stepTimings
    );

    if (completedResults.length === 0) return [];

    const stepData: Record<string, number[]> = {};

    completedResults.forEach(result => {
      result.stepTimings?.forEach(timing => {
        if (!stepData[timing.step]) {
          stepData[timing.step] = [];
        }
        stepData[timing.step].push(timing.duration);
      });
    });

    const stats: TimingStats[] = [];

    PIPELINE_STEPS.forEach(step => {
      const data = stepData[step.id];
      if (data && data.length > 0) {
        const sorted = [...data].sort((a, b) => a - b);
        const sum = data.reduce((a, b) => a + b, 0);

        stats.push({
          step: step.id,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          avg: Math.round(sum / data.length),
          median: sorted[Math.floor(sorted.length / 2)],
          p95: sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1],
          count: data.length
        });
      }
    });

    return stats;
  };

  // Update timing stats when results change
  React.useEffect(() => {
    if (Object.keys(testResults).length > 0) {
      setTimingStats(calculateTimingStats());
    }
  }, [testResults]);

  // Run all filtered tests
  const runTests = async () => {
    setRunningTests(true);
    setTestResults({});

    for (const tc of filteredTestCases) {
      await runSingleTest(tc);
      // Small delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setRunningTests(false);
  };

  // Run 10 random sample tests
  const runRandomTests = async (count: number = 10) => {
    setRunningTests(true);
    setTestResults({});

    // Get random samples from filtered test cases
    const shuffled = [...filteredTestCases].sort(() => Math.random() - 0.5);
    const randomSamples = shuffled.slice(0, Math.min(count, shuffled.length));

    for (const tc of randomSamples) {
      await runSingleTest(tc);
      // Small delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setRunningTests(false);
  };

  // Run audio file test - E2E analysis
  const runAudioTest = async () => {
    if (!audioFile) return;

    const totalStartTime = Date.now();

    setAudioTestResult({
      status: 'uploading',
      timings: { upload: 0, transcription: 0, intentClassification: 0, dataExtraction: 0, total: 0 }
    });

    try {
      // Step 1: Upload audio file
      const uploadStartTime = Date.now();
      const formData = new FormData();
      formData.append('file', audioFile);

      const uploadResponse = await fetch('https://analytics-staging.vyaparapp.in/api/ps/talk2bill/talk2bill-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData,
      });

      const uploadEndTime = Date.now();
      const uploadDuration = uploadEndTime - uploadStartTime;

      if (!uploadResponse.ok) {
        throw new Error(`Audio upload failed: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      const transcription = uploadData.data?.whisper?.transcription || uploadData.data?.sarvam?.transcription || '';
      const translation = uploadData.data?.whisper?.translation || uploadData.data?.sarvam?.translation || '';

      setAudioTestResult(prev => ({
        ...prev,
        status: 'transcribing',
        transcription,
        translation,
        timings: { ...prev.timings, upload: uploadDuration, transcription: uploadDuration }
      }));

      // Step 2: Run text extraction with the transcription
      const extractionStartTime = Date.now();

      setAudioTestResult(prev => ({
        ...prev,
        status: 'processing',
      }));

      const extractResponse = await fetch('https://analytics-staging.vyaparapp.in/api/ps/talk2bill/extract-json-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          modelName: selectedModel,
          text: transcription.trim(),
          transactionType: audioTestType,
          includeTimings: true
        })
      });

      const extractionEndTime = Date.now();
      const extractionDuration = extractionEndTime - extractionStartTime;

      if (!extractResponse.ok) {
        throw new Error(`Extraction API failed: ${extractResponse.status}`);
      }

      const extractData = await extractResponse.json();
      const totalEndTime = Date.now();

      // Extract server-side timings if available
      let intentTime = 0;
      let dataExtractionTime = 0;
      if (extractData.timings || extractData.metadata?.timings) {
        const st = extractData.timings || extractData.metadata?.timings;
        intentTime = st.intent_classification || 0;
        dataExtractionTime = st.data_extraction || 0;
      }

      setAudioTestResult({
        status: 'completed',
        transcription,
        translation,
        intent: extractData.intent || extractData.data?.intent,
        extractedData: extractData.invoice || extractData.data?.invoice || extractData.data,
        timings: {
          upload: uploadDuration,
          transcription: uploadDuration, // Same as upload since it's done server-side
          intentClassification: intentTime || Math.round(extractionDuration * 0.3),
          dataExtraction: dataExtractionTime || Math.round(extractionDuration * 0.7),
          total: totalEndTime - totalStartTime
        }
      });

    } catch (error) {
      const totalEndTime = Date.now();
      setAudioTestResult(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Audio test failed',
        timings: { ...prev.timings, total: totalEndTime - totalStartTime }
      }));
    }
  };

  // Reset audio test
  const resetAudioTest = () => {
    setAudioFile(null);
    setAudioTestResult({
      status: 'idle',
      timings: { upload: 0, transcription: 0, intentClassification: 0, dataExtraction: 0, total: 0 }
    });
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const generateTestCases = () => {
    const baseId = Math.max(...testCases.map(tc => tc.id)) + 1;
    const currentType = filteredType === 'all' ? 'expense' : filteredType;

    const generatedCases = [
      { id: baseId, type: currentType, input: 'Bus ticket 45 rupees', expectedIntent: currentType, expectedOutput: { item_name: 'bus ticket', item_amount: 45 }, category: 'generated' },
      { id: baseId + 1, type: currentType, input: 'Metro card recharge 500', expectedIntent: currentType, expectedOutput: { item_name: 'metro card', item_amount: 500 }, category: 'generated' },
      { id: baseId + 2, type: currentType, input: 'Snacks for meeting 800', expectedIntent: currentType, expectedOutput: { item_name: 'snacks', item_amount: 800 }, category: 'generated' },
      { id: baseId + 3, type: currentType, input: 'Office supplies 1200', expectedIntent: currentType, expectedOutput: { item_name: 'office supplies', item_amount: 1200 }, category: 'generated' },
      { id: baseId + 4, type: currentType, input: 'Team lunch 2500', expectedIntent: currentType, expectedOutput: { item_name: 'lunch', item_amount: 2500 }, category: 'generated' },
    ];

    setTestCases([...testCases, ...generatedCases]);
  };

  const passedTests = Object.values(testResults).filter(r => r.status === 'passed').length;
  const failedTests = Object.values(testResults).filter(r => r.status === 'failed').length;
  const errorTests = Object.values(testResults).filter(r => r.status === 'error').length;
  const avgLatency = Object.values(testResults).filter(r => r.latency > 0).length > 0
    ? Math.round(Object.values(testResults).filter(r => r.latency > 0).reduce((sum, r) => sum + r.latency, 0) / Object.values(testResults).filter(r => r.latency > 0).length)
    : 0;

  // Get current API config
  const currentAPI = productionAPIs.find(api => api.id === selectedAPI);

  // Initialize inputs when API changes
  React.useEffect(() => {
    if (currentAPI) {
      const initialInputs: Record<string, string> = {};
      Object.entries(currentAPI.inputSchema).forEach(([key, schema]: [string, any]) => {
        initialInputs[key] = schema.example || '';
      });
      setApiInputs(initialInputs);
      setApiResponse(null);
      setApiError(null);
    }
  }, [selectedAPI]);

  // Execute API call
  const executeAPICall = async () => {
    if (!currentAPI) return;

    setApiLoading(true);
    setApiError(null);
    setApiResponse(null);
    const startTime = Date.now();

    try {
      const baseUrl = 'https://analytics-staging.vyaparapp.in';
      const token = localStorage.getItem('authToken');

      let response: Response;

      if (currentAPI.id === 'talk2bill-upload') {
        // File upload requires FormData - for now show info
        setApiError('File upload APIs require a file input. Please use the Speech to Text page for audio upload testing.');
        setApiLoading(false);
        return;
      }

      // Build request body
      let body: any = {};
      Object.entries(apiInputs).forEach(([key, value]) => {
        // Try to parse JSON values
        try {
          if (value.startsWith('[') || value.startsWith('{')) {
            body[key] = JSON.parse(value);
          } else if (!isNaN(Number(value)) && value.trim() !== '') {
            body[key] = Number(value);
          } else {
            body[key] = value;
          }
        } catch {
          body[key] = value;
        }
      });

      response = await fetch(`${baseUrl}${currentAPI.endpoint}`, {
        method: currentAPI.method,
        headers: {
          'Content-Type': 'application/json',
          ...(currentAPI.id !== 'talk2bill-login' && token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });

      const latency = Date.now() - startTime;
      setApiLatency(latency);

      const data = await response.json();

      if (!response.ok) {
        setApiError(`API returned ${response.status}: ${JSON.stringify(data)}`);
      } else {
        setApiResponse(data);
      }
    } catch (error) {
      setApiLatency(Date.now() - startTime);
      setApiError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setApiLoading(false);
    }
  };

  // Load example values
  const loadExampleValues = () => {
    if (currentAPI) {
      const exampleInputs: Record<string, string> = {};
      Object.entries(currentAPI.inputSchema).forEach(([key, schema]: [string, any]) => {
        exampleInputs[key] = schema.example || '';
      });
      setApiInputs(exampleInputs);
    }
  };

  // Generate sample CSV content
  const generateSampleCSV = () => {
    const headers = ['type', 'input', 'expectedIntent', 'category', 'context', 'expectedOutput'];
    const sampleRows = [
      ['expense', 'Add petrol for 500 rupees', 'expense', 'basic', '', '{"item_name":"petrol","item_amount":500}'],
      ['expense', 'Chai samosa 140', 'expense', 'multi-item', '', '{"items":[{"item_name":"chai"},{"item_name":"samosa"}]}'],
      ['payment_in', 'Received 5000 from Sharma ji', 'payment_in', 'basic', '', '{"party_name":"Sharma ji","amount":5000}'],
      ['sale_invoice', 'Sold 5 bags cement at 350 each', 'sale_invoice', 'basic', '', '{"items":[{"item_name":"cement","quantity":5,"rate":350}]}'],
      ['other', 'Hello', 'other', 'greeting', '', ''],
    ];

    const csvContent = [headers.join(','), ...sampleRows.map(row =>
      row.map(cell => {
        // Escape cells containing commas or quotes
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )].join('\n');

    return csvContent;
  };

  // Download sample CSV
  const downloadSampleCSV = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'test_cases_sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV content
  const parseCSV = (content: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const nextChar = content[i + 1];

      if (insideQuotes) {
        if (char === '"' && nextChar === '"') {
          currentCell += '"';
          i++; // Skip next quote
        } else if (char === '"') {
          insideQuotes = false;
        } else {
          currentCell += char;
        }
      } else {
        if (char === '"') {
          insideQuotes = true;
        } else if (char === ',') {
          currentRow.push(currentCell.trim());
          currentCell = '';
        } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
          currentRow.push(currentCell.trim());
          if (currentRow.some(cell => cell !== '')) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentCell = '';
          if (char === '\r') i++; // Skip \n in \r\n
        } else {
          currentCell += char;
        }
      }
    }

    // Add last row if exists
    if (currentCell !== '' || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell !== '')) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  // Handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const rows = parseCSV(content);

        if (rows.length < 2) {
          setImportError('CSV file must have a header row and at least one data row.');
          return;
        }

        const headers = rows[0].map(h => h.toLowerCase().trim());
        const requiredHeaders = ['type', 'input'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
          setImportError(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }

        const typeIndex = headers.indexOf('type');
        const inputIndex = headers.indexOf('input');
        const expectedIntentIndex = headers.indexOf('expectedintent');
        const categoryIndex = headers.indexOf('category');
        const contextIndex = headers.indexOf('context');
        const expectedOutputIndex = headers.indexOf('expectedoutput');

        const newTestCases: TestCase[] = [];
        const baseId = Math.max(...testCases.map(tc => tc.id), 0) + 1;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < 2 || !row[inputIndex]?.trim()) continue;

          const type = row[typeIndex]?.trim() || 'expense';
          const input = row[inputIndex]?.trim();

          let expectedOutput = null;
          if (expectedOutputIndex >= 0 && row[expectedOutputIndex]?.trim()) {
            try {
              expectedOutput = JSON.parse(row[expectedOutputIndex]);
            } catch {
              // Keep as null if JSON is invalid
            }
          }

          newTestCases.push({
            id: baseId + i - 1,
            type: type as any,
            input: input,
            expectedIntent: expectedIntentIndex >= 0 ? (row[expectedIntentIndex]?.trim() || type) : type,
            expectedOutput: expectedOutput,
            category: categoryIndex >= 0 ? (row[categoryIndex]?.trim() || 'imported') : 'imported',
            context: contextIndex >= 0 ? row[contextIndex]?.trim() : undefined,
          });
        }

        if (newTestCases.length === 0) {
          setImportError('No valid test cases found in the file.');
          return;
        }

        setTestCases([...testCases, ...newTestCases]);
        setImportSuccess(`Successfully imported ${newTestCases.length} test cases!`);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        setImportError(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    reader.onerror = () => {
      setImportError('Error reading file.');
    };

    reader.readAsText(file);
  };

  // Export test cases
  const exportTestCases = (format: 'csv' | 'xlsx') => {
    const dataToExport = filteredTestCases.map(tc => ({
      id: tc.id,
      type: tc.type,
      input: tc.input,
      expectedIntent: tc.expectedIntent,
      category: tc.category,
      context: tc.context || '',
      expectedOutput: tc.expectedOutput ? JSON.stringify(tc.expectedOutput) : '',
    }));

    const filename = `test_cases_${filteredType === 'all' ? 'all' : filteredType}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const headers = ['id', 'type', 'input', 'expectedIntent', 'category', 'context', 'expectedOutput'];
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(row =>
          headers.map(header => {
            const value = String(row[header as keyof typeof row] || '');
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // XLSX export
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');

      // Auto-size columns
      const colWidths = [
        { wch: 6 },  // id
        { wch: 14 }, // type
        { wch: 50 }, // input
        { wch: 14 }, // expectedIntent
        { wch: 15 }, // category
        { wch: 25 }, // context
        { wch: 50 }, // expectedOutput
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    setShowExportDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product</h1>
        <p className="text-gray-600">System prompts and test case management for VAANI</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="proposed-prompts">Proposed</TabsTrigger>
          <TabsTrigger value="testcases">Test Cases</TabsTrigger>
          <TabsTrigger value="api-testing">API Testing</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-6">
          {/* Strategy Header */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Target className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">VAANI Strategy</h2>
                  <p className="text-gray-600 mt-1">Voice-First Business Operating System for Indian MSMEs</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-indigo-100 text-indigo-800">63M MSMEs Target</Badge>
                    <Badge className="bg-purple-100 text-purple-800">10 Languages</Badge>
                    <Badge className="bg-green-100 text-green-800">3x Faster Entry</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Rocket className="w-5 h-5" />
                  Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-lg font-medium text-gray-900 italic">
                  "Enable every Indian business owner to run their business in their own voice, in their own language, without barriers."
                </p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Language Barrier: 10+ Indian languages support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Literacy Barrier: Voice-first interface</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Time Barrier: 3x faster data entry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Complexity Barrier: Natural conversation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Eye className="w-5 h-5" />
                  Vision (3-Year)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-lg font-medium text-gray-900 italic">
                  "VAANI becomes the primary interface for 10 million Indian MSMEs to operate their businesses."
                </p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Voice-First Business OS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>12+ Languages (speaking & listening)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Proactive Intelligence & Insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Offline Capabilities</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Market Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-3xl font-bold text-green-700">63M</p>
                  <p className="text-sm text-green-600 font-medium">Total MSMEs in India</p>
                  <p className="text-xs text-gray-500 mt-1">TAM - Total Addressable Market</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-3xl font-bold text-blue-700">15M</p>
                  <p className="text-sm text-blue-600 font-medium">Digitally Active MSMEs</p>
                  <p className="text-xs text-gray-500 mt-1">SAM - Serviceable Market</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-3xl font-bold text-purple-700">3M</p>
                  <p className="text-sm text-purple-600 font-medium">Target in 18 Months</p>
                  <p className="text-xs text-gray-500 mt-1">SOM - Obtainable Market</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Pillars */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Strategic Pillars
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Accessibility First</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Voice as primary input</li>
                    <li>• All major Indian languages</li>
                    <li>• Works in noisy environments</li>
                    <li>• Minimal data usage</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Speed & Efficiency</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 3x faster than typing</li>
                    <li>• Intelligent defaults</li>
                    <li>• Batch operations</li>
                    <li>• Voice shortcuts</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Accuracy & Trust</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• 95% accuracy target</li>
                    <li>• User reviews before save</li>
                    <li>• Transparent AI decisions</li>
                    <li>• Easy error correction</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">Privacy & Security</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Secure voice processing</li>
                    <li>• Optional local processing</li>
                    <li>• Clear user controls</li>
                    <li>• Regulatory compliance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                Technology Foundation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">AI Architecture (5 Agents)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <Badge>1</Badge>
                      <span className="text-sm">Intent Detector - Routes to transaction type</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <Badge>2</Badge>
                      <span className="text-sm">Transaction Extractor - Extracts structured data</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <Badge>3</Badge>
                      <span className="text-sm">Question Generator - Asks clarifying questions</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <Badge>4</Badge>
                      <span className="text-sm">Category Matcher - 3-tier categorization</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <Badge>5</Badge>
                      <span className="text-sm">Response Builder - Structures output</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Model Strategy</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Intent Detection</span>
                      <Badge variant="secondary">Gemini 2.0 Flash</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Simple Extraction</span>
                      <Badge variant="secondary">Gemini 2.0 Flash</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Complex Extraction</span>
                      <Badge variant="secondary">Gemini 1.5 Pro</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Category Matching</span>
                      <Badge variant="secondary">Gemini 1.5 Flash</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Find Mode Queries</span>
                      <Badge variant="secondary">Gemini 1.5 Pro</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Success Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-700">30%</p>
                  <p className="text-xs text-blue-600">Voice Adoption (Y1)</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700">95%</p>
                  <p className="text-xs text-green-600">Transaction Accuracy</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-700">&lt;10s</p>
                  <p className="text-xs text-purple-600">Time to Transaction</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-700">60%</p>
                  <p className="text-xs text-yellow-600">30-Day Retention</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Advantage */}
          <Card className="border-2 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Sparkles className="w-5 h-5" />
                VAANI's Unique Position
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-700 mb-4 font-medium">
                The only voice-first business software designed specifically for Indian MSMEs
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Voice Transaction Entry</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">10 Indian Languages</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Hinglish Support</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Hands-Free Operation</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Context-Aware AI</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">1.3M Transaction Data</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prompt List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-500" />
                    Prompts by Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Common</div>
                    <button
                      onClick={() => setSelectedPrompt('intentClassification')}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${selectedPrompt === 'intentClassification' ? 'bg-purple-100 text-purple-800' : 'hover:bg-gray-100'}`}
                    >
                      <div className="font-medium text-sm">Intent Classification</div>
                      <div className="text-xs text-gray-500">Common prompt template</div>
                    </button>

                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase mt-3">Expense</div>
                    {['expenseRules', 'expenseExtraction', 'expenseMissingFields'].map((key) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPrompt(key)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedPrompt === key ? 'bg-purple-100 text-purple-800' : 'hover:bg-gray-100'}`}
                      >
                        <div className="font-medium text-sm">{systemPrompts[key as keyof typeof systemPrompts].name}</div>
                      </button>
                    ))}

                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase mt-3">Sale Invoice</div>
                    <button
                      onClick={() => setSelectedPrompt('saleInvoiceExtraction')}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${selectedPrompt === 'saleInvoiceExtraction' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                    >
                      <div className="font-medium text-sm">Sale Invoice Extraction</div>
                    </button>

                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase mt-3">Payment In</div>
                    {['paymentInRules', 'paymentInExtraction'].map((key) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPrompt(key)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedPrompt === key ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
                      >
                        <div className="font-medium text-sm">{systemPrompts[key as keyof typeof systemPrompts].name}</div>
                      </button>
                    ))}

                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase mt-3">Payment Out</div>
                    {['paymentOutRules', 'paymentOutExtraction'].map((key) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPrompt(key)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedPrompt === key ? 'bg-orange-100 text-orange-800' : 'hover:bg-gray-100'}`}
                      >
                        <div className="font-medium text-sm">{systemPrompts[key as keyof typeof systemPrompts].name}</div>
                      </button>
                    ))}

                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase mt-3">Other</div>
                    <button
                      onClick={() => setSelectedPrompt('otherIntent')}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${selectedPrompt === 'otherIntent' ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100'}`}
                    >
                      <div className="font-medium text-sm">Other Intent Handler</div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prompt Detail */}
            <div className="lg:col-span-2">
              {selectedPrompt && systemPrompts[selectedPrompt as keyof typeof systemPrompts] && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-500" />
                          {systemPrompts[selectedPrompt as keyof typeof systemPrompts].name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {systemPrompts[selectedPrompt as keyof typeof systemPrompts].description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(
                          systemPrompts[selectedPrompt as keyof typeof systemPrompts].prompt,
                          selectedPrompt
                        )}
                      >
                        {copiedPrompt === selectedPrompt ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <HighlightedPrompt text={systemPrompts[selectedPrompt as keyof typeof systemPrompts].prompt} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Proposed System Prompts Tab */}
        <TabsContent value="proposed-prompts" className="space-y-6">
          {/* Header Card */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-amber-600" />
                Proposed Optimized System Prompts
              </CardTitle>
              <p className="text-gray-600">
                Optimized prompts for each transaction type with detailed explanations and AI critiques for improvement
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600">4</div>
                  <div className="text-gray-500">Transaction Types</div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">v2.0</div>
                  <div className="text-gray-500">Version</div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">Optimized</div>
                  <div className="text-gray-500">Status</div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">Hindi/Hinglish</div>
                  <div className="text-gray-500">Language Support</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Transaction Type Selector */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Transaction Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {Object.entries(proposedPrompts).map(([key, prompt]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedProposedPrompt(key as keyof typeof proposedPrompts)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedProposedPrompt === key
                            ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                            : 'hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{prompt.name}</div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              prompt.status === 'proposed' ? 'border-amber-500 text-amber-600' : 'border-green-500 text-green-600'
                            }`}
                          >
                            {prompt.version}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {prompt.sections.length} sections • {prompt.critiques.length} critiques
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prompt Detail and Explanation */}
            <div className="lg:col-span-3 space-y-6">
              {/* Optimized Prompt */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-500" />
                        {proposedPrompts[selectedProposedPrompt].name} - Optimized Prompt
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Version {proposedPrompts[selectedProposedPrompt].version} • Status: {proposedPrompts[selectedProposedPrompt].status}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(proposedPrompts[selectedProposedPrompt].prompt, `proposed-${selectedProposedPrompt}`)}
                    >
                      {copiedPrompt === `proposed-${selectedProposedPrompt}` ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <HighlightedPrompt text={proposedPrompts[selectedProposedPrompt].prompt} />
                </CardContent>
              </Card>

              {/* Prompt Sections Explanation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      Prompt Structure Explained
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllSections(!showAllSections)}
                    >
                      {showAllSections ? 'Collapse All' : 'Expand All'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Understanding each part of the system prompt and why it matters
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {proposedPrompts[selectedProposedPrompt].sections.map((section, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-lg overflow-hidden ${
                          section.importance === 'critical' ? 'border-red-200' :
                          section.importance === 'high' ? 'border-orange-200' : 'border-gray-200'
                        }`}
                      >
                        <div className={`p-3 flex items-center justify-between ${
                          section.importance === 'critical' ? 'bg-red-50' :
                          section.importance === 'high' ? 'bg-orange-50' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${
                                section.importance === 'critical' ? 'bg-red-100 text-red-700' :
                                section.importance === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {section.importance}
                            </Badge>
                            <span className="font-medium">{section.title}</span>
                          </div>
                          <span className="text-xs text-gray-500">Section {idx + 1}</span>
                        </div>
                        {showAllSections && (
                          <div className="p-4 space-y-3">
                            <div>
                              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Content</h5>
                              <code className="block text-sm bg-gray-100 p-2 rounded text-gray-700">
                                {section.content}
                              </code>
                            </div>
                            <div>
                              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Why This Matters</h5>
                              <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                                {section.explanation}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Critiques */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-500" />
                    AI Critiques & Improvement Suggestions
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Areas where this prompt could be improved for better accuracy
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {proposedPrompts[selectedProposedPrompt].critiques.map((critique, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 ${
                          critique.priority === 'high' ? 'bg-red-50 border-red-400' :
                          critique.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className={`w-4 h-4 ${
                                critique.priority === 'high' ? 'text-red-500' :
                                critique.priority === 'medium' ? 'text-yellow-600' : 'text-blue-500'
                              }`} />
                              <span className="font-medium text-gray-800">{critique.issue}</span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  critique.priority === 'high' ? 'border-red-400 text-red-600' :
                                  critique.priority === 'medium' ? 'border-yellow-500 text-yellow-700' : 'border-blue-400 text-blue-600'
                                }`}
                              >
                                {critique.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">{critique.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Optimization Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    Your Optimization Suggestions
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Add your own ideas to improve this prompt based on real-world usage patterns
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your optimization suggestions here... For example:
- Add handling for 'cancel last entry' commands
- Include more Hindi number words (gyarah, barah, etc.)
- Add region-specific terms (Tamil Nadu, Gujarat, etc.)"
                    value={userOptimizationInput}
                    onChange={(e) => setUserOptimizationInput(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Your suggestions will be reviewed and incorporated into future prompt versions
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserOptimizationInput('')}
                        disabled={!userOptimizationInput}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!userOptimizationInput}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Suggestion
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Test Cases Tab */}
        <TabsContent value="testcases" className="space-y-6">
          {/* Stats Bar */}
          {Object.keys(testResults).length > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-green-700">{passedTests} Passed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="font-semibold text-red-700">{failedTests} Failed</span>
                    </div>
                    {errorTests > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <span className="font-semibold text-orange-700">{errorTests} Errors</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-blue-700">Avg: {avgLatency}ms</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTimingAnalysis(!showTimingAnalysis)}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {showTimingAnalysis ? 'Hide' : 'View'} Timing Analysis
                    </Button>
                    {passedTests + failedTests > 0 && (
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {Math.round((passedTests / (passedTests + failedTests)) * 100)}% Pass Rate
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timing Analysis Panel */}
          {showTimingAnalysis && timingStats.length > 0 && (
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Clock className="w-5 h-5" />
                  Pipeline Timing Analysis
                  <Badge variant="outline" className="ml-2 text-purple-600">
                    {Object.values(testResults).filter(r => r.status !== 'running').length} samples
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {timingStats.filter(s => ['total', 'server_processing', 'api_request', 'response_parse'].includes(s.step)).map(stat => {
                    const stepInfo = PIPELINE_STEPS.find(p => p.id === stat.step);
                    return (
                      <div key={stat.step} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">{stepInfo?.name || stat.step}</p>
                        <p className="text-2xl font-bold text-purple-700">{stat.avg}ms</p>
                        <p className="text-xs text-gray-400">avg ({stat.count} samples)</p>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-2 font-medium">Pipeline Step</th>
                        <th className="text-right p-2 font-medium">Min</th>
                        <th className="text-right p-2 font-medium">Avg</th>
                        <th className="text-right p-2 font-medium">Median</th>
                        <th className="text-right p-2 font-medium">P95</th>
                        <th className="text-right p-2 font-medium">Max</th>
                        <th className="text-right p-2 font-medium">Samples</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timingStats.map((stat, idx) => {
                        const stepInfo = PIPELINE_STEPS.find(p => p.id === stat.step);
                        const isTotal = stat.step === 'total';
                        return (
                          <tr
                            key={stat.step}
                            className={`border-b ${isTotal ? 'bg-purple-50 font-semibold' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  stat.step === 'total' ? 'bg-purple-500' :
                                  stat.step === 'server_processing' ? 'bg-blue-500' :
                                  stat.step === 'api_request' ? 'bg-green-500' :
                                  stat.step === 'response_parse' ? 'bg-yellow-500' :
                                  'bg-gray-400'
                                }`} />
                                <span>{stepInfo?.name || stat.step}</span>
                              </div>
                              {stepInfo?.description && (
                                <p className="text-xs text-gray-400 ml-4">{stepInfo.description}</p>
                              )}
                            </td>
                            <td className="text-right p-2 text-green-600">{stat.min}ms</td>
                            <td className="text-right p-2 font-medium">{stat.avg}ms</td>
                            <td className="text-right p-2">{stat.median}ms</td>
                            <td className="text-right p-2 text-orange-600">{stat.p95}ms</td>
                            <td className="text-right p-2 text-red-600">{stat.max}ms</td>
                            <td className="text-right p-2 text-gray-500">{stat.count}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Visual Bar Chart */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Average Time Distribution</h4>
                  <div className="space-y-2">
                    {timingStats.filter(s => s.step !== 'total').map(stat => {
                      const stepInfo = PIPELINE_STEPS.find(p => p.id === stat.step);
                      const maxAvg = Math.max(...timingStats.filter(s => s.step !== 'total').map(s => s.avg));
                      const widthPercent = (stat.avg / maxAvg) * 100;
                      return (
                        <div key={stat.step} className="flex items-center gap-3">
                          <div className="w-32 text-xs text-gray-600 truncate">
                            {stepInfo?.name || stat.step}
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                stat.step === 'server_processing' ? 'bg-blue-500' :
                                stat.step === 'api_request' ? 'bg-green-500' :
                                stat.step === 'response_parse' ? 'bg-yellow-500' :
                                stat.step === 'intent_classification' ? 'bg-purple-500' :
                                stat.step === 'data_extraction' ? 'bg-pink-500' :
                                'bg-gray-400'
                              }`}
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                          <div className="w-16 text-xs text-right font-medium">
                            {stat.avg}ms
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Note about server timings */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-700">
                    <Info className="w-4 h-4 inline mr-1" />
                    <strong>Note:</strong> Client-side timing includes API Request, Server Processing (total server time), and Response Parse.
                    If the server returns detailed timing breakdown (intent_classification, data_extraction, validation, storage),
                    those will be shown separately.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Controls */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search test cases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Type Filter */}
                <Select value={filteredType} onValueChange={setFilteredType}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="sale_invoice">Sale Invoice</SelectItem>
                    <SelectItem value="payment_in">Payment In</SelectItem>
                    <SelectItem value="payment_out">Payment Out</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filteredCategory} onValueChange={setFilteredCategory}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map(cat => (
                      <SelectItem key={cat} value={cat} className={cat === 'custom' ? 'font-semibold text-blue-600' : ''}>
                        {cat === 'custom' ? '+ Custom (Manual)' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Model Selection */}
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Actions */}
                <Button onClick={runTests} disabled={runningTests} className="bg-green-600 hover:bg-green-700">
                  {runningTests ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Run All ({filteredTestCases.length})
                </Button>

                <Button
                  onClick={() => runRandomTests(10)}
                  disabled={runningTests || filteredTestCases.length === 0}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {runningTests ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Run 10 Random
                </Button>

                <Button variant="outline" onClick={generateTestCases}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add New Test Case - Synced with Type Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Add New Test Case
                {filteredType !== 'all' && (
                  <Badge variant="secondary">{filteredType}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Input Text</label>
                  <Input
                    placeholder={`e.g., ${filteredType === 'sale_invoice' ? 'Sold 5 kg rice at 40 per kg' : filteredType === 'payment_in' ? 'Received 5000 from Sharma ji' : 'Add petrol for 500 rupees'}`}
                    value={newTestCase.input}
                    onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                  />
                </div>
                <div className="w-[160px]">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                  <Select
                    value={newTestCase.type}
                    onValueChange={(v) => setNewTestCase({ ...newTestCase, type: v, expectedIntent: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="sale_invoice">Sale Invoice</SelectItem>
                      <SelectItem value="payment_in">Payment In</SelectItem>
                      <SelectItem value="payment_out">Payment Out</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[140px]">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                  <Input
                    placeholder="e.g., basic"
                    value={newTestCase.category}
                    onChange={(e) => setNewTestCase({ ...newTestCase, category: e.target.value })}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Context (optional)</label>
                  <Input
                    placeholder="e.g., After 'Amount?'"
                    value={newTestCase.context}
                    onChange={(e) => setNewTestCase({ ...newTestCase, context: e.target.value })}
                  />
                </div>
                <Button onClick={addTestCase}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audio Test - E2E Analysis */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-purple-500" />
                Audio Test (End-to-End Analysis)
                <Badge variant="outline" className="ml-2 text-purple-600 border-purple-300">Voice → Invoice</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Audio Upload Section */}
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[250px]">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Upload Audio File</label>
                  <div className="flex gap-2">
                    <Input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAudioFile(file);
                          setAudioTestResult({
                            status: 'idle',
                            timings: { upload: 0, transcription: 0, intentClassification: 0, dataExtraction: 0, total: 0 }
                          });
                        }
                      }}
                      className="flex-1"
                    />
                    {audioFile && (
                      <Button variant="ghost" size="icon" onClick={resetAudioTest}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {audioFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      <Volume2 className="w-3 h-3 inline mr-1" />
                      {audioFile.name} ({(audioFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
                <div className="w-[160px]">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Transaction Type</label>
                  <Select value={audioTestType} onValueChange={setAudioTestType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="sale_invoice">Sale Invoice</SelectItem>
                      <SelectItem value="payment_in">Payment In</SelectItem>
                      <SelectItem value="payment_out">Payment Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={runAudioTest}
                  disabled={!audioFile || audioTestResult.status === 'uploading' || audioTestResult.status === 'transcribing' || audioTestResult.status === 'processing'}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {audioTestResult.status === 'uploading' || audioTestResult.status === 'transcribing' || audioTestResult.status === 'processing' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mic className="w-4 h-4 mr-2" />
                  )}
                  {audioTestResult.status === 'uploading' ? 'Uploading...' :
                   audioTestResult.status === 'transcribing' ? 'Transcribing...' :
                   audioTestResult.status === 'processing' ? 'Processing...' :
                   'Run Audio Test'}
                </Button>
              </div>

              {/* Audio Test Results */}
              {audioTestResult.status !== 'idle' && (
                <div className="mt-4 space-y-4">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    {audioTestResult.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {audioTestResult.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                    {(audioTestResult.status === 'uploading' || audioTestResult.status === 'transcribing' || audioTestResult.status === 'processing') && (
                      <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                    )}
                    <span className={`font-medium ${
                      audioTestResult.status === 'completed' ? 'text-green-700' :
                      audioTestResult.status === 'error' ? 'text-red-700' :
                      'text-purple-700'
                    }`}>
                      {audioTestResult.status === 'completed' ? 'Test Complete' :
                       audioTestResult.status === 'error' ? 'Test Failed' :
                       audioTestResult.status === 'uploading' ? 'Step 1/3: Uploading audio...' :
                       audioTestResult.status === 'transcribing' ? 'Step 2/3: Transcribing...' :
                       'Step 3/3: Extracting data...'}
                    </span>
                  </div>

                  {/* Error Message */}
                  {audioTestResult.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                      {audioTestResult.error}
                    </div>
                  )}

                  {/* Results Grid */}
                  {audioTestResult.status === 'completed' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Transcription */}
                      <div className="bg-white rounded-lg p-4 border">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Mic className="w-4 h-4 text-blue-500" />
                          Transcription
                        </h4>
                        <p className="text-gray-900 bg-gray-50 p-2 rounded text-sm">
                          "{audioTestResult.transcription || 'N/A'}"
                        </p>
                        {audioTestResult.translation && audioTestResult.translation !== audioTestResult.transcription && (
                          <p className="text-gray-600 text-xs mt-2">
                            Translation: "{audioTestResult.translation}"
                          </p>
                        )}
                      </div>

                      {/* Extracted Data */}
                      <div className="bg-white rounded-lg p-4 border">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-500" />
                          Extracted Data
                          {audioTestResult.intent && (
                            <Badge variant="secondary" className="ml-2">{audioTestResult.intent}</Badge>
                          )}
                        </h4>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-[150px]">
                          {JSON.stringify(audioTestResult.extractedData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* E2E Timing Analysis */}
                  {(audioTestResult.status === 'completed' || audioTestResult.timings.total > 0) && (
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        End-to-End Timing Analysis
                      </h4>
                      <div className="space-y-2">
                        {/* Upload + Transcription */}
                        <div className="flex items-center gap-3">
                          <div className="w-40 text-sm text-gray-600">Upload + STT</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (audioTestResult.timings.upload / audioTestResult.timings.total) * 100)}%` }}
                            />
                          </div>
                          <div className="w-20 text-right text-sm font-mono text-gray-700">
                            {audioTestResult.timings.upload}ms
                          </div>
                        </div>

                        {/* Intent Classification */}
                        <div className="flex items-center gap-3">
                          <div className="w-40 text-sm text-gray-600">Intent Classification</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (audioTestResult.timings.intentClassification / audioTestResult.timings.total) * 100)}%` }}
                            />
                          </div>
                          <div className="w-20 text-right text-sm font-mono text-gray-700">
                            {audioTestResult.timings.intentClassification}ms
                          </div>
                        </div>

                        {/* Data Extraction */}
                        <div className="flex items-center gap-3">
                          <div className="w-40 text-sm text-gray-600">Data Extraction</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (audioTestResult.timings.dataExtraction / audioTestResult.timings.total) * 100)}%` }}
                            />
                          </div>
                          <div className="w-20 text-right text-sm font-mono text-gray-700">
                            {audioTestResult.timings.dataExtraction}ms
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex items-center gap-3 pt-2 border-t mt-2">
                          <div className="w-40 text-sm font-semibold text-gray-800">Total E2E</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full" style={{ width: '100%' }} />
                          </div>
                          <div className="w-20 text-right text-sm font-mono font-bold text-gray-900">
                            {audioTestResult.timings.total}ms
                          </div>
                        </div>
                      </div>

                      {/* Timing Summary */}
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>STT: {((audioTestResult.timings.upload / audioTestResult.timings.total) * 100).toFixed(1)}%</span>
                        <span>Intent: {((audioTestResult.timings.intentClassification / audioTestResult.timings.total) * 100).toFixed(1)}%</span>
                        <span>Extraction: {((audioTestResult.timings.dataExtraction / audioTestResult.timings.total) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Cases List with Expandable Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Test Cases ({filteredTestCases.length} of {testCases.length})
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowImportDialog(true);
                    setImportError(null);
                    setImportSuccess(null);
                  }}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pagination Info */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} - {Math.min(endIndex, filteredTestCases.length)} of {filteredTestCases.length} test cases
                  {filteredType !== 'all' || filteredCategory !== 'all' || searchQuery ? ' (filtered)' : ''}
                </div>
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages || 1}
                </div>
              </div>

              <div className="space-y-3">
                {paginatedTestCases.map((tc) => (
                  <div
                    key={tc.id}
                    className={`border rounded-lg transition-shadow ${
                      testResults[tc.id]?.status === 'passed' ? 'bg-green-50 border-green-200' :
                      testResults[tc.id]?.status === 'failed' ? 'bg-red-50 border-red-200' :
                      testResults[tc.id]?.status === 'error' ? 'bg-orange-50 border-orange-200' :
                      testResults[tc.id]?.status === 'running' ? 'bg-blue-50 border-blue-200' :
                      'bg-white'
                    }`}
                  >
                    {/* Main Row */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={
                              tc.type === 'expense' ? 'border-purple-500 text-purple-700' :
                              tc.type === 'sale_invoice' ? 'border-blue-500 text-blue-700' :
                              tc.type === 'payment_in' ? 'border-green-500 text-green-700' :
                              tc.type === 'payment_out' ? 'border-orange-500 text-orange-700' :
                              'border-gray-500 text-gray-700'
                            }>
                              {tc.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">{tc.category}</Badge>
                            <span className="text-xs text-gray-400">#{tc.id}</span>
                          </div>
                          <p className="text-gray-900 font-medium">"{tc.input}"</p>
                          {tc.context && (
                            <p className="text-xs text-gray-500 mt-1">Context: {tc.context}</p>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-2">
                          {testResults[tc.id]?.status === 'running' && (
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                          )}
                          {testResults[tc.id]?.status === 'passed' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {testResults[tc.id]?.status === 'failed' && (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          {testResults[tc.id]?.status === 'error' && (
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                          )}
                          {testResults[tc.id]?.latency > 0 && (
                            <span className="text-xs text-gray-500">{testResults[tc.id].latency}ms</span>
                          )}

                          {/* Run single test */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => runSingleTest(tc)}
                            disabled={runningTests}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Play className="w-4 h-4" />
                          </Button>

                          {/* Expand/Collapse Output */}
                          {testResults[tc.id] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleResultExpand(tc.id)}
                              className="text-gray-500"
                            >
                              {expandedResults[tc.id] ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTestCase(tc.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Output Section */}
                    {testResults[tc.id] && expandedResults[tc.id] && (
                      <div className="border-t px-4 py-3 bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Expected Output */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Expected Output</h4>
                            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-[200px]">
                              {tc.expectedOutput ? JSON.stringify(tc.expectedOutput, null, 2) : 'N/A'}
                            </pre>
                          </div>

                          {/* Actual Output */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Actual Output
                              <Badge variant="outline" className="ml-2 text-xs">
                                {selectedModel}
                              </Badge>
                            </h4>
                            <pre className={`text-xs p-3 rounded border overflow-x-auto max-h-[200px] ${
                              testResults[tc.id].status === 'passed' ? 'bg-green-50' :
                              testResults[tc.id].status === 'failed' ? 'bg-red-50' :
                              testResults[tc.id].status === 'error' ? 'bg-orange-50' :
                              'bg-white'
                            }`}>
                              {JSON.stringify(testResults[tc.id].output, null, 2)}
                            </pre>
                          </div>
                        </div>

                        {/* Raw Response (collapsible) */}
                        {testResults[tc.id].rawResponse && (
                          <details className="mt-3">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                              View Raw API Response
                            </summary>
                            <pre className="text-xs bg-gray-800 text-gray-200 p-3 rounded mt-2 overflow-x-auto max-h-[150px]">
                              {testResults[tc.id].rawResponse}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first, last, current, and pages around current
                        return page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 2;
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className={`w-8 h-8 p-0 ${currentPage === page ? 'bg-blue-600' : ''}`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {paginatedTestCases.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No test cases found matching your filters.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Testing Tab */}
        <TabsContent value="api-testing" className="space-y-6">
          {/* API Overview */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Server className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Production API Testing</h3>
                    <p className="text-sm text-gray-600">Test and explore available APIs from the staging environment</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  {productionAPIs.length} APIs Available
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* API List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-purple-500" />
                    Available APIs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {/* Extraction APIs */}
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Extraction</div>
                    {productionAPIs.filter(api => api.category === 'extraction').map((api) => (
                      <button
                        key={api.id}
                        onClick={() => setSelectedAPI(api.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedAPI === api.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{api.name}</span>
                          <Badge variant="outline" className="text-xs">{api.method}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">{api.endpoint}</div>
                      </button>
                    ))}

                    {/* Verification APIs */}
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase mt-3">Verification</div>
                    {productionAPIs.filter(api => api.category === 'verification').map((api) => (
                      <button
                        key={api.id}
                        onClick={() => setSelectedAPI(api.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedAPI === api.id ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{api.name}</span>
                          <Badge variant="outline" className="text-xs">{api.method}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">{api.endpoint}</div>
                      </button>
                    ))}

                    {/* Speech APIs */}
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase mt-3">Speech</div>
                    {productionAPIs.filter(api => api.category === 'speech').map((api) => (
                      <button
                        key={api.id}
                        onClick={() => setSelectedAPI(api.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedAPI === api.id ? 'bg-orange-100 text-orange-800' : 'hover:bg-gray-100'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{api.name}</span>
                          <Badge variant="outline" className="text-xs">{api.method}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">{api.endpoint}</div>
                      </button>
                    ))}

                    {/* Auth APIs */}
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase mt-3">Authentication</div>
                    {productionAPIs.filter(api => api.category === 'auth').map((api) => (
                      <button
                        key={api.id}
                        onClick={() => setSelectedAPI(api.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedAPI === api.id ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{api.name}</span>
                          <Badge variant="outline" className="text-xs">{api.method}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">{api.endpoint}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* API Tester */}
            <div className="lg:col-span-2 space-y-4">
              {currentAPI && (
                <>
                  {/* API Info */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            {currentAPI.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-blue-100 text-blue-800">{currentAPI.method}</Badge>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              https://analytics-staging.vyaparapp.in{currentAPI.endpoint}
                            </code>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadExampleValues}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Load Example
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{currentAPI.description}</p>
                    </CardHeader>
                  </Card>

                  {/* Input Fields */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Request Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(currentAPI.inputSchema).map(([key, schema]: [string, any]) => (
                        <div key={key} className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            {key}
                            {schema.required && <span className="text-red-500">*</span>}
                            <span className="text-xs text-gray-400">({schema.type})</span>
                          </label>
                          <p className="text-xs text-gray-500">{schema.description}</p>
                          {schema.type === 'file' ? (
                            <Input type="file" disabled className="bg-gray-100" />
                          ) : key === 'sys_prompt' || key === 'text' || key === 'responses' || key === 'correctedOutput' ? (
                            <Textarea
                              value={apiInputs[key] || ''}
                              onChange={(e) => setApiInputs({ ...apiInputs, [key]: e.target.value })}
                              placeholder={schema.example}
                              rows={key === 'sys_prompt' ? 4 : 2}
                              className="font-mono text-sm"
                            />
                          ) : (
                            <Input
                              value={apiInputs[key] || ''}
                              onChange={(e) => setApiInputs({ ...apiInputs, [key]: e.target.value })}
                              placeholder={schema.example}
                              type={key === 'password' ? 'password' : 'text'}
                              className="font-mono"
                            />
                          )}
                        </div>
                      ))}

                      <Button
                        onClick={executeAPICall}
                        disabled={apiLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {apiLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Execute API Call
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Response */}
                  {(apiResponse || apiError) && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            Response
                            {apiResponse && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {apiError && <XCircle className="w-5 h-5 text-red-500" />}
                          </CardTitle>
                          {apiLatency > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {apiLatency}ms
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {apiError ? (
                          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                            <p className="font-medium">Error</p>
                            <p className="text-sm mt-1">{apiError}</p>
                          </div>
                        ) : (
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-[400px] overflow-y-auto">
                            {JSON.stringify(apiResponse, null, 2)}
                          </pre>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Output Schema */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Expected Response Schema</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(currentAPI.outputSchema, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          {/* Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">VAANI Metrics Dashboard</h2>
                  <p className="text-gray-600 mt-1">Performance analytics from Mixpanel (Nov 22 - Dec 22, 2024)</p>
                  <div className="flex gap-2 mt-3">
                    <Badge className="bg-blue-100 text-blue-800">30-Day Data</Badge>
                    <Badge className="bg-green-100 text-green-800">1,092 Users</Badge>
                    <Badge className="bg-purple-100 text-purple-800">1,487 Expenses</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics at a Glance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold text-red-600">9.42%</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-xs text-red-500 mt-1">Below benchmark</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Unique Users</p>
                    <p className="text-2xl font-bold text-blue-600">1,092</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-xs text-blue-500 mt-1">30-day period</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">D1 Retention</p>
                    <p className="text-2xl font-bold text-yellow-600">~15%</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-yellow-400" />
                </div>
                <p className="text-xs text-yellow-600 mt-1">Benchmark: 40%</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">5★ Rating</p>
                    <p className="text-2xl font-bold text-green-600">62.9%</p>
                  </div>
                  <Star className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-xs text-green-500 mt-1">22 of 35 ratings</p>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Conversion Funnels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 4-Step Funnel */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Central Funnel (4-Step)</h4>
                    <Badge className="bg-red-100 text-red-800">9.42% Overall</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-sm text-gray-600">Start</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2" style={{width: '100%'}}>
                          <span className="text-xs text-white font-medium">11,000</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 w-14">100%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-sm text-gray-600">Recording</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2" style={{width: '49%'}}>
                          <span className="text-xs text-white font-medium">5,462</span>
                        </div>
                      </div>
                      <span className="text-xs text-red-500 w-14">-51%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-sm text-gray-600">Processed</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2" style={{width: '42%'}}>
                          <span className="text-xs text-white font-medium">4,673</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 w-14">-14%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-sm text-gray-600">Saved</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2" style={{width: '9.4%'}}>
                          <span className="text-xs text-white font-medium">1,037</span>
                        </div>
                      </div>
                      <span className="text-xs text-red-500 w-14">-78%</span>
                    </div>
                  </div>
                </div>

                {/* Drop-off Analysis */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Drop-off Points</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-800">Start → Recording Done</span>
                        <Badge className="bg-red-600">51% DROP</Badge>
                      </div>
                      <p className="text-xs text-red-600 mt-1">Users open VAANI but don't complete recording</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Recording → Processed</span>
                        <Badge className="bg-green-600">14% drop</Badge>
                      </div>
                      <p className="text-xs text-green-600 mt-1">Good retention at this step</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-800">Processed → Saved</span>
                        <Badge className="bg-red-600">78% DROP</Badge>
                      </div>
                      <p className="text-xs text-red-600 mt-1">Voice is processed but expense not saved</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Elaborated Funnel Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-500" />
                Detailed Funnel Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Audio Submission Funnel */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-500" />
                    <h4 className="font-medium text-gray-900">Audio Submission</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800">VAANI Opened</span>
                        <span className="font-bold text-blue-600">11,000</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-500 h-full rounded-full" style={{width: '100%'}}></div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-800">Audio Submitted</span>
                        <span className="font-bold text-green-600">5,462</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-full rounded-full" style={{width: '49.7%'}}></div>
                      </div>
                      <p className="text-xs text-green-600 mt-1">49.7% submission rate</p>
                    </div>
                    <div className="flex justify-center">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-800">Successfully Transcribed</span>
                        <span className="font-bold text-purple-600">5,047</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                        <div className="bg-purple-500 h-full rounded-full" style={{width: '92.4%'}}></div>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">92.4% STT success</p>
                    </div>
                  </div>
                  <div className="p-2 bg-red-50 rounded border border-red-200">
                    <p className="text-xs text-red-700">
                      <strong>Issue:</strong> 50% drop at audio submission - users don't complete recording
                    </p>
                  </div>
                </div>

                {/* Expense Quality Funnel */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-medium text-gray-900">Expense Meaningfulness</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800">Expenses Extracted</span>
                        <span className="font-bold text-blue-600">4,673</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-500 h-full rounded-full" style={{width: '100%'}}></div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-800">Valid Item + Amount</span>
                        <span className="font-bold text-yellow-600">2,850</span>
                      </div>
                      <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                        <div className="bg-yellow-500 h-full rounded-full" style={{width: '61%'}}></div>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">61% have complete data</p>
                    </div>
                    <div className="flex justify-center">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-800">Actually Saved</span>
                        <span className="font-bold text-green-600">1,037</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-full rounded-full" style={{width: '36.4%'}}></div>
                      </div>
                      <p className="text-xs text-green-600 mt-1">36.4% of valid expenses saved</p>
                    </div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-700">
                      <strong>Issue:</strong> 39% extractions lack item/amount - need better prompting
                    </p>
                  </div>
                </div>

                {/* Single vs Multi-Item */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <h4 className="font-medium text-gray-900">Item Composition</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-800">Total Saved Expenses</span>
                        <span className="font-bold text-gray-600">1,037</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                        <div className="text-2xl font-bold text-blue-600">78%</div>
                        <div className="text-sm text-blue-800">Single Item</div>
                        <div className="text-xs text-blue-600 mt-1">~809 expenses</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                        <div className="text-2xl font-bold text-purple-600">22%</div>
                        <div className="text-sm text-purple-800">Multi-Item</div>
                        <div className="text-xs text-purple-600 mt-1">~228 expenses</div>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <h5 className="text-sm font-medium text-orange-800 mb-2">Multi-Item Breakdown:</h5>
                      <div className="space-y-1 text-xs text-orange-700">
                        <div className="flex justify-between">
                          <span>2 items</span>
                          <span className="font-medium">14% (~145)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>3 items</span>
                          <span className="font-medium">5% (~52)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>4+ items</span>
                          <span className="font-medium">3% (~31)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>Insight:</strong> Most users speak single items - optimize for this pattern
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3">Funnel Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">49.7%</div>
                    <div className="text-xs text-gray-500">Audio Submit Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">92.4%</div>
                    <div className="text-xs text-gray-500">STT Success</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">61%</div>
                    <div className="text-xs text-gray-500">Meaningful Data</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">36.4%</div>
                    <div className="text-xs text-gray-500">Save Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">78%</div>
                    <div className="text-xs text-gray-500">Single-Item</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retention & Exit Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Retention Curve */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Retention Curve (30-Day)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-sm text-gray-600">Day 1</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-yellow-500 h-full rounded-full" style={{width: '15%'}}></div>
                    </div>
                    <span className="text-sm font-medium w-12">~15%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-sm text-gray-600">Day 2</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full" style={{width: '3%'}}></div>
                    </div>
                    <span className="text-sm font-medium w-12">~3%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-sm text-gray-600">Day 5</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{width: '2%'}}></div>
                    </div>
                    <span className="text-sm font-medium w-12">~2%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-sm text-gray-600">Day 30</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-red-600 h-full rounded-full" style={{width: '1%'}}></div>
                    </div>
                    <span className="text-sm font-medium w-12">~1%</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-700">
                    <strong>Gap:</strong> VAANI retention is 4-10x lower than industry benchmark (40% D1, 20% D7, 10% D30)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Exit Reasons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LogOut className="w-5 h-5 text-orange-500" />
                  Exit Reasons (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Others</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-3">
                        <div className="bg-gray-500 h-full rounded-full" style={{width: '45%'}}></div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">45.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm text-red-700">Didn't understand me</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-red-200 rounded-full h-3">
                        <div className="bg-red-500 h-full rounded-full" style={{width: '35%'}}></div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">17.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm text-yellow-700">Just testing</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-yellow-200 rounded-full h-3">
                        <div className="bg-yellow-500 h-full rounded-full" style={{width: '30%'}}></div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">14.9%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <span className="text-sm text-orange-700">Too slow</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-orange-200 rounded-full h-3">
                        <div className="bg-orange-500 h-full rounded-full" style={{width: '10%'}}></div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">5.1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm text-blue-700">Made a mistake</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-blue-200 rounded-full h-3">
                        <div className="bg-blue-500 h-full rounded-full" style={{width: '7%'}}></div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">3.3%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Total: 2,389 exits from 2,083 unique users (341/day avg)
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                User Feedback Scores (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rating Distribution */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Rating Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-sm">5 Stars</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{width: '62.9%'}}></div>
                      </div>
                      <span className="text-sm font-medium w-12">62.9%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-sm">3 Stars</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div className="bg-yellow-500 h-full rounded-full" style={{width: '17.1%'}}></div>
                      </div>
                      <span className="text-sm font-medium w-12">17.1%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-sm">1 Star</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{width: '11.4%'}}></div>
                      </div>
                      <span className="text-sm font-medium w-12">11.4%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-sm">2 Stars</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full" style={{width: '5.7%'}}></div>
                      </div>
                      <span className="text-sm font-medium w-12">5.7%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-sm">4 Stars</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div className="bg-lime-500 h-full rounded-full" style={{width: '2.9%'}}></div>
                      </div>
                      <span className="text-sm font-medium w-12">2.9%</span>
                    </div>
                  </div>
                </div>

                {/* NPS Score */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Net Promoter Score (NPS)</h4>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-600">45.8</div>
                      <p className="text-sm text-gray-500 mt-1">NPS Score (Decent)</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">62.9%</div>
                      <div className="text-xs text-green-700">Promoters</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-600">20.0%</div>
                      <div className="text-xs text-gray-700">Passives</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">17.1%</div>
                      <div className="text-xs text-red-700">Detractors</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Only 35 feedback events from 1,092 users (3.2% response rate)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missing Metrics */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                Missing Metrics (Need Data)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Performance
                  </h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>Average Latency (E2E)</li>
                    <li>P50, P95, P99 Latency</li>
                    <li>Time to First Response</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-1">
                    <Target className="w-4 h-4" /> Accuracy
                  </h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>Intent Detection Accuracy</li>
                    <li>Extraction Accuracy</li>
                    <li>Category Assignment</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> Cost
                  </h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>Cost per Transaction</li>
                    <li>Monthly API Spend</li>
                    <li>Cost per Success</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4" /> Segmentation
                  </h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>Success by Business Type</li>
                    <li>Success by Language</li>
                    <li>Success by Time of Day</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues Summary */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <XCircle className="w-5 h-5" />
                Critical Issues Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">9.42%</div>
                  <div className="text-sm text-red-800 font-medium">Low Success Rate</div>
                  <p className="text-xs text-red-600 mt-1">Only 1,037 expenses saved from 11,000 starts</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">~2%</div>
                  <div className="text-sm text-red-800 font-medium">Poor D5 Retention</div>
                  <p className="text-xs text-red-600 mt-1">98% users don't return after Day 5</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">341/day</div>
                  <div className="text-sm text-red-800 font-medium">High Exit Rate</div>
                  <p className="text-xs text-red-600 mt-1">2,389 exits in last 7 days</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">422</div>
                  <div className="text-sm text-red-800 font-medium">"Didn't Understand"</div>
                  <p className="text-xs text-red-600 mt-1">Users report VAANI didn't understand them</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          {/* Header */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Rocket className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">LLM Arena Roadmap</h2>
                  <p className="text-gray-600 mt-1">Feature ideas and implementation phases for the LLM testing and comparison platform</p>
                  <div className="flex gap-2 mt-3">
                    <Badge className="bg-purple-100 text-purple-800">8 Categories</Badge>
                    <Badge className="bg-blue-100 text-blue-800">50+ Features</Badge>
                    <Badge className="bg-green-100 text-green-800">5 Phases</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Phases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Implementation Phases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600">Phase 1</Badge>
                    <span className="text-xs text-gray-500">Weeks 1-2</span>
                  </div>
                  <h4 className="font-semibold text-blue-900">Foundation</h4>
                  <p className="text-xs text-blue-700 mt-1">Basic functionality + critical dashboards</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-600">Phase 2</Badge>
                    <span className="text-xs text-gray-500">Weeks 3-4</span>
                  </div>
                  <h4 className="font-semibold text-green-900">Testing & Debug</h4>
                  <p className="text-xs text-green-700 mt-1">Power user tools for deep analysis</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yellow-600">Phase 3</Badge>
                    <span className="text-xs text-gray-500">Weeks 5-6</span>
                  </div>
                  <h4 className="font-semibold text-yellow-900">Analytics</h4>
                  <p className="text-xs text-yellow-700 mt-1">Data-driven decision making</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-purple-600">Phase 4</Badge>
                    <span className="text-xs text-gray-500">Weeks 7-8</span>
                  </div>
                  <h4 className="font-semibold text-purple-900">Collaboration</h4>
                  <p className="text-xs text-purple-700 mt-1">Team productivity & sharing</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-red-600">Phase 5</Badge>
                    <span className="text-xs text-gray-500">Weeks 9-12</span>
                  </div>
                  <h4 className="font-semibold text-red-900">Advanced</h4>
                  <p className="text-xs text-red-700 mt-1">ML training & automation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Testing & Experimentation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="w-5 h-5 text-green-500" />
                  1. Testing & Experimentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Enhanced Playground
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Test Dataset Library (Easy/Medium/Hard cases)</li>
                    <li>Save & Share Test Results</li>
                    <li>Batch Testing (CSV upload, parallel execution)</li>
                    <li>Prompt Version Comparison (v1 vs v2)</li>
                    <li>Voice Recording Integration</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    Real User Testing
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Live Session Replay with audio playback</li>
                    <li>Session Filters (success/failure, date, category)</li>
                    <li>Session Search (keyword, ID, date)</li>
                    <li>Tag & Flag System (P0/P1/P2 priorities)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    A/B Testing Dashboard
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>A/B Test Setup (sample size, criteria)</li>
                    <li>Results Visualization (charts, significance)</li>
                    <li>Test History & Quick Re-run</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data & Analytics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  2. Data & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    LLM Performance Metrics
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Success Rate Tracking (daily, 7-day avg)</li>
                    <li>Failure Reason Analysis (Top 10, trends)</li>
                    <li>Conversation Metrics (length, turns)</li>
                    <li>Category Performance & Confusion Matrix</li>
                    <li>Response Time Metrics (P50, P95, P99)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    Prompt Analysis
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Token usage analysis</li>
                    <li>Prompt effectiveness scores</li>
                    <li>Input complexity metrics</li>
                    <li>Output quality ratings</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-500" />
                    Model Performance
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Cost Tracking (per transaction)</li>
                    <li>API Call Breakdown</li>
                    <li>Model Accuracy Comparison</li>
                    <li>Latency Analysis by region</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* System Prompts Management */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-500" />
                  3. System Prompts Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Prompt Library
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Organized by Transaction Type & Agent</li>
                    <li>Syntax highlighting & token count</li>
                    <li>Side-by-side Comparison with diff</li>
                    <li>Version History with rollback</li>
                    <li>Edit & Preview without deploying</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Performance Tracking
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Success rate per prompt</li>
                    <li>Test coverage & gaps</li>
                    <li>Change impact analysis</li>
                    <li>Regression detection alerts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Roadmap & Documentation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Map className="w-5 h-5 text-blue-500" />
                  4. Roadmap & Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    Roadmap View
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Sprint Board (In Progress/Testing/Done)</li>
                    <li>Pipeline View (next 4 weeks)</li>
                    <li>Completed Features Archive</li>
                    <li>Priority Framework (P0-P3)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    Learning Center
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Prompt engineering best practices</li>
                    <li>Model selection guide</li>
                    <li>Common failure patterns</li>
                    <li>Platform onboarding guide</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Model Management */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5 text-orange-500" />
                  5. Model Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-500" />
                    Model Registry
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>All available models listing</li>
                    <li>Model capabilities & pricing</li>
                    <li>Performance benchmarks</li>
                    <li>Quick model switching</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-500" />
                    Test Dataset Library
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Curated test cases by difficulty</li>
                    <li>Edge case collections</li>
                    <li>Multi-language test sets</li>
                    <li>Custom dataset upload</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Debugging Tools */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-red-500" />
                  6. Debugging Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-500" />
                    Session Inspector
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Deep Dive Analysis (all 5 agents)</li>
                    <li>Agent Output Viewer (JSON)</li>
                    <li>API Call Tracer (exact prompts)</li>
                    <li>MongoDB Data View</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Error Analysis
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Failed Sessions Dashboard</li>
                    <li>Empty Transcription Tracker</li>
                    <li>Timeout Issues Log</li>
                    <li>Pattern Detection & Alerts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Team Collaboration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  7. Team Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-500" />
                    Annotations
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Comment System with threads</li>
                    <li>Flagging & Priority levels</li>
                    <li>Knowledge Sharing collections</li>
                    <li>Action items tracking</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    Reports
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Weekly Performance Summary (auto)</li>
                    <li>Stakeholder Reports (PDF/PPT)</li>
                    <li>Success Stories Showcase</li>
                    <li>Custom Reports Builder</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Inspiration & Research Hub */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  8. Inspiration & Research Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Ideas to Experiment
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Idea Submission with voting</li>
                    <li>Status Tracking (Idea to Shipped)</li>
                    <li>Impact Estimation</li>
                    <li>Related Research Links</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    LLM News Feed
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Latest model announcements</li>
                    <li>Industry benchmarks</li>
                    <li>Provider updates</li>
                    <li>Research papers</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    Quick Links
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-6">
                    <li>Gemini / OpenAI / LangChain Docs</li>
                    <li>Indian Language Resources</li>
                    <li>STT/TTS Provider Comparison</li>
                    <li>Testing Tools</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Wins Section */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Rocket className="w-5 h-5" />
                Quick Wins (Easy to Build First)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">UI/UX</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>Dark mode toggle</li>
                    <li>Responsive design</li>
                    <li>Loading indicators</li>
                    <li>Keyboard shortcuts</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Results</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>Copy JSON output</li>
                    <li>Share test results</li>
                    <li>Export comparisons</li>
                    <li>Save test sessions</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Search</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>Global search bar</li>
                    <li>Quick filters</li>
                    <li>Recent activity</li>
                    <li>Bookmarks</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Navigation</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>Breadcrumbs</li>
                    <li>Quick sidebar</li>
                    <li>Recently viewed</li>
                    <li>Favorites</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Performance</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>Lazy loading</li>
                    <li>Pagination</li>
                    <li>Caching</li>
                    <li>Optimized queries</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Problems Reference */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                Key Problems to Solve (from Production Data)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-600">8.8%</div>
                  <div className="text-sm text-red-800 font-medium">Success Rate</div>
                  <p className="text-xs text-red-600 mt-1">Only 1,403 invoices from 15,869 sessions</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-600">67%</div>
                  <div className="text-sm text-red-800 font-medium">Useless First Messages</div>
                  <p className="text-xs text-red-600 mt-1">Users saying "yes/okay" when starting</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-600">79%</div>
                  <div className="text-sm text-red-800 font-medium">Speak 5 Words or Less</div>
                  <p className="text-xs text-red-600 mt-1">37% single word, 42% 2-5 words</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  <strong>Projected Impact:</strong> With Priority 1-6 fixes, success rate can improve from 8.8% to 45-55% (~5x improvement)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              Import Test Cases
            </DialogTitle>
            <DialogDescription>
              Upload a CSV file to import test cases. The file must include the required columns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Column Structure Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Required CSV Columns</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-blue-700">type *</p>
                        <p className="text-blue-600 text-xs">Transaction type: expense, sale_invoice, payment_in, payment_out, other</p>
                      </div>
                      <div>
                        <p className="font-medium text-blue-700">input *</p>
                        <p className="text-blue-600 text-xs">The test input text (e.g., "Add petrol for 500 rupees")</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Optional Columns</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">expectedIntent</p>
                  <p className="text-gray-500 text-xs">Expected intent classification (defaults to type)</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">category</p>
                  <p className="text-gray-500 text-xs">Test category for filtering (e.g., basic, hinglish)</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">context</p>
                  <p className="text-gray-500 text-xs">Conversation context if applicable</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">expectedOutput</p>
                  <p className="text-gray-500 text-xs">Expected JSON output (must be valid JSON)</p>
                </div>
              </div>
            </div>

            {/* Sample Download */}
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">Download a sample CSV to see the correct format</span>
              </div>
              <Button variant="outline" size="sm" onClick={downloadSampleCSV} className="border-green-300 text-green-700 hover:bg-green-100">
                <Download className="w-4 h-4 mr-2" />
                Sample CSV
              </Button>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileImport}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">CSV files only</p>
              </label>
            </div>

            {/* Status Messages */}
            {importError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                <XCircle className="w-5 h-5" />
                <p className="text-sm">{importError}</p>
              </div>
            )}

            {importSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm">{importSuccess}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-500" />
              Export Test Cases
            </DialogTitle>
            <DialogDescription>
              Choose a format to download {filteredTestCases.length} test cases
              {filteredType !== 'all' && ` (filtered: ${filteredType})`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {/* Export Summary */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total test cases:</span>
                <Badge>{filteredTestCases.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Filter applied:</span>
                <Badge variant="outline">{filteredType === 'all' ? 'All Types' : filteredType}</Badge>
              </div>
            </div>

            {/* Format Options */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Select format:</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => exportTestCases('csv')}
                  className="flex flex-col items-center gap-2 h-auto py-4 border-2 hover:border-blue-500 hover:bg-blue-50"
                >
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="text-center">
                    <p className="font-medium">CSV</p>
                    <p className="text-xs text-gray-500">Comma-separated values</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportTestCases('xlsx')}
                  className="flex flex-col items-center gap-2 h-auto py-4 border-2 hover:border-green-500 hover:bg-green-50"
                >
                  <FileSpreadsheet className="w-8 h-8 text-green-500" />
                  <div className="text-center">
                    <p className="font-medium">XLSX</p>
                    <p className="text-xs text-gray-500">Excel spreadsheet</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Product;
