import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  TrendingUp, Database, Users, MessageSquare, CheckCircle, XCircle,
  Clock, Mic, IndianRupee, ShoppingCart, FileText, Calendar, AlertTriangle,
  ArrowDown, Filter, Lightbulb, Target, TrendingDown, AlertCircle, Info,
  Copy, Check, Code, ChevronDown, ChevronUp
} from 'lucide-react';

// Production Data Summary (Nov 7 - Dec 22, 2025)
const dataSnapshot = {
  dateRange: 'Nov 7 - Dec 22, 2025',
  startDate: 'November 7, 2025',
  endDate: 'December 22, 2025',
  lastUpdated: 'December 22, 2025',
  totalDays: 45,
  totalRecords: 19526,
  uniqueSessions: 11249,
  totalItems: 11578,
  totalAmount: 167735549.28,
  avgRecordsPerDay: 434,
  peakDay: 'Nov 14',
  peakDayRecords: 873,
};

// Key Text Insights
const textInsights = [
  {
    type: 'critical',
    icon: 'AlertCircle',
    title: 'Low Expense → Invoice Conversion',
    description: 'Only 14.7% of expense intents convert to invoices. 11,182 expense sessions did NOT create invoices. This is the critical metric to improve.',
    metric: '14.7%',
    metricLabel: 'expense → invoice',
  },
  {
    type: 'warning',
    icon: 'TrendingDown',
    title: 'The "YES" Problem in Other Intent',
    description: '36.7% of "other" intent responses are just "yes/okay". Users respond to questions with acknowledgments instead of expense details.',
    metric: '36.7%',
    metricLabel: 'yes/okay responses',
  },
  {
    type: 'warning',
    icon: 'MessageSquare',
    title: 'Greetings & Random Chat',
    description: '17.1% of "other" intent are greetings/random conversations. Users treating VAANI like a chatbot instead of expense tracker.',
    metric: '17.1%',
    metricLabel: 'greetings/chat',
  },
  {
    type: 'success',
    icon: 'TrendingUp',
    title: 'Strong Expense Intent Rate',
    description: '67.2% of all requests are expense-related (13,114 records). Users understand the primary use case. The problem is completing the flow.',
    metric: '67.2%',
    metricLabel: 'expense intent',
  },
  {
    type: 'info',
    icon: 'Lightbulb',
    title: 'Food & Fuel Dominate',
    description: 'Top categories: Food (1,121), Fuel (835), Salary (698). Petrol is #1 item (1,009 times). Cash is 98.1% of payments.',
    metric: '1,932',
    metricLabel: 'invoices created',
  },
];

// Other Intent Breakdown Data
const otherIntentBreakdown = [
  { category: 'Yes/Okay Responses', count: 2150, percentage: 36.7, color: '#EF4444', description: 'Users saying "yes", "okay", "haan" instead of expense info' },
  { category: 'Greetings/Chat', count: 1002, percentage: 17.1, color: '#F59E0B', description: 'Hello, hi, namaste, random conversations' },
  { category: 'Unclear/Other', count: 1832, percentage: 31.3, color: '#6B7280', description: 'Incomplete sentences, unclear intent' },
  { category: 'Single Words', count: 485, percentage: 8.3, color: '#8B5CF6', description: 'One-word responses like "expenses", "no", "vani"' },
  { category: 'Questions', count: 366, percentage: 6.2, color: '#3B82F6', description: 'Users asking how to use VAANI' },
  { category: 'No/Cancel', count: 25, percentage: 0.4, color: '#10B981', description: 'Explicit cancellations' },
];

// Sample "Other" intent transcriptions for display
const otherIntentSamples = [
  { text: 'yes.', category: 'Yes/Okay', issue: 'User responding to follow-up question with just "yes"' },
  { text: 'okay.', category: 'Yes/Okay', issue: 'Acknowledgment instead of expense details' },
  { text: 'hello.', category: 'Greeting', issue: 'User greeting instead of expense command' },
  { text: 'what happened?', category: 'Question', issue: 'User confused about system state' },
  { text: 'i will do it.', category: 'Unclear', issue: 'Vague response, no expense info' },
  { text: 'expenses.', category: 'Single Word', issue: 'Single word, no actionable data' },
  { text: 'how much percentage is this?', category: 'Question', issue: 'User asking questions instead of giving expense' },
  { text: 'i had diesel under petrol category.', category: 'Unclear', issue: 'Discussing category but not creating expense' },
];

