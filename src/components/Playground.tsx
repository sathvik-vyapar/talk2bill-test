
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Clock, Zap, Maximize2, Minimize2, Loader2, ListFilter, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

const availableModels = [
  { id: 'gpt-4o-mini', name: 'GPT-4O Mini', specialization: 'General Purpose' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', specialization: 'Fast & Efficient' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', specialization: 'Balanced Performance' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', specialization: 'Advanced Reasoning' }
];

// Sample inputs organized by transaction type
const sampleInputs = [
  // Expense samples
  { id: 1, type: 'expense', input: 'Add petrol for 500 rupees', category: 'basic' },
  { id: 2, type: 'expense', input: 'Chai samosa 140 rupay', category: 'multi-item' },
  { id: 3, type: 'expense', input: 'Office stationery 2500 PhonePe se diya', category: 'with-payment' },
  { id: 4, type: 'expense', input: 'Ramesh ki salary 15000', category: 'salary' },
  { id: 5, type: 'expense', input: '5 kg rice 250 rupay', category: 'quantity' },
  { id: 6, type: 'expense', input: 'Electricity bill 3500 SBI bank se', category: 'bills' },
  { id: 7, type: 'expense', input: 'Travel kharcha Delhi trip 8000', category: 'travel' },
  { id: 8, type: 'expense', input: 'Rent payment 25000 cash diya', category: 'rent' },
  { id: 9, type: 'expense', input: 'Internet bill Airtel 999', category: 'bills' },
  { id: 10, type: 'expense', input: 'Lunch meeting 1200 GPay', category: 'food' },

  // Payment In samples
  { id: 11, type: 'payment_in', input: 'Sharma ji se 5000 mile', category: 'basic' },
  { id: 12, type: 'payment_in', input: 'Ramesh ne 10000 diye PhonePe se', category: 'upi' },
  { id: 13, type: 'payment_in', input: 'Customer payment 25000 bank transfer', category: 'bank' },
  { id: 14, type: 'payment_in', input: 'Advance mila Gupta ji se 15000', category: 'advance' },
  { id: 15, type: 'payment_in', input: 'Last month ka payment aaya 50000', category: 'dues' },
  { id: 16, type: 'payment_in', input: 'Mohan ne cash diya 8000', category: 'cash' },
  { id: 17, type: 'payment_in', input: 'Invoice 234 ka payment mila 12500', category: 'invoice' },
  { id: 18, type: 'payment_in', input: 'Partial payment 3000 out of 10000', category: 'partial' },

  // Payment Out samples
  { id: 19, type: 'payment_out', input: 'Supplier ko 20000 diye', category: 'basic' },
  { id: 20, type: 'payment_out', input: 'Vendor ABC ko NEFT kiya 45000', category: 'bank' },
  { id: 21, type: 'payment_out', input: 'Advance diya Mohan ko 5000', category: 'advance' },
  { id: 22, type: 'payment_out', input: 'Last bill clear kiya 35000 cheque se', category: 'cheque' },
  { id: 23, type: 'payment_out', input: 'Raw material payment 1.5 lakh', category: 'large' },
  { id: 24, type: 'payment_out', input: 'Transport charges 3500 cash', category: 'transport' },

  // Sale Invoice samples
  { id: 25, type: 'sale_invoice', input: 'Sharma ji ko 5 bag cement becha 350 per bag', category: 'basic' },
  { id: 26, type: 'sale_invoice', input: '10 kg rice 40 rupay kilo Gupta store ko', category: 'quantity' },
  { id: 27, type: 'sale_invoice', input: 'Mobile accessories bill 8500 cash le liya', category: 'paid' },
  { id: 28, type: 'sale_invoice', input: 'Wholesale order 25000 baad mein denge', category: 'credit' },
  { id: 29, type: 'sale_invoice', input: 'Steel rods 50 pieces 450 each plus GST', category: 'gst' },
  { id: 30, type: 'sale_invoice', input: '3 chairs 2500 each discount 500', category: 'discount' },
  { id: 31, type: 'sale_invoice', input: 'Computer repair service 3500', category: 'service' },
  { id: 32, type: 'sale_invoice', input: 'Grocery items multiple 15 products total 4500', category: 'multi-item' },

  // Other samples
  { id: 33, type: 'other', input: 'Hello', category: 'greeting' },
  { id: 34, type: 'other', input: 'Kya haal hai', category: 'greeting' },
  { id: 35, type: 'other', input: 'What can you do?', category: 'question' },
  { id: 36, type: 'other', input: 'Weather kaisa hai aaj', category: 'offtopic' },
  { id: 37, type: 'other', input: 'Thank you', category: 'greeting' },
];

interface StepTiming {
  step: string;
  duration: number;
  description?: string;
}

interface ModelResponse {
  modelId: string;
  modelName: string;
  response: string;
  error?: boolean;
  latency: number;
  stepTimings: StepTiming[];
  rawResponse?: string;
}

const Playground = ({ preSelectedModel }: { preSelectedModel?: string | null }) => {
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([
    'gemini-2.0-flash-lite'
  ]);
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalCorrection, setGlobalCorrection] = useState('');
  const [incorrectResponses, setIncorrectResponses] = useState<{[key: string]: boolean}>({});
  const [textareaRows, setTextareaRows] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample inputs state
  const [showSampleInputs, setShowSampleInputs] = useState(true);
  const [sampleTypeFilter, setSampleTypeFilter] = useState('all');
  const [sampleSearch, setSampleSearch] = useState('');
  const [expandedTimings, setExpandedTimings] = useState<{[key: string]: boolean}>({});

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const filteredSamples = sampleInputs.filter(sample => {
    const matchesType = sampleTypeFilter === 'all' || sample.type === sampleTypeFilter;
    const matchesSearch = sampleSearch === '' ||
      sample.input.toLowerCase().includes(sampleSearch.toLowerCase()) ||
      sample.category.toLowerCase().includes(sampleSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  const selectSampleInput = (sampleInput: string) => {
    setInput(sampleInput);
    // Auto-resize based on content
    const lines = sampleInput.split('\n').length;
    setTextareaRows(Math.max(4, Math.min(lines + 1, 20)));
  };

  const handleCompare = async () => {
    if (!input.trim() || selectedModels.length === 0) return;

    setIsLoading(true);
    setResponses([]);

    try {
      const modelResponses = await Promise.all(
        selectedModels.map(async (modelId) => {
          const timings: StepTiming[] = [];
          const overallStart = Date.now();

          try {
            // Step 1: Prepare request
            const prepStart = Date.now();
            const requestBody = {
              modelName: modelId,
              text: input.trim(),
              includeTimings: true
            };
            timings.push({
              step: 'request_preparation',
              duration: Date.now() - prepStart,
              description: 'Preparing API request'
            });

            // Step 2: API Call
            const apiStart = Date.now();
            const response = await fetch('https://analytics-staging.vyaparapp.in/api/ps/extract-json-text', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              },
              body: JSON.stringify(requestBody)
            });
            const apiEnd = Date.now();
            timings.push({
              step: 'network_request',
              duration: apiEnd - apiStart,
              description: 'Network round-trip time'
            });

            if (!response.ok) {
              throw new Error(`API request failed for ${modelId}`);
            }

            // Step 3: Parse response
            const parseStart = Date.now();
            const data = await response.json();
            timings.push({
              step: 'response_parsing',
              duration: Date.now() - parseStart,
              description: 'JSON parsing time'
            });

            // Step 4: Extract server-side timings if available
            if (data.timings || data.metadata?.timings) {
              const serverTimings = data.timings || data.metadata?.timings;
              if (serverTimings.intent_classification) {
                timings.push({
                  step: 'intent_classification',
                  duration: serverTimings.intent_classification,
                  description: 'LLM intent detection (server)'
                });
              }
              if (serverTimings.data_extraction) {
                timings.push({
                  step: 'data_extraction',
                  duration: serverTimings.data_extraction,
                  description: 'LLM data extraction (server)'
                });
              }
              if (serverTimings.validation) {
                timings.push({
                  step: 'validation',
                  duration: serverTimings.validation,
                  description: 'Data validation (server)'
                });
              }
              if (serverTimings.total_processing) {
                timings.push({
                  step: 'server_total',
                  duration: serverTimings.total_processing,
                  description: 'Total server processing'
                });
              }
            }

            const totalLatency = Date.now() - overallStart;
            timings.push({
              step: 'total_e2e',
              duration: totalLatency,
              description: 'Total end-to-end time'
            });

            return {
              modelId,
              modelName: availableModels.find(m => m.id === modelId)?.name || '',
              response: JSON.stringify(data.invoice || data, null, 2),
              latency: totalLatency,
              stepTimings: timings,
              rawResponse: JSON.stringify(data, null, 2)
            };
          } catch (error) {
            const totalLatency = Date.now() - overallStart;
            timings.push({ step: 'total_e2e', duration: totalLatency, description: 'Total time (with error)' });

            console.error(`Error with model ${modelId}:`, error);
            return {
              modelId,
              modelName: availableModels.find(m => m.id === modelId)?.name || '',
              response: `Error: Failed to get response from ${modelId}. Please try again.`,
              error: true,
              latency: totalLatency,
              stepTimings: timings
            };
          }
        })
      );

      setResponses(modelResponses);
    } catch (error) {
      console.error('Comparison error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalCorrectionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGlobalCorrection(e.target.value);
  };

  const handleIncorrectToggle = (modelId: string, isIncorrect: boolean) => {
    setIncorrectResponses(prev => ({
      ...prev,
      [modelId]: isIncorrect
    }));
  };

  const toggleTimingExpand = (modelId: string) => {
    setExpandedTimings(prev => ({
      ...prev,
      [modelId]: !prev[modelId]
    }));
  };

  const handleSubmit = async () => {
    if (globalCorrection.trim() === '') {
      setError('Please enter the correct output');
      return;
    }
    setIsSubmitting(true);
    try {
      const submissionData = {
        input: input.trim(),
        responses: responses.map(response => ({
          modelId: response.modelId,
          modelName: response.modelName,
          originalResponse: response.response,
          isIncorrect: incorrectResponses[response.modelId] || false
        })),
        correctedOutput: globalCorrection.trim()
      };
      console.log(submissionData);

      const response = await fetch('https://analytics-staging.vyaparapp.in/api/ps/talk2bill-json-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit corrections');
      }

      // Reset the form
      setInput('');
      setSelectedModels(['gemini-2.0-flash-lite']);
      setResponses([]);
      setGlobalCorrection('');
      setIncorrectResponses({});

    } catch (err) {
      console.error('Error submitting corrections:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setInput('');
    setSelectedModels(['gemini-2.0-flash-lite']);
    setResponses([]);
    setGlobalCorrection('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 25000) {
      setInput(value);
      const lines = value.split('\n').length;
      const newRows = Math.max(4, Math.min(lines + 1, 20));
      setTextareaRows(newRows);
    }
  };

  const expandTextarea = () => {
    setTextareaRows(prev => Math.min(prev + 5, 30));
  };

  const shrinkTextarea = () => {
    setTextareaRows(prev => Math.max(prev - 5, 4));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'expense': return 'border-purple-500 text-purple-700 bg-purple-50';
      case 'payment_in': return 'border-green-500 text-green-700 bg-green-50';
      case 'payment_out': return 'border-orange-500 text-orange-700 bg-orange-50';
      case 'sale_invoice': return 'border-blue-500 text-blue-700 bg-blue-50';
      default: return 'border-gray-500 text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Input Playground</h1>
        <p className="text-gray-600">Test and compare model responses with timing analysis</p>
      </div>

      {/* Sample Inputs Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-blue-500" />
              Sample Inputs
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSampleInputs(!showSampleInputs)}
            >
              {showSampleInputs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        {showSampleInputs && (
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={sampleTypeFilter} onValueChange={setSampleTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="payment_in">Payment In</SelectItem>
                  <SelectItem value="payment_out">Payment Out</SelectItem>
                  <SelectItem value="sale_invoice">Sale Invoice</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search samples..."
                  value={sampleSearch}
                  onChange={(e) => setSampleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Badge variant="outline" className="text-gray-600">
                {filteredSamples.length} samples
              </Badge>
            </div>

            {/* Sample inputs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
              {filteredSamples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => selectSampleInput(sample.input)}
                  className={`text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                    input === sample.input
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-xs ${getTypeColor(sample.type)}`}>
                      {sample.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {sample.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">"{sample.input}"</p>
                </button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={shrinkTextarea}
                  className="h-8 w-8 p-0"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={expandTextarea}
                  className="h-8 w-8 p-0"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {input.length}/25,000 characters
              </div>
            </div>
            <Textarea
              placeholder="Enter your input here or select from samples above (e.g., 'Add petrol for 500 rupees')"
              value={input}
              onChange={handleInputChange}
              rows={textareaRows}
              maxLength={25000}
              className="w-full resize-none"
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Select Models to Test:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {availableModels.map((model) => (
                <div key={model.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={model.id}
                    checked={selectedModels.includes(model.id)}
                    onCheckedChange={() => handleModelToggle(model.id)}
                  />
                  <label htmlFor={model.id} className="text-sm cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.name}</span>
                    </div>
                    <div className="text-gray-500 text-xs">{model.specialization}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCompare}
            disabled={!input.trim() || selectedModels.length === 0 || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isLoading ? 'Processing...' : selectedModels.length === 1 ? 'Run Test' : 'Compare Models'}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {(responses.length > 0 || isLoading) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Model Responses</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {selectedModels.map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {responses.map((response) => (
                <Card key={response.modelId} className={`h-fit ${response.error ? 'border-red-200' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{response.modelName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {response.latency}ms
                        </Badge>
                        {response.error && (
                          <Badge variant="destructive">Error</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Response */}
                    <div className="space-y-3 border p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Extracted Output
                        </label>
                        <div className="flex items-center gap-2">
                          <label htmlFor={`incorrect-${response.modelId}`} className="text-sm text-gray-600">
                            Incorrect
                          </label>
                          <Checkbox
                            id={`incorrect-${response.modelId}`}
                            checked={incorrectResponses[response.modelId] || false}
                            onCheckedChange={(checked) =>
                              handleIncorrectToggle(response.modelId, checked as boolean)
                            }
                          />
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${response.error ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono max-h-[300px] overflow-y-auto">
                          {response.response}
                        </pre>
                      </div>
                    </div>

                    {/* Timing Analysis */}
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleTimingExpand(response.modelId)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Zap className="w-4 h-4 text-amber-500" />
                          Timing Analysis
                        </span>
                        {expandedTimings[response.modelId] ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>

                      {expandedTimings[response.modelId] && (
                        <div className="p-3 space-y-2">
                          {response.stepTimings.map((timing, idx) => {
                            const isTotal = timing.step === 'total_e2e';
                            const maxDuration = Math.max(...response.stepTimings.map(t => t.duration));
                            const widthPercent = (timing.duration / maxDuration) * 100;

                            return (
                              <div
                                key={idx}
                                className={`${isTotal ? 'pt-2 mt-2 border-t' : ''}`}
                              >
                                <div className="flex items-center justify-between text-sm">
                                  <span className={`${isTotal ? 'font-semibold' : ''} text-gray-700`}>
                                    {timing.step.replace(/_/g, ' ')}
                                  </span>
                                  <span className={`${isTotal ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                                    {timing.duration}ms
                                  </span>
                                </div>
                                {timing.description && (
                                  <p className="text-xs text-gray-400 mb-1">{timing.description}</p>
                                )}
                                {!isTotal && (
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        timing.step.includes('network') ? 'bg-blue-400' :
                                        timing.step.includes('intent') ? 'bg-purple-400' :
                                        timing.step.includes('extraction') ? 'bg-green-400' :
                                        timing.step.includes('validation') ? 'bg-amber-400' :
                                        'bg-gray-400'
                                      }`}
                                      style={{ width: `${widthPercent}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Raw Response (collapsible) */}
                    {response.rawResponse && (
                      <details className="text-sm">
                        <summary className="text-gray-500 cursor-pointer hover:text-gray-700 py-2">
                          View Raw API Response
                        </summary>
                        <pre className="text-xs bg-gray-800 text-gray-200 p-3 rounded mt-2 overflow-x-auto max-h-[200px]">
                          {response.rawResponse}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Global Correction and Buttons */}
      {responses.length > 0 && (
        <div className="space-y-6 mt-6">
          <div className="space-y-3 border p-4 rounded-lg">
            <label className="text-sm font-medium text-gray-700">
              Correct Output
            </label>
            <Textarea
              value={globalCorrection}
              onChange={handleGlobalCorrectionChange}
              placeholder="Enter the correct output here..."
              rows={4}
              className="w-full"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Correction'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playground;
