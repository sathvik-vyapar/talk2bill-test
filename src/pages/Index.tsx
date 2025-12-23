/**
 * Index.tsx
 *
 * Main application entry point and router.
 * Handles:
 * - User authentication state management
 * - Session persistence (48-hour sessions stored in localStorage)
 * - Page navigation between different sections
 *
 * @author Vyapar Team
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';

// Components
import LoginForm from '@/components/LoginForm';
import Navbar from '@/components/Navbar';
import HowVaaniWorks from '@/components/HowVaaniWorks';
import PlaygroundPrompts from '@/components/PlayGroundPrompts';
import AudioTranscription from '@/components/Speech2Text';
import Talk2Bill from '@/components/Talk2Bill';
import ProductionInsights from '@/components/ProductionInsights';
import DataScience from '@/components/DataScience';
import Product from '@/components/Product';

// =============================================================================
// CONSTANTS
// =============================================================================

/** Session duration: 48 hours in milliseconds */
const SESSION_DURATION_MS = 48 * 60 * 60 * 1000;

/** localStorage keys for session management */
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  LOGIN_TIMESTAMP: 'loginTimestamp',
} as const;

/** Available pages/routes in the application */
type PageId = 'how-vaani-works' | 'playground-prompts' | 'speech-to-text' | 'talk2bill' | 'prod-insights' | 'data-science' | 'product';

/** Default page to show after login */
const DEFAULT_PAGE: PageId = 'how-vaani-works';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Checks if the current session is valid (within 48-hour window)
 * @returns Object containing session validity and remaining time
 */
const checkSessionValidity = (): { isValid: boolean; remainingHours: number } => {
  const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const loginTimestamp = localStorage.getItem(STORAGE_KEYS.LOGIN_TIMESTAMP);

  if (!authToken || !loginTimestamp) {
    return { isValid: false, remainingHours: 0 };
  }

  const loginTime = parseInt(loginTimestamp, 10);
  const currentTime = Date.now();
  const timeSinceLogin = currentTime - loginTime;
  const remainingTime = SESSION_DURATION_MS - timeSinceLogin;

  return {
    isValid: timeSinceLogin < SESSION_DURATION_MS,
    remainingHours: Math.max(0, Math.round(remainingTime / (1000 * 60 * 60))),
  };
};

/**
 * Clears all session data from localStorage
 */
const clearSessionData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.LOGIN_TIMESTAMP);
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Index Component
 *
 * The main application container that manages:
 * - Authentication state with 48-hour persistent sessions
 * - Navigation between different dashboard sections
 * - Session validation on app load
 */
const Index: React.FC = () => {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  /** Whether user is currently logged in */
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  /** Currently active page/section */
  const [currentPage, setCurrentPage] = useState<PageId>(DEFAULT_PAGE);

  /** Loading state while checking session validity on mount */
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);

  // ---------------------------------------------------------------------------
  // SESSION MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Check for existing valid session on component mount.
   * Auto-logs in user if a valid session exists.
   */
  useEffect(() => {
    const initializeSession = (): void => {
      const { isValid, remainingHours } = checkSessionValidity();

      if (isValid) {
        console.log('[SESSION] Valid session found, auto-logging in');
        console.log(`[SESSION] Time remaining: ${remainingHours} hours`);
        setIsLoggedIn(true);
      } else {
        // Session expired or doesn't exist - clear any stale data
        console.log('[SESSION] No valid session found');
        clearSessionData();
      }

      setIsCheckingSession(false);
    };

    initializeSession();
  }, []);

  // ---------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Handles successful login.
   * Stores login timestamp for 48-hour session tracking.
   */
  const handleLogin = useCallback((): void => {
    localStorage.setItem(STORAGE_KEYS.LOGIN_TIMESTAMP, Date.now().toString());
    console.log('[SESSION] New login, session will expire in 48 hours');
    setIsLoggedIn(true);
  }, []);

  /**
   * Handles user logout.
   * Clears all session data and resets to default page.
   */
  const handleLogout = useCallback((): void => {
    clearSessionData();
    console.log('[SESSION] User logged out, session cleared');
    setIsLoggedIn(false);
    setCurrentPage(DEFAULT_PAGE);
  }, []);

  /**
   * Handles page navigation.
   */
  const handlePageChange = useCallback((page: string): void => {
    setCurrentPage(page as PageId);
  }, []);

  // ---------------------------------------------------------------------------
  // PAGE RENDERING
  // ---------------------------------------------------------------------------

  /**
   * Renders the current page component based on currentPage state.
   * Uses a switch statement for type safety and explicit mapping.
   */
  const renderCurrentPage = (): React.ReactNode => {
    switch (currentPage) {
      case 'how-vaani-works':
        return <HowVaaniWorks />;
      case 'playground-prompts':
        return <PlaygroundPrompts />;
      case 'speech-to-text':
        return <AudioTranscription />;
      case 'talk2bill':
        return <Talk2Bill />;
      case 'prod-insights':
        return <ProductionInsights />;
      case 'data-science':
        return <DataScience />;
      case 'product':
        return <Product />;
      default:
        // Fallback to default page for unknown routes
        return <HowVaaniWorks />;
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  // Show loading spinner while checking session validity
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Main authenticated layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <Navbar
          onLogout={handleLogout}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default Index;
