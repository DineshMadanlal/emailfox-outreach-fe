<template>
  <q-card flat class="unsubscribe-card">
    <!-- Dialog -->
    <q-dialog
      v-model="showCancelSubscriptionModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <CancelSubscription
        @onSuccessfulCancelSubscription="showCancelSubscriptionModal = false"
      />
    </q-dialog>

    <h6 class="unsubscribe-header-text">
      Manage your subscription
    </h6>

    <p class="unsubscribe-label-text">
      We're sorry to see you go!
      Canceling your subscription will stop future billings, but you can always reactivate anytime.
    </p>

    <!-- Unsubscribe Button -->
    <q-btn
      flat
      no-caps
      unelevated

      color="negative"
      class="light-negative-btn"
      label="Proceed with Cancellation"

      @click="onProceedWithCancellation"
    />
  </q-card>
</template>

<script>
// vue
import { defineComponent, reactive, toRefs } from 'vue';

// Modals
import CancelSubscription from 'components/Subscription/Modals/CancelSubscription.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'UnsubscribeCard',

  components: {
    CancelSubscription,
  },

  setup() {
    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      showCancelSubscriptionModal: false,
    });

    // methods
    const onProceedWithCancellation = () => {
      // proceed with cancellation
      state.showCancelSubscriptionModal = true;
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      onProceedWithCancellation,
    };
  },
});
</script>

<style lang="scss" scoped>
.unsubscribe-card {
  width: 100%;
  max-width: 720px;
  border-radius: 8px;
  background: $white;
  border: 1px solid $blue-grey;

  padding: 20px;
  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 12px;
  }

  .unsubscribe-header-text {
    color: $black;
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;

    margin-bottom: 4px;
  }

  .unsubscribe-label-text {
    color: $black;
    font-size: 14px;
    line-height: 22px;

    margin-bottom: 16px;
  }
}
</style>
