import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain, Code, Cpu, Database, FileText, Mic, MessageSquare,
  ArrowRight, ChevronDown, ChevronUp, Copy, Check, Workflow,
  GitCompare, Zap, Clock, TrendingDown, Factory, Layers,
  Smartphone, Cloud, Server, HelpCircle, CheckCircle, XCircle,
  Timer, RefreshCw, AlertCircle
} from 'lucide-react';

// OLD Pipeline stages (5-Agent Architecture)
const oldPipelineStages = [
  {
    id: 1,
    name: 'Speech-to-Text',
    agent: 'Agent 1',
    description: 'Converts voice audio to text transcription',
    tech: 'Whisper / Sarvam AI',
    input: 'Audio file (WAV/MP3)',
    output: 'Text transcription',
    color: '#3B82F6',
    llmCall: false,
  },
  {
    id: 2,
    name: 'Intent Detection',
    agent: 'Agent 2',
    description: 'Classifies user intent using LLM',
    tech: 'Gemini 2.0 Flash',
    input: 'Transcription text',
    output: 'Intent: expense | other',
    color: '#8B5CF6',
    llmCall: true,
  },
  {
    id: 3,
    name: 'Data Extraction',
    agent: 'Agent 3',
    description: 'Extracts structured data from text using LLM',
    tech: 'Gemini 2.0 Flash + Pydantic',
    input: 'Transcription + Intent',
    output: 'Structured JSON (items, amounts, categories)',
    color: '#10B981',
    llmCall: true,
  },
  {
    id: 4,
    name: 'Question Generation',
    agent: 'Agent 4',
    description: 'Generates follow-up questions using LLM',
    tech: 'Gemini 2.0 Flash',
    input: 'Extracted data',
    output: 'Follow-up question OR confirmation',
    color: '#F59E0B',
    llmCall: true,
  },
  {
    id: 5,
    name: 'Conversation Manager',
    agent: 'Agent 5',
    description: 'Manages multi-turn conversation flow using LLM',
    tech: 'Gemini 2.0 Flash + MongoDB',
    input: 'Current state + History',
    output: 'Invoice OR Continue conversation',
    color: '#EF4444',
    llmCall: true,
  },
];

// NEW Pipeline stages (Handler-based Architecture - Dec 2025)
const newPipelineStages = [
  {
    id: 1,
    name: 'Speech-to-Text',
    description: 'Converts voice audio to text transcription',
    tech: 'Whisper / Sarvam AI',
    input: 'Audio file (WAV/MP3)',
    output: 'Text transcription',
    color: '#3B82F6',
    llmCall: false,
  },
  {
    id: 2,
    name: 'Intent Detection',
    description: 'Classifies user intent using single LLM call',
    tech: 'Gemini 2.0 Flash',
    input: 'Transcription + History + Entry Point',
    output: 'Intent: expense | payment_in | payment_out | other',
    color: '#8B5CF6',
    llmCall: true,
  },
  {
    id: 3,
    name: 'Handler Factory',
    description: 'Creates appropriate handler based on intent',
    tech: 'Python Factory Pattern',
    input: 'Intent type',
    output: 'Transaction Handler instance',
    color: '#10B981',
    llmCall: false,
  },
  {
    id: 4,
    name: 'Data Extraction',
    description: 'Handler extracts data using single LLM call',
    tech: 'Gemini 2.0 Flash + Pydantic',
    input: 'User query + Latest invoice + History',
    output: 'Validated transaction model',
    color: '#F59E0B',
    llmCall: true,
  },
  {
    id: 5,
    name: 'Post Processing',
    description: 'Validates and cleans extracted data',
    tech: 'Python validation logic',
    input: 'Raw extracted model',
    output: 'Cleaned model (abs values, etc.)',
    color: '#06B6D4',
    llmCall: false,
  },
  {
    id: 6,
    name: 'Rule-based Questions',
    description: 'Determines next question using deterministic rules',
    tech: 'Python conditional logic',
    input: 'Validated model',
    output: 'Pre-defined question or COMPLETE status',
    color: '#EF4444',
    llmCall: false,
  },
];

