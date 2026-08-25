<template>
  <router-view
    v-if="showRouterView"
  />

  <ApiLoader
    v-else
    show
  />

  <!-- Include GlobalToast directly in the root template -->
  <GlobalToast />
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  computed, defineComponent, onBeforeUnmount, onMounted, provide, reactive, toRefs,
} from 'vue';

// quasar
import { useQuasar } from 'quasar';

// Import the Pinia store
import { useAuthStore } from 'src/stores/auth';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';
import useAppHelpersApi from 'src/composables/app-helpers.js';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import GlobalToast from 'components/Global/GlobalToast.vue';

// vue apollo composable - vue3
import { ApolloClients } from '@vue/apollo-composable';

// apollo client
import { client1 } from 'src/graphql/apollo';

// utils
import { updatePrimaryAndSecondaryColor } from 'src/utils/quasarHelpers.js';
import { applyBranding } from 'src/utils/applyBranding';
import { getWorkspaceSlugFromUrl } from 'src/utils/helperFunctions';

// boot
import { setApiBaseURL } from 'src/boot/axios';

export default defineComponent({
  name: 'App',

  components: {
    ApiLoader,
    GlobalToast,
  },

  setup() {
    const $q = useQuasar();

    // Access the user store
    const authStorePinia = useAuthStore();

    // composition API
    const {
      fetchWorkspaceDetailsBySlug,
    } = useWorkspace();
    const { updateAppBranding } = useAppHelpersApi();

    // state
    const state = reactive({
      showRouterView: false,

      configTimeoutId: null,
    });

    // computed
    const activeWorkspaceData = computed(() => authStorePinia.getActiveWorkspaceData);

    // methods
    const setupApollo = () => {
      provide(ApolloClients, {
        default: client1,
      });
    };

    setupApollo();

    const setupWorkspaceBranding = (workspaceData) => {
      if (workspaceData?.theme_color) {
        updatePrimaryAndSecondaryColor(workspaceData.theme_color);
      }
    };

    const primaryAppSetup = async () => {
      const workspaceSlug = getWorkspaceSlugFromUrl();

      try {
        if (workspaceSlug) {
          if (isEmpty(activeWorkspaceData.value)) {
            // fetch workspace details and set branding
            const response = await fetchWorkspaceDetailsBySlug(workspaceSlug);

            authStorePinia.setField({
              field: 'activeWorkspaceData',
              value: response,
            });

            setupWorkspaceBranding(response);
          } else {
            setupWorkspaceBranding(activeWorkspaceData.value);
          }

          state.showRouterView = true;
        } else {
          state.showRouterView = true;

          updateAppBranding();
        }
      } catch (error) {
        updateAppBranding();
        state.showRouterView = true;
      } finally {
        applyBranding();
      }
    };

    const onAppMounted = async () => {
      // no dark mode
      $q.dark.set(false);

      primaryAppSetup();

      // Inside a cross-origin iframe: use postMessage handshake instead of isMainApp()
      // Send EMAILFOX_INIT to signal we are ready to receive config
      if (window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'EMAILFOX_INIT',
            version: '1.0.0',
            timestamp: Date.now(),
          },
          '*',
        );
      }
    };

    // Handles the EMAILFOX_CONFIG message sent by the parent in response to EMAILFOX_INIT
    const handleConfigMessage = (event) => {
      if (event.data?.type !== 'EMAILFOX_CONFIG') {
        return;
      }

      // Clean up listener — config is a one-time handshake
      window.removeEventListener('message', handleConfigMessage);

      if (state.configTimeoutId) {
        clearTimeout(state.configTimeoutId);
      }

      const { isMainApp: isMainAppFlag } = event.data;

      if (isMainAppFlag) {
        // Switch axios to the primary app API before any requests are made
        setApiBaseURL(process.env.AUTHENTICATION_API);
      }
    };

    // Handles the EMAILFOX_LOGOUT message sent by the parent to force-logout the user
    const handleLogoutMessage = (event) => {
      if (event.data?.type !== 'EMAILFOX_LOGOUT') {
        return;
      }

      authStorePinia.logoutUser?.();
    };

    onMounted(async () => {
      if (window.parent !== window) {
        // Register config listener before sending EMAILFOX_INIT to avoid any race condition
        window.addEventListener('message', handleConfigMessage);

        // Register logout listener — stays active for the lifetime of the app
        window.addEventListener('message', handleLogoutMessage);

        // Fallback: if parent does not respond within 3s, treat as white-label
        state.configTimeoutId = setTimeout(() => {
          window.removeEventListener('message', handleConfigMessage);
        }, 3000);
      }

      onAppMounted();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('message', handleConfigMessage);
      window.removeEventListener('message', handleLogoutMessage);

      if (state.configTimeoutId) {
        clearTimeout(state.configTimeoutId);
      }
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>
