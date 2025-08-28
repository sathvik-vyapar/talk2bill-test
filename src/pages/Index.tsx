
import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import Navbar from '@/components/Navbar';
import ModelOverview from '@/components/ModelOverview';
import Playground from '@/components/Playground';
import PlaygroundPrompts from '@/components/PlayGroundPrompts';
import AudioTranscription from '@/components/Speech2Text';
import UseCases from '@/components/UseCases';
import Metrics from '@/components/Metrics';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('overview');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('overview');
  };

  const handleNavigateToPlayground = (modelId: string) => {
    setSelectedModelId(modelId);
    setCurrentPage('playground');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <ModelOverview onNavigateToPlayground={handleNavigateToPlayground} />;
      case 'playground':
        return <Playground preSelectedModel={selectedModelId} />;
      case 'playground-prompts':
        return <PlaygroundPrompts preSelectedModel={selectedModelId} />;
      case 'speech-to-text':
        return <AudioTranscription />;
      case 'use-cases':
        return <UseCases />;
      case 'metrics':
        return <Metrics />;
      default:
        return <ModelOverview onNavigateToPlayground={handleNavigateToPlayground} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b">
        <Navbar 
          onLogout={handleLogout} 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default Index;
