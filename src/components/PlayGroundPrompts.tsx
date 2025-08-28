
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Play, Clock, Zap, Maximize2, Minimize2 } from 'lucide-react';

// const availableModels = [
//   { id: 'gpt-3.5', name: 'GPT-3.5', specialization: 'General Purpose' },
//   { id: 'chatgpt', name: 'ChatGPT', specialization: 'Conversational AI' },
//   { id: 'gemma', name: 'GEMMA', specialization: 'Business Documents', isInHouse: true }
// ];

const availableModels = [
  { id: 'gpt-4o-mini', name: 'GPT-4O Mini', specialization: 'General Purpose' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', specialization: 'Fast & Efficient' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', specialization: 'Balanced Performance' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', specialization: 'Advanced Reasoning' }
];

const dummyResponses = {
  'gpt-3.5': {
    response: "I can help you create a professional document. Here's a sample response:\n\n**Sample Business Communication**\n\nDear valued customer,\n\nThank you for reaching out to us. We have received your inquiry and are pleased to assist you with your request.\n\nOur team has reviewed your requirements and we believe we can provide you with an excellent solution that meets your needs.\n\nKey details:\n- Fast processing time\n- Cost-effective solution\n- Professional quality output\n- 24/7 customer support\n\nPlease let us know if you have any questions or would like to proceed with the next steps.\n\nBest regards,\nCustomer Service Team"
  },
  'chatgpt': {
    response: "Hello! I'm here to help you with your request. Let me provide you with a comprehensive response:\n\n**Enhanced AI Assistant Response**\n\nI understand you're looking for assistance, and I'm excited to help! Here's what I can offer:\n\n🔍 **Analysis**: I can analyze your requirements in detail\n💡 **Solutions**: Provide creative and practical solutions\n📊 **Insights**: Offer data-driven insights and recommendations\n🎯 **Customization**: Tailor responses to your specific needs\n\n**Next Steps:**\n1. Review the information provided\n2. Ask any follow-up questions\n3. Request specific modifications if needed\n4. Implement the suggested approach\n\nI'm designed to understand context, provide nuanced responses, and engage in meaningful dialogue. Feel free to ask me anything!\n\nHow can I further assist you today?"
  },
  'gemma': {
    response: "**GEMMA In-House Model Response**\n\nGreetings! I'm GEMMA, your specialized business document assistant. I've been specifically trained on domain-specific data to help with business documentation needs.\n\n**Business Document Generation:**\n\n📋 **Invoice Processing**: Automated GST invoice generation for various business types\n📊 **Financial Reports**: Comprehensive financial statement preparation\n📝 **Legal Documents**: Contract templates and compliance documentation\n🏢 **Business Communications**: Professional correspondence and proposals\n\n**Key Advantages:**\n- Optimized for Indian business context\n- GST compliance built-in\n- Regional language support capabilities\n- Industry-specific templates\n- Regulatory compliance awareness\n\n**Sample Output Quality:**\nAs an in-house model, I provide consistent, reliable outputs tailored to your specific business requirements with enhanced accuracy for local business practices.\n\nReady to assist with your business documentation needs!"
  }
};

const PlaygroundPrompts = ({ preSelectedModel }: { preSelectedModel?: string | null }) => {
  const [prompt, setPrompt] = useState('');
  const [userInput, setUserInput] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(preSelectedModel ? [preSelectedModel] : []);
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<{[key: string]: string}>({});
  const [textareaRows, setTextareaRows] = useState(4);

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  // const handleCompare = async () => {
  //   if (!prompt.trim() || selectedModels.length === 0) return;
    
  //   setIsLoading(true);
    
  //   // Simulate API delay
  //   await new Promise(resolve => setTimeout(resolve, 1500));
    
  //   const modelResponses = selectedModels.map(modelId => ({
  //     modelId,
  //     modelName: availableModels.find(m => m.id === modelId)?.name || '',
  //     ...dummyResponses[modelId as keyof typeof dummyResponses]
  //   }));
    
  //   setResponses(modelResponses);
  //   setIsLoading(false);
  // };

  const handleCompare = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return;
    
    setIsLoading(true);
    
    try {
      const modelResponses = await Promise.all(
        selectedModels.map(async (modelId) => {
          try {
            const response = await fetch('https://analytics-staging.vyaparapp.in/talk2bill/extract-json-alt', {  // You'll need to set up this endpoint
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                modelName: modelId,
                sys_prompt: prompt.trim(),
                text: userInput.trim()
              })
            });
  
            if (!response.ok) {
              throw new Error(`API request failed for ${modelId}`);
            }
  
            const data = await response.json();
            console.log(data.output);
            return {
              modelId,
              modelName: availableModels.find(m => m.id === modelId)?.name || '',
              response: JSON.parse(JSON.stringify(data.output)),
              metadata: data.metadata // Optional: if your API returns additional metadata
            };
          } catch (error) {
            console.error(`Error with model ${modelId}:`, error);
            return {
              modelId,
              modelName: availableModels.find(m => m.id === modelId)?.name || '',
              response: `Error: Failed to get response from ${modelId}. Please try again.`,
              error: true
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

  const handleFeedback = (modelId: string, type: 'helpful' | 'not-helpful') => {
    console.log(`Feedback for ${modelId}: ${type}`);
    // In a real app, this would be sent to analytics
  };

  const handleNotesChange = (modelId: string, note: string) => {
    setNotes(prev => ({ ...prev, [modelId]: note }));
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 25000) {
      setPrompt(value);
      // Auto-resize based on content
      const lines = value.split('\n').length;
      const newRows = Math.max(4, Math.min(lines + 1, 20));
      setTextareaRows(newRows);
    }
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);
    // Auto-resize based on content
    const lines = value.split('\n').length;
    const newRows = Math.max(4, Math.min(lines + 1, 20));
    setTextareaRows(newRows);
  };

  const expandTextarea = () => {
    setTextareaRows(prev => Math.min(prev + 5, 30));
  };

  const shrinkTextarea = () => {
    setTextareaRows(prev => Math.max(prev - 5, 4));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prompt Playground</h1>
        <p className="text-gray-600">Test and compare model responses side by side</p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Prompt</CardTitle>
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
                {prompt.length}/25,000 characters
              </div>
            </div>
            <Textarea
              placeholder="Enter your prompt here (e.g., 'Generate a GST invoice for a Kirana store in Bihar')"
              value={prompt}
              onChange={handlePromptChange}
              rows={textareaRows}
              maxLength={25000}
              className="w-full resize-none"
            />
            <Textarea
              placeholder="Enter your input here"
              value={userInput}
              onChange={handleUserInputChange}
              rows={textareaRows}
              maxLength={25000}
              className="w-full resize-none"
            />
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Select Models to Test:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableModels.map((model) => (
                <div key={model.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={model.id}
                    checked={selectedModels.includes(model.id)}
                    onCheckedChange={() => handleModelToggle(model.id)}
                  />
                  <label htmlFor={model.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.name}</span>
                      {model.isInHouse && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          In-House
                        </Badge>
                      )}
                    </div>
                    <div className="text-gray-500 text-xs">{model.specialization}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCompare}
            disabled={!prompt.trim() || selectedModels.length === 0 || isLoading}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isLoading ? 'Generating Responses...' : selectedModels.length === 1 ? 'Test Model' : 'Compare Models'}
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
                <Card key={response.modelId} className="h-fit">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{response.modelName}</CardTitle>
                      <Badge variant="secondary">
                        AI Response
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                        {response.response}
                      </pre>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFeedback(response.modelId, 'helpful')}
                          className="flex items-center gap-1"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Helpful
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFeedback(response.modelId, 'not-helpful')}
                          className="flex items-center gap-1"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Not Useful
                        </Button>
                      </div>
                      
                      <Textarea
                        placeholder="Add your notes or feedback for this response..."
                        value={notes[response.modelId] || ''}
                        onChange={(e) => handleNotesChange(response.modelId, e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaygroundPrompts;
