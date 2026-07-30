<template>
  <q-card flat class="subscription-status-card">
    <!-- popup -->
    <q-dialog
      maximized
      persistent
      v-model="showChoosePlanModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : 'slide-up'"
      :transition-hide="isMobileDevice ? 'slide-down' : 'slide-down'"
    >
      <ChoosePlan
        @postPaymentSuccess="postPaymentSuccess"
      />
    </q-dialog>

    <!-- top -->
    <div class="subscription-card-top">
      <p class="subscription-status-header-text">
        Plan Details
      </p>

      <!--  -->
      <div class="plan-details-section">
        <!--  -->
        <div
          v-for="(data, index) in planDetails"
          :key="`each-plan-detail-${index}`"

          class="each-plan-detail"
        >
          <p class="plan-label-text">
            {{ data.label }}
          </p>

          <p class="plan-value-text">
            {{ data.value }}
          </p>
        </div>
      </div>
    </div>

    <!-- content -->
    <div class="subscription-card-content">
      <!--  -->
      <div class="outbound-capacity-block">
        <p class="subscription-status-header-text no-margin">
          Outbound Capacity
        </p>

        <q-space />

        <div class="flex no-wrap items-center">
          <div class="credits-used-text">
            {{ getNumeralAmount(emailCreditsUsed) }}
          </div>

          <div class="credits-limits-text">
            / {{ getNumeralAmount(emailCreditsLimit) }}
            this month
          </div>
        </div>
      </div>

      <!-- Progress -->
      <q-linear-progress
        rounded
        :value="emailUsedPercentage / 100"

        color="primary"
        class="credits-usage-progress"
      >
      </q-linear-progress>

      <!-- reset -->
      <p
        class="reset-text"
      >
        {{ isPlanExpired ? 'Expired' : 'Resets' }} on {{ formatDate2(currentPlan.plan_end_date) }}
      </p>
    </div>

    <!-- bottom -->
    <div
      class="subscription-card-bottom"
    >
      <!-- Change Plan -->
      <q-btn
        no-caps
        unelevated
        color="primary"
        :label="isCreditCardSubscribed ? 'Change Plan' : 'Start Paid Plan'"

        :loading="isApiLoading"

        @click="showChoosePlanModal = true"
      />

      <!-- Manage Subscription -->
      <q-btn
        flat
        no-caps
        unelevated
        color="primary"
        label="Manage Subscription"
        class="light-primary-btn"

        :loading="isApiLoading"

        @click="onManageSubscription"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, computed, toRefs, reactive, getCurrentInstance,
} from 'vue';

// Import the Pinia store
import { useAuthStore } from 'src/stores/auth';

// Components
import ChoosePlan from 'components/Subscription/Modals/ChoosePlan.vue';

// Utils
import { getApiCall } from 'src/utils/apiRequests';
import { formatDate2, isExpiredDate } from 'src/utils/dates';
import { getNumeralAmount, findPercentage } from 'src/utils/numbers';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { PLAN_LABELS } from 'boot/constants';

export default defineComponent({
  name: 'SubscriptionStatusCard',

  components: {
    ChoosePlan,
  },

  setup() {
    // current instance
    const { appContext } = getCurrentInstance();

    // Access the authentication store
    const authStorePinia = useAuthStore();

    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      showChoosePlanModal: false,

      isApiLoading: false,
    });

    // computed
    const currentPlan = computed(() => authStorePinia.getUserPlan);
    const isCreditCardSubscribed = computed(() => authStorePinia.isCreditCardSubscribed);

    const emailCreditsLimit = computed(() => currentPlan.value.email_credits);
    const emailCreditsUsed = computed(() => currentPlan.value.email_credits_used);

    const emailUsedPercentage = computed(() => findPercentage({
      part: emailCreditsUsed.value,
      whole: emailCreditsLimit.value,
    }));

    const isPlanExpired = computed(() => {
      if (isCreditCardSubscribed.value) {
        return false;
      }

      // date
      return isExpiredDate(currentPlan.value.plan_end_date);
    });

    const upgradePlanCta = computed(() => {
      if (isPlanExpired.value) {
        return 'Start Paid Plan';
      }

      return 'Upgrade to Paid Plan';
    });

    const getBillingDate = () => {
      const date = formatDate2(currentPlan.value.plan_end_date);

      if (isPlanExpired.value) {
        return `Expired on ${date}`;
      }

      return date;
    };

    const planDetails = computed(() => {
      const details = [
        {
          label: 'Plan Selected',
          value: PLAN_LABELS[currentPlan.value.plan_name],
        },
        {
          label: isCreditCardSubscribed.value ? 'Next Billing Date' : 'Expires on',
          value: getBillingDate(),
        },
        {
          label: 'Recurring Type',
          value: isCreditCardSubscribed.value ? 'Monthly' : '-',
        },
      ];

      return details;
    });

    // methods
    const postPaymentSuccess = () => {
      state.showChoosePlanModal = false;
    };

    const onManageSubscription = async () => {
      try {
        state.isApiLoading = true;

        const response = await getApiCall({
          endpoint: 'subscription/create-portal-session',
        });

        window.open(response.url, '_blank');
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

      // computed
      isMobileDevice,

      currentPlan,
      isCreditCardSubscribed,

      emailCreditsLimit,
      emailCreditsUsed,
      emailUsedPercentage,

      planDetails,
      upgradePlanCta,
      isPlanExpired,

      // methods
      formatDate2,
      getNumeralAmount,
      postPaymentSuccess,
      onManageSubscription,
    };
  },
});
</script>

<style lang="scss" scoped>
.subscription-status-card {
  width: 100%;
  max-width: 720px;
  border-radius: 8px;
  background: $white;
  border: 1px solid $blue-grey;

  .subscription-card-top,
  .subscription-card-content,
  .subscription-card-bottom {
    padding: 20px;
  }

  .subscription-status-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;

    margin-bottom: 20px;

    &.no-margin {
      margin-bottom: 0px;
    }
  }

  // top
  .subscription-card-top {
    background: rgba(var(--primary-rgb), 0.025);

    .plan-details-section {
      width: 100%;

      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 32px;

      .each-plan-detail {
        &:not(:first-child) {
          padding-left: 12px;
          border-left: 1px solid $grey-50;

          // xs max
          @media (max-width: $breakpoint-xs-max) {
            border-left: 0;
            padding-left: 0;
          }
        }

        &:last-child {
          padding-right: 24px;
        }

        .plan-label-text {

        }

        .plan-value-text {
          font-weight: 600;
          line-height: 16px;
          margin-top: 8px;
        }
      }

      // xs max
      @media (max-width: $breakpoint-sm-max) {
        gap: 16px;
      }
    }
  }

  // content
  .subscription-card-content {
    border-top: 1px solid $grey-50;
    border-bottom: 1px solid $grey-50;

    .outbound-capacity-block {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 20px;

      .credits-used-text {
        color: $black;
        font-size: 20px;
        font-weight: 500;
        line-height: normal;
        margin-right: 2px;
      }

      .credits-limits-text {
        color: $grey-400;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
      }
    }

    :deep(.credits-usage-progress) {
      height: 14px;
      margin-bottom: 15px;

      .q-linear-progress__track {
        opacity: 1;
        background: $grey-50;
      }
    }

    .reset-text {
      color: $grey-400;
      font-size: 14px;
      font-weight: 400;
    }
  }

  // bottom
  .subscription-card-bottom {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    .subscription-card-top,
    .subscription-card-content,
    .subscription-card-bottom {
      padding: 20px 12px;
    }
  }
}
</style>
