<template>
  <q-card flat class="app-modal-card cancel-subscription-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Cancel Subscription
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
      <p class="cancel-warning-card">
        <b>Important:</b> Cancelling your subscription will stop all active campaigns
        and disable sending. Your account will remain accessible until the end of
        your current billing period. After cancellation, Outreach features will no
        longer be available unless you subscribe again.
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToDelete"

        color="primary"
        label="I understand the consequences of cancelling the subscription."
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="negative"
        label="Cancel my subscription"

        :loading="isApiLoading"
        :disabled="!agreeToDelete"

        @click="onConfirmCancellation"
      />

      <!-- Delete -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        :loading="isApiLoading"

        label="Cancel"
        color="primary"

        class="light-primary-btn"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'DeleteDomains',

  emits: ['onSuccessfulCancelSubscription'],

  setup(_, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      agreeToDelete: false,

      isApiLoading: false,
    });

    // methods
    const onConfirmCancellation = async () => {
      try {
        state.isApiLoading = true;

        await postApiCall({
          endpoint: 'subscription/unsubscribe',
          payload: {

          },
        });

        appContext.config.globalProperties.$toast({
          message: 'Subscription cancelled successfully.',
        });

        emit('onSuccessfulCancelSubscription');
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
      onConfirmCancellation,
    };
  },
});
</script>

<style lang="scss" scoped>
.cancel-subscription-card {
  max-width: 600px;

  .light-primary-btn {
    margin-left: 12px;
  }

  .cancel-warning-card {
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
