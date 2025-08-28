
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Star, Zap, Brain, Globe } from 'lucide-react';

const dummyModels = [
  {
    id: 1,
    playgroundId: 'gpt-3.5',
    name: 'GPT-3.5',
    version: 'v3.5.0',
    trainedOn: 'General Internet Text Corpus',
    fineTuned: false,
    specialization: 'General Purpose Text Generation',
    icon: <Brain className="w-5 h-5" />,
    isInHouse: false
  },
  {
    id: 2,
    playgroundId: 'chatgpt',
    name: 'ChatGPT',
    version: 'v4.0',
    trainedOn: 'Conversational Data + RLHF',
    fineTuned: true,
    specialization: 'Advanced Conversational AI',
    icon: <Star className="w-5 h-5" />,
    isInHouse: false
  },
  {
    id: 3,
    playgroundId: 'gemma',
    name: 'GEMMA',
    version: 'v1.0',
    trainedOn: 'Proprietary Domain-Specific Data',
    fineTuned: true,
    specialization: 'Business Document Generation',
    icon: <Zap className="w-5 h-5" />,
    isInHouse: true
  }
];

const ModelOverview = ({ onNavigateToPlayground }: { onNavigateToPlayground?: (modelId: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredModels = dummyModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'fine-tuned' && model.fineTuned) ||
                         (filterType === 'base' && !model.fineTuned);
    
    return matchesSearch && matchesFilter;
  });

  const getPerformanceBadge = (score: number) => {
    if (score >= 95) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 90) return <Badge className="bg-blue-100 text-blue-800">Very Good</Badge>;
    if (score >= 85) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">Average</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Model Overview</h1>
          <p className="text-gray-600">Available AI models for your applications</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search models or specializations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            <SelectItem value="fine-tuned">Fine-tuned Only</SelectItem>
            <SelectItem value="base">Base Models</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <Card key={model.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {model.icon}
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  {model.isInHouse && (
                    <Badge className="bg-green-100 text-green-800">
                      In-House
                    </Badge>
                  )}
                  {model.fineTuned && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Fine-tuned
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">{model.version}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Specialization</p>
                <p className="text-sm text-gray-600">{model.specialization}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Trained On</p>
                <p className="text-sm text-gray-600">{model.trainedOn}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">How to Use</p>
                <p className="text-sm text-gray-600">Provide your API key and enter prompts to get responses</p>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => onNavigateToPlayground?.(model.playgroundId)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No models found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ModelOverview;
