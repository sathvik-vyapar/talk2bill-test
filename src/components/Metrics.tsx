
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Clock, ThumbsUp, Zap, Users, Mic, MessageSquare, Play, Pause, Eye, ChevronDown, ChevronRight, Activity, Database, Cpu } from 'lucide-react';

// API Usage Data
const apiUsageData = [
  { date: '2024-01-15', llmCalls: 1250, audioCalls: 340, totalCalls: 1590 },
  { date: '2024-01-16', llmCalls: 1380, audioCalls: 290, totalCalls: 1670 },
  { date: '2024-01-17', llmCalls: 1420, audioCalls: 380, totalCalls: 1800 },
  { date: '2024-01-18', llmCalls: 1290, audioCalls: 310, totalCalls: 1600 },
  { date: '2024-01-19', llmCalls: 1540, audioCalls: 420, totalCalls: 1960 },
];

// Conversation History Data
const conversationHistory = [
  {
    id: 'conv_001',
    timestamp: '2024-01-19 14:32:15',
    user: 'Rajesh Kumar',
    inputType: 'audio',
    inputText: 'मुझे अपनी दुकान के लिए GST invoice बनाना है।',
    audioUrl: '/audio/conv_001_input.mp3',
    audioDuration: '12s',
    model: 'VyaparGPT-Hindi-v2.1',
    response: 'मैं आपकी मदद कर सकता हूं। आपकी दुकान का GSTIN number क्या है और किन items का invoice बनाना है?',
    responseTime: '120ms',
    userFeedback: 'helpful',
    confidence: 94.2,
    expanded: false
  },
  {
    id: 'conv_002',
    timestamp: '2024-01-19 14:25:08',
    user: 'Priya Sharma',
    inputType: 'text',
    inputText: 'Generate invoice for software consulting services - Client: ABC Corp, Amount: ₹50,000, GST: 18%',
    model: 'InvoiceBot-Pro',
    response: 'I\'ll create a professional invoice for your software consulting services...',
    responseTime: '95ms',
    userFeedback: 'helpful',
    confidence: 91.7,
    expanded: false
  },
  {
    id: 'conv_003',
    timestamp: '2024-01-19 14:18:42',
    user: 'Amit Patel',
    inputType: 'audio',
    inputText: 'What is the GST rate for textile products?',
    audioUrl: '/audio/conv_003_input.mp3',
    audioDuration: '8s',
    model: 'GSTGuru-Advanced',
    response: 'The GST rate for textile products varies: Cotton textiles - 5%, Synthetic textiles - 12%, Readymade garments - 12%.',
    responseTime: '110ms',
    userFeedback: 'helpful',
    confidence: 96.1,
    expanded: false
  },
  {
    id: 'conv_004',
    timestamp: '2024-01-19 14:10:33',
    user: 'Neha Singh',
    inputType: 'text',
    inputText: 'How to track inventory for multiple locations?',
    model: 'FinBot-Base',
    response: 'For multi-location inventory tracking, you should implement a centralized system...',
    responseTime: '150ms',
    userFeedback: 'not-helpful',
    confidence: 87.3,
    expanded: false
  },
  {
    id: 'conv_005',
    timestamp: '2024-01-19 14:05:17',
    user: 'Suresh Gupta',
    inputType: 'audio',
    inputText: 'व्यापार ऐप में inventory कैसे manage करते हैं?',
    audioUrl: '/audio/conv_005_input.mp3',
    audioDuration: '15s',
    model: 'VyaparChat-Multilingual',
    response: 'Vyapar app में inventory management के लिए आप Stock menu का use कर सकते हैं...',
    responseTime: '140ms',
    userFeedback: 'helpful',
    confidence: 89.4,
    expanded: false
  }
];

