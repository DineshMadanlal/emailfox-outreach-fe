// src/stores/plugins/secureLSPlugin.js
import SecureLS from 'secure-ls';

// constants
import { LOCAL_STORAGE_KEY } from 'boot/constants';

const secureLS = new SecureLS({ encodingType: 'aes' });
// IDs of stores you want to exclude storing in encrypted storage
const excludedStores = new Set(['storeExclusions']);

export function secureLSPlugin({ store }) {
  const key = LOCAL_STORAGE_KEY; // The key for storing all store states

  // Restore state from encrypted storage when the store is initialized
  const allStates = secureLS.get(key) || {};
  if (!excludedStores.has(store.$id) && allStates[store.$id]) {
    store.$patch(allStates[store.$id]);
  }

  // Save state to encrypted storage whenever it changes
  store.$subscribe((mutation, state) => {
    if (!excludedStores.has(store.$id)) {
      const currentState = secureLS.get(key) || {};
      currentState[store.$id] = state;
      secureLS.set(key, currentState);
    }
  });
}