// Handler types for new architecture
const handlerTypes = [
  {
    name: 'ExpenseTransactionHandler',
    intent: 'expense',
    description: 'Handles expense recording with items, amounts, categories',
    methods: ['extract()', 'post_process()', 'ask_question()'],
    color: '#8B5CF6',
  },
  {
    name: 'PaymentInTransactionHandler',
    intent: 'payment_in',
    description: 'Handles money received from customers',
    methods: ['extract()', 'post_process()', 'ask_question()'],
    color: '#10B981',
  },
  {
    name: 'PaymentOutTransactionHandler',
    intent: 'payment_out',
    description: 'Handles money paid to suppliers',
    methods: ['extract()', 'post_process()', 'ask_question()'],
    color: '#F59E0B',
  },
  {
    name: 'OtherTransactionHandler',
    intent: 'other',
    description: 'Handles unrelated queries, greetings, etc.',
    methods: ['extract()', 'ask_question()'],
    color: '#6B7280',
  },
];

// Comparison metrics
const pipelineComparison = {
  old: {
    llmCalls: 4,
    avgLatency: '2-3 seconds',
    questionGeneration: 'LLM-based (variable)',
    architecture: 'Sequential agents',
    flexibility: 'Limited to expense',
  },
  new: {
    llmCalls: 2,
    avgLatency: '1-1.5 seconds',
    questionGeneration: 'Rule-based (deterministic)',
    architecture: 'Handler pattern',
    flexibility: 'Multiple transaction types',
  },
};

// How It Works - System Architecture
const systemFlowSteps = [
  {
    id: 1,
    name: 'Mobile App',
    description: 'User speaks into Vyapar app voice feature',
    tech: 'Vyapar Android/iOS App',
    icon: 'Smartphone',
    color: '#3B82F6',
  },
  {
    id: 2,
    name: 'Audio Storage',
    description: 'Voice recording uploaded to S3 bucket',
    tech: 'AWS S3',
    icon: 'Cloud',
    color: '#F59E0B',
  },
  {
    id: 3,
    name: 'Speech-to-Text',
    description: 'Audio converted to text transcription',
    tech: 'Sarvam AI / Whisper (Lambda)',
    icon: 'Mic',
    color: '#8B5CF6',
  },
  {
    id: 4,
    name: 'Job Queue',
    description: 'Job created with STT_COMPLETED status in MongoDB',
    tech: 'MongoDB',
    icon: 'Database',
    color: '#10B981',
  },
  {
    id: 5,
    name: 'Scheduler',
    description: 'Batch processor picks up jobs every 0.5 seconds',
    tech: 'Python Scheduler (30 workers)',
    icon: 'Timer',
    color: '#06B6D4',
  },
  {
    id: 6,
    name: 'Talk2Bill Pipeline',
    description: 'Intent detection + Data extraction via LLM',
    tech: 'Gemini 2.0 Flash + Handlers',
    icon: 'Brain',
    color: '#EC4899',
  },
  {
    id: 7,
    name: 'Response Generation',
    description: 'Rule-based question or invoice creation',
    tech: 'Pre-defined Questions / Invoice',
    icon: 'MessageSquare',
    color: '#EF4444',
  },
];

// Job Status Lifecycle
const jobStatuses = [
  {
    status: 'STT_IN_PROGRESS',
    code: 1,
    description: 'Audio is being transcribed',
    color: '#3B82F6',
    icon: 'RefreshCw',
  },
  {
    status: 'STT_COMPLETED',
    code: 2,
    description: 'Transcription complete, ready for Talk2Bill',
    color: '#8B5CF6',
    icon: 'Check',
  },
  {
    status: 'T2I_IN_PROGRESS',
    code: 3,
    description: 'Talk2Bill pipeline is processing',
    color: '#F59E0B',
    icon: 'RefreshCw',
  },
  {
    status: 'T2I_COMPLETED',
    code: 4,
    description: 'Extraction complete, response ready',
    color: '#10B981',
    icon: 'CheckCircle',
  },
  {
    status: 'INVOICE_READY',
    code: 5,
    description: 'All data extracted, invoice can be created',
    color: '#06B6D4',
    icon: 'FileText',
  },
  {
    status: 'FAILED',
    code: -1,
    description: 'Processing failed after retries',
    color: '#EF4444',
    icon: 'XCircle',
  },
];