const Metrics = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [conversationData, setConversationData] = useState(conversationHistory);

  // High-level metrics
  const totalApiCalls = 47890;
  const llmApiCalls = 38240;
  const audioApiCalls = 9650;
  const avgResponseTime = 123;
  const successRate = 98.7;

  const toggleConversation = (id: string) => {
    setConversationData(prev => 
      prev.map(conv => 
        conv.id === id ? { ...conv, expanded: !conv.expanded } : conv
      )
    );
  };

  const playAudio = (audioId: string) => {
    if (playingAudio === audioId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(audioId);
      // Simulate audio playback
      setTimeout(() => setPlayingAudio(null), 3000);
    }
  };

  const apiDistribution = [
    { name: 'LLM API Calls', value: 79.8, count: llmApiCalls, color: '#3B82F6' },
    { name: 'Audio API Calls', value: 20.2, count: audioApiCalls, color: '#10B981' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Analytics & Usage Metrics</h1>
        <p className="text-gray-600">Real-time insights into model performance and user interactions</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap justify-start gap-1 h-auto p-1 bg-muted/50 sm:grid sm:w-full sm:grid-cols-3">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">API Usage Overview</TabsTrigger>
          <TabsTrigger value="conversations" className="text-xs sm:text-sm">Conversation History</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* High-Level API Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total API Calls</p>
                    <p className="text-2xl font-bold text-gray-900">{totalApiCalls.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">+15.2%</span>
                    </div>
                  </div>
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">LLM API Calls</p>
                    <p className="text-2xl font-bold text-gray-900">{llmApiCalls.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">+12.8%</span>
                    </div>
                  </div>
                  <Cpu className="w-6 h-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Audio API Calls</p>
                    <p className="text-2xl font-bold text-gray-900">{audioApiCalls.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">+23.1%</span>
                    </div>
                  </div>
                  <Mic className="w-6 h-6 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response</p>
                    <p className="text-2xl font-bold text-gray-900">{avgResponseTime}ms</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingDown className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">-8ms</span>
                    </div>
                  </div>
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">+0.3%</span>
                    </div>
                  </div>
                  <Zap className="w-6 h-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Usage Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Calls Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={apiUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="llmCalls" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="LLM API Calls" />
                    <Area type="monotone" dataKey="audioCalls" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Audio API Calls" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={apiDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    >
                      {apiDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [
                      `${(value as number).toFixed(1)}% (${props.payload.count.toLocaleString()} calls)`,
                      name
                    ]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Interactions</CardTitle>
              <p className="text-sm text-gray-600">
                Drill down into actual conversations with audio playback and text analysis
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversationData.map((conversation) => (
                  <div key={conversation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleConversation(conversation.id)}
                          className="h-6 w-6 p-0"
                        >
                          {conversation.expanded ? 
                            <ChevronDown className="w-4 h-4" /> : 
                            <ChevronRight className="w-4 h-4" />
                          }
                        </Button>
                        <div className="flex items-center gap-2">
                          {conversation.inputType === 'audio' ? (
                            <Mic className="w-4 h-4 text-green-500" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="font-medium">{conversation.user}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {conversation.model}
                        </Badge>
                        <Badge variant={conversation.userFeedback === 'helpful' ? 'default' : 'secondary'} className="text-xs">
                          {conversation.userFeedback === 'helpful' ? '👍 Helpful' : '👎 Not Useful'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{conversation.timestamp}</span>
                        <span>•</span>
                        <span>{conversation.responseTime}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Input:</span> {conversation.inputText.substring(0, 80)}
                      {conversation.inputText.length > 80 && '...'}
                    </div>

                    {conversation.expanded && (
                      <div className="mt-4 space-y-4 bg-white p-4 rounded border">
                        {/* Full Input */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            User Input
                            {conversation.inputType === 'audio' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => playAudio(conversation.id)}
                                className="h-6 flex items-center gap-1"
                              >
                                {playingAudio === conversation.id ? (
                                  <Pause className="w-3 h-3" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                                {conversation.audioDuration}
                              </Button>
                            )}
                          </h4>
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            {conversation.inputText}
                          </div>
                        </div>

                        {/* Model Response */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center justify-between">
                            Model Response
                            <div className="flex items-center gap-2 text-xs">
                              <span>Confidence: {conversation.confidence}%</span>
                              <span>•</span>
                              <span>Time: {conversation.responseTime}</span>
                            </div>
                          </h4>
                          <div className="bg-blue-50 p-3 rounded text-sm">
                            {conversation.response}
                          </div>
                        </div>

                        {/* Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                          <div>
                            <h5 className="font-medium text-gray-600 text-xs mb-1">Performance Metrics</h5>
                            <div className="space-y-1 text-xs">
                              <div>Response Time: <span className="font-medium">{conversation.responseTime}</span></div>
                              <div>Confidence Score: <span className="font-medium">{conversation.confidence}%</span></div>
                              <div>Input Type: <span className="font-medium capitalize">{conversation.inputType}</span></div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-600 text-xs mb-1">User Feedback</h5>
                            <div className="text-xs">
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
                                conversation.userFeedback === 'helpful' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {conversation.userFeedback === 'helpful' ? '👍' : '👎'}
                                {conversation.userFeedback === 'helpful' ? 'Helpful' : 'Not Useful'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Existing analytics charts can go here */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <p className="text-gray-600">Detailed performance metrics and trends</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Advanced analytics dashboard coming soon...</p>
                <p className="text-sm">This will include model accuracy trends, user satisfaction metrics, and performance comparisons.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Metrics;
