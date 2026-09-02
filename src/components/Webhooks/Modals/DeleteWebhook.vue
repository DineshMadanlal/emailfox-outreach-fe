<template>
  <q-card flat class="app-modal-card delete-webook-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Delete Webhook
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
      <p class="delete-warning-text">
        Deleting the webhook will
        <span class="permanent-delete-text">
          permanently delete
        </span>
        all associated data.
        <br />
        <br />
        This action cannot be undone. Are you sure you want to continue?
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToDelete"

        color="negative"
        label="I understand the consequences of deleting the webhook"
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="negative"
        label="Permanently Delete"

        :loading="isApiLoading"
        :disabled="!agreeToDelete"

        @click="onConfirmDelete"
      />

      <!-- Delete -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        :loading="isApiLoading"

        label="Cancel"
        color="negative"

        class="light-negative-btn"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// Utils
import { deleteApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'DeleteWebhook',

  emits: ['onSuccessfulDelete'],

  props: {
    editWebhookJson: {
      type: Object,
      required: true,
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      agreeToDelete: false,

      isApiLoading: false,
    });

    // methods
    const onConfirmDelete = async () => {
      try {
        state.isApiLoading = true;

        // delete multiple domains
        await deleteApiCall({
          includeWorkspace: true,
          endpoint: `/webhooks/${props.editWebhookJson.id}`,
        });

        appContext.config.globalProperties.$toast({
          message: 'Webhook deleted successfully',
        });

        emit('onSuccessfulDelete');
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // methods
      onConfirmDelete,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-webook-card {
  max-width: 600px;

  .light-negative-btn {
    margin-left: 12px;
  }

  .delete-warning-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;

    margin-bottom: 20px;

    .permanent-delete-text {
      color: $negative;
    }
  }
}
</style>
