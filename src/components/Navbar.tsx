
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onLogout: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navbar = ({ onLogout, currentPage, onPageChange }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    // { id: 'overview', label: 'Model Overview', icon: '📊' },
    { id: 'playground', label: 'Playground', icon: '🔍' },
    { id: 'playground-prompts', label: 'Playground Prompts', icon: '🔍' },
    { id: 'speech-to-text', label: 'Speech to Text', icon: '🎤' },
    // { id: 'use-cases', label: 'Use Cases', icon: '📈' },
    // { id: 'metrics', label: 'Metrics', icon: '📁' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button 
                onClick={() => onPageChange('overview')}
                className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Vyapar LLM Hub
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Logout */}
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-lg mt-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
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
