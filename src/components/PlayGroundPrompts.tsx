import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, CheckCircle, XCircle, Bug, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

// Debug log interface
interface DebugLog {
  timestamp: string;
  type: 'info' | 'request' | 'response' | 'error';
  message: string;
  data?: any;
}

// System prompts for each transaction type
const systemPrompts: Record<string, string> = {
  expense: `Extract expense information from user input. Return ONLY valid JSON.

RULES:
- item_name: The item or service purchased
- item_amount: Total cost as a number
- item_qty: Quantity (default 1)
- expense_category: Category like food, fuel, transport, salary, utilities
- payment_type: How they paid (default "cash")

RESPONSE FORMAT:
{
  "expense_category": "category",
  "items": [{"item_name": "name", "item_amount": amount, "item_qty": qty}],
  "payment_type": "cash"
}`,

  sale_invoice: `Extract sale invoice information from user input. Return ONLY valid JSON.

RULES:
- party_name: Customer name if mentioned
- items: Array of items sold with name, amount, quantity
- payment_status: "paid" or "credit"
- gst_applicable: true if GST mentioned

RESPONSE FORMAT:
{
  "party_name": "customer name or null",
  "items": [{"item_name": "name", "item_amount": amount, "item_qty": qty}],
  "payment_status": "paid",
  "gst_applicable": false
}`,

  payment_in: `Extract payment received information from user input. Return ONLY valid JSON.

RULES:
- party_name: Who paid
- amount: Amount received
- payment_type: How they paid (cash, upi, bank, etc.)
- description: Any notes

RESPONSE FORMAT:
{
  "party_name": "name",
  "amount": number,
  "payment_type": "cash",
  "description": "optional notes"
}`,

  payment_out: `Extract payment made information from user input. Return ONLY valid JSON.

RULES:
- party_name: Who was paid
- amount: Amount paid
- payment_type: How it was paid (cash, upi, bank, etc.)
- description: Any notes

RESPONSE FORMAT:
{
  "party_name": "name",
  "amount": number,
  "payment_type": "cash",
  "description": "optional notes"
}`
};

// Sample user inputs for each transaction type - longer, realistic examples
const sampleInputs: Record<string, string[]> = {
  expense: [
    'Petrol 500 rupees, chai samosa 140 rupees, and parking 50 rupees - all transport expenses',
    'Bought office supplies - 2 reams paper 400, printer ink 1200, and stapler 150 from stationery shop',
    'Paid salary to Ram 25000, Shyam 18000, and helper boy 8000 for this month',
    'Electricity bill 2500, water bill 800, and internet bill 1200 for shop',
    'Purchased vegetables for canteen - tomato 5kg 200, onion 10kg 350, potato 8kg 240, and oil 5 liters 750'
  ],
  sale_invoice: [
    'Sold to Sharma ji - basmati rice 25kg at 80 per kg, wheat flour 10kg at 45 per kg, and sugar 5kg at 50 per kg, paid by UPI',
    'Invoice for Gupta Traders - 50 packets biscuits at 25 each, 30 bottles cold drink at 40 each, 20 chips packets at 20 each on credit',
    'Billed Ramesh Kirana Store - toor dal 20kg at 140 per kg, moong dal 15kg at 120 per kg, chana dal 10kg at 90 per kg, half payment received',
    'Sold 100 notebooks at 35 each, 50 pens at 10 each, 25 geometry boxes at 80 each to ABC School with GST'
  ],
  payment_in: [
    'Received 15000 from Sharma ji against last month pending bill, paid via Google Pay',
    'Cash payment 8500 from Ramesh for partial bill settlement, remaining 3500 still pending',
    'Bank transfer of 45000 received from XYZ Distributors for invoice number 234',
    'Collected cheque of 25000 from Gupta ji, 12000 from Verma ji, and 8000 cash from Mehta ji today'
  ],
  payment_out: [
    'Paid 35000 to ABC Wholesalers for last week stock, transferred via NEFT',
    'Gave advance 10000 to carpenter for new shop furniture, remaining 15000 after completion',
    'Settled pending dues - 8000 to electrician, 5000 to plumber, and 3500 to painter',
    'Monthly rent 25000 paid to landlord via cheque, plus 2000 maintenance charges in cash'
  ]
};

const availableModels = [
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
  { id: 'gpt-4o-mini', name: 'GPT-4O Mini' },
];