// Daily distribution data (Nov 7 - Dec 22, 2025)
const dailyData = [
  { date: 'Nov 7', records: 14 },
  { date: 'Nov 9', records: 7 },
  { date: 'Nov 10', records: 47 },
  { date: 'Nov 11', records: 120 },
  { date: 'Nov 12', records: 352 },
  { date: 'Nov 13', records: 696 },
  { date: 'Nov 14', records: 873 },
  { date: 'Nov 15', records: 835 },
  { date: 'Nov 16', records: 733 },
  { date: 'Nov 17', records: 792 },
  { date: 'Nov 18', records: 771 },
  { date: 'Nov 19', records: 721 },
  { date: 'Nov 20', records: 834 },
  { date: 'Nov 21', records: 522 },
  { date: 'Nov 22', records: 534 },
  { date: 'Nov 23', records: 419 },
  { date: 'Nov 24', records: 462 },
  { date: 'Nov 25', records: 571 },
  { date: 'Nov 26', records: 416 },
  { date: 'Nov 27', records: 479 },
  { date: 'Nov 28', records: 476 },
  { date: 'Nov 29', records: 448 },
  { date: 'Nov 30', records: 351 },
  { date: 'Dec 1', records: 582 },
  { date: 'Dec 2', records: 567 },
  { date: 'Dec 3', records: 418 },
  { date: 'Dec 4', records: 423 },
  { date: 'Dec 5', records: 457 },
  { date: 'Dec 6', records: 380 },
  { date: 'Dec 7', records: 285 },
  { date: 'Dec 8', records: 349 },
  { date: 'Dec 9', records: 405 },
  { date: 'Dec 10', records: 390 },
  { date: 'Dec 11', records: 310 },
  { date: 'Dec 12', records: 389 },
  { date: 'Dec 13', records: 297 },
  { date: 'Dec 14', records: 295 },
  { date: 'Dec 15', records: 331 },
  { date: 'Dec 16', records: 352 },
  { date: 'Dec 17', records: 341 },
  { date: 'Dec 18', records: 319 },
  { date: 'Dec 19', records: 286 },
  { date: 'Dec 20', records: 358 },
  { date: 'Dec 21', records: 409 },
  { date: 'Dec 22', records: 110 },
];

// Status distribution
const statusData = [
  { name: 'T2I Completed', value: 16945, percentage: 86.8, color: '#10B981' },
  { name: 'Invoice Ready', value: 2029, percentage: 10.4, color: '#3B82F6' },
  { name: 'Failed', value: 551, percentage: 2.8, color: '#EF4444' },
];

// Intent distribution
const intentData = [
  { name: 'Expense', value: 13114, percentage: 67.2, color: '#8B5CF6' },
  { name: 'Other', value: 5860, percentage: 30.0, color: '#F59E0B' },
  { name: 'Unknown', value: 552, percentage: 2.8, color: '#6B7280' },
];

// Top expense categories
const categoryData = [
  { name: 'Food', count: 1121 },
  { name: 'Fuel', count: 835 },
  { name: 'Salary', count: 698 },
  { name: 'Transport', count: 606 },
  { name: 'Utilities', count: 548 },
  { name: 'Petrol', count: 363 },
  { name: 'Shopping', count: 242 },
  { name: 'Daily Expense', count: 129 },
  { name: 'Medical', count: 89 },
  { name: 'Rent', count: 67 },
];

// Top items
const topItems = [
  { name: 'Petrol', count: 1009 },
  { name: 'Tea', count: 529 },
  { name: 'Samosa', count: 195 },
  { name: 'Salary', count: 173 },
  { name: 'Diesel', count: 159 },
  { name: 'Rent', count: 143 },
  { name: 'Milk', count: 129 },
  { name: 'Food', count: 104 },
  { name: 'Water', count: 82 },
  { name: 'Electricity Bill', count: 80 },
];

// Payment types
const paymentData = [
  { name: 'Cash', value: 18577, percentage: 98.1, color: '#10B981' },
  { name: 'Bank/UPI', value: 276, percentage: 1.5, color: '#3B82F6' },
  { name: 'Credit', value: 85, percentage: 0.4, color: '#F59E0B' },
];

// Conversion Funnel Data (Nov 7 - Dec 22, 2025)
const funnelData = [
  { name: 'Total Records', value: 19526, fill: '#3B82F6', percentage: 100 },
  { name: 'Expense Intent', value: 13114, fill: '#8B5CF6', percentage: 67.2 },
  { name: 'Invoice Created', value: 1932, fill: '#10B981', percentage: 14.7 }, // 14.7% of expense intent
];

// Expense Conversion Metrics (the REAL important metric)
const expenseConversionData = {
  totalExpenseIntent: 13114,
  invoicesCreated: 1932,
  conversionRate: 14.7,
  lostSessions: 11182, // 13114 - 1932
  lostPercentage: 85.3,
};

// The "YES" Problem Data
const yesProblemData = {
  firstMessage: [
    { response: 'Yes', percentage: 56.6, count: 8983, color: '#EF4444' },
    { response: 'Okay', percentage: 10.8, count: 1714, color: '#F59E0B' },
    { response: 'Actual Expense', percentage: 32.6, count: 5172, color: '#10B981' },
  ],
  followUp: [
    { response: 'Yes', percentage: 29.2, count: 4634, color: '#EF4444' },
    { response: 'No', percentage: 15.8, count: 2507, color: '#F59E0B' },
    { response: 'Okay', percentage: 6.2, count: 984, color: '#F59E0B' },
    { response: 'Actual Info', percentage: 48.8, count: 7744, color: '#10B981' },
  ],
};

// Word count distribution
const wordCountData = [
  { words: '1 word', count: 5881, percentage: 37, color: '#EF4444' },
  { words: '2-5 words', count: 6738, percentage: 42, color: '#F59E0B' },
  { words: '6-10 words', count: 1872, percentage: 12, color: '#10B981' },
  { words: '10+ words', count: 1378, percentage: 9, color: '#3B82F6' },
];

// Sample transcriptions
const sampleTranscriptions = [
  { text: "Apple for 100 rupees.", intent: "expense", category: "food" },
  { text: "Tax expense for 100 rupees.", intent: "expense", category: "tax" },
  { text: "Create expense of 100 rupees for item apple.", intent: "expense", category: "food" },
  { text: "Add Apple for 100.", intent: "expense", category: "food" },
  { text: "Petrol 500 rupees.", intent: "expense", category: "fuel" },
  { text: "Chai samosa 140 rupees.", intent: "expense", category: "food" },
  { text: "Salary for Ramesh 15000.", intent: "expense", category: "salary" },
  { text: "Electricity bill 2500.", intent: "expense", category: "utilities" },
];

