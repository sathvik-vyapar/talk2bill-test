/**
 * Index.tsx
 *
 * Main application entry point with sidebar layout.
 * Handles:
 * - User authentication state management
 * - Session persistence (48-hour sessions stored in localStorage)
 * - Page navigation with sidebar
 *
 * @author Vyapar Team
 * @version 3.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';

// Components
import LoginForm from '@/components/LoginForm';
import AppSidebar from '@/components/AppSidebar';
import HowVaaniWorks from '@/components/HowVaaniWorks';
import PlaygroundPrompts from '@/components/PlayGroundPrompts';
import AudioTranscription from '@/components/Speech2Text';
import Talk2Bill from '@/components/Talk2Bill';
import ProductionInsights from '@/components/ProductionInsights';
import DataScience from '@/components/DataScience';
import Product from '@/components/Product';

// UI Components
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// =============================================================================
// CONSTANTS
// =============================================================================

/** Session duration: 48 hours in milliseconds */
const SESSION_DURATION_MS = 48 * 60 * 60 * 1000;

/** localStorage keys for session management */
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  LOGIN_TIMESTAMP: 'loginTimestamp',
  SIDEBAR_STATE: 'sidebar:state',
} as const;

/** Available pages/routes in the application */
type PageId = 'how-vaani-works' | 'playground-prompts' | 'speech-to-text' | 'talk2bill' | 'prod-insights' | 'data-science' | 'product';

/** Default page to show after login */
const DEFAULT_PAGE: PageId = 'how-vaani-works';

/** Page metadata for breadcrumbs and headers */
const PAGE_META: Record<PageId, { title: string; section: string; description: string }> = {
  'how-vaani-works': {
    title: 'How It Works',
    section: 'Learn',
    description: 'Understand how VAANI processes voice to invoice',
  },
  'speech-to-text': {
    title: 'Speech to Text',
    section: 'Test',
    description: 'Test speech-to-text models and transcription',
  },
  'playground-prompts': {
    title: 'Playground',
    section: 'Test',
    description: 'Test prompts and LLM responses',
  },
  'talk2bill': {
    title: 'Talk2Bill',
    section: 'Test',
    description: 'Full voice-to-invoice pipeline testing',
  },
  'prod-insights': {
    title: 'Prod Insights',
    section: 'Analyze',
    description: 'Production metrics and analytics',
  },
  'data-science': {
    title: 'Architecture',
    section: 'Reference',
    description: 'System architecture and pipeline design',
  },
  'product': {
    title: 'Product',
    section: 'Reference',
    description: 'Prompts, test cases, and product specs',
  },
};

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
 * The main application container with sidebar layout that manages:
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

  // Get current page metadata
  const pageMeta = PAGE_META[currentPage];

  // Main authenticated layout with sidebar
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Sidebar */}
        <AppSidebar
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          {/* Header with breadcrumb */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <span className="text-gray-500 text-sm">{pageMeta.section}</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">{pageMeta.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto hidden md:block">
              <p className="text-sm text-gray-500">{pageMeta.description}</p>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {renderCurrentPage()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