const PlaygroundPrompts = () => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userInput, setUserInput] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash-lite');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [copiedDebug, setCopiedDebug] = useState(false);

  const addDebugLog = (type: DebugLog['type'], message: string, data?: any) => {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data
    };
    console.log(`[${type.toUpperCase()}] ${message}`, data || '');
    setDebugLogs(prev => [...prev, log]);
  };

  const clearDebugLogs = () => {
    setDebugLogs([]);
  };

  const copyDebugLogs = () => {
    const logsText = debugLogs.map(log =>
      `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}\n${log.data ? JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n');
    navigator.clipboard.writeText(logsText);
    setCopiedDebug(true);
    setTimeout(() => setCopiedDebug(false), 2000);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setSystemPrompt(systemPrompts[type]);
    setUserInput('');
    setResponse(null);
    setError(null);
  };

  const handleSampleSelect = (sample: string) => {
    setUserInput(sample);
    setResponse(null);
    setError(null);
  };

  const handleRun = async () => {
    if (!systemPrompt.trim() || !userInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);
    clearDebugLogs();

    const apiUrl = 'https://analytics-staging.vyaparapp.in/api/ps/extract-json-alt';
    const authToken = localStorage.getItem('authToken');
    const requestBody = {
      modelName: selectedModel,
      sys_prompt: systemPrompt.trim(),
      text: userInput.trim()
    };

    // Log request details
    addDebugLog('info', 'Starting API request...');
    addDebugLog('request', 'API URL', { url: apiUrl });
    addDebugLog('request', 'Request Method', { method: 'POST' });
    addDebugLog('request', 'Auth Token Present', { hasToken: !!authToken, tokenLength: authToken?.length || 0 });
    addDebugLog('request', 'Request Headers', {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken.substring(0, 20)}...` : 'NO TOKEN'
    });
    addDebugLog('request', 'Request Body', requestBody);

    try {
      const startTime = performance.now();

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(requestBody)
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      addDebugLog('response', 'Response received', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        duration: `${duration}ms`,
        headers: {
          'content-type': res.headers.get('content-type'),
          'content-length': res.headers.get('content-length')
        }
      });

      if (!res.ok) {
        // Try to get error body
        let errorBody = null;
        try {
          errorBody = await res.text();
          addDebugLog('error', 'Error response body', { body: errorBody });
        } catch (e) {
          addDebugLog('error', 'Could not read error body', { error: String(e) });
        }

        const errorMessage = `API error: ${res.status} ${res.statusText}`;
        addDebugLog('error', errorMessage, {
          status: res.status,
          statusText: res.statusText,
          url: apiUrl,
          possibleCauses: res.status === 404
            ? ['Endpoint does not exist', 'Wrong URL path', 'API route not configured on server']
            : res.status === 401
            ? ['Invalid or expired auth token', 'Token not present']
            : res.status === 500
            ? ['Server error', 'Backend exception']
            : ['Unknown error']
        });

        setShowDebugPanel(true); // Auto-show debug panel on error
        throw new Error(errorMessage);
      }

      const data = await res.json();
      addDebugLog('response', 'Response data parsed successfully', data);
      setResponse(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      addDebugLog('error', 'Request failed', {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(errorMessage);
      setShowDebugPanel(true); // Auto-show debug panel on error
    } finally {
      setIsLoading(false);
      addDebugLog('info', 'Request completed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prompt Playground</h1>
        <p className="text-gray-600">Test system prompts with different inputs</p>
      </div>

      {/* Transaction Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Transaction Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.keys(systemPrompts).map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                onClick={() => handleTypeSelect(type)}
                className="capitalize"
              >
                {type.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            System Prompt
            {selectedType && (
              <Badge variant="secondary" className="capitalize">
                {selectedType.replace('_', ' ')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Select a transaction type above or enter your custom system prompt..."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* User Input - Only show when transaction type is selected */}
      {selectedType ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sample Inputs with Tooltips */}
            {sampleInputs[selectedType] && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Sample inputs (hover to see full text):</p>
                <div className="flex flex-wrap gap-2">
                  {sampleInputs[selectedType].map((sample, idx) => (
                    <div key={idx} className="relative group">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSampleSelect(sample)}
                        className="text-xs max-w-[200px] truncate"
                        title={sample}
                      >
                        {sample.length > 35 ? `${sample.substring(0, 35)}...` : sample}
                      </Button>
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 w-80 max-w-sm">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                          {sample}
                          <div className="absolute top-full left-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Textarea
              placeholder="Enter user input or select a sample above..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={4}
            />

            {/* Model Selection & Run */}
            <div className="flex items-center gap-4">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>

              <Button
                onClick={handleRun}
                disabled={!systemPrompt.trim() || !userInput.trim() || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isLoading ? 'Running...' : 'Run'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Select a transaction type above</p>
              <p className="text-sm mt-1">Choose expense, sale invoice, payment in, or payment out to continue</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response */}
      {(response || error) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {error ? (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  Error
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Response
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            ) : (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* Debug Panel */}
      {debugLogs.length > 0 && (
        <Card className={`border-2 ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle
                className="text-lg flex items-center gap-2 cursor-pointer"
                onClick={() => setShowDebugPanel(!showDebugPanel)}
              >
                <Bug className="w-5 h-5 text-orange-500" />
                Debug Logs
                <Badge variant="outline" className="ml-2">
                  {debugLogs.length} entries
                </Badge>
                {showDebugPanel ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyDebugLogs}
                  className="flex items-center gap-1"
                >
                  {copiedDebug ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Logs
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearDebugLogs}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          {showDebugPanel && (
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {debugLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm font-mono ${
                      log.type === 'error'
                        ? 'bg-red-100 border border-red-300'
                        : log.type === 'request'
                        ? 'bg-blue-50 border border-blue-200'
                        : log.type === 'response'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={`text-xs ${
                          log.type === 'error'
                            ? 'bg-red-500'
                            : log.type === 'request'
                            ? 'bg-blue-500'
                            : log.type === 'response'
                            ? 'bg-green-500'
                            : 'bg-gray-500'
                        }`}
                      >
                        {log.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className={`font-medium ${log.type === 'error' ? 'text-red-700' : 'text-gray-800'}`}>
                      {log.message}
                    </p>
                    {log.data && (
                      <pre className="mt-2 text-xs bg-white/50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Debug Info */}
              {error && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 flex items-center gap-2 mb-2">
                    <Bug className="w-4 h-4" />
                    Troubleshooting Tips
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Check if the API endpoint exists: <code className="bg-yellow-100 px-1 rounded">https://analytics-staging.vyaparapp.in/api/ps/extract-json-alt</code></li>
                    <li>• Verify your auth token is valid (check localStorage)</li>
                    <li>• Compare with production API URL if available</li>
                    <li>• Check browser Network tab for more details</li>
                    <li>• Look at the console for additional logs</li>
                  </ul>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default PlaygroundPrompts;