// Raw transaction data for in-depth analysis
const rawTransactionData = [
  {
    id: "txn_001",
    session_id: "sess_abc123",
    timestamp: "2024-12-18T10:23:45.123Z",
    transcription: "Petrol 500 rupees",
    intent_detected: "expense",
    status: "INVOICE_READY",
    processing_time_ms: 1847,
    extracted_data: {
      items: [{ name: "Petrol", amount: 500, quantity: 1 }],
      total_amount: 500,
      category: "Fuel",
      category_confidence: 0.95,
      payment_mode: "cash",
      date: "2024-12-18"
    },
    model_used: "gemini-2.0-flash",
    word_count: 3,
    audio_duration_ms: 2100,
    language_detected: "hinglish"
  },
  {
    id: "txn_002",
    session_id: "sess_def456",
    timestamp: "2024-12-18T11:05:12.456Z",
    transcription: "Chai samosa 140 rupees aur parking 50 rupees",
    intent_detected: "expense",
    status: "INVOICE_READY",
    processing_time_ms: 2341,
    extracted_data: {
      items: [
        { name: "Chai", amount: 70, quantity: 1 },
        { name: "Samosa", amount: 70, quantity: 1 },
        { name: "Parking", amount: 50, quantity: 1 }
      ],
      total_amount: 190,
      category: "Food",
      category_confidence: 0.88,
      payment_mode: "cash",
      date: "2024-12-18"
    },
    model_used: "gemini-1.5-pro",
    word_count: 7,
    audio_duration_ms: 3500,
    language_detected: "hindi"
  },
  {
    id: "txn_003",
    session_id: "sess_ghi789",
    timestamp: "2024-12-17T14:30:00.789Z",
    transcription: "Salary for driver Ramesh 15000",
    intent_detected: "expense",
    status: "INVOICE_READY",
    processing_time_ms: 1523,
    extracted_data: {
      items: [{ name: "Salary - Driver Ramesh", amount: 15000, quantity: 1 }],
      total_amount: 15000,
      category: "Salary",
      category_confidence: 0.92,
      payment_mode: "cash",
      party_name: "Ramesh",
      date: "2024-12-17"
    },
    model_used: "gemini-2.0-flash",
    word_count: 5,
    audio_duration_ms: 2800,
    language_detected: "english"
  },
  {
    id: "txn_004",
    session_id: "sess_jkl012",
    timestamp: "2024-12-17T09:15:30.012Z",
    transcription: "yes",
    intent_detected: "other",
    status: "T2I_COMPLETED",
    processing_time_ms: 892,
    extracted_data: {
      items: [],
      total_amount: 0,
      category: null,
      category_confidence: 0,
      error: "No expense information detected"
    },
    model_used: "gemini-2.0-flash",
    word_count: 1,
    audio_duration_ms: 800,
    language_detected: "english"
  },
  {
    id: "txn_005",
    session_id: "sess_mno345",
    timestamp: "2024-12-16T16:45:22.345Z",
    transcription: "Electricity bill 2500 rupees for November",
    intent_detected: "expense",
    status: "INVOICE_READY",
    processing_time_ms: 1756,
    extracted_data: {
      items: [{ name: "Electricity Bill", amount: 2500, quantity: 1 }],
      total_amount: 2500,
      category: "Utilities",
      category_confidence: 0.97,
      payment_mode: "bank",
      date: "2024-12-16",
      notes: "November bill"
    },
    model_used: "gemini-2.0-flash",
    word_count: 6,
    audio_duration_ms: 3200,
    language_detected: "english"
  },
  {
    id: "txn_006",
    session_id: "sess_pqr678",
    timestamp: "2024-12-16T12:00:00.678Z",
    transcription: "hello vaani",
    intent_detected: "other",
    status: "T2I_COMPLETED",
    processing_time_ms: 723,
    extracted_data: {
      items: [],
      total_amount: 0,
      category: null,
      category_confidence: 0,
      error: "Greeting detected, no expense"
    },
    model_used: "gemini-2.0-flash",
    word_count: 2,
    audio_duration_ms: 1200,
    language_detected: "english"
  },
  {
    id: "txn_007",
    session_id: "sess_stu901",
    timestamp: "2024-12-15T18:30:45.901Z",
    transcription: "Diesel 800 rupees for truck",
    intent_detected: "expense",
    status: "INVOICE_READY",
    processing_time_ms: 1634,
    extracted_data: {
      items: [{ name: "Diesel", amount: 800, quantity: 1 }],
      total_amount: 800,
      category: "Fuel",
      category_confidence: 0.94,
      payment_mode: "cash",
      date: "2024-12-15",
      notes: "For truck"
    },
    model_used: "gemini-2.0-flash",
    word_count: 5,
    audio_duration_ms: 2400,
    language_detected: "english"
  },
  {
    id: "txn_008",
    session_id: "sess_vwx234",
    timestamp: "2024-12-15T10:20:15.234Z",
    transcription: "Rent payment 25000 for shop",
    intent_detected: "expense",
    status: "INVOICE_READY",
    processing_time_ms: 1892,
    extracted_data: {
      items: [{ name: "Shop Rent", amount: 25000, quantity: 1 }],
      total_amount: 25000,
      category: "Rent",
      category_confidence: 0.96,
      payment_mode: "bank",
      date: "2024-12-15"
    },
    model_used: "gemini-2.0-flash",
    word_count: 5,
    audio_duration_ms: 2600,
    language_detected: "english"
  },
  {
    id: "txn_009",
    session_id: "sess_yz0567",
    timestamp: "2024-12-14T15:45:30.567Z",
    transcription: "",
    intent_detected: "unknown",
    status: "FAILED",
    processing_time_ms: 312,
    extracted_data: {
      items: [],
      total_amount: 0,
      category: null,
      error: "Empty audio / no transcription"
    },
    model_used: null,
    word_count: 0,
    audio_duration_ms: 500,
    language_detected: null
  },
  {
    id: "txn_010",
    session_id: "sess_abc890",
    timestamp: "2024-12-14T11:10:00.890Z",
    transcription: "Tea 20 rupees milk 45 rupees bread 30 rupees",
    intent_detected: "expense",
    status: "INVOICE_READY",
    processing_time_ms: 2156,
    extracted_data: {
      items: [
        { name: "Tea", amount: 20, quantity: 1 },
        { name: "Milk", amount: 45, quantity: 1 },
        { name: "Bread", amount: 30, quantity: 1 }
      ],
      total_amount: 95,
      category: "Food",
      category_confidence: 0.91,
      payment_mode: "cash",
      date: "2024-12-14"
    },
    model_used: "gemini-1.5-pro",
    word_count: 9,
    audio_duration_ms: 4200,
    language_detected: "english"
  },
  {
    id: "txn_011",
    session_id: "sess_def123",
    timestamp: "2024-11-20T09:30:00.123Z",
    transcription: "Auto rickshaw 150 rupees",
    intent_detected: "expense",
    status: "INVOICE_READY",
    processing_time_ms: 1423,
    extracted_data: {
      items: [{ name: "Auto Rickshaw", amount: 150, quantity: 1 }],
      total_amount: 150,
      category: "Transport",
      category_confidence: 0.93,
      payment_mode: "cash",
      date: "2024-11-20"
    },
    model_used: "gemini-2.0-flash",
    word_count: 4,
    audio_duration_ms: 1900,
    language_detected: "english"
  },
  {
    id: "txn_012",
    session_id: "sess_ghi456",
    timestamp: "2024-11-15T14:00:00.456Z",
    transcription: "Medicine for cold 350 rupees",
    intent_detected: "expense",
    status: "INVOICE_READY",
    processing_time_ms: 1567,
    extracted_data: {
      items: [{ name: "Medicine", amount: 350, quantity: 1 }],
      total_amount: 350,
      category: "Medical",
      category_confidence: 0.89,
      payment_mode: "cash",
      date: "2024-11-15",
      notes: "For cold"
    },
    model_used: "gemini-2.0-flash",
    word_count: 5,
    audio_duration_ms: 2300,
    language_detected: "english"
  }
];

