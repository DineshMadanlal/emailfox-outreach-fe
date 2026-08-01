<template>
  <!-- Layout -->
  <q-layout
    view="hHh LpR fFf"
    class="app-layout"

    v-if="isWorkspaceValid"
  >
    <!-- Drak left Rail -->
    <q-drawer
      show-if-above

      :width="74"
      :breakpoint="1023"

      side="left"
      class="app-left-rail"

      v-model="storeExclusionsPinia.leftDrawerOpen"
    >
      <LeftRail
        :isPrimaryApp="isPrimaryApp"
      />

      <SecondarySidebar />
    </q-drawer>

    <!-- Page Container -->
    <q-page-container class="app-page-container">
      <!-- Main Page -->
      <q-page
        id="appMainPage"
        class="app-main-page"
      >
        <div
          id="appMainPageContent"
          ref="mainPageContentRef"
          class="main-page-content hide-scrollbar"
        >
          <SecondarySidebar />

          <!-- router view -->
          <router-view />
        </div>
      </q-page>

    </q-page-container>

  </q-layout>

  <!-- Setting up workspace loader -->
  <q-layout
    v-else
    view="hHh lpR fFf"
  >
    <q-page-container>
      <q-page>
        <WorkspaceLoader />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
// lodash
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, reactive, toRefs, computed,
  onUnmounted, onMounted, getCurrentInstance,
} from 'vue';

// vue-router
import { useRoute } from 'vue-router';

// Components
import LeftRail from 'components/Sidebar/LeftRail.vue';
import WorkspaceLoader from 'components/Workspaces/Loader.vue';
import SecondarySidebar from 'components/Sidebar/SecondarySidebar.vue';

// vue apollo composable
import { useSubscription } from '@vue/apollo-composable';

// Import the Pinia store
import { useAuthStore } from 'src/stores/auth';
import { useCustomerStore } from 'src/stores/customer';
import { storeExclusions } from 'src/stores/storeExclusions.js';

// Utils
import { isMainApp } from 'src/utils/applyBranding';
import { waitForTimeInSeconds } from 'src/utils/helperFunctions';

// Composables
import { useWorkspace } from 'src/composables/useWorkspace';

// Graphql
import {
  getUserPlanDetails,
} from 'src/graphql/schema/plan_details';

export default defineComponent({
  name: 'AppLayout',

  components: {
    LeftRail,
    SecondarySidebar,
    WorkspaceLoader,
  },

  setup() {
    // instance
    const { appContext } = getCurrentInstance();

    // router
    const $route = useRoute();

    // store
    const authStorePinia = useAuthStore();
    const customerStorePinia = useCustomerStore();
    const storeExclusionsPinia = storeExclusions();

    // composables
    const {
      isWorkspaceValid,

      fetchAllWorkspaces,
    } = useWorkspace();

    // state
    const state = reactive({
      mainPageContentRef: null,
    });

    // computed
    const activeRoute = computed(() => $route.path);
    const loggedInUser = computed(() => authStorePinia.getUser);

    const isPrimaryApp = computed(() => isMainApp());
    const customerBrandingData = computed(() => customerStorePinia.getBrandingData);

    // useSubscription API
    const {
      onError: onGetUserPlanDetailsApiError,
      onResult: onGetUserPlanDetailsApiResult,
    } = useSubscription(getUserPlanDetails, () => ({
      accountId: loggedInUser.value.account_id,
    }));

    onGetUserPlanDetailsApiResult((response) => {
      const planDetails = get(response, 'data.results[0]') || {};

      if (isEmpty(planDetails)) {
        // logout the user if empty plan details
        authStorePinia.logoutUser();
      } else {
        authStorePinia.setMultipleFields({
          userPlan: planDetails,
        });
      }
    });

    onGetUserPlanDetailsApiError((error) => {
      if (!loggedInUser.value.account_id) {
        return;
      }

      const errorMessage = get(error, 'cause.originalError.message', '');

      // Display the error message using the Quasar Toast
      appContext.config.globalProperties.$toast({
        warning: true,
        message: errorMessage || 'An unexpected error occurred',
      });
    });

    // methods
    const updateMainPageMaxHeight = () => {
      if (state.mainPageContentRef) {
        const mainPageElement = document.getElementById('appMainPage');

        // Get q-page dimensions and padding
        const qPageStyle = window.getComputedStyle(mainPageElement);

        const paddingTop = parseInt(qPageStyle.paddingTop, 10) || 0;
        const paddingBottom = parseInt(qPageStyle.paddingBottom, 10) || 0;

        // Calculate max height
        const qPageHeight = parseInt(window.getComputedStyle(
          mainPageElement,
        ).minHeight, 10) || window.innerHeight;
        const maxHeight = qPageHeight - paddingTop - paddingBottom;

        // Set max height for main page content
        state.mainPageContentRef.style.maxHeight = `${maxHeight}px`;
        state.mainPageContentRef.style.overflowY = 'auto';
      }
    };

    const trackExternalServices = async () => {
      //
    };

    const loadFroalaPlugin = async () => {
      // dynamically import plugin
      const Froala = await import('vue-froala-wysiwyg');

      // register plugin only now
      appContext.app.use(Froala.default);
    };

    // Update height on mount and when resizing
    onMounted(() => {
      updateMainPageMaxHeight();

      fetchAllWorkspaces();

      // enable vue froala plugin
      loadFroalaPlugin();

      state.enableGetUserDetailsByIdApi = true;

      // resize event listener
      window.addEventListener('resize', async () => {
        await waitForTimeInSeconds(0.2);
        updateMainPageMaxHeight();
      });
    });

    window.addEventListener(
      'mousemove',
      async () => {
        trackExternalServices();
      },
      { once: true },
    );

    // Cleanup event listener
    onUnmounted(() => {
      window.removeEventListener('mousemove', () => {});
      window.removeEventListener('resize', updateMainPageMaxHeight);
    });

    return {
      // state
      ...toRefs(state),

      // computed
      activeRoute,
      isPrimaryApp,
      isWorkspaceValid,
      customerBrandingData,

      // store
      storeExclusionsPinia,
    };
  },
});
</script>

<style lang="scss" scoped>
.app-layout {
  :deep(.app-left-rail) {
    background: $white;

    .secondary-sidebar {
      display: none;
    }

    // sm max
    @media (max-width: $breakpoint-sm-max) {
      display: flex;
      width: fit-content !important;

      .secondary-sidebar {
        display: block;
      }
    }
  }

  .app-page-container {
    .app-main-page {
      width: 100%;
      background: $secondary;

      padding: 6px;

      display: grid;
      grid-template-rows: 1fr;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 0px;
      }

      .main-page-content {
        display: flex;
        // grid-template-rows: 1fr;

        background: $white;
        border-radius: 8px;
        position: relative;
        @include custom-scrollbar;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          border-radius: 0px;
        }

        // sm max
        @media (max-width: $breakpoint-sm-max) {
          :deep(.secondary-sidebar) {
            display: none;
          }
        }
      }
    }
  }
}
</style>
