<template>
  <q-card flat class="billing-address-card">
    <!-- Dialog -->
    <q-dialog
      persistent
      v-model="showPlanCheckoutModal"

      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <PlanCheckout
        updatePaymentDetails

        @closeModal="showPlanCheckoutModal = false"
      />
    </q-dialog>

    <!-- content -->
    <div class="billing-address-card-content">
      <!-- Billing Address -->
      <div class="billing-address-details">
        <h6 class="billing-address-title">
          Billing Address
        </h6>

        <!-- Card holder name -->
        <p class="billing-card-name">
          {{ billingDetails.line1 }}
        </p>

        <!-- Billing Address -->
        <p class="billing-address-text">
          {{ billingDetails.line2 }}, {{ billingDetails.city }},
          {{ billingDetails.state }},
          {{ billingDetails.country }} - {{ billingDetails.postal_code }}
        </p>

        <!-- GSTIN -->
        <p
          v-if="billingDetails.tax_details?.value"
          class="gst-number-text"
        >
          GSTIN: {{ billingDetails.tax_details.value }}
        </p>
      </div>

      <!-- Card Info -->
      <div class="billing-address-details card-info">
        <h6 class="billing-address-title">
          Card Info
        </h6>

        <div
          class="card-details-grid"
        >
          <div
            v-for="(card, index) in cardDetails"
            :key="index"
            class="card-details-item"
          >
            <q-img
              v-if="card.icon"
              :src="card.icon"

              class="card-icon"
            />

            <LocalSvgIcon v-else :image="card.localIcon" classes="card-icon" />

            <div class="card-details-wrapper">
              <p class="card-label-text">
                {{ card.label }}
              </p>

              <p
                v-if="card.expiry"
                class="card-expiry-text"
              >
                Expiry: {{ card.expiry }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action -->
    <div class="billing-address-card-action">
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        label="Update Payment Details"
        color="primary"

        class="light-primary-btn"

        @click="showPlanCheckoutModal = true"
      />
    </div>
  </q-card>
</template>
<script>
// vue
import {
  defineComponent, computed, reactive, toRefs,
} from 'vue';

// Import the Pinia store
import { useAuthStore } from 'src/stores/auth';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import PlanCheckout from 'components/Subscription/Modals/PlanCheckout.vue';

export default defineComponent({
  name: 'BillingAddress',

  components: {
    PlanCheckout,
  },

  setup() {
    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // Access the authentication store
    const authStorePinia = useAuthStore();

    // state
    const state = reactive({
      showPlanCheckoutModal: false,
    });

    // computed
    const subscriptionPlan = computed(() => authStorePinia.getUserPlan);
    const userPaymentDetails = computed(() => authStorePinia.getUserPaymentDetails);

    const billingDetails = computed(() => subscriptionPlan.value.billing_details);

    const cardDetails = computed(() => {
      // Extract card details from user payment details
      const card = userPaymentDetails.value?.payment_card_details || {};

      return [
        {
          localIcon: 'credit-card',
          label: `${card.funding} Card Ending ${card.last4 || '****'}`,
          expiry: `${card.exp_month}/${card.exp_year}`,
        },
      ];
    });

    // No specific logic needed for this component
    return {
      // state
      ...toRefs(state),

      // computed
      cardDetails,
      isMobileDevice,
      billingDetails,

    };
  },
});
</script>

<style lang="scss" scoped>
.billing-address-card {
  width: 100%;
  max-width: 720px;

  border-radius: 8px;
  background: $white;
  border: 1px solid $blue-grey;

  //
  .billing-address-card-content {
    padding: 20px;

    display: flex;

    .billing-address-details {
      width: 100%;

      &.card-info {
        padding-left: 32px;
        border-left: 1px solid $grey-50;
      }
    }

    .billing-address-title {
      margin-bottom: 16px;

      color: $black;
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
    }

    .card-details-grid {
      display: grid;
      gap: 8px;

      .card-details-item {
        display: flex;

        .card-icon {
          min-width: 24px;
          max-width: 24px;

          height: 18px;

          position: relative;
          top: 5px;
        }

        .card-details-wrapper {
          margin-left: 8px;

          .card-label-text {
            font-size: 14px;
            color: $black;

            text-transform: capitalize;
          }

          .card-expiry-text {
            font-size: 14px;
            color: $black;

            margin-top: 6px;
          }
        }
      }
    }

    .billing-card-name {
      color: rgba($color: var(--black-rgb), $alpha: 0.8);
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;

      margin-bottom: 8px;
    }

    .billing-address-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 0.14px;

      max-width: 232px;

      margin-top: 8px;
      margin-bottom: 4px;
    }

    .gst-number-text {
      color: $grey;
      font-size: 14px;
      font-size: 14px;
      font-style: italic;
      font-weight: 400;
      letter-spacing: 0.14px;
    }

    //xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;

      flex-direction: column;

      .billing-address-details {
        &.card-info {
          padding-left: 0;
          border-left: 0px;

          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid $grey-50;
        }
      }
    }
  }

  .billing-address-card-action {
    padding: 16px 20px;
    border-top: 1px solid $grey-50;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }
  }
}
</style>
