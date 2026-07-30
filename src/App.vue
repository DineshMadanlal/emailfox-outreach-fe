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
  computed, defineComponent, onMounted, provide, reactive, toRefs,
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
import { isMainApp, applyBranding } from 'src/utils/applyBranding';
import { getWorkspaceSlugFromUrl } from 'src/utils/helperFunctions';

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
      fetchWorkspaceDetailsByWhitelabelUrl,
    } = useWorkspace();
    const { updateAppBranding } = useAppHelpersApi();

    // state
    const state = reactive({
      showRouterView: false,
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

        // if (workspaceSlug) {
        //   // move to app.
        //   primaryAppRouteToLoginPage();
        // }
      } finally {
        applyBranding();
      }
    };

    const setupWhitelabelBranding = (workspaceData) => {
      applyBranding({
        description: '',
        analyticsId: '',
        themeColor: workspaceData.theme_color,
        icons: {
          ico: 'https://',
        },
      });
    };

    const whitelabelBrandingSetup = async () => {
      const appUrl = window.location.hostname;

      try {
        if (isEmpty(activeWorkspaceData.value)) {
          // fetch workspace details and set branding
          const response = await fetchWorkspaceDetailsByWhitelabelUrl(appUrl);

          authStorePinia.setField({
            field: 'activeWorkspaceData',
            value: response,
          });

          setupWhitelabelBranding(response);

          setupWorkspaceBranding(response);

          state.showRouterView = true;
        } else {
          setupWhitelabelBranding(activeWorkspaceData.value);

          setupWorkspaceBranding(activeWorkspaceData.value);

          state.showRouterView = true;
        }
      } catch (error) {
        // redirect to google if any error in fetching workspace details using whitelabel url
        window.location.href = 'https://www.google.com';
      }
    };

    const onAppMounted = async () => {
      const isMainAppFlag = isMainApp();

      // no dark mode
      $q.dark.set(false);

      if (isMainAppFlag) {
        primaryAppSetup();
      } else {
        whitelabelBrandingSetup();
      }
    };

    onMounted(async () => {
      onAppMounted();
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>
