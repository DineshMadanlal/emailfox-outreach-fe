import posthog from 'posthog-js';

posthog.init('phc_84cG5CH3EKv6XnhGAfFIEL7aFAMqK0BcfUcyPZHQB70', {
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only',
  disable_session_recording: window.location.hostname === 'localhost',
  loaded(loadedPostHog) {
    if (window.location.hostname === 'localhost') {
      loadedPostHog.opt_out_capturing(); // Opt out of capturing events
    }
  },
  // optional: defaults or any other config
});

export default posthog;