// Entry Points (Transaction Types)
const entryPoints = [
  {
    code: 7,
    name: 'expense',
    intent: 'expense',
    description: 'Recording business expenses (chai, petrol, salary)',
    handler: 'ExpenseTransactionHandler',
    color: '#8B5CF6',
  },
  {
    code: 3,
    name: 'payment_in',
    intent: 'payment_in',
    description: 'Money received from customers',
    handler: 'PaymentInTransactionHandler',
    color: '#10B981',
  },
  {
    code: 4,
    name: 'payment_out',
    intent: 'payment_out',
    description: 'Money paid to suppliers',
    handler: 'PaymentOutTransactionHandler',
    color: '#F59E0B',
  },
];

// Data Models
const dataModels = {
  expense: {
    name: 'ExpenseModel',
    fields: [
      { name: 'item_name', type: 'str | None', required: true, description: 'Name of expense item' },
      { name: 'item_amount', type: 'float | None', required: true, description: 'Amount spent' },
      { name: 'item_qty', type: 'float | None', required: false, description: 'Quantity (default 1)' },
      { name: 'expense_category', type: 'str | None', required: true, description: 'Category from 50 options' },
      { name: 'payment_type', type: 'str | None', required: false, description: 'cash, UPI, card, etc.' },
    ],
  },
  payment_in: {
    name: 'PaymentInModel',
    fields: [
      { name: 'party_name', type: 'str | None', required: true, description: 'Customer name' },
      { name: 'amount_received', type: 'float | None', required: true, description: 'Payment amount' },
      { name: 'payment_mode', type: 'str | None', required: false, description: 'cash, UPI, bank, etc.' },
    ],
  },
  payment_out: {
    name: 'PaymentOutModel',
    fields: [
      { name: 'party_name', type: 'str | None', required: true, description: 'Supplier name' },
      { name: 'amount_paid', type: 'float | None', required: true, description: 'Payment amount' },
      { name: 'payment_mode', type: 'str | None', required: false, description: 'cash, UPI, bank, etc.' },
    ],
  },
};

// Pre-defined Questions
const predefinedQuestions = {
  expense: [
    { condition: 'item_name is None', question: 'Aapne yeh paisa kisliye kharch kiya?', english: 'What did you spend this money on?' },
    { condition: 'item_amount is None', question: 'Aapne {item_name} pe kitna kharch kiya?', english: 'How much did you spend on {item_name}?' },
    { condition: 'expense_category is None', question: 'Yeh expense kis category mein aata hai?', english: 'Which category does this expense belong to?' },
    { condition: 'all fields present', question: 'Kya aap {item_amount} rupees ka {item_name} expense add karna chahte hain?', english: 'Confirmation question' },
  ],
  payment_in: [
    { condition: 'party_name is None', question: 'Yeh payment kisne di?', english: 'Who made this payment?' },
    { condition: 'amount_received is None', question: 'Kitni payment mili?', english: 'How much payment was received?' },
    { condition: 'all fields present', question: 'Kya aap {party_name} se {amount_received} rupees ki payment in add karna chahte hain?', english: 'Confirmation question' },
  ],
  payment_out: [
    { condition: 'party_name is None', question: 'Aapne yeh payment kisko di?', english: 'Who did you pay?' },
    { condition: 'amount_paid is None', question: 'Kitni payment di?', english: 'How much did you pay?' },
    { condition: 'all fields present', question: 'Kya aap {party_name} ko {amount_paid} rupees ki payment out add karna chahte hain?', english: 'Confirmation question' },
  ],
};

