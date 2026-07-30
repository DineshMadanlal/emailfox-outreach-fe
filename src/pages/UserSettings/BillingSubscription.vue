<template>
  <div class="subscription-settings">
    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          Subscription
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Manage your billing and subscription plan.
        </p>
      </div>

      <!-- right side -->
      <div class="settings-header-right-side">
      </div>
    </div>

    <div
      v-if="isCreditCardSubscribed"

      class="user-plan-details settings-section-content"
    >
      <!-- Current plan of the user -->
      <SubscriptionStatusCard />

      <BillingAddress
        v-if="showBillingAddress"
      />

      <!-- unsubscribe card -->
      <UnsubscribeCard />
    </div>

    <!-- Else show pricing card where users can subscribe -->
    <div
      v-else

      class="settings-section-content"
    >
      <SubscriptionStatusCard />
    </div>
  </div>
</template>

<script>
// lodash
import get from 'lodash/get';
import size from 'lodash/size';

// vue
import { defineComponent, computed, getCurrentInstance } from 'vue';

// quasar
import { useMeta } from 'quasar';

// vue apollo composable
import { useSubscription } from '@vue/apollo-composable';

// Components
import BillingAddress from 'components/Subscription/BillingAddress.vue';
import UnsubscribeCard from 'components/Subscription/UnsubscribeCard.vue';
import SubscriptionStatusCard from 'components/Subscription/SubscriptionStatusCard.vue';

// Import the Pinia store
import { useAuthStore } from 'src/stores/auth';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Graphql
import { getUserPaymentDetails } from 'src/graphql/schema/plan_details';

export default defineComponent({
  name: 'BillingSubscription',

  components: {
    BillingAddress,
    UnsubscribeCard,
    SubscriptionStatusCard,
  },

  setup() {
    // instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Subscription'));

    // Access the authentication store
    const authStorePinia = useAuthStore();
    const loggedInUser = computed(() => authStorePinia.getUser);
    const userPaymentDetails = computed(() => authStorePinia.getUserPaymentDetails);
    const isCreditCardSubscribed = computed(() => authStorePinia.isCreditCardSubscribed);
    const showBillingAddress = computed(() => size(userPaymentDetails.value?.payment_card_details));

    // useSubscription API
    const {
      onError: onGetUserPaymentDetailsApiError,
      onResult: onGetUserPaymentDetailsApiResult,
    } = useSubscription(getUserPaymentDetails, () => ({
      accountId: loggedInUser.value.account_id,
    }), () => ({
      enabled: isCreditCardSubscribed.value,
    }));

    onGetUserPaymentDetailsApiResult((result) => {
      const paymentDetails = get(result, 'data.results[0]', {});

      // Update the Pinia store with the payment details
      authStorePinia.setMultipleFields({
        userPaymentDetails: paymentDetails,
      });
    });

    onGetUserPaymentDetailsApiError((error) => {
      const errorMessage = get(error, 'cause.originalError.message', '');

      // Display the error message using the Quasar Toast
      appContext.config.globalProperties.$toast({
        warning: true,
        message: errorMessage || 'An unexpected error occurred',
      });
    });

    return {
      // computed
      showBillingAddress,
      isCreditCardSubscribed,
    };
  },
});
</script>

<style lang="scss" scoped>
.subscription-settings {
  width: 100%;

  .user-plan-details {
    width: 100%;
    display: grid;
    grid-row-gap: 20px;
  }
}
</style>
