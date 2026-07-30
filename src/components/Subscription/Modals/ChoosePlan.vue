<template>
  <q-card
    flat
    class="choose-plan-card app-modal-card"
  >
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

    <div class="plan-card-container">
      <!-- header -->
      <div
        class="plan-modal-header"
      >
        <div>
          <p
            class="choose-plan-header-text"
          >
            Choose your Outreach plan
          </p>

          <p class="choose-plan-desc-text">
            Select the outbound capacity that fits your team's growth.
          </p>
        </div>
      </div>

      <!-- content -->
      <BillingTable
        @onPaymentSuccess="onPaymentSuccess"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, computed,
} from 'vue';

// Components
import BillingTable from 'components/Subscription/BillingTable.vue';

// Pinia
import { useAuthStore } from 'src/stores/auth';

export default defineComponent({
  name: 'ChoosePlan',

  emits: ['postPaymentSuccess'],

  components: {
    BillingTable,
  },

  setup(_, { emit }) {
    // Access the authentication store
    const authStorePinia = useAuthStore();

    // computed
    const isCreditCardSubscribed = computed(() => authStorePinia.isCreditCardSubscribed);

    // methods
    const onPaymentSuccess = () => {
      emit('postPaymentSuccess');
    };

    return {

      // computed
      isCreditCardSubscribed,

      // methods
      onPaymentSuccess,
    };
  },
});
</script>

<style lang="scss" scoped>
.choose-plan-card {
  width: 100%;
  position: relative;
  border-radius: 0px !important;
  background: #FAFCFF;

  display: flex;
  flex-direction: column;
  align-items: center;

  .app-negative-button {
    position: absolute;
    top: 12px;
    right: 12px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      top: 4px;
      right: 4px;
    }
  }

  .plan-card-container {
    width: 100%;
    max-width: 1200px;
    padding: 40px 20px;

    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 24px 12px;
    }
  }

  .plan-modal-header {
    background: inherit;
    border: 0px;
    align-items: baseline;
    padding: 0px;
    margin-bottom: 40px;

    .choose-plan-header-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .choose-plan-desc-text {
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
      color: rgba($color: var(--black-rgb), $alpha: 0.8);

      margin-top: 8px;
    }
  }

  .app-modal-content {
    padding: 20px 0px;
  }
}
</style>