// Pipeline stages (kept for backward compatibility)
const pipelineStages = [
  {
    id: 1,
    name: 'Speech-to-Text',
    agent: 'Agent 1',
    description: 'Converts voice audio to text transcription',
    tech: 'Whisper / Sarvam AI',
    input: 'Audio file (WAV/MP3)',
    output: 'Text transcription',
    color: '#3B82F6',
  },
  {
    id: 2,
    name: 'Intent Detection',
    agent: 'Agent 2',
    description: 'Classifies user intent',
    tech: 'Gemini 2.0 Flash',
    input: 'Transcription text',
    output: 'Intent: expense | sales | purchase | payment | other',
    color: '#8B5CF6',
  },
  {
    id: 3,
    name: 'Data Extraction',
    agent: 'Agent 3',
    description: 'Extracts structured data from text',
    tech: 'Gemini 2.0 Flash + Pydantic',
    input: 'Transcription + Intent',
    output: 'Structured JSON (items, amounts, categories)',
    color: '#10B981',
  },
  {
    id: 4,
    name: 'Question Generation',
    agent: 'Agent 4',
    description: 'Asks follow-up questions for missing data',
    tech: 'Gemini 2.0 Flash',
    input: 'Extracted data',
    output: 'Follow-up question OR confirmation',
    color: '#F59E0B',
  },
  {
    id: 5,
    name: 'Conversation Manager',
    agent: 'Agent 5',
    description: 'Manages multi-turn conversation flow',
    tech: 'Gemini 2.0 Flash + MongoDB',
    input: 'Current state + History',
    output: 'Invoice OR Continue conversation',
    color: '#EF4444',
  },
];

