import posthog from 'posthog-js';

let initialized = false;

/**
 * Initialize PostHog partner analytics
 * Only initializes if POSTHOG_PROJECT_TOKEN exists in environment
 * @returns {object|null} PostHog client or null
 */
export function initPartnerAnalytics() {
  try {
    const token = process.env?.POSTHOG_PROJECT_TOKEN?.trim();

    const apiHost = 'https://us.i.posthog.com';

    // Guard: only proceed if token exists
    if (!token) {
      console.log('PostHog skipped: POSTHOG_PROJECT_TOKEN not found.');
      return null;
    }

    if (!initialized) {
      posthog.init(token, {
        api_host: apiHost,
        defaults: '2026-05-30',
      });

      initialized = true;
    }

    return posthog;
  } catch (error) {
    console.log('PostHog init failed. App continues without analytics.', error);
    return null;
  }
}

/**
 * Identify user in PostHog upon login
 * @param {object|string|number} user User object or distinct ID
 * @param {object} extraProperties Additional metadata to attach
 */
export function identifyPartnerUser(user, extraProperties = {}) {
  try {
    if (!initialized || !user) return;

    const userId = user.id;
    if (!userId) return;

    const properties = {
      email: user.email,
      name: user.name,
      ...extraProperties,
    };

    // Remove undefined properties
    Object.keys(properties).forEach((key) => {
      if (properties[key] === undefined) {
        delete properties[key];
      }
    });

    posthog.identify(String(userId), properties);
  } catch (error) {
    console.log('PostHog identify failed:', error);
  }
}

/**
 * Reset PostHog session upon logout
 */
export function resetPartnerUser() {
  try {
    if (!initialized) return;
    posthog.reset();
  } catch (error) {
    console.log('PostHog reset failed:', error);
  }
}

/**
 * Capture custom event in PostHog
 * @param {string} eventName Name of event
 * @param {object} properties Event properties
 */
export function capturePartnerEvent(eventName, properties = {}) {
  try {
    if (!initialized) return;
    posthog.capture(eventName, properties);
  } catch (error) {
    console.log('PostHog capture failed:', error);
  }
}

export default {
  initPartnerAnalytics,
  identifyPartnerUser,
  resetPartnerUser,
  capturePartnerEvent,
};
