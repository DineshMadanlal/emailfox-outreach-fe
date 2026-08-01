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
