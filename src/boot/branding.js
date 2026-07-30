// Stores
import { useAuthStore } from 'stores/auth';

// utils
import { applyBranding, isMainApp } from 'src/utils/applyBranding';

const runWhenIdle = (callback) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
};

export default () => {
  // Access the auth store
  const authStore = useAuthStore();

  const isPrimaryPlatform = isMainApp();

  authStore.setField({ field: 'isMainApp', value: isPrimaryPlatform });

  if (isPrimaryPlatform) {
    runWhenIdle(() => {
      applyBranding();
    });
  }
};
