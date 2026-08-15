<template>
  <div class="webhooks-settings">
    <!-- Dialog -->
    <q-dialog
      v-model="modals.showSaveWebhookModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveWebhook
        @newWebhookCreated="onNewWebhookCreated"
      />
    </q-dialog>

    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          Webhooks
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Manage your workspace webhooks.
        </p>
      </div>

      <!-- right side -->
      <div class="settings-header-right-side">
        <!-- Add webhook -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Add Webhook"

          @click="onAddNewWebhook"

          v-if="canCreateNewWebhook"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="settings-section-content">
      <WebhooksTable
        :key="`webhooks-table-${webhookTableKey}`"

        ref="webhooksTableRef"

        @onCreateNewWebhook="onAddNewWebhook"
      />
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, toRefs, reactive, computed,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import SaveWebhook from 'components/Webhooks/Modals/SaveWebhook.vue';
import WebhooksTable from 'components/Webhooks/WebhooksTable.vue';

export default defineComponent({
  name: 'WebhooksSettings',

  components: {
    SaveWebhook,
    WebhooksTable,
  },

  setup() {
    // composables
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Webhooks'));

    // state
    const state = reactive({
      modals: {
        showSaveWebhookModal: false,
      },

      loaders: {
        isFetchApi: false,
      },

      webhookTableKey: 0,
      webhooksTableRef: null,
    });

    // computed
    const canCreateNewWebhook = computed(() => {
      if (state.webhooksTableRef) {
        return !state.webhooksTableRef.showWebhookIllustration;
      }
      return true;
    });

    // methods
    const onAddNewWebhook = () => {
      state.modals.showSaveWebhookModal = true;
    };

    const onNewWebhookCreated = () => {
      state.modals.showSaveWebhookModal = false;

      // refresh table
      state.webhookTableKey += 1;
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      canCreateNewWebhook,

      // methods
      onAddNewWebhook,
      onNewWebhookCreated,
    };
  },
});
</script>

<style lang="scss" scoped>
.webhooks-settings {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;

  .settings-section-header {
    border-bottom: 0px;
    padding-bottom: 0px;
  }

  .settings-section-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}
</style>
