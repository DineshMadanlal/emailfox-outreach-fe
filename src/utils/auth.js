// lodash
import get from 'lodash/get';

// Import SecureLS
import SecureLS from 'secure-ls';

// Constants
import { LOCAL_STORAGE_KEY } from 'boot/constants';

// Create an instance of SecureLS
const secureLS = new SecureLS({ encodingType: 'aes' });

export const getUserToken = () => {
  // Retrieve all encrypted states
  const allStates = secureLS.get(LOCAL_STORAGE_KEY) || {};

  return get(allStates, 'storeAuth.token', null);
};
