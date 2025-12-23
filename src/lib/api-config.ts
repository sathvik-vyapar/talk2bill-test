/**
 * API Configuration Utility
 * 
 * Centralized configuration for API endpoints to handle CORS and environment-specific URLs.
 * 
 * In development: Uses Vite proxy (relative URLs)
 * In production: Uses environment variables or fallback to full URLs
 * 
 * To fix CORS in production:
 * 1. Set VITE_API_BASE_URL environment variable to your API base URL
 * 2. Ensure backend has CORS headers configured for your deployed domain
 * 3. Or use a proxy service (e.g., Cloudflare Workers, Netlify Functions)
 */

/**
 * Gets the base URL for API requests
 * Priority:
 * 1. VITE_API_BASE_URL environment variable (if set)
 * 2. Empty string in dev (uses Vite proxy)
 * 3. Fallback to staging URL in production
 */
export const getApiBaseUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // In development, use empty string to leverage Vite proxy
  if (import.meta.env.DEV) {
    return '';
  }

  // Production fallback - can be overridden with VITE_API_BASE_URL
  return 'https://staging.vyaparapp.in';
};

/**
 * Gets the analytics API base URL
 */
export const getAnalyticsApiBaseUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_ANALYTICS_API_BASE_URL) {
    return import.meta.env.VITE_ANALYTICS_API_BASE_URL;
  }

  // In development, use empty string to leverage Vite proxy
  if (import.meta.env.DEV) {
    return '';
  }

  // Production fallback
  return 'https://analytics-staging.vyaparapp.in';
};

/**
 * API Base URLs
 */
export const API_BASE_URL = getApiBaseUrl();
export const ANALYTICS_API_BASE_URL = getAnalyticsApiBaseUrl();

/**
 * Common API Endpoints
 */
export const API_ENDPOINTS = {
  // Talk2Bill endpoints
  TALK2BILL: {
    SIGNED_URL: `${API_BASE_URL}/api/ns/cloud/file/multiple-signed-urls`,
    JOB_STATUS: `${API_BASE_URL}/api/ps/talk2bill/jobs`,
    SESSION_STATUS: `${API_BASE_URL}/api/ps/talk2bill/session`,
    FEEDBACK: `${API_BASE_URL}/api/ps/talk2bill/session`,
    LOGIN: `${ANALYTICS_API_BASE_URL}/api/ps/talk2bill/talk2bill-login`,
    UPLOAD: `${ANALYTICS_API_BASE_URL}/api/ps/talk2bill/talk2bill-upload`,
    VERIFY: `${ANALYTICS_API_BASE_URL}/api/ps/talk2bill/talk2bill-voice-verify`,
    EXTRACT_JSON: `${ANALYTICS_API_BASE_URL}/api/ps/talk2bill/extract-json-alt`,
  },
} as const;

