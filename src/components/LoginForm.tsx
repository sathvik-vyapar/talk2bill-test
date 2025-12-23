/**
 * LoginForm.tsx
 *
 * Authentication form component for user login.
 * Features:
 * - Username and password input fields
 * - API-based authentication with fallback for local development
 * - Error handling and loading states
 * - Stores auth token in localStorage on successful login
 *
 * @author Vyapar Team
 * @version 2.0.0
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, LogIn, Loader2 } from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Props for the LoginForm component
 */
interface LoginFormProps {
  /** Callback function called after successful login with the auth token */
  onLogin: (token: string) => void;
}

/**
 * User credentials for login
 */
interface Credentials {
  username: string;
  password: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

import { API_ENDPOINTS } from '@/lib/api-config';

/** API endpoint for authentication */
const AUTH_API_ENDPOINT = API_ENDPOINTS.TALK2BILL.LOGIN;

/** localStorage key for auth token */
const AUTH_TOKEN_KEY = 'authToken';

/** Fallback credentials for local development */
const DEV_CREDENTIALS = {
  username: 'akhil',
  password: 'Vaani@1234',
} as const;

/** Token used for local development */
const DEV_TOKEN = 'local-dev-token';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * LoginForm Component
 *
 * Provides a login form with:
 * - Production API authentication
 * - Local development fallback
 * - Error handling and validation
 */
const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  /** User input credentials */
  const [credentials, setCredentials] = useState<Credentials>({
    username: '',
    password: ''
  });

  /** Error message to display */
  const [error, setError] = useState<string>('');

  /** Loading state during authentication */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // HELPER FUNCTIONS
  // ---------------------------------------------------------------------------

  /**
   * Checks if credentials match the local development credentials
   */
  const isValidDevCredentials = useCallback((creds: Credentials): boolean => {
    return creds.username === DEV_CREDENTIALS.username &&
           creds.password === DEV_CREDENTIALS.password;
  }, []);

  /**
   * Saves auth token and completes login process
   */
  const completeLogin = useCallback((token: string): void => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    onLogin(token);
  }, [onLogin]);

  // ---------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Updates credentials state when input changes
   */
  const handleInputChange = useCallback((field: keyof Credentials) => {
    return (e: React.ChangeEvent<HTMLInputElement>): void => {
      setCredentials(prev => ({ ...prev, [field]: e.target.value }));
    };
  }, []);

  /**
   * Handles form submission and authentication
   * Attempts API authentication first, then falls back to local dev credentials
   */
  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Attempt production API authentication
      const response = await fetch(AUTH_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.data;
        completeLogin(token);
        return;
      }

      // API returned error - check if dev credentials match
      if (isValidDevCredentials(credentials)) {
        completeLogin(DEV_TOKEN);
        return;
      }

      throw new Error('Invalid credentials');

    } catch {
      // Network error or API failure - fallback to dev credentials
      if (isValidDevCredentials(credentials)) {
        completeLogin(DEV_TOKEN);
        return;
      }

      setError('Invalid credentials. Please check your ID and password.');

    } finally {
      setIsLoading(false);
    }
  }, [credentials, completeLogin, isValidDevCredentials]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        {/* Header with Logo */}
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Vaani LLM Arena
          </CardTitle>
          <p className="text-gray-600">Voice-First Business Intelligence</p>
        </CardHeader>

        {/* Login Form */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleInputChange('username')}
                className="w-full"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleInputChange('password')}
                className="w-full"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
