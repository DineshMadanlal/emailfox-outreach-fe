<template>
  <q-layout
    container
    view="lHh Lpr lFf"
    class="master-inbox-preferences-preferences-layout"
  >
    <!-- Sidebar -->
    <q-drawer

      :width="200"
      :breakpoint="0"
      :model-value="true"
      :mini="preferencesDrawerMiniState"

      side="left"
      class="master-inbox-preferences-drawer"
    >
      <div class="master-inbox-back-btn-container">
        <!-- Back Button -->
        <q-btn
          flat
          no-caps
          unelevated

          color="primary"
          :to="backToDetailsInJson.route"
          class="master-inbox-preferences-back-btn"
        >
          <LocalSvgIcon
            image="back-to"
            classes="back-icon"
          />

          <p
            class="back-text"
            v-if="!preferencesDrawerMiniState"
          >
            {{ backToDetailsInJson.text }}
          </p>

          <AppTooltip
            :content="backToDetailsInJson.text"
            anchor="center right"
            self="center left"
            :offset="[6, 10]"

            v-if="preferencesDrawerMiniState"
          />
        </q-btn>
      </div>

      <!-- Content -->
      <PreferencesSidebarContent
        :miniDrawer="preferencesDrawerMiniState"
      />
    </q-drawer>

    <!-- Main Content -->
    <q-page-container class="master-inbox-preferences-page-container">
      <q-page
        class="master-inbox-preferences-main-content"
        :style="{ height: `${pageHeight}px` }"
      >
        <!-- router view -->
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
// vue
import {
  computed, defineComponent, reactive, toRefs, onMounted, onBeforeUnmount,
} from 'vue';

// vue route
import { useRoute } from 'vue-router';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';
import PreferencesSidebarContent from 'components/MasterInbox/Preferences/Content.vue';

// store pinia
import { useSkyboxStore } from 'src/stores/skybox.js';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { isMainApp } from 'src/utils/applyBranding';

export default defineComponent({
  name: 'SkyBoxPreferences',

  components: {
    AppTooltip,
    PreferencesSidebarContent,
  },

  setup() {
    // router
    const $route = useRoute();

    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      pageHeight: 0,
    });

    // store
    const skyboxPinia = useSkyboxStore();

    // computed
    const preferencesDrawerMiniState = computed(() => skyboxPinia.getPreferencesMiniState
      || isMobileDevice.value);

    const isFolderPage = computed(() => {
      if ($route.path.includes('/unibox/preferences/folder/')) {
        return true;
      }
      return false;
    });

    const backToDetailsInJson = computed(() => {
      if (isFolderPage.value) {
        return {
          route: 'unibox/preferences/folders',
          text: 'Back to Folders',
        };
      }

      const isPrimaryPlatform = isMainApp();

      if (isPrimaryPlatform) {
        return {
          route: 'unibox',
          text: 'Back to SkyBox',
        };
      }

      return {
        route: '/unibox',
        text: 'Back to Inbox',
      };
    });

    // methods
    const toggleDrawerMiniState = () => {
      skyboxPinia.togglePreferencesMiniState();
    };

    const updatePageMaxHeight = () => {
      const mainPageContentElement = document.getElementById('appMainPageContent');

      if (mainPageContentElement) {
        // print style
        const { maxHeight } = mainPageContentElement.style;

        state.pageHeight = maxHeight.replace('px', '');
      }
    };

    onMounted(() => {
      updatePageMaxHeight();

      // add event listener for window resize
      window.addEventListener('resize', updatePageMaxHeight);
    });

    onBeforeUnmount(() => {
      // remove event listener for window resize
      window.removeEventListener('resize', updatePageMaxHeight);
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isFolderPage,
      isMobileDevice,
      backToDetailsInJson,
      preferencesDrawerMiniState,

      // methods
      toggleDrawerMiniState,
    };
  },

});
</script>

<style lang="scss" scoped>
.master-inbox-preferences-preferences-layout {
  width: 100%;
  min-height: 100% !important;

  :deep(.q-drawer--left) {
    background-color: $white;

    .master-inbox-preferences-drawer {
      background-color: $white;
      border-right: 1px solid $grey-50;
    }

    &.q-drawer--mini {
      .master-inbox-preferences-drawer {
        background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.6);
      }
    }

    .master-inbox-back-btn-container {
      width: 100%;
      padding: 12px 12px 0px 12px;

      .master-inbox-preferences-back-btn {
        width: 100%;
        padding: 0px 4px;

        .back-text {
          color: $black;
          font-size: 18px;
          font-weight: 600;

          margin-left: 12px;
        }
      }
    }
  }

  :deep(.scroll) {
    min-height: 100%;

    display: grid;
    grid-template-columns: 1fr;
  }

  .master-inbox-preferences-page-container {
    display: grid;
    min-height: inherit;
    grid-template-rows: 1fr;

    .master-inbox-preferences-main-content {
      min-height: inherit !important;
    }
  }
}
</style>