const ProductionInsights = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState('all');
  const [intentFilter, setIntentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter options
  const dateOptions = [
    { value: 'all', label: 'All Dates (Nov 7 - Dec 22)' },
    { value: 'nov', label: 'November 2025' },
    { value: 'dec', label: 'December 2025' },
    { value: 'week1', label: 'Nov 7-13 (Week 1)' },
    { value: 'week2', label: 'Nov 14-20 (Week 2)' },
    { value: 'week3', label: 'Nov 21-27 (Week 3)' },
    { value: 'week4', label: 'Nov 28 - Dec 4 (Week 4)' },
    { value: 'week5', label: 'Dec 5-11 (Week 5)' },
    { value: 'week6', label: 'Dec 12-18 (Week 6)' },
    { value: 'week7', label: 'Dec 19-22 (Week 7)' },
  ];

  const intentOptions = [
    { value: 'all', label: 'All Intents' },
    { value: 'expense', label: 'Expense (67.2%)' },
    { value: 'other', label: 'Other (30%)' },
    { value: 'unknown', label: 'Unknown (2.8%)' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'T2I Completed (86.8%)' },
    { value: 'invoice', label: 'Invoice Ready (10.4%)' },
    { value: 'failed', label: 'Failed (2.8%)' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'food', label: 'Food' },
    { value: 'fuel', label: 'Fuel' },
    { value: 'transport', label: 'Transport' },
    { value: 'salary', label: 'Salary' },
    { value: 'utilities', label: 'Utilities' },
  ];

  const resetFilters = () => {
    setDateFilter('all');
    setIntentFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const hasActiveFilters = dateFilter !== 'all' || intentFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Insights</h1>
          <p className="text-gray-600">VAANI voice-to-invoice production data analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Data: {dataSnapshot.dateRange}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
            <Info className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">
              Last Updated: {dataSnapshot.endDate}
            </span>
          </div>
        </div>
      </div>

      {/* Text Insights Section */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Key Insights at a Glance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {textInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'critical' ? 'bg-red-50 border-red-500' :
                  insight.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                  insight.type === 'success' ? 'bg-green-50 border-green-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'critical' ? 'bg-red-100' :
                    insight.type === 'warning' ? 'bg-orange-100' :
                    insight.type === 'success' ? 'bg-green-100' :
                    'bg-blue-100'
                  }`}>
                    {insight.icon === 'AlertCircle' && <AlertCircle className={`w-4 h-4 ${insight.type === 'critical' ? 'text-red-600' : 'text-gray-600'}`} />}
                    {insight.icon === 'TrendingDown' && <TrendingDown className="w-4 h-4 text-orange-600" />}
                    {insight.icon === 'TrendingUp' && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {insight.icon === 'Target' && <Target className="w-4 h-4 text-blue-600" />}
                    {insight.icon === 'Lightbulb' && <Lightbulb className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{insight.title}</h4>
                      <span className={`text-lg font-bold ${
                        insight.type === 'critical' ? 'text-red-600' :
                        insight.type === 'warning' ? 'text-orange-600' :
                        insight.type === 'success' ? 'text-green-600' :
                        'text-blue-600'
                      }`}>
                        {insight.metric}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={intentFilter} onValueChange={setIntentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Intent" />
              </SelectTrigger>
              <SelectContent>
                {intentOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            )}

            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-auto">
                Filters Active - Showing subset of data
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <TooltipProvider>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <UITooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <span className="text-xs text-gray-500">Total Records</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dataSnapshot.totalRecords.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium">Total Records</p>
              <p className="text-sm text-gray-500">Total number of voice interactions processed by VAANI during this period. Each record represents one voice input from a user.</p>
            </TooltipContent>
          </UITooltip>

          <UITooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-gray-500">Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dataSnapshot.uniqueSessions.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium">Unique Sessions</p>
              <p className="text-sm text-gray-500">Number of distinct conversation sessions. A session may contain multiple voice interactions as users complete their expense entry.</p>
            </TooltipContent>
          </UITooltip>

          <UITooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-purple-500" />
                    <span className="text-xs text-gray-500">Items Tracked</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dataSnapshot.totalItems.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium">Items Tracked</p>
              <p className="text-sm text-gray-500">Total individual expense items extracted from voice inputs. One voice input can contain multiple items (e.g., "chai and samosa 140 rupees" = 2 items).</p>
            </TooltipContent>
          </UITooltip>

          <UITooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-yellow-500" />
                    <span className="text-xs text-gray-500">Total Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {(dataSnapshot.totalAmount / 100000).toFixed(1)}L
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium">Total Amount Tracked</p>
              <p className="text-sm text-gray-500">Sum of all expense amounts recorded through voice inputs. Displayed in Lakhs (L). Actual value: ₹{dataSnapshot.totalAmount.toLocaleString()}</p>
            </TooltipContent>
          </UITooltip>

          <UITooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-gray-500">Success Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">98%</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium">Processing Success Rate</p>
              <p className="text-sm text-gray-500">Percentage of voice inputs successfully processed (T2I_COMPLETED + INVOICE_READY). Excludes failed transcriptions due to empty audio or system errors.</p>
            </TooltipContent>
          </UITooltip>

          <UITooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-500" />
                    <span className="text-xs text-gray-500">Expense Intent</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">68%</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium">Expense Intent Rate</p>
              <p className="text-sm text-gray-500">Percentage of voice inputs classified as expense-related. Remaining 32% are "other" intents like greetings, questions, or unrelated speech.</p>
            </TooltipContent>
          </UITooltip>
        </div>
      </TooltipProvider>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap justify-start gap-1 h-auto p-1 bg-muted/50 md:grid md:w-full md:grid-cols-7">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="funnel" className="text-xs sm:text-sm">Funnel</TabsTrigger>
          <TabsTrigger value="other-intent" className="text-xs sm:text-sm">Other Intent</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">Categories</TabsTrigger>
          <TabsTrigger value="items" className="text-xs sm:text-sm">Top Items</TabsTrigger>
          <TabsTrigger value="samples" className="text-xs sm:text-sm">Samples</TabsTrigger>
          <TabsTrigger value="raw-data" className="text-xs sm:text-sm">Raw Data</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Daily Voice Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <ChartTooltip />
                    <Area
                      type="monotone"
                      dataKey="records"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name="Requests"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Intent Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  Intent Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={intentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {intentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {intentData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Processing Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${percentage}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-yellow-500" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${percentage}%`}
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {paymentData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funnel Tab */}
        <TabsContent value="funnel" className="space-y-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-500" />
                Conversion Funnel
              </CardTitle>
              <p className="text-sm text-gray-500">
                User journey from voice input to invoice creation (Nov 7 - Dec 22, 2025)
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                {funnelData.map((stage, index) => (
                  <div key={stage.name} className="w-full">
                    <div
                      className="relative mx-auto rounded-lg p-4 text-center text-white font-medium transition-all"
                      style={{
                        backgroundColor: stage.fill,
                        width: `${Math.max(30, stage.percentage)}%`,
                        minWidth: '200px',
                      }}
                    >
                      <div className="text-lg font-bold">{stage.value.toLocaleString()}</div>
                      <div className="text-sm opacity-90">{stage.name}</div>
                      <div className="text-xs opacity-75">{stage.percentage}%</div>
                    </div>
                    {index < funnelData.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Drop-off Analysis */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h3 className="font-semibold text-red-800">Drop-off Point 1</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-900">32.8%</p>
                    <p className="text-sm text-red-700">No expense intent detected</p>
                    <p className="text-xs text-red-600 mt-1">~6,412 requests: greetings, questions, or testing</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <h3 className="font-semibold text-orange-800">Drop-off Point 2</h3>
                    </div>
                    <p className="text-2xl font-bold text-orange-900">84.5%</p>
                    <p className="text-sm text-orange-700">Intent detected but not completed</p>
                    <p className="text-xs text-orange-600 mt-1">~11,085 expense requests not converted to invoices</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* The YES Problem */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                The "YES" Problem - Critical Issue
              </CardTitle>
              <p className="text-sm text-gray-500">
                Users responding with "yes/okay" instead of actual expense information
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Messages */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">First Messages (When Users Start)</h4>
                  <div className="space-y-2">
                    {yesProblemData.firstMessage.map((item) => (
                      <div key={item.response} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-600">{item.response}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center justify-end px-2 text-xs text-white font-medium"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                          >
                            {item.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-red-600 mt-3 font-medium">
                    67% are useless responses!
                  </p>
                </div>

                {/* Follow-up Messages */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Follow-up Messages (Answering VAANI)</h4>
                  <div className="space-y-2">
                    {yesProblemData.followUp.map((item) => (
                      <div key={item.response} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-600">{item.response}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center justify-end px-2 text-xs text-white font-medium"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                          >
                            {item.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-red-600 mt-3 font-medium">
                    51.2% are just acknowledgments!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Word Count Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                Word Count Distribution
              </CardTitle>
              <p className="text-sm text-gray-500">
                79% of users speak 5 words or less
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={wordCountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="words" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip formatter={(value) => value.toLocaleString()} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {wordCountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Worst/Best Questions */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Worst Performing Question</h4>
                    <p className="text-sm text-gray-700 italic mb-2">
                      "What did you spend money on today?"
                    </p>
                    <p className="text-lg font-bold text-red-600">73% say "yes"</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Best Performing Question</h4>
                    <p className="text-sm text-gray-700 italic mb-2">
                      "Would you like to add another item?"
                    </p>
                    <p className="text-lg font-bold text-green-600">85% success rate</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Projected Impact */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Projected Impact with Fixes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Fix Level</th>
                      <th className="text-center py-2 px-3">Success Rate</th>
                      <th className="text-center py-2 px-3">Invoices</th>
                      <th className="text-center py-2 px-3">Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-gray-50">
                      <td className="py-2 px-3">Current</td>
                      <td className="text-center py-2 px-3">10.4%</td>
                      <td className="text-center py-2 px-3">2,029</td>
                      <td className="text-center py-2 px-3">Baseline</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3">Priority 1-2 (Examples + Better Questions)</td>
                      <td className="text-center py-2 px-3 text-green-600 font-medium">25-30%</td>
                      <td className="text-center py-2 px-3">~5,000</td>
                      <td className="text-center py-2 px-3 text-green-600 font-medium">2.5x</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3">Priority 1-3 (Add Validation)</td>
                      <td className="text-center py-2 px-3 text-green-600 font-medium">35-40%</td>
                      <td className="text-center py-2 px-3">~7,000</td>
                      <td className="text-center py-2 px-3 text-green-600 font-medium">3.5x</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">All Fixes (Priority 1-6)</td>
                      <td className="text-center py-2 px-3 text-green-600 font-bold">45-55%</td>
                      <td className="text-center py-2 px-3">~10,000</td>
                      <td className="text-center py-2 px-3 text-green-600 font-bold">5x</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Intent Analysis Tab */}
        <TabsContent value="other-intent" className="space-y-6">
          {/* Key Metric: Expense Conversion */}
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                Critical Metric: Expense → Invoice Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <p className="text-3xl font-bold text-purple-600">{expenseConversionData.totalExpenseIntent.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Expense Intent Sessions</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <p className="text-3xl font-bold text-green-600">{expenseConversionData.invoicesCreated.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Invoices Created</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-red-200">
                  <p className="text-3xl font-bold text-red-600">{expenseConversionData.conversionRate}%</p>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-red-200">
                  <p className="text-3xl font-bold text-red-600">{expenseConversionData.lostSessions.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Lost Sessions ({expenseConversionData.lostPercentage}%)</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-red-700 font-medium">
                85.3% of users who expressed expense intent did NOT complete an invoice. This is the primary problem to solve.
              </p>
            </CardContent>
          </Card>

          {/* Other Intent Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                "Other" Intent Breakdown ({(5860).toLocaleString()} records)
              </CardTitle>
              <p className="text-sm text-gray-500">
                What are users saying when NOT creating expenses?
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {otherIntentBreakdown.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm text-gray-500">{item.count.toLocaleString()} ({item.percentage}%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full rounded-full flex items-center justify-end px-2"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        >
                          {item.percentage > 10 && (
                            <span className="text-xs text-white font-medium">{item.percentage}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sample Transcriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-500" />
                Sample "Other" Intent Transcriptions
              </CardTitle>
              <p className="text-sm text-gray-500">
                Real examples of what users said that was classified as "other"
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {otherIntentSamples.map((sample, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border-l-4"
                    style={{ borderColor: otherIntentBreakdown.find(b => b.category.includes(sample.category))?.color || '#6B7280' }}
                  >
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">"{sample.text}"</p>
                      <p className="text-xs text-gray-500 mt-1">{sample.issue}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {sample.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights & Recommendations */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Key Insights from "Other" Intent Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold text-red-700 mb-2">Problem: Yes/Okay Responses (36.7%)</h4>
                  <p className="text-sm text-gray-600">
                    Users are responding to follow-up questions with "yes" or "okay" instead of providing the requested information.
                    The system asks "What did you spend on?" and users say "yes" instead of "petrol 500 rupees".
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold text-orange-700 mb-2">Problem: Greetings/Chat (17.1%)</h4>
                  <p className="text-sm text-gray-600">
                    Users treat VAANI like a general chatbot. They say "hello" or have random conversations
                    instead of giving expense commands directly.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold text-blue-700 mb-2">Problem: Questions (6.2%)</h4>
                  <p className="text-sm text-gray-600">
                    Users ask "what happened?" or "how do I use this?" instead of creating expenses.
                    Better onboarding or examples could help.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold text-purple-700 mb-2">Problem: Single Words (8.3%)</h4>
                  <p className="text-sm text-gray-600">
                    Users say just "expenses" or "vani" without any actionable information.
                    The system needs to guide them to provide complete expense info.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Expense Categories</CardTitle>
              <p className="text-sm text-gray-500">
                Distribution of expense categories from voice inputs
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                  <ChartTooltip />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-green-800">Top Category</h3>
                <p className="text-2xl font-bold text-green-900 mt-1">Food</p>
                <p className="text-sm text-green-700">1,121 transactions (22.7%)</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-800">Second Largest</h3>
                <p className="text-2xl font-bold text-blue-900 mt-1">Fuel</p>
                <p className="text-sm text-blue-700">835 transactions (petrol/diesel)</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-purple-800">Business Expense</h3>
                <p className="text-2xl font-bold text-purple-900 mt-1">Salary</p>
                <p className="text-sm text-purple-700">698 transactions tracked</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Tracked Items</CardTitle>
              <p className="text-sm text-gray-500">
                Items frequently mentioned in voice expense entries
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis fontSize={12} />
                  <ChartTooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Item Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {topItems.slice(0, 5).map((item, index) => (
              <Card key={item.name}>
                <CardContent className="p-4 text-center">
                  <Badge variant="outline" className="mb-2">#{index + 1}</Badge>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.count} times</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Samples Tab */}
        <TabsContent value="samples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Sample Voice Transcriptions
              </CardTitle>
              <p className="text-sm text-gray-500">
                Examples of voice inputs processed by VAANI
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleTranscriptions.map((sample, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Mic className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">"{sample.text}"</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{sample.intent}</Badge>
                        <Badge variant="outline">{sample.category}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span><strong>14.7% expense → invoice conversion</strong> - Only 1,932 invoices from 13,114 expense intents. 85.3% lost.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>36.7% "yes/okay" problem</strong> - Users respond with acknowledgments instead of expense details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>67.2% expense intent</strong> - Users understand the primary use case; completion is the problem</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Food & Fuel dominate</strong> - Top categories: Food (1,121), Fuel (835), Salary (698)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Cash is king</strong> - 98.1% transactions recorded as cash payments</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Raw Data Tab */}
        <TabsContent value="raw-data" className="space-y-6">
          {/* Info Banner */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Code className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Raw Transaction Data</h3>
                  <p className="text-sm text-blue-700">
                    View extracted JSON data for each transaction including items, amounts, processing time, and model details.
                    Use the filters above to narrow down results. Click on a row to expand full JSON.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                Active Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dateFilter !== 'all' && (
                  <Badge variant="secondary">Date: {dateOptions.find(o => o.value === dateFilter)?.label}</Badge>
                )}
                {intentFilter !== 'all' && (
                  <Badge variant="secondary">Intent: {intentFilter}</Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary">Status: {statusFilter}</Badge>
                )}
                {categoryFilter !== 'all' && (
                  <Badge variant="secondary">Category: {categoryFilter}</Badge>
                )}
                {!hasActiveFilters && (
                  <Badge variant="outline" className="text-gray-500">No filters applied - Showing all data</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats for Filtered Data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {rawTransactionData.filter(txn => {
                    if (intentFilter !== 'all' && txn.intent_detected !== intentFilter) return false;
                    if (statusFilter !== 'all') {
                      const statusMap: Record<string, string> = { completed: 'T2I_COMPLETED', invoice: 'INVOICE_READY', failed: 'FAILED' };
                      if (txn.status !== statusMap[statusFilter]) return false;
                    }
                    if (categoryFilter !== 'all' && txn.extracted_data.category?.toLowerCase() !== categoryFilter) return false;
                    return true;
                  }).length}
                </p>
                <p className="text-xs text-gray-500">Matching Records</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(
                    rawTransactionData.filter(txn => {
                      if (intentFilter !== 'all' && txn.intent_detected !== intentFilter) return false;
                      if (statusFilter !== 'all') {
                        const statusMap: Record<string, string> = { completed: 'T2I_COMPLETED', invoice: 'INVOICE_READY', failed: 'FAILED' };
                        if (txn.status !== statusMap[statusFilter]) return false;
                      }
                      if (categoryFilter !== 'all' && txn.extracted_data.category?.toLowerCase() !== categoryFilter) return false;
                      return true;
                    }).reduce((sum, txn) => sum + txn.processing_time_ms, 0) /
                    Math.max(1, rawTransactionData.filter(txn => {
                      if (intentFilter !== 'all' && txn.intent_detected !== intentFilter) return false;
                      if (statusFilter !== 'all') {
                        const statusMap: Record<string, string> = { completed: 'T2I_COMPLETED', invoice: 'INVOICE_READY', failed: 'FAILED' };
                        if (txn.status !== statusMap[statusFilter]) return false;
                      }
                      if (categoryFilter !== 'all' && txn.extracted_data.category?.toLowerCase() !== categoryFilter) return false;
                      return true;
                    }).length)
                  )}ms
                </p>
                <p className="text-xs text-gray-500">Avg Processing Time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ₹{rawTransactionData.filter(txn => {
                    if (intentFilter !== 'all' && txn.intent_detected !== intentFilter) return false;
                    if (statusFilter !== 'all') {
                      const statusMap: Record<string, string> = { completed: 'T2I_COMPLETED', invoice: 'INVOICE_READY', failed: 'FAILED' };
                      if (txn.status !== statusMap[statusFilter]) return false;
                    }
                    if (categoryFilter !== 'all' && txn.extracted_data.category?.toLowerCase() !== categoryFilter) return false;
                    return true;
                  }).reduce((sum, txn) => sum + txn.extracted_data.total_amount, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Total Amount</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {rawTransactionData.filter(txn => {
                    if (intentFilter !== 'all' && txn.intent_detected !== intentFilter) return false;
                    if (statusFilter !== 'all') {
                      const statusMap: Record<string, string> = { completed: 'T2I_COMPLETED', invoice: 'INVOICE_READY', failed: 'FAILED' };
                      if (txn.status !== statusMap[statusFilter]) return false;
                    }
                    if (categoryFilter !== 'all' && txn.extracted_data.category?.toLowerCase() !== categoryFilter) return false;
                    return true;
                  }).reduce((sum, txn) => sum + txn.extracted_data.items.length, 0)}
                </p>
                <p className="text-xs text-gray-500">Total Items Extracted</p>
              </CardContent>
            </Card>
          </div>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                Transaction JSON Data
              </CardTitle>
              <p className="text-sm text-gray-500">
                Click on any row to expand and view the complete JSON. Use the copy button to copy individual records.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rawTransactionData
                  .filter(txn => {
                    if (intentFilter !== 'all' && txn.intent_detected !== intentFilter) return false;
                    if (statusFilter !== 'all') {
                      const statusMap: Record<string, string> = { completed: 'T2I_COMPLETED', invoice: 'INVOICE_READY', failed: 'FAILED' };
                      if (txn.status !== statusMap[statusFilter]) return false;
                    }
                    if (categoryFilter !== 'all' && txn.extracted_data.category?.toLowerCase() !== categoryFilter) return false;
                    return true;
                  })
                  .map((txn) => {
                    const isExpanded = expandedRows.has(txn.id);
                    return (
                      <div
                        key={txn.id}
                        className={`border rounded-lg overflow-hidden ${
                          txn.status === 'INVOICE_READY' ? 'border-green-200' :
                          txn.status === 'FAILED' ? 'border-red-200' : 'border-gray-200'
                        }`}
                      >
                        {/* Row Header */}
                        <div
                          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${
                            txn.status === 'INVOICE_READY' ? 'bg-green-50' :
                            txn.status === 'FAILED' ? 'bg-red-50' : 'bg-gray-50'
                          }`}
                          onClick={() => {
                            const newSet = new Set(expandedRows);
                            if (isExpanded) {
                              newSet.delete(txn.id);
                            } else {
                              newSet.add(txn.id);
                            }
                            setExpandedRows(newSet);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <code className="text-xs text-gray-500">{txn.id}</code>
                                <Badge variant={
                                  txn.status === 'INVOICE_READY' ? 'default' :
                                  txn.status === 'FAILED' ? 'destructive' : 'secondary'
                                } className="text-xs">
                                  {txn.status}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {txn.intent_detected}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                "{txn.transcription || '(empty)'}"
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <div className="flex items-center gap-2 text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{txn.processing_time_ms}ms</span>
                              </div>
                              {txn.extracted_data.total_amount > 0 && (
                                <div className="text-green-600 font-medium">
                                  ₹{txn.extracted_data.total_amount.toLocaleString()}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(JSON.stringify(txn, null, 2));
                                setCopiedId(txn.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="p-2 rounded hover:bg-gray-200 transition-colors"
                            >
                              {copiedId === txn.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded JSON View */}
                        {isExpanded && (
                          <div className="border-t bg-gray-900 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-400">Full JSON Data</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(JSON.stringify(txn, null, 2));
                                  setCopiedId(txn.id + '-full');
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                              >
                                {copiedId === txn.id + '-full' ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    Copy JSON
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="text-xs text-green-400 overflow-x-auto">
                              {JSON.stringify(txn, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {rawTransactionData.filter(txn => {
                  if (intentFilter !== 'all' && txn.intent_detected !== intentFilter) return false;
                  if (statusFilter !== 'all') {
                    const statusMap: Record<string, string> = { completed: 'T2I_COMPLETED', invoice: 'INVOICE_READY', failed: 'FAILED' };
                    if (txn.status !== statusMap[statusFilter]) return false;
                  }
                  if (categoryFilter !== 'all' && txn.extracted_data.category?.toLowerCase() !== categoryFilter) return false;
                  return true;
                }).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions match the current filters</p>
                    <Button variant="link" onClick={resetFilters}>Reset Filters</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Copy All Filtered Data */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Export Filtered Data</h3>
                  <p className="text-sm text-gray-600">Copy all filtered transactions as JSON for external analysis</p>
                </div>
                <Button
                  onClick={() => {
                    const filteredData = rawTransactionData.filter(txn => {
                      if (intentFilter !== 'all' && txn.intent_detected !== intentFilter) return false;
                      if (statusFilter !== 'all') {
                        const statusMap: Record<string, string> = { completed: 'T2I_COMPLETED', invoice: 'INVOICE_READY', failed: 'FAILED' };
                        if (txn.status !== statusMap[statusFilter]) return false;
                      }
                      if (categoryFilter !== 'all' && txn.extracted_data.category?.toLowerCase() !== categoryFilter) return false;
                      return true;
                    });
                    navigator.clipboard.writeText(JSON.stringify(filteredData, null, 2));
                    setCopiedId('all');
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="flex items-center gap-2"
                >
                  {copiedId === 'all' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy All as JSON
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionInsights;
