
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import Navbar from '@/components/Navbar';
import PlaygroundPrompts from '@/components/PlayGroundPrompts';
import AudioTranscription from '@/components/Speech2Text';
import ProductionInsights from '@/components/ProductionInsights';
import DataScience from '@/components/DataScience';
import Product from '@/components/Product';

// Session duration: 48 hours in milliseconds
const SESSION_DURATION_MS = 48 * 60 * 60 * 1000;

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('playground-prompts');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for existing valid session on mount
  useEffect(() => {
    const checkSession = () => {
      const authToken = localStorage.getItem('authToken');
      const loginTimestamp = localStorage.getItem('loginTimestamp');

      if (authToken && loginTimestamp) {
        const loginTime = parseInt(loginTimestamp, 10);
        const currentTime = Date.now();
        const timeSinceLogin = currentTime - loginTime;

        // Check if session is still valid (within 48 hours)
        if (timeSinceLogin < SESSION_DURATION_MS) {
          console.log('[SESSION] Valid session found, auto-logging in');
          console.log(`[SESSION] Time remaining: ${Math.round((SESSION_DURATION_MS - timeSinceLogin) / (1000 * 60 * 60))} hours`);
          setIsLoggedIn(true);
        } else {
          // Session expired, clear storage
          console.log('[SESSION] Session expired, clearing storage');
          localStorage.removeItem('authToken');
          localStorage.removeItem('loginTimestamp');
        }
      }
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  const handleLogin = () => {
    // Store login timestamp for 48-hour session
    localStorage.setItem('loginTimestamp', Date.now().toString());
    console.log('[SESSION] New login, session will expire in 48 hours');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Clear all session data
    localStorage.removeItem('authToken');
    localStorage.removeItem('loginTimestamp');
    console.log('[SESSION] User logged out, session cleared');
    setIsLoggedIn(false);
    setCurrentPage('playground-prompts');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'playground-prompts':
        return <PlaygroundPrompts />;
      case 'speech-to-text':
        return <AudioTranscription />;
      case 'prod-insights':
        return <ProductionInsights />;
      case 'data-science':
        return <DataScience />;
      case 'product':
        return <Product />;
      default:
        return <PlaygroundPrompts />;
    }
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

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
