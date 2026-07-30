<template>
  <div
    class="billing-options"
  >
    <!-- flex -->
    <div class="available-plans-wrapper">
      <!-- each plan card -->
      <PricingPlanCard
        v-for="planDetails in availablePlans"
        :key="`${planDetails.type}-plan`"
        :planDetails="planDetails"

        @selectPlan="onSelectPlan"
      />
    </div>

    <!-- Dialog -->
    <q-dialog
      persistent
      v-model="showPlanCheckoutModal"

      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <PlanCheckout
        :selectedPlanDetails="selectedPlanDetails"

        @closeModal="showPlanCheckoutModal = false"
        @onSuccessfulPlanCheckout="onSuccessfulPlanCheckout"
      />
    </q-dialog>

    <!-- Dialog -->
    <q-dialog
      persistent
      v-model="showSelectEnterprisePlanModal"

      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SelectEnterprisePlan
        @planCheckout="onCheckoutEnterprisePlan"
      />
    </q-dialog>

  </div>
</template>

<script>
// vue
import {
  computed, defineComponent, reactive, toRefs,
} from 'vue';

// Components
import PricingPlanCard from 'components/Subscription/PricingPlanCard.vue';
import PlanCheckout from 'components/Subscription/Modals/PlanCheckout.vue';
import SelectEnterprisePlan from 'components/Subscription/Modals/SelectEnterprisePlan.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Import the Pinia store
import { useAuthStore } from 'src/stores/auth';

// Constants
import {
  PLAN_LABELS,
  PLAN_TYPES, PLAN_CHARGE_TYPES, STRIKETHROUGH_PLAN_PRICE,
} from 'boot/constants';

export default defineComponent({
  name: 'BillingOptions',

  emits: ['onPaymentSuccess'],

  components: {
    PlanCheckout,
    PricingPlanCard,
    SelectEnterprisePlan,
  },

  props: {
    showBillingOptionsNote: {
      type: Boolean,
      default: true,
    },
  },

  setup(_, { emit }) {
    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // Access the authentication store
    const authStorePinia = useAuthStore();

    // state
    const state = reactive({
      selectedPlanDetails: {},

      showPlanCheckoutModal: false,
      showSelectEnterprisePlanModal: false,
    });

    // computed
    const userPlan = computed(() => authStorePinia.getUserPlan);

    const availablePlans = computed(() => {
      const isSubscribed = userPlan.value.is_sub_active;

      const planList = [
        {
          name: PLAN_LABELS[PLAN_TYPES.LAUNCH_PLAN],
          type: PLAN_TYPES.LAUNCH_PLAN,
          charge: PLAN_CHARGE_TYPES.month.LAUNCH_PLAN,
          strikeCharge: STRIKETHROUGH_PLAN_PRICE.month.LAUNCH_PLAN,

          isCurrentPlan: isSubscribed && userPlan.value.plan_name === PLAN_TYPES.LAUNCH_PLAN,
        },
        {
          name: PLAN_LABELS[PLAN_TYPES.GROWTH_PLAN],
          type: PLAN_TYPES.GROWTH_PLAN,
          charge: PLAN_CHARGE_TYPES.month.GROWTH_PLAN,
          strikeCharge: STRIKETHROUGH_PLAN_PRICE.month.GROWTH_PLAN,

          isCurrentPlan: isSubscribed && userPlan.value.plan_name === PLAN_TYPES.GROWTH_PLAN,
        },
        {
          name: PLAN_LABELS[PLAN_TYPES.SCALE_PLAN],
          planMostUsed: true,
          type: PLAN_TYPES.SCALE_PLAN,
          charge: PLAN_CHARGE_TYPES.month.SCALE_PLAN,
          strikeCharge: STRIKETHROUGH_PLAN_PRICE.month.SCALE_PLAN,
          isCurrentPlan: isSubscribed && userPlan.value.plan_name === PLAN_TYPES.SCALE_PLAN,
        },
        {
          name: PLAN_LABELS[PLAN_TYPES.ENTERPRISE_PLAN],
          type: PLAN_TYPES.ENTERPRISE_PLAN,
          charge: PLAN_CHARGE_TYPES.month.ENTERPRISE_PLAN,
          strikeCharge: STRIKETHROUGH_PLAN_PRICE.month.ENTERPRISE_PLAN,

          allowUpdatePlan: true,
          isCurrentPlan: isSubscribed && userPlan.value.plan_name === PLAN_TYPES.ENTERPRISE_PLAN,
        },
      ];

      return planList;
    });

    // methods
    const onSelectPlan = (planDetails) => {
      if (planDetails.type === PLAN_TYPES.ENTERPRISE_PLAN
        || planDetails.type === PLAN_TYPES.PARTNER_PLAN
      ) {
        state.showSelectEnterprisePlanModal = true;
      } else {
        state.selectedPlanDetails = planDetails;

        state.showPlanCheckoutModal = true;
      }
    };

    const onCheckoutEnterprisePlan = (planDetails) => {
      state.selectedPlanDetails = planDetails;

      state.showPlanCheckoutModal = true;
    };

    const onSuccessfulPlanCheckout = () => {
      state.showPlanCheckoutModal = false;

      if (state.showSelectEnterprisePlanModal) {
        state.showSelectEnterprisePlanModal = false;
      }

      emit('onPaymentSuccess');
    };

    return {
      // state
      ...toRefs(state),

      // computed
      availablePlans,
      isMobileDevice,

      // methods
      onSelectPlan,
      onCheckoutEnterprisePlan,
      onSuccessfulPlanCheckout,
    };
  },
});
</script>

<style lang="scss" scoped>
.billing-options {
  width: 100%;

  .available-plans-wrapper {
    width: 100%;
    display: flex;
    flex-wrap: wrap;

    grid-row-gap: 24px;
    grid-column-gap: 28px;
  }
}
</style>
