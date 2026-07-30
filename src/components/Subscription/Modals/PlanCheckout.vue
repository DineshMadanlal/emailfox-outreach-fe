<template>
  <q-card
    flat
    class="app-modal-card plan-checkout-card"
    :class="checkoutCardClassName"
  >
    <q-form
      class="full-width"
      ref="planCheckoutFormRef"

      @submit.prevent.stop="onPaySecurely"
    >
      <!-- header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          {{ checkoutHeader }}
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
        <!-- Left Section -->
        <div
          v-if="selectedPlanDetails?.charge"
          class="app-modal-left-section"
        >
          <!-- Total amount to be paid -->
          <div class="checkout-cart-value">
            <p class="checkout-label-text">
              Total Amount to be paid
            </p>

            <p
              class="total-amount-value-text"
            >
              {{ amountCurrency }}{{ totalAmountToBePaid }}
            </p>
          </div>

          <div class="checkout-cart-details">
            <!-- label -->
            <p class="checkout-label-text">
              Plan Name
            </p>

            <!-- plan name -->
            <p class="plan-name-text">
              {{ selectedPlanDetails.name }} Plan

              <span
                @click="onChangePlan"
              >
                Change Plan
              </span>
            </p>

            <!-- Billing Cycle -->
            <p class="checkout-label-text">
              Billing Cycle
            </p>

            <div class="billing-period-item">
              <!-- monthly -->
              <p class="billing-period-type-text">
                Monthly
              </p>

              <!-- charge -->
              <p class="billing-period-charge-text">
                ${{ selectedPlanDetails.charge }}

                <!-- strike text -->
                <span>
                  ${{ selectedPlanDetails.strikeCharge }}
                </span>
              </p>
            </div>
          </div>

          <!-- Price Breaup -->
          <div class="price-breakup-wrapper">
            <q-expansion-item

              dense
              default-opened
              hide-expand-icon

              class="price-breakup-expansion-item"
              header-class="price-breakup-expansion-header"
            >
              <template #header>
                <div class="full-width flex no-wrap items-center justify-between">
                  <p>
                    View Price Breakup
                  </p>

                  <LocalSvgIcon image="plain-down-arrow" class="down-arrow-icon" />
                </div>
              </template>

              <div class="price-breakup-card">
                <!-- Sub Total -->
                <div class="each-price-breakup-item">
                  <p class="each-price-label">
                    Sub Total
                  </p>

                  <p class="each-price-value">
                    {{ amountCurrency }}
                    {{ numbersInDecimalFormat(amountToBePaid) }}
                  </p>
                </div>
                <!-- Tax -->
                <div class="each-price-breakup-item">
                  <p class="each-price-label">
                    Tax({{ isIndianCustomer ? '18%' : '0%' }})
                  </p>

                  <p class="each-price-value">
                    {{ amountCurrency }}{{ numbersInDecimalFormat(taxToBePaid) }}
                  </p>
                </div>

                <!-- border spacer -->
                <div class="border-spacer"></div>

                <!-- Total -->
                <div class="each-price-breakup-item">
                  <p class="each-price-label">
                    <b>Total</b>
                  </p>

                  <p class="each-price-value">
                    <b>{{ amountCurrency }}{{ totalAmountToBePaid }}</b>
                  </p>
                </div>
              </div>
            </q-expansion-item>
          </div>
        </div>

        <!-- Right Section -->
        <div
          v-if="showCheckoutCardForm"
          class="app-modal-right-section"
        >
          <p class="checkout-header-text">
            Card Info
          </p>

          <div class="checkout-credit-card-details">
            <!-- Stripe Input -->
            <div class="full-width">
              <InputLabel
                isImportant
                label="Credit Card Number"
              />

              <!-- Stripe Input -->
              <StripeInput
                ref="stripeInputRef"
              />
            </div>

            <!-- Card Holder Name -->
            <div class="full-width">
              <InputLabel
                isImportant
                label="Name on card"
              />

              <q-input
                dense
                outlined
                hide-bottom-space

                v-model="cardName"

                :rules="[
                  (val) => val.length > 0 || 'Name is required',
                ]"

                name="cardName"
                lazy-rules="ondemand"
                class="app-input-field-height"

                @update:model-value="onInputChange"
              />
            </div>
          </div>

          <p class="checkout-header-text billing-header-text">
            Billing Address
          </p>

          <!-- Billing Details -->
          <div class="checkout-billing-details">
            <!-- ZIP Code and Country -->
            <div class="two-input-grid">
              <!-- Country -->
              <div class="full-width">
                <InputLabel
                  isImportant
                  label="Country"
                />

                <CountriesSelect
                  v-model="country"

                  :rules="countryRules"

                  lazy-rules="ondemand"
                  class="app-input-field-height"

                  @update:model-value="onInputChange"
                />
              </div>

              <!-- State -->
              <div class="full-width">
                <InputLabel
                  isImportant
                  label="State"
                />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  v-model="state"

                  :rules="[
                    (val) => val.length > 0 || 'State is required',
                  ]"

                  lazy-rules="ondemand"
                  class="app-input-field-height"

                  @update:model-value="onInputChange"
                />
              </div>
            </div>

            <!-- Address -->
            <div class="full-width">
              <InputLabel
                isImportant
                label="Address Line"
              />

              <q-input
                dense
                outlined
                hide-bottom-space

                v-model="address"

                :rules="[
                  (val) => val.length > 0 || 'Address is required',
                ]"

                name="address"
                lazy-rules="ondemand"
                class="app-input-field-height"

                @update:model-value="onInputChange"
              />
            </div>

            <!-- City and State -->
            <div class="two-input-grid">
              <!-- City -->
              <div class="full-width">
                <InputLabel
                  isImportant
                  label="City"
                />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  v-model="city"

                  :rules="[
                    (val) => val.length > 0 || 'City is required',
                  ]"

                  lazy-rules="ondemand"
                  class="app-input-field-height"

                  @update:model-value="onInputChange"
                />
              </div>

              <!-- ZIP Code -->
              <div class="full-width">
                <InputLabel
                  isImportant
                  label="ZIP Code"
                />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  v-model="postalCode"

                  :rules="[
                    (val) => val.length > 0 || 'Postal code is required',
                  ]"

                  lazy-rules="ondemand"
                  class="app-input-field-height"

                  @update:model-value="onInputChange"
                />
              </div>
            </div>

            <!-- Tax Details -->
            <div
              class="full-width"

              v-if="isIndianCustomer"
            >
              <InputLabel
                label="GST/Tax ID (Optional)"
              />

              <q-input
                dense
                outlined
                hide-bottom-space

                v-model="gstNumber"

                lazy-rules="ondemand"
                class="app-input-field-height"

                @update:model-value="onInputChange"
              />
            </div>

            <!-- Alert Box -->
            <InfoAlertBox
              :alert="`Indian cards by default include 18% GST + ₹${USD_TO_INR_VALUE}/USD
              fixed rate. Use an international card to save on tax.`"

              v-if="isIndianCustomer"
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="app-modal-footer">
        <div>
          <!--  -->
          <q-btn
            no-caps
            unelevated

            color="primary"
            :label="checkoutButtonCta"

            :loading="isCheckoutProcessing"

            type="submit"
          />
        </div>
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, toRefs, getCurrentInstance, onMounted,
} from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import InfoAlertBox from 'components/Alerts/InfoAlertBox.vue';
import StripeInput from 'components/Subscription/StripeInput.vue';
import CountriesSelect from 'src/components/Dropdown/CountriesSelect.vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';
import { numbersInDecimalFormat } from 'src/utils/numbers';
import {
  createSetupIntent, saveBusinessDetails, setupStripeIntent, confirmStripePayment,
} from 'src/utils/subscription';

// Import the Pinia store
import { useAuthStore } from 'src/stores/auth';

// npm
import { loadStripe } from '@stripe/stripe-js';

// constants
import { PLAN_TYPES, USD_TO_INR_VALUE } from 'boot/constants';

export default defineComponent({
  name: 'PlanCheckout',

  emits: ['closeModal', 'onSuccessfulPlanCheckout'],

  components: {
    StripeInput,
    InputLabel,
    InfoAlertBox,
    CountriesSelect,
  },

  props: {
    selectedPlanDetails: {
      type: Object,
      default: () => {},
    },
    updatePaymentDetails: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // Access the authentication store
    const authStorePinia = useAuthStore();

    // state
    const state = reactive({
      stripeInputRef: null,

      // business details
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',

      // card details
      cardName: '',

      // tax details
      gstNumber: '',

      isApiLoading: false,
      planCheckoutFormRef: null,

      stripeReference: null,
    });

    // computed
    const subscriptionPlan = computed(() => authStorePinia.getUserPlan);
    const isCreditCardSubscribed = computed(() => authStorePinia.isCreditCardSubscribed);

    const userPaymentDetails = computed(() => authStorePinia.getUserPaymentDetails);

    const checkoutCardClassName = computed(() => {
      if (props.updatePaymentDetails) {
        return 'update-payment-details';
      } if (isCreditCardSubscribed.value) {
        return 'microview';
      }

      return 'fullview';
    });

    const checkoutHeader = computed(() => {
      if (props.updatePaymentDetails) {
        return 'Edit Payment Details';
      }

      return 'Subscribe';
    });

    const checkoutButtonCta = computed(() => {
      if (props.updatePaymentDetails) {
        return 'Update';
      }

      return 'Make a Secure Payment';
    });

    const showCheckoutCardForm = computed(() => {
      if (props.updatePaymentDetails) {
        return true;
      }

      return !isCreditCardSubscribed.value;
    });

    const isCheckoutProcessing = computed(() => state.stripeInputRef?.isProcessing
      || state.isApiLoading);

    const isIndianCustomer = computed(() => state.country === 'IN');

    const amountCurrency = computed(() => (isIndianCustomer.value ? '₹' : '$'));

    const amountToBePaid = computed(() => {
      if (isIndianCustomer.value) {
        return props.selectedPlanDetails.charge * USD_TO_INR_VALUE;
      }

      return props.selectedPlanDetails.charge;
    });

    const taxToBePaid = computed(() => {
      if (isIndianCustomer.value) {
        return amountToBePaid.value * (18 / 100);
      }

      return 0;
    });

    const totalAmountToBePaid = computed(() => {
      const total = amountToBePaid.value + taxToBePaid.value;

      return numbersInDecimalFormat(total);
    });

    // methods
    const upgradePlan = async (paymentMethodId) => {
      try {
        state.isApiLoading = true;

        // payload
        const payload = {
          plan_name: props.selectedPlanDetails.type,
        };

        if (isCreditCardSubscribed.value) {
          payload.is_inr_payment = userPaymentDetails.value.is_inr_payment || false;
        }

        if (paymentMethodId) {
          payload.is_inr_payment = isIndianCustomer.value;
          payload.payment_method_id = paymentMethodId;
        }

        if (
          props.selectedPlanDetails.type === PLAN_TYPES.ENTERPRISE_PLAN
        ) {
          payload.quantity = props.selectedPlanDetails.quantity;
        }

        // api call
        const response = await postApiCall({
          endpoint: 'subscription/subscribe',
          payload,
        });

        if (response.isPaymentAuthenticationRequired) {
          await confirmStripePayment({
            customerClientSecret: response.paymentIntentClientSecret,
            confirmCardPayment: isCreditCardSubscribed.value
              ? state.stripeReference.confirmCardPayment
              : state.stripeInputRef.stripe?.confirmCardPayment,
          });
        }

        // show confetti
        appContext.config.globalProperties.$showConfetti();

        emit('onSuccessfulPlanCheckout');
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

    const addNewPaymentMethod = async () => {
      try {
        state.isApiLoading = true;

        // billing details json
        const billingDetails = {
          name: state.cardName,
          address: {
            line1: state.cardName,
            line2: state.address,
            city: state.city,
            state: state.state,
            country: state.country,
            postal_code: state.postalCode,
          },
        };

        // fetch the client secret from BE
        const response = await createSetupIntent();

        // client secret
        const customerClientSecret = response.clientSecret;

        // payment ID
        await saveBusinessDetails({
          gstNumber: state.gstNumber,
          billingDetails: billingDetails.address,
        });

        const paymentMethodId = await setupStripeIntent({
          billingDetails,
          customerClientSecret,
          stripeInputRef: state.stripeInputRef,
        });

        return paymentMethodId;
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });

        return false;
      } finally {
        state.isApiLoading = false;
      }
    };

    const onUpdatePaymentDetails = async () => {
      try {
        state.isApiLoading = true;

        // Just add the payment details
        const paymentMethodId = await addNewPaymentMethod();

        if (paymentMethodId) {
          // show toast
          appContext.config.globalProperties.$toast({
            message: 'Payment Details Updated Successfully.',
          });

          // close the dialog with a success popup
          emit('closeModal');
        }
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

    const onPaySecurely = async () => {
      if (props.updatePaymentDetails) {
        onUpdatePaymentDetails();
      } else if (isCreditCardSubscribed.value) {
        // upgrade plan logic
        upgradePlan();
      } else {
        const paymentMethodId = await addNewPaymentMethod();

        // call upgrade plan if payment method is added successfully
        if (paymentMethodId) {
          upgradePlan(paymentMethodId);
        }
      }
    };

    const onInputChange = () => {
      state.planCheckoutFormRef.resetValidation();
    };

    const onChangePlan = () => {
      emit('closeModal');
    };

    const fetchLocationFieldsAndSave = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const countryCode = data.country_code;
        const { postal } = data;

        state.country = countryCode;
        state.postalCode = postal;
      } catch (err) {
        //
      }
    };

    const prefillLocationFields = () => {
      const billingDetails = subscriptionPlan.value.billing_details;

      if (billingDetails) {
        state.cardName = billingDetails.line1 || '';
        state.address = billingDetails.line2 || '';
        state.state = billingDetails.state || '';
        state.city = billingDetails.city || '';
        state.country = billingDetails.country || '';
        state.postalCode = billingDetails.postal_code || '';
      }
    };

    // lifecycle hooks
    onMounted(async () => {
      if (isCreditCardSubscribed.value) {
        prefillLocationFields();

        state.stripeReference = await loadStripe(process.env.STRIPE_PAY_PUBLISHABLE_KEY);
      } else {
        fetchLocationFieldsAndSave();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isIndianCustomer,
      isCheckoutProcessing,
      isCreditCardSubscribed,

      taxToBePaid,
      amountCurrency,
      amountToBePaid,
      totalAmountToBePaid,

      //
      checkoutHeader,
      checkoutButtonCta,
      showCheckoutCardForm,
      checkoutCardClassName,

      // methods
      onChangePlan,
      onPaySecurely,
      onInputChange,
      numbersInDecimalFormat,

      // Rules
      countryRules: [
        (val) => val.length > 0 || 'Country is required',
      ],

      // constants
      USD_TO_INR_VALUE,
    };
  },
});
</script>

<style lang="scss" scoped>
.plan-checkout-card {
  max-width: 933px;

  &.fullview {
    max-width: 933px;
  }

  &.microview {
    max-width: 354px;

    // sm max
    @media (max-width: $breakpoint-xs-max) {
      max-width: 100%;
    }
  }

  &.update-payment-details {
    max-width: 580px;

    // sm max
    @media (max-width: $breakpoint-xs-max) {
      max-width: 100%;
    }
  }

  .app-modal-header {
    background: $grey-50 !important;
  }

  .app-modal-content {
    display: flex;
    padding: 0px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-direction: column;

      .app-modal-left-section {
        max-width: unset !important;
      }
    }

    .app-modal-left-section,
    .app-modal-right-section {
      width: 100%;
      padding: 24px 20px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 24px 12px;
      }
    }

    .app-modal-left-section {
      max-width: 354px;
      background: rgba($color: var(--grey-50-rgb), $alpha: 0.3);

      .checkout-label-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
      }

      .checkout-cart-value {
        width: 100%;
        padding-bottom: 24px;
        border-bottom: 1px solid $grey-50;

        .total-amount-value-text {
          color: $black;
          font-size: 32px;
          font-weight: 700;

          margin-top: 8px;
        }
      }

      .checkout-cart-details {
        width: 100%;
        padding: 24px 0px;
        border-bottom: 1px solid $grey-50;

        .plan-name-text {
          color: $black;
          font-size: 14px;
          font-weight: 700;
          line-height: normal;

          margin-top: 6px;
          margin-bottom: 24px;

          span {
            color: $primary;
            font-size: 14px;
            font-weight: 500;
            line-height: 16px;

            margin-left: 12px;
            cursor: pointer;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .billing-period-item {
          width: fit-content;
          border-radius: 4px;
          background-color: $white;
          border: 1px solid $primary;

          padding: 8px;
          min-width: 145px;
          margin-top: 12px;

          .billing-period-type-text {
            color: $black;
            font-size: 14px;
            font-weight: 500;
            line-height: normal;

            margin-bottom: 4px;
          }

          .billing-period-charge-text {
            color: $grey;
            font-size: 12px;
            font-weight: 400;

            span {
              color: $grey-400;
              font-size: 10px;
              text-decoration-line: line-through;

              margin-left: 6px;
            }
          }
        }
      }

      .price-breakup-wrapper {
        width: 100%;
        padding: 12px 0px;
        border-bottom: 1px solid $grey-50;

        :deep(.price-breakup-expansion-item) {
          .price-breakup-expansion-header {
            padding: 4px;
          }

          .down-arrow-icon {
            min-width: 8px;
            max-width: 8px;
            height: 4px;
            transition: transform 0.3s;
          }

          [aria-expanded="true"] {
            .down-arrow-icon {
              transform: rotate(180deg);
            }
          }
        }

        .price-breakup-card {
          padding: 8px;
          background: rgba($color: var(--grey-rgb), $alpha: 0.04);

          display: grid;
          grid-row-gap: 12px;

          .each-price-breakup-item {
            display: flex;
            justify-content: space-between;
          }

          .border-spacer {
            height: 1px;
            width: 100%;
            border-top: 1px dashed rgba($color: var(--grey-rgb), $alpha: 0.1);
          }
        }
      }

      .checkout-note-text {
        color: $grey-300;
        font-size: 12px;
        font-weight: 400;

        margin-top: 16px;
      }
    }

    // Right Section
    .app-modal-right-section {
      width: 100%;

      .checkout-header-text {
        color: $black;
        font-size: 16px;
        font-weight: 600;
        line-height: normal;

        margin-bottom: 12px;

        &.billing-header-text {
          margin-top: 40px;
        }
      }

      .checkout-credit-card-details {
        display: grid;
        grid-row-gap: 16px;
      }

      .checkout-billing-details {
        display: grid;
        grid-row-gap: 20px;
      }

    }
  }
}
</style>
