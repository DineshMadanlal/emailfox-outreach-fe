<template>
  <q-card flat class="app-modal-card bulk-reconnect-mailboxes-card">
    <!-- header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        Bulk Reconnect Mailboxes
      </h4>

      <q-space />

      <!-- Close -->
      <q-btn
        flat
        round
        dense
        v-close-popup

        color="negative"
        class="app-negative-button"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <!-- Content -->
    <div class="app-modal-content">
      <p class="reconnect-description-text">
        Are you sure you want to bulk reconnect all disconnected mailboxes?
        This process will run in the background.
      </p>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        :disabled="loaders.reconnecting"

        label="Cancel"
        color="primary"
        class="light-primary-btn q-mr-md"
      />

      <!-- Reconnect -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Reconnect Mailboxes"

        :loading="loaders.reconnecting"

        @click="onBulkReconnect"
      />
    </div>
  </q-card>
</template>

<script>
import {
  defineComponent, reactive, getCurrentInstance, toRefs,
} from 'vue';

// utils
import { bulkReconnectMailboxes } from 'src/utils/domainMailboxesApi.js';

export default defineComponent({
  name: 'BulkReconnectMailboxes',

  emits: ['onSuccess'],

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      loaders: {
        reconnecting: false,
      },
    });

    // methods
    const onBulkReconnect = async () => {
      if (state.loaders.reconnecting) return;

      try {
        state.loaders.reconnecting = true;

        const response = await bulkReconnectMailboxes();

        appContext.config.globalProperties.$toast({
          message: response?.message || 'Bulk reconnect initiated successfully.',
        });

        emit('onSuccess', response);
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.reconnecting = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // methods
      onBulkReconnect,
    };
  },
});
</script>

<style lang="scss" scoped>
.bulk-reconnect-mailboxes-card {
  max-width: 560px;

  .app-modal-content {
    .reconnect-description-text {
      color: rgba(var(--black-rgb), 1);
      font-size: 14px;
      line-height: 20px;

      max-width: 480px;
    }
  }
}
</style>
