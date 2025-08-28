
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calculator, Package, Globe, Play, Clock } from 'lucide-react';

const useCases = [
  {
    id: 'gst-filing',
    title: 'GST Filing Queries',
    icon: <Calculator className="w-5 h-5" />,
    description: 'Test model performance on GST-related questions and compliance scenarios',
    prompts: [
      'What is the GST rate for textile products in India?',
      'How to file GSTR-1 return for a small business?',
      'मुझे अपनी दुकान के लिए GST registration करना है, क्या करूं?',
      'What are the penalties for late GST return filing?'
    ]
  },
  {
    id: 'invoice-creation',
    title: 'Invoice Creation',
    icon: <FileText className="w-5 h-5" />,
    description: 'Evaluate invoice generation capabilities across different business scenarios',
    prompts: [
      'Create a professional invoice for software consulting services',
      'Generate an invoice for a restaurant with multiple food items',
      'बिजली के सामान की दुकान के लिए बिल बनाएं',
      'Create a service invoice with GST breakdown for a small business'
    ]
  },
  {
    id: 'inventory-management',
    title: 'Inventory Management',
    icon: <Package className="w-5 h-5" />,
    description: 'Test inventory-related queries and stock management scenarios',
    prompts: [
      'How to track inventory for a multi-location retail business?',
      'What is the optimal reorder point for fast-moving items?',
      'कम stock होने पर alert कैसे set करें?',
      'Calculate inventory turnover ratio for the last quarter'
    ]
  },
  {
    id: 'hindi-vernacular',
    title: 'Hindi/Vernacular Support',
    icon: <Globe className="w-5 h-5" />,
    description: 'Assess performance on regional language queries and mixed-language scenarios',
    prompts: [
      'मेरे business के लिए accounting software कैसे choose करूं?',
      'What are the benefits of using Vyapar app for small business?',
      'GST के बारे में हिंदी में जानकारी दें',
      'छोटे व्यापारियों के लिए tax planning के tips'
    ]
  }
];

const dummyResults = {
  'gst-filing': [
    {
      modelName: 'GSTGuru-Advanced',
      score: 96.1,
      latency: '110ms',
      strengths: ['Accurate GST rates', 'Compliance knowledge', 'Hindi support'],
      weaknesses: ['Limited regional variations']
    },
    {
      modelName: 'VyaparGPT-Hindi-v2.1',
      score: 94.2,
      latency: '120ms',
      strengths: ['Excellent Hindi responses', 'Practical examples'],
      weaknesses: ['Slightly slower on complex queries']
    },
    {
      modelName: 'FinBot-Base',
      score: 87.3,
      latency: '150ms',
      strengths: ['Good general knowledge'],
      weaknesses: ['Less specific to Indian GST']
    }
  ],
  'invoice-creation': [
    {
      modelName: 'InvoiceBot-Pro',
      score: 91.7,
      latency: '95ms',
      strengths: ['Professional formatting', 'Multiple templates'],
      weaknesses: ['Limited customization']
    },
    {
      modelName: 'VyaparGPT-Hindi-v2.1',
      score: 89.4,
      latency: '120ms',
      strengths: ['Bilingual invoices', 'Local business context'],
      weaknesses: ['Template variety']
    }
  ]
};

const UseCases = () => {
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleRunEvaluation = async (useCaseId: string) => {
    setIsLoading(true);
    setSelectedUseCase(useCaseId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResults(dummyResults[useCaseId as keyof typeof dummyResults] || []);
    setIsLoading(false);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 95) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 90) return <Badge className="bg-blue-100 text-blue-800">Very Good</Badge>;
    if (score >= 85) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">Average</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Use-Case-Based Evaluation</h1>
        <p className="text-gray-600">Test model performance across common Vyapar business scenarios</p>
      </div>

      {/* Selected Use Case with Results */}
      {selectedUseCase && (
        <div className="space-y-6">
          {/* Expanded Use Case Card */}
          <Card className="border-2 border-blue-200 bg-blue-50/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {useCases.find(uc => uc.id === selectedUseCase)?.icon}
                  </div>
                  <CardTitle className="text-lg">
                    {useCases.find(uc => uc.id === selectedUseCase)?.title}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Active Evaluation
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedUseCase(null);
                    setResults(null);
                  }}
                >
                  ✕ Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">All Test Prompts:</h4>
                    <div className="space-y-2">
                      {useCases.find(uc => uc.id === selectedUseCase)?.prompts.map((prompt, index) => (
                        <div key={index} className="text-sm text-gray-700 bg-white p-3 rounded border">
                          <span className="font-medium text-blue-600">#{index + 1}</span> {prompt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Evaluation Status:</h4>
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        Running evaluation across all prompts...
                      </div>
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse h-6 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded border">
                      <div className="text-green-600 font-medium mb-2">✓ Evaluation Complete</div>
                      <div className="text-sm text-gray-600">
                        Tested {useCases.find(uc => uc.id === selectedUseCase)?.prompts.length} prompts across {results?.length || 0} models
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {results && !isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Comparison</CardTitle>
                <p className="text-gray-600">
                  How each model performed on the {useCases.find(uc => uc.id === selectedUseCase)?.title.toLowerCase()} test scenarios
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{result.modelName}</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm text-gray-600">{result.latency}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{result.score}%</div>
                            {getScoreBadge(result.score)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {result.strengths.map((strength: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-orange-700 mb-2">Areas for Improvement</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {result.weaknesses.map((weakness: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Other Use Cases */}
      <div>
        {selectedUseCase && <h2 className="text-xl font-semibold text-gray-900 mb-4">Other Use Cases</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases
            .filter(useCase => useCase.id !== selectedUseCase)
            .map((useCase) => (
              <Card key={useCase.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {useCase.icon}
                    </div>
                    <CardTitle className="text-lg">{useCase.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">{useCase.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Sample Prompts:</h4>
                    <div className="space-y-1">
                      {useCase.prompts.slice(0, 2).map((prompt, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          • {prompt}
                        </div>
                      ))}
                      <div className="text-xs text-gray-500">+{useCase.prompts.length - 2} more prompts</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRunEvaluation(useCase.id)}
                    disabled={isLoading}
                    className="w-full flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Run Evaluation
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default UseCases;
