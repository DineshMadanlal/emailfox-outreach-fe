let gleapInstance = null;

const getGleap = async () => {
  if (gleapInstance) {
    return gleapInstance;
  }

  const module = await import(
    /* webpackChunkName: "gleap" */
    /* webpackPrefetch: false */
    'gleap'
  );

  gleapInstance = module.default || module;

  return gleapInstance;
};

// initialize gleap
export const initGleap = async () => {
  setTimeout(async () => {
    const Gleap = await getGleap();

    // Please make sure to call this method only once!
    Gleap.initialize(process.env.GLEAP_API_KEY);

    Gleap.showFeedbackButton(false);

    return true;
  }, 2000);
};

export const showGleapWidget = async () => {
  const Gleap = await getGleap();

  Gleap.open();
};

export const gleapIdentifyUser = async ({
  userId, user,
}) => {
  const Gleap = await getGleap();

  Gleap.identify(userId, user);
};

export const gleapUpdateContact = async (contact) => {
  const Gleap = await getGleap();

  Gleap.updateContact(contact);
};

export const gleapClearIdentity = async () => {
  const Gleap = await getGleap();

  Gleap.clearIdentity();
};

const trackGleapEvent = async (eventName, eventData) => {
  const Gleap = await getGleap();

  Gleap.trackEvent({
    name: eventName,
    data: eventData || {},
  });
};

export const trackUserEvent = async (eventName, eventData) => {
  // track all events
  await trackGleapEvent(eventName, eventData);
};

export const startProductTour = async () => {
  const Gleap = await getGleap();

  Gleap.startProductTour('6864d9fe3eaa9f120fd2a56d');
};
