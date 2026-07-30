<template>
  <q-layout
    container
    view="lHh Lpr lFf"
    class="master-inbox-main-layout"
  >
    <!-- Modals -->
    <q-dialog
      :position="composeEditorModalType.maximized ? 'standard' : 'bottom'"
      :class="{ 'app-bottom-dialog': !composeEditorModalType.maximized }"

      v-model="showSkyBoxComposeEditorModal"

      :maximized="composeEditorModalType.maximized"
      :persistent="composeEditorModalType.persistent"
    >
      <SkyBoxComposeEditor
        :maximized="composeEditorModalType.maximized"

        @onMaximize="handleComposeEditorResize"
        @onSuccessSentEmail="onSuccessSentEmail"
        @updatePersistentStatus="handleComposeEditorPersistentStatus"
      />
    </q-dialog>

    <!-- Main Content -->
    <q-page-container class="master-inbox-page-container">
      <q-page class="master-inbox-main-content">
        <!-- router view -->
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, watch,
} from 'vue';

// Components
import SkyBoxComposeEditor from 'components/MasterInbox/Modals/ComposeEditor.vue';

// store pinia
import { useSkyboxStore } from 'src/stores/skybox.js';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'SkyBoxMainIndex',

  components: {
    SkyBoxComposeEditor,
  },

  setup() {
    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // store
    const skyboxPinia = useSkyboxStore();

    // state
    const state = reactive({
      composeEditorModalType: {},

      // modal
      showSkyBoxComposeEditorModal: false,
    });

    // computed
    const secondarySiderbarClickEvent = computed(() => skyboxPinia.getSecondarySiderbarClickEvent);

    // methods
    const toggleDrawerMiniState = () => {
      skyboxPinia.toggleDrawerMiniState();
    };

    const onSuccessSentEmail = () => {
      state.showSkyBoxComposeEditorModal = false;
    };

    const handleComposeEditorResize = () => {
      state.composeEditorModalType.maximized = !state.composeEditorModalType.maximized;
    };

    const handleComposeEditorPersistentStatus = (status) => {
      state.composeEditorModalType.persistent = status;
    };

    const onRefreshSkybox = () => {
      // refresh the email list
      const refreshButton = document.getElementById('skyboxEmailListReloadBtn');

      if (refreshButton) {
        refreshButton.click();
      }
    };

    // watch
    watch(secondarySiderbarClickEvent, (newVal) => {
      if (!newVal) return;

      if (newVal === 'REFRESH_SKYBOX') {
        onRefreshSkybox();
      } else if (newVal === 'COMPOSE_EMAIL') {
        state.showSkyBoxComposeEditorModal = true;
      }

      skyboxPinia.setMultipleFields({
        secondarySiderbarClickEvent: null,
      });
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      onRefreshSkybox,
      toggleDrawerMiniState,
      onSuccessSentEmail,
      handleComposeEditorResize,
      handleComposeEditorPersistentStatus,
    };
  },

});
</script>

<style lang="scss" scoped>
.master-inbox-main-layout {
  width: 100%;
  min-height: 100% !important;

  :deep(.q-drawer--left) {
    background-color: $white;

    .master-inbox-drawer {
      background-color: $white;
      border-right: 1px solid $grey-50;
    }

    &.q-drawer--mini {
      .master-inbox-drawer {
        background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.6);
      }
    }
  }

  :deep(.scroll) {
    min-height: 100%;

    display: grid;
    grid-template-columns: 1fr;
  }

  .master-inbox-page-container {
    display: grid;
    min-height: inherit;
    grid-template-rows: 1fr;

    .master-inbox-main-content {
      min-height: inherit !important;
    }
  }
}
</style>
