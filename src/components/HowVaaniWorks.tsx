/**
 * HowVaaniWorks.tsx
 *
 * Educational page explaining how Vaani voice assistant works.
 * Features:
 * - Overview of Vaani capabilities
 * - Desktop app user flow
 * - Mobile app user flow (roadmap)
 * - Step-by-step guides
 * - Interactive flow diagrams
 *
 * @author Vyapar Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mic,
  Monitor,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Settings,
  MessageSquare,
  Zap,
  Globe,
  Clock,
  Shield,
  Volume2,
  FileText,
  Search,
  ChevronRight,
  Lightbulb,
  Target,
  Users,
  Sparkles,
  Play,
  HelpCircle
} from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface FlowStep {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details?: string[];
}

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const VAANI_CAPABILITIES: FeatureCard[] = [
  {
    title: 'Voice-to-Transaction',
    description: 'Create expenses, sales, purchases, and payments by speaking naturally',
    icon: <Mic className="w-6 h-6" />,
    color: 'blue',
  },
  {
    title: 'Multi-Language Support',
    description: '10 Indian languages for speaking, with Hinglish support',
    icon: <Globe className="w-6 h-6" />,
    color: 'green',
  },
  {
    title: 'Voice Queries',
    description: 'Ask questions about your business data and get instant answers',
    icon: <Search className="w-6 h-6" />,
    color: 'purple',
  },
  {
    title: '3x Faster Entry',
    description: 'Voice input is 3x faster than typing for Indian MSME users',
    icon: <Zap className="w-6 h-6" />,
    color: 'yellow',
  },
];

const SUPPORTED_LANGUAGES = [
  { name: 'Hindi', native: 'हिंदी' },
  { name: 'English', native: 'English' },
  { name: 'Tamil', native: 'தமிழ்' },
  { name: 'Telugu', native: 'తెలుగు' },
  { name: 'Bengali', native: 'বাংলা' },
  { name: 'Marathi', native: 'मराठी' },
  { name: 'Gujarati', native: 'ગુજરાતી' },
  { name: 'Kannada', native: 'ಕನ್ನಡ' },
  { name: 'Malayalam', native: 'മലയാളം' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

const DESKTOP_SETUP_FLOW: FlowStep[] = [
  {
    step: 1,
    title: 'Launch Vyapar App',
    description: 'Open the Vyapar desktop app with VAANI enabled',
    icon: <Monitor className="w-5 h-5" />,
    details: ['VAANI introduction screen appears', 'Click "Enable VAANI" to proceed'],
  },
  {
    step: 2,
    title: 'Grant Microphone Permission',
    description: 'Allow Vyapar to access your microphone',
    icon: <Mic className="w-5 h-5" />,
    details: ['Windows/Mac system permission dialog', 'Click Allow to continue'],
  },
  {
    step: 3,
    title: 'Test Microphone',
    description: 'Verify your microphone is working correctly',
    icon: <Volume2 className="w-5 h-5" />,
    details: ['Say something like "Chai 50 rupees"', 'Sound level bars animate when detected'],
  },
  {
    step: 4,
    title: 'Select Language',
    description: 'Choose your preferred speaking language',
    icon: <Globe className="w-5 h-5" />,
    details: ['10 Indian languages available', 'VAANI responds in English (more coming soon)'],
  },
  {
    step: 5,
    title: 'Complete Onboarding',
    description: 'Quick 3-slide tutorial on VAANI features',
    icon: <CheckCircle className="w-5 h-5" />,
    details: ['Learn about voice transactions', 'Learn about voice queries', 'Start using VAANI'],
  },
];

const CREATE_MODE_FLOW: FlowStep[] = [
  {
    step: 1,
    title: 'Open Voice Modal',
    description: 'Click the floating mic button or press Ctrl+V',
    icon: <Mic className="w-5 h-5" />,
    details: ['Orange mic button at bottom-right', 'Modal opens in Create mode by default'],
  },
  {
    step: 2,
    title: 'Speak Your Transaction',
    description: 'Say your transaction naturally in your language',
    icon: <MessageSquare className="w-5 h-5" />,
    details: ['"Chai samosa 140 rupees"', '"Sale to Ramesh, rice 5 kg, 250 rupees"', 'Real-time transcription appears'],
  },
  {
    step: 3,
    title: 'AI Processing',
    description: 'VAANI extracts transaction details automatically',
    icon: <Sparkles className="w-5 h-5" />,
    details: ['Intent detection (expense/sale/etc)', 'Entity extraction (item, amount, party)', 'Category suggestion from database'],
  },
  {
    step: 4,
    title: 'Answer Clarifying Questions',
    description: 'If needed, VAANI asks for missing information',
    icon: <HelpCircle className="w-5 h-5" />,
    details: ['"When did you spend this?"', '"Which payment method?"', 'Smart defaults applied when possible'],
  },
  {
    step: 5,
    title: 'Review & Save',
    description: 'Form is pre-filled, review and save the transaction',
    icon: <CheckCircle className="w-5 h-5" />,
    details: ['All fields auto-populated', 'Edit if needed before saving', 'Transaction saved to your books'],
  },
];

const FIND_MODE_FLOW: FlowStep[] = [
  {
    step: 1,
    title: 'Switch to Find Mode',
    description: 'Click the "Find" tab in the voice modal',
    icon: <Search className="w-5 h-5" />,
  },
  {
    step: 2,
    title: 'Ask Your Question',
    description: 'Query your business data naturally',
    icon: <MessageSquare className="w-5 h-5" />,
    details: ['"What were my sales yesterday?"', '"How much did I spend on fuel this month?"', '"Who owes me money?"'],
  },
  {
    step: 3,
    title: 'Get Instant Answers',
    description: 'VAANI retrieves and displays the information',
    icon: <FileText className="w-5 h-5" />,
    details: ['Charts and visualizations', 'Detailed breakdowns', 'Export options'],
  },
];

const TRANSACTION_EXAMPLES = [
  { type: 'Expense', example: '"Petrol 500 rupees, chai 50 rupees"', result: 'Creates 2 expense entries' },
  { type: 'Sale', example: '"Sale to Sharma ji, rice 10 kg at 60 rupees"', result: 'Creates sale with party and items' },
  { type: 'Payment In', example: '"Received 5000 from Ramesh"', result: 'Records incoming payment' },
  { type: 'Payment Out', example: '"Paid 3000 to Kumar"', result: 'Records outgoing payment' },
  { type: 'Purchase', example: '"Purchased 20 kg sugar from Wholesaler, 800 rupees"', result: 'Creates purchase entry' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const HowVaaniWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------

  const renderFeatureCard = (feature: FeatureCard, index: number) => {
    const colorClasses: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    };

    return (
      <Card key={index} className={`border-2 ${colorClasses[feature.color].split(' ').slice(1, 2).join(' ')}`}>
        <CardContent className="p-6">
          <div className={`w-12 h-12 rounded-xl ${colorClasses[feature.color].split(' ').slice(0, 1).join(' ')} flex items-center justify-center mb-4`}>
            <span className={colorClasses[feature.color].split(' ').slice(2).join(' ')}>{feature.icon}</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </CardContent>
      </Card>
    );
  };

  const renderFlowStep = (step: FlowStep, isLast: boolean) => (
    <div key={step.step} className="flex gap-4">
      {/* Step Number and Line */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
          {step.step}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-blue-200 my-2" />}
      </div>

      {/* Step Content */}
      <div className={`flex-1 ${!isLast ? 'pb-6' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          {step.icon}
          <h4 className="font-semibold text-gray-900">{step.title}</h4>
        </div>
        <p className="text-gray-600 mb-2">{step.description}</p>
        {step.details && (
          <ul className="space-y-1">
            {step.details.map((detail, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                <ChevronRight className="w-3 h-3" />
                {detail}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">How Vaani Works</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          VAANI (Voice-Activated Accounting & Navigation Interface) is your intelligent voice assistant
          for managing business transactions in your own language.
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="desktop" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Desktop</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Mobile</span>
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Examples</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 mt-6">
          {/* What is VAANI */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <Mic className="w-12 h-12 text-blue-600" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">What is VAANI?</h2>
                  <p className="text-gray-700">
                    VAANI enables every Indian business owner to run their business in their own voice,
                    in their own language, without barriers. Create transactions, ask questions, and
                    navigate the app — all by speaking naturally.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Capabilities */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {VAANI_CAPABILITIES.map(renderFeatureCard)}
            </div>
          </div>

          {/* Two Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Mic className="w-5 h-5" />
                  Create Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-600 mb-4">
                  Speak to create transactions. Just say what you bought, sold, or paid.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Expenses, Sales, Purchases</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Payments In & Out</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Multiple items in one command</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Search className="w-5 h-5" />
                  Find Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-600 mb-4">
                  Ask questions about your business data and get instant answers.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>"What were my sales yesterday?"</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>"Who owes me money?"</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>"Show expenses this month"</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supported Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Supported Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Speak in any of these 10 Indian languages. VAANI responds in English (more languages coming soon).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {SUPPORTED_LANGUAGES.map((lang, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded-lg text-center border border-gray-200"
                  >
                    <span className="font-medium text-gray-900">{lang.native}</span>
                    <p className="text-xs text-gray-500 mt-1">{lang.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Desktop Tab */}
        <TabsContent value="desktop" className="space-y-8 mt-6">
          {/* First-Time Setup */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  First-Time Setup
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800">Desktop App</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-0">
                {DESKTOP_SETUP_FLOW.map((step, idx) =>
                  renderFlowStep(step, idx === DESKTOP_SETUP_FLOW.length - 1)
                )}
              </div>
            </CardContent>
          </Card>

          {/* Create Mode Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-green-600" />
                Create Mode - Voice to Transaction
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-0">
                {CREATE_MODE_FLOW.map((step, idx) =>
                  renderFlowStep(step, idx === CREATE_MODE_FLOW.length - 1)
                )}
              </div>
            </CardContent>
          </Card>

          {/* Find Mode Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-600" />
                Find Mode - Voice Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-0">
                {FIND_MODE_FLOW.map((step, idx) =>
                  renderFlowStep(step, idx === FIND_MODE_FLOW.length - 1)
                )}
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span>Open VAANI</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">Ctrl + V</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span>Push to Talk</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">Space (hold)</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span>Close Modal</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">ESC</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span>Minimize</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">Ctrl + M</kbd>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Tab */}
        <TabsContent value="mobile" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Smartphone className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">Mobile App</h2>
                    <Badge className="bg-orange-100 text-orange-800">Coming Q1 2025</Badge>
                  </div>
                  <p className="text-gray-600 mt-1">
                    VAANI for mobile is currently in development and will launch in Q1 2025.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Planned Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Native iOS & Android voice input</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Background voice processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Push notifications for responses</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Offline mode with sync</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Widget for quick voice entry</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mobile-Specific UX</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span>Floating action button for voice</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mic className="w-5 h-5 text-blue-600" />
                  <span>Long-press to activate voice</span>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <span>Voice feedback for hands-free use</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Biometric unlock for voice access</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Transaction Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {TRANSACTION_EXAMPLES.map((ex, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{ex.type}</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">"{ex.example}"</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                      <div className="text-sm text-gray-600 sm:text-right">
                        {ex.result}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Multi-turn Conversation Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                Multi-turn Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 p-3 bg-blue-50 rounded-lg rounded-tl-none">
                    <p className="font-medium">"Petrol 500"</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 p-3 bg-purple-50 rounded-lg rounded-tl-none">
                    <p className="font-medium text-purple-900">VAANI: "When did you spend this?"</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 p-3 bg-blue-50 rounded-lg rounded-tl-none">
                    <p className="font-medium">"Yesterday"</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 p-3 bg-green-50 rounded-lg rounded-tl-none">
                    <p className="font-medium text-green-900">VAANI: "Got it! Filling the expense form."</p>
                    <p className="text-sm text-green-700 mt-1">Form auto-populated with: Petrol, ₹500, Yesterday, Cash</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Find Mode Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-green-600" />
                Find Mode Query Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'What were my total sales yesterday?',
                  'How much did I spend on fuel this month?',
                  'Who owes me money?',
                  'Show all payments from Ramesh',
                  'What is my profit this week?',
                  'List expenses above 1000 rupees',
                ].map((query, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">"{query}"</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HowVaaniWorks;