const DataScience = () => {
  const [activeTab, setActiveTab] = useState('how-it-works');
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Science</h1>
        <p className="text-gray-600">VAANI AI pipeline architecture and system prompts</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap justify-start gap-1 h-auto p-1 bg-muted/50 sm:grid sm:w-full sm:grid-cols-3">
          <TabsTrigger value="how-it-works" className="text-xs sm:text-sm">How It Works</TabsTrigger>
          <TabsTrigger value="evolution" className="text-xs sm:text-sm">Pipeline Evolution</TabsTrigger>
          <TabsTrigger value="architecture" className="text-xs sm:text-sm">Old Architecture</TabsTrigger>
        </TabsList>

        {/* How It Works Tab */}
        <TabsContent value="how-it-works" className="space-y-6">
          {/* Overview */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-indigo-600" />
                VAANI: Voice-to-Invoice System
              </CardTitle>
              <p className="text-gray-600">
                End-to-end architecture for converting voice commands into business transactions for 63M+ Indian MSMEs
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-indigo-600">2</div>
                  <div className="text-gray-500">LLM Calls</div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">30</div>
                  <div className="text-gray-500">Parallel Workers</div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">0.5s</div>
                  <div className="text-gray-500">Poll Interval</div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <div className="text-gray-500">Transaction Types</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* End-to-End System Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-blue-500" />
                End-to-End System Flow
              </CardTitle>
              <p className="text-sm text-gray-500">
                From user voice input to invoice creation
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Flow diagram */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
                  {systemFlowSteps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg min-w-[120px] max-w-[140px]">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white mb-2"
                          style={{ backgroundColor: step.color }}
                        >
                          {step.icon === 'Smartphone' && <Smartphone className="w-5 h-5" />}
                          {step.icon === 'Cloud' && <Cloud className="w-5 h-5" />}
                          {step.icon === 'Mic' && <Mic className="w-5 h-5" />}
                          {step.icon === 'Database' && <Database className="w-5 h-5" />}
                          {step.icon === 'Timer' && <Timer className="w-5 h-5" />}
                          {step.icon === 'Brain' && <Brain className="w-5 h-5" />}
                          {step.icon === 'MessageSquare' && <MessageSquare className="w-5 h-5" />}
                        </div>
                        <div className="text-sm font-medium text-center">{step.name}</div>
                        <div className="text-xs text-gray-500 text-center mt-1">{step.tech}</div>
                      </div>
                      {index < systemFlowSteps.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-gray-300 hidden md:block flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Status Lifecycle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-500" />
                Job Status Lifecycle
              </CardTitle>
              <p className="text-sm text-gray-500">
                Each voice request creates a job that moves through these statuses in MongoDB
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {jobStatuses.map((status, index) => (
                  <div
                    key={status.status}
                    className="relative p-4 rounded-lg border-2"
                    style={{ borderColor: status.color }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.icon === 'RefreshCw' && <RefreshCw className="w-4 h-4" />}
                        {status.icon === 'Check' && <Check className="w-4 h-4" />}
                        {status.icon === 'CheckCircle' && <CheckCircle className="w-4 h-4" />}
                        {status.icon === 'FileText' && <FileText className="w-4 h-4" />}
                        {status.icon === 'XCircle' && <XCircle className="w-4 h-4" />}
                      </div>
                      <Badge variant="outline" className="text-xs">{status.code}</Badge>
                    </div>
                    <div className="font-mono text-xs font-medium text-gray-800 mb-1">{status.status}</div>
                    <p className="text-xs text-gray-500">{status.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Status Transitions</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge style={{ backgroundColor: '#3B82F6' }} className="text-white">STT_IN_PROGRESS</Badge>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Badge style={{ backgroundColor: '#8B5CF6' }} className="text-white">STT_COMPLETED</Badge>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Badge style={{ backgroundColor: '#F59E0B' }} className="text-white">T2I_IN_PROGRESS</Badge>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Badge style={{ backgroundColor: '#10B981' }} className="text-white">T2I_COMPLETED</Badge>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Badge style={{ backgroundColor: '#06B6D4' }} className="text-white">INVOICE_READY</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entry Points / Transaction Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-500" />
                Entry Points (Transaction Types)
              </CardTitle>
              <p className="text-sm text-gray-500">
                The app sends a transaction type code that determines which handler processes the request
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {entryPoints.map((entry) => (
                  <Card key={entry.code} className="border-2" style={{ borderColor: entry.color }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          style={{ backgroundColor: entry.color }}
                          className="text-white text-lg px-3 py-1"
                        >
                          Code: {entry.code}
                        </Badge>
                        <Badge variant="outline">{entry.intent}</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">{entry.name}</h4>
                      <p className="text-sm text-gray-500 mb-3">{entry.description}</p>
                      <code className="block text-xs bg-gray-100 px-2 py-1 rounded">
                        {entry.handler}
                      </code>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">How Entry Points Work</h4>
                <p className="text-sm text-blue-700">
                  When a user opens the voice feature from different screens (Expense, Payment In, Payment Out),
                  the app sends a <code className="bg-blue-100 px-1 rounded">transaction_type</code> code.
                  This helps the system understand context and route to the correct handler, even if the user
                  says something ambiguous.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Models */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-500" />
                Pydantic Data Models
              </CardTitle>
              <p className="text-sm text-gray-500">
                Structured output models that LLM extracts data into via LangChain
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {Object.entries(dataModels).map(([key, model]) => (
                  <Card key={key} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Code className="w-4 h-4 text-purple-500" />
                        <span className="font-mono font-semibold text-purple-700">{model.name}</span>
                      </div>
                      <div className="space-y-2">
                        {model.fields.map((field) => (
                          <div key={field.name} className="bg-white p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <code className="text-sm font-medium">{field.name}</code>
                              {field.required && (
                                <Badge variant="destructive" className="text-xs">required</Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="text-purple-600 font-mono">{field.type}</span>
                              <span className="mx-1">-</span>
                              {field.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pre-defined Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                Pre-defined Questions (Rule-based)
              </CardTitle>
              <p className="text-sm text-gray-500">
                Instead of using LLM for question generation, we use deterministic rules for consistent responses
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(predefinedQuestions).map(([type, questions]) => (
                  <div key={type}>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Badge
                        style={{
                          backgroundColor: type === 'expense' ? '#8B5CF6' : type === 'payment_in' ? '#10B981' : '#F59E0B'
                        }}
                        className="text-white"
                      >
                        {type}
                      </Badge>
                      Questions
                    </h4>
                    <div className="space-y-2">
                      {questions.map((q, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border-l-4" style={{
                          borderColor: type === 'expense' ? '#8B5CF6' : type === 'payment_in' ? '#10B981' : '#F59E0B'
                        }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <code className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700">
                                if {q.condition}
                              </code>
                              <p className="text-sm font-medium text-gray-800 mt-2">"{q.question}"</p>
                              <p className="text-xs text-gray-500 mt-1 italic">{q.english}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Why Rule-based Questions?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• <strong>Consistency:</strong> Same question format every time, no LLM variability</li>
                  <li>• <strong>Speed:</strong> No additional LLM call needed (saves ~50% latency)</li>
                  <li>• <strong>Cost:</strong> 50% reduction in API costs</li>
                  <li>• <strong>Hinglish:</strong> Questions are pre-written in natural Hinglish</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Scheduler Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-500" />
                Scheduler & Job Processing
              </CardTitle>
              <p className="text-sm text-gray-500">
                Batch processor that picks up jobs from MongoDB and processes them in parallel
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Configuration</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-600">Poll Interval</span>
                      <code className="text-sm">0.5 seconds</code>
                    </div>
                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-600">Max Workers</span>
                      <code className="text-sm">30 threads</code>
                    </div>
                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-600">Batch Size</span>
                      <code className="text-sm">30 jobs/batch</code>
                    </div>
                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-600">Max Retries</span>
                      <code className="text-sm">3 attempts</code>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Processing Flow</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                      <span className="font-bold text-blue-600">1.</span>
                      <span>Query MongoDB for jobs with status <code className="bg-blue-100 px-1 rounded">STT_COMPLETED</code></span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-purple-50 rounded">
                      <span className="font-bold text-purple-600">2.</span>
                      <span>Update status to <code className="bg-purple-100 px-1 rounded">T2I_IN_PROGRESS</code></span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-green-50 rounded">
                      <span className="font-bold text-green-600">3.</span>
                      <span>Process via Talk2Bill pipeline (Intent + Extract)</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-orange-50 rounded">
                      <span className="font-bold text-orange-600">4.</span>
                      <span>Update status to <code className="bg-orange-100 px-1 rounded">T2I_COMPLETED</code> with response</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Evolution Tab */}
        <TabsContent value="evolution" className="space-y-6">
          {/* Comparison Header */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="w-6 h-6 text-purple-600" />
                Pipeline Evolution: 5-Agent → Handler Pattern
              </CardTitle>
              <p className="text-gray-600">
                Architectural improvements for better performance and maintainability (Dec 2025)
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600">LLM Calls</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-bold text-red-500">4</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-xl font-bold text-green-500">2</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">50% reduction</p>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Latency</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-bold text-red-500">2-3s</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-xl font-bold text-green-500">1-1.5s</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">~50% faster</p>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-gray-600">Questions</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-bold text-red-500">LLM</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-green-500">Rules</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Deterministic</p>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-gray-600">Transaction Types</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-bold text-red-500">1</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-xl font-bold text-green-500">4</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">expense, payment_in/out</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side-by-side Pipeline Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Old Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="w-5 h-5" />
                  Old: 5-Agent Sequential Pipeline
                </CardTitle>
                <p className="text-sm text-gray-500">
                  4 LLM calls per request, LLM-generated questions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {oldPipelineStages.map((stage, index) => (
                    <div key={stage.id}>
                      <div
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{
                          backgroundColor: stage.llmCall ? '#FEF2F2' : '#F0FDF4',
                          borderLeft: `3px solid ${stage.color}`
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: stage.color }}
                        >
                          {stage.id}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{stage.name}</div>
                          <div className="text-xs text-gray-500">{stage.agent}</div>
                        </div>
                        {stage.llmCall && (
                          <Badge variant="destructive" className="text-xs">LLM</Badge>
                        )}
                      </div>
                      {index < oldPipelineStages.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* New Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Zap className="w-5 h-5" />
                  New: Handler-based Pipeline (Dec 2025)
                </CardTitle>
                <p className="text-sm text-gray-500">
                  2 LLM calls per request, rule-based questions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {newPipelineStages.map((stage, index) => (
                    <div key={stage.id}>
                      <div
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{
                          backgroundColor: stage.llmCall ? '#FEF2F2' : '#F0FDF4',
                          borderLeft: `3px solid ${stage.color}`
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: stage.color }}
                        >
                          {stage.id}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{stage.name}</div>
                          <div className="text-xs text-gray-500">{stage.tech}</div>
                        </div>
                        {stage.llmCall ? (
                          <Badge variant="destructive" className="text-xs">LLM</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-600">Logic</Badge>
                        )}
                      </div>
                      {index < newPipelineStages.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Handler Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-purple-500" />
                Transaction Handler Factory Pattern
              </CardTitle>
              <p className="text-sm text-gray-500">
                Each transaction type has a dedicated handler with extract, post_process, and ask_question methods
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {handlerTypes.map((handler) => (
                  <Card key={handler.name} className="border-2" style={{ borderColor: handler.color }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: handler.color }}
                        />
                        <Badge variant="outline">{handler.intent}</Badge>
                      </div>
                      <h4 className="font-mono text-sm font-medium text-gray-900 mb-1">
                        {handler.name}
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">{handler.description}</p>
                      <div className="space-y-1">
                        {handler.methods.map((method) => (
                          <code key={method} className="block text-xs bg-gray-100 px-2 py-1 rounded">
                            {method}
                          </code>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Improvements */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle>Key Architectural Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">What Changed</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Question Generation:</strong> Moved from LLM to rule-based deterministic logic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Conversation Manager:</strong> Merged into Handler ask_question() method</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Post Processing:</strong> Added validation layer (abs values, type checks)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span><strong>Entry Points:</strong> Support for expense, payment_in, payment_out</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Benefits</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span><strong>50% fewer LLM calls:</strong> Reduced API costs and latency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span><strong>Consistent questions:</strong> No more LLM hallucinations in follow-ups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span><strong>Easy to extend:</strong> Add new handlers for new transaction types</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span><strong>Better testability:</strong> Each handler can be unit tested</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Architecture Tab (Old) */}
        <TabsContent value="architecture" className="space-y-6">
          {/* Overview Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-6 h-6 text-blue-600" />
                VAANI 5-Agent AI Pipeline
              </CardTitle>
              <p className="text-gray-600">
                Voice → Text → Intent → Extraction → Questions → Invoice
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-700">Primary Model</div>
                  <div className="text-blue-600">Gemini 2.0 Flash</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-700">Framework</div>
                  <div className="text-purple-600">LangChain</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-700">Database</div>
                  <div className="text-green-600">MongoDB</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-700">Data Models</div>
                  <div className="text-orange-600">Pydantic</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineStages.map((stage, index) => (
                  <div key={stage.id}>
                    <div
                      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                      style={{ borderLeftWidth: '4px', borderLeftColor: stage.color }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: stage.color }}
                          >
                            {stage.id}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{stage.name}</div>
                            <div className="text-sm text-gray-500">{stage.agent}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{stage.tech}</Badge>
                          {expandedStage === stage.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {expandedStage === stage.id && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <p className="text-gray-600">{stage.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="font-medium text-gray-700">Input</div>
                              <div className="text-gray-600">{stage.input}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="font-medium text-gray-700">Output</div>
                              <div className="text-gray-600">{stage.output}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {index < pipelineStages.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Flow Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-500" />
                Data Flow Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-blue-800">User Voice Input</span>
                  </div>
                  <p className="text-gray-700 italic">"Chai samosa ke liye 140 rupees diye"</p>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-300 rotate-90 mx-auto" />

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-purple-800">Extracted Data</span>
                  </div>
                  <pre className="text-sm bg-white p-3 rounded overflow-x-auto">
{`{
  "intent": "expense",
  "items": [
    {"item_name": "Chai", "item_amount": 70, "item_qty": 1},
    {"item_name": "Samosa", "item_amount": 70, "item_qty": 1}
  ],
  "expense_category": "Food",
  "payment_type": "cash",
  "total_amount": 140
}`}
                  </pre>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-300 rotate-90 mx-auto" />

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-800">Final Output</span>
                  </div>
                  <p className="text-gray-700">
                    Invoice created with 2 items totaling ₹140 in Food category
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default DataScience;
