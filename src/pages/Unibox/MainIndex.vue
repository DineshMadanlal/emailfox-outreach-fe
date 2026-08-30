<template>
  <q-layout
    container
    view="lHh Lpr lFf"
    class="unibox-main-layout"
  >
    <!-- Compose Editor Modal Dialog -->
    <q-dialog
      :position="modals.composeEditorType.maximized ? 'standard' : 'bottom'"
      :class="{ 'app-bottom-dialog': !modals.composeEditorType.maximized }"
      v-model="modals.showComposeEditor"
      :maximized="modals.composeEditorType.maximized"
      :persistent="modals.composeEditorType.persistent"
    >
      <SkyBoxComposeEditor
        :maximized="modals.composeEditorType.maximized"
        @onMaximize="handleComposeEditorResize"
        @onSuccessSentEmail="onSuccessSentEmail"
        @updatePersistentStatus="handleComposeEditorPersistentStatus"
      />
    </q-dialog>

    <!-- Main Content Container -->
    <q-page-container class="unibox-page-container">
      <q-page class="unibox-main-content">
        <!-- Sub-route View -->
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

// components (reusing ComposeEditor for now)
import SkyBoxComposeEditor from 'components/MasterInbox/Modals/ComposeEditor.vue';

// store pinia
import { useUniboxStore } from 'src/stores/unibox.js';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { UNIBOX_SIDEBAR_CLICK_EVENTS } from 'boot/unibox-constants';

export default defineComponent({
  name: 'UniboxMainIndex',

  components: {
    SkyBoxComposeEditor,
  },

  setup() {
    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // store
    const uniboxPinia = useUniboxStore();

    // state
    const state = reactive({
      modals: {
        showComposeEditor: false,
        composeEditorType: {
          maximized: false,
          persistent: false,
        },
      },
    });

    // computed
    const secondarySidebarClickEvent = computed(
      () => uniboxPinia.getSecondarySidebarClickEvent,
    );

    // methods
    const onSuccessSentEmail = () => {
      state.modals.showComposeEditor = false;
    };

    const handleComposeEditorResize = () => {
      const isMax = state.modals.composeEditorType.maximized;
      state.modals.composeEditorType.maximized = !isMax;
    };

    const handleComposeEditorPersistentStatus = (status) => {
      state.modals.composeEditorType.persistent = status;
    };

    const onRefreshUnibox = () => {
      const refreshButton = document.getElementById('uniboxEmailListReloadBtn');

      if (refreshButton) {
        refreshButton.click();
      }
    };

    // Watch secondary sidebar events (Compose, Refresh)
    watch(secondarySidebarClickEvent, (newVal) => {
      if (!newVal) return;

      if (newVal === UNIBOX_SIDEBAR_CLICK_EVENTS.REFRESH_UNIBOX) {
        onRefreshUnibox();
      } else if (newVal === UNIBOX_SIDEBAR_CLICK_EVENTS.COMPOSE_EMAIL) {
        state.modals.showComposeEditor = true;
      }

      uniboxPinia.setMultipleFields({
        secondarySidebarClickEvent: null,
      });
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      onRefreshUnibox,
      onSuccessSentEmail,
      handleComposeEditorResize,
      handleComposeEditorPersistentStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-main-layout {
  width: 100%;
  min-height: 100% !important;

  :deep(.scroll) {
    min-height: 100%;
    display: grid;
    grid-template-columns: 1fr;
  }

  .unibox-page-container {
    display: grid;
    min-height: inherit;
    grid-template-rows: 1fr;

    .unibox-main-content {
      min-height: inherit !important;
    }
  }
}
</style>
