// vue
import { computed } from 'vue';

// npm
import { useActiveElement } from '@vueuse/core';

// quasar
import { useQuasar, Platform, QSpinnerBars } from 'quasar';

// router
import { useRouter } from 'vue-router';

// Import the Pinia store
import { useCustomerStore } from 'src/stores/customer.js';
import { useUserPreferencesStore } from 'src/stores/userPreferences.js';

// utils
import { isMainApp } from 'src/utils/applyBranding.js';
import { setDarkModeColors, setDefaultOtherColors } from 'src/utils/quasarHelpers';

// constants
import { APP_MODE } from 'boot/constants';

export default function useAppHelpersApi() {
  // quasar
  const $q = useQuasar();

  // router
  const $router = useRouter();

  // use active element
  const activeElement = useActiveElement();

  // Access the user store
  const userStore = useUserPreferencesStore();
  const customerStorePinia = useCustomerStore();

  // Create a computed property to access the current app mode
  const selectedMode = computed(() => userStore.getAppMode);

  const isMobileDevice = computed(() => $q.screen.lt.sm);
  const isElectronApp = computed(() => Platform.is.electron);
  const partnerBranding = computed(() => customerStorePinia.getBrandingData);

  const isNotTyping = computed(() => {
    const tagName = activeElement.value?.tagName;
    const className = activeElement.value?.className;

    return tagName !== 'INPUT'
        && tagName !== 'TEXTAREA'
        && !(tagName === 'DIV' && className.includes('fr-element'));
  });

  const isNoDialogOpen = computed(() => !document.querySelectorAll('.q-dialog__inner').length > 0);

  const generateMetadata = (pageTitle) => {
    const isPrimaryPlatform = isMainApp();

    if (isPrimaryPlatform) {
      return {
        // sets document title
        title: pageTitle,
        // titleTemplate: (title) => `${title} | Sky Senders`,
        titleTemplate: (title) => `${title}`,
      };
    }

    const appName = partnerBranding.value?.name || '';

    // For non-Sky Senders apps, return an empty object
    return {
      // sets document title
      title: pageTitle,
      titleTemplate: (title) => {
        if (appName) {
          return `${title} | ${appName}`;
        }

        return title;
      },
    };
  };

  // return {
  //   // sets document title
  //   title: pageTitle,
  //   titleTemplate: (title) => `${title}`,
  // };

  const setAppColourPalette = () => {
    if ($q.dark.isActive) {
      // set dark mode colors
      setDarkModeColors();
    } else {
      // set default colors
      setDefaultOtherColors();
    }
  };

  const updateAppMode = (mode) => {
    if (mode === APP_MODE.LIGHT_MODE) {
      $q.dark.set(false);
    } else if (mode === APP_MODE.DARK_MODE) {
      $q.dark.set(true);
    } else {
      $q.dark.set('auto');
    }

    setAppColourPalette();
  };

  const updateAppBranding = () => {
    updateAppMode(selectedMode.value);
  };

  const goBackOrHome = () => {
    try {
      $router.go(-1);
    } catch (error) {
      // $router.push(defaultHome);
    }
  };

  const showQuasarLoader = (message = '') => {
    $q.loading.show({
      message,
      size: '40px',
      spinner: QSpinnerBars,
      spinnerColor: 'primary',
    });
  };

  const hideQuasarLoader = () => {
    $q.loading.hide();
  };

  return {
    // computed
    isMobileDevice,
    isElectronApp,
    isNotTyping,
    isNoDialogOpen,

    // methods
    goBackOrHome,
    updateAppBranding,

    updateAppMode,
    generateMetadata,
    showQuasarLoader,
    hideQuasarLoader,
  };
}
