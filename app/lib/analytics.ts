/**
 * PostHog Analytics for the ZAO Cypher Visualizer
 * Provides functionality for tracking user events and session data
 */

// Define PostHog interface for TypeScript type safety
interface PostHogInstance {
  capture: (event: string, properties?: Record<string, any>) => void;
  identify: (distinctId: string, properties?: Record<string, any>) => void;
  init: (apiKey: string, options?: Record<string, any>) => void;
}

// Extend Window interface to include posthog property
declare global {
  interface Window {
    posthog?: PostHogInstance;
  }
}

/**
 * Initialize PostHog analytics
 * Creates a placeholder implementation until the actual script loads
 */
export const initializeAnalytics = (): void => {
  // Skip in SSR context
  if (typeof window === 'undefined') return;
  
  // Skip if already initialized
  if (window.posthog) return;
  
  // Get API credentials from environment
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY || 'phc_placeholder';
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  // Create a placeholder implementation
  const placeholder: PostHogInstance = {
    capture: (event, properties) => {
      console.log(`[Analytics] ${event}`, properties);
    },
    identify: () => {},
    init: () => {}
  };
  
  // Assign the placeholder
  window.posthog = placeholder;
  
  // Load the actual PostHog script
  const script = document.createElement('script');
  script.src = `${apiHost}/static/array.js`;
  script.async = true;
  
  // Once loaded, initialize properly
  script.onload = () => {
    if (window.posthog) {
      window.posthog.init(apiKey, {
        api_host: apiHost,
        disable_cookie: true,
        disable_session_recording: true,
        capture_pageview: false // We handle this manually
      });
    }
  };
  
  // Insert the script into the DOM
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
};

/**
 * Track an event with optional properties
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(eventName, properties);
  }
};

/**
 * Identify a user with optional traits
 */
export const identifyUser = (userId: string, traits?: Record<string, any>): void => {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.identify(userId, traits);
  }
};
