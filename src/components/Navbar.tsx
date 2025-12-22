/**
 * Navbar.tsx
 *
 * Main navigation bar component for the application.
 * Features:
 * - Desktop navigation with horizontal menu
 * - Mobile-responsive hamburger menu
 * - Active page highlighting
 * - Logout functionality
 *
 * @author Vyapar Team
 * @version 2.0.0
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Props for the Navbar component
 */
interface NavbarProps {
  /** Callback function when user clicks logout */
  onLogout: () => void;
  /** Currently active page identifier */
  currentPage: string;
  /** Callback function when user navigates to a different page */
  onPageChange: (page: string) => void;
}

/**
 * Navigation item configuration
 */
interface NavItem {
  /** Unique identifier for the page */
  id: string;
  /** Display label for the navigation item */
  label: string;
  /** Emoji icon for visual identification */
  icon: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Navigation items configuration.
 * Each item represents a section of the dashboard.
 */
const NAV_ITEMS: NavItem[] = [
  { id: 'playground-prompts', label: 'Playground', icon: '🔍' },
  { id: 'speech-to-text', label: 'Speech to Text', icon: '🎤' },
  { id: 'prod-insights', label: 'Prod Insights', icon: '📈' },
  { id: 'data-science', label: 'Data Science', icon: '🧠' },
  { id: 'product', label: 'Product', icon: '🛠️' },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets the CSS classes for a navigation button based on its active state
 * @param isActive - Whether this nav item is currently active
 * @returns Tailwind CSS classes string
 */
const getNavButtonClasses = (isActive: boolean): string => {
  const baseClasses = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
  const activeClasses = 'bg-blue-100 text-blue-700';
  const inactiveClasses = 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';

  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
};

/**
 * Gets the CSS classes for a mobile navigation button based on its active state
 * @param isActive - Whether this nav item is currently active
 * @returns Tailwind CSS classes string
 */
const getMobileNavButtonClasses = (isActive: boolean): string => {
  const baseClasses = 'w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors';
  const activeClasses = 'bg-blue-100 text-blue-700';
  const inactiveClasses = 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Navbar Component
 *
 * Responsive navigation bar with desktop and mobile layouts.
 * Provides navigation between dashboard sections and logout functionality.
 */
const Navbar: React.FC<NavbarProps> = ({ onLogout, currentPage, onPageChange }) => {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  /** Controls mobile menu visibility */
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Toggles the mobile menu open/closed state
   */
  const toggleMobileMenu = useCallback((): void => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  /**
   * Handles navigation item click.
   * Changes page and closes mobile menu if open.
   */
  const handleNavClick = useCallback((pageId: string): void => {
    onPageChange(pageId);
    setMobileMenuOpen(false); // Close mobile menu after selection
  }, [onPageChange]);

  /**
   * Handles logo click - navigates to overview/home
   */
  const handleLogoClick = useCallback((): void => {
    onPageChange('overview');
  }, [onPageChange]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo / Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={handleLogoClick}
                className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Vyapar LLM Hub
              </button>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={getNavButtonClasses(currentPage === item.id)}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Logout Button - Hidden on mobile */}
          <div className="hidden md:block">
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Toggle Button - Hidden on desktop */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Collapsible */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-lg mt-2">
              {/* Mobile Nav Items */}
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={getMobileNavButtonClasses(currentPage === item.id)}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}

              {/* Mobile Logout Button */}
              <div className="pt-2 border-t border-gray-200">
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
