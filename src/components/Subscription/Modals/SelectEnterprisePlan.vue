<template>
  <q-card
    flat
    class="select-enterprise-plan-card app-modal-card"
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

    <!-- Content -->
    <div class="enterprise-plan-content">
      <p class="enterprise-plan-header-text">
        Choose Your Monthly Sending Capacity
      </p>

      <p class="enterprise-plan-desc-text">
        Select how many emails you'd like to send each month.
      </p>

      <div class="outbound-slider-container">
        <!-- Slider -->
        <q-slider
          v-model="sliderOutboundCapacity"

          :min="ENTERPRISE_OUTBOUND_CAPACITY.min"
          :max="ENTERPRISE_OUTBOUND_CAPACITY.max"
          :step="100000"

          label
          label-always
          :label-value="getNumberalInKWithoutDecimals(sliderOutboundCapacity)"

          track-size="12px"
          color="primary"

          class="outbound-slider"

          @blur="onInputBlur"
          @update:model-value="onInputChange"
        >
        </q-slider>

        <div class="flex no-wrap justify-between items-center">
          <p class="slider-label-text">
            From {{ getNumberalInKWithoutDecimals(ENTERPRISE_OUTBOUND_CAPACITY.min) }}
          </p>

          <p class="slider-label-text">
            Upto {{ getNumberalInKWithoutDecimals(ENTERPRISE_OUTBOUND_CAPACITY.max) }}
          </p>
        </div>
      </div>

      <!-- Outbound Capacity Selected -->
      <div class="outbound-selected-wrapper">
        <!--  -->
        <div class="outbound-label-block">
          <p class="outbound-label-text">
            Outbound Capacity
            <span
              v-if="showFormattedCapacity"
            >
              ({{ getNumberalInKWithoutDecimals(inputOutboundCapacity) }})
            </span>
          </p>
        </div>

        <q-input
          v-model="inputOutboundCapacity"

          dense
          outlined
          hide-bottom-space

          :min="ENTERPRISE_OUTBOUND_CAPACITY.min"
          :max="ENTERPRISE_OUTBOUND_CAPACITY.max"

          type="number"
          ref="outboundInputNumberRef"
          class="app-input-field-height"

          :rules="outboundInputRules"

          lazy-rules="ondemand"

          @blur="onInputBlur"
          @update:model-value="onInputChange"
        />

        <InfoAlertBox
          alert="Volume discounts are automatically applied."

          class="volume-info-alert-box"
        />

      </div>
    </div>
    <!-- Footer -->
    <div class="enterprise-plan-footer">
      <div
        v-if="checkoutPrice"
        class="checkout-price-block"
      >
        <p class="enterprise-plan-footer-text">
          Your Monthly Subscription
        </p>

        <p
          v-if="sliderOutboundCapacity >= ENTERPRISE_OUTBOUND_CAPACITY.min"
          class="enterprise-plan-price-text"
        >
          ${{ numbersInDecimalFormat(checkoutPrice) }}

          <span class="strike-through-price">
            ${{ numbersInDecimalFormat(strikeThroughPrice) }}
          </span>
        </p>

        <p class="billed-monthly-text">
          Billed Monthly
        </p>
      </div>

      <div
        v-else
        class="empty-checkout-price"
      />

      <q-space />

      <q-btn
        no-caps
        unelevated

        :disable="!checkoutPrice"

        color="primary"
        label="Continue to Payment"

        @click="onProceedToPayment"
      >
      </q-btn>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted,
} from 'vue';

// components
import InfoAlertBox from 'components/Alerts/InfoAlertBox.vue';

// Utils
import { calculatePriceByOutboundCapacity } from 'src/utils/subscription';
import { convertStringToNumber, getNumberalInKWithoutDecimals, numbersInDecimalFormat } from 'src/utils/numbers';

// constants
import {
  ENTERPRISE_OUTBOUND_CAPACITY, PLAN_TYPES, PLAN_LABELS,
} from 'boot/constants';

export default defineComponent({
  name: 'SelectEnterprisePlan',

  emits: ['planCheckout'],

  props: {
    currentPlan: {
      type: Object,
      default: () => ({}),
    },
  },

  components: {
    InfoAlertBox,
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      outboundInputNumberRef: null,

      sliderOutboundCapacity: ENTERPRISE_OUTBOUND_CAPACITY.min,
      inputOutboundCapacity: ENTERPRISE_OUTBOUND_CAPACITY.min,
    });

    // computed
    const checkoutPrice = computed(() => {
      const priceLimit = ENTERPRISE_OUTBOUND_CAPACITY;

      if (state.sliderOutboundCapacity < priceLimit.min) {
        return 0;
      }

      return calculatePriceByOutboundCapacity(state.sliderOutboundCapacity);
    });

    const strikeThroughPrice = computed(() => {
      const priceLimit = ENTERPRISE_OUTBOUND_CAPACITY;

      if (state.sliderOutboundCapacity < priceLimit.min) {
        return 0;
      }

      return checkoutPrice.value + 109;
    });

    const showFormattedCapacity = computed(() => {
      if (state.inputOutboundCapacity < ENTERPRISE_OUTBOUND_CAPACITY.min) {
        return false;
      }

      return true;
    });

    // methods
    const onInputChange = (value) => {
      state.inputOutboundCapacity = convertStringToNumber(value);
      state.sliderOutboundCapacity = convertStringToNumber(value);
    };

    const roundCapacity = (value) => Math.ceil(value / 100000) * 100000;

    const onInputBlur = () => {
      let value = Number(state.inputOutboundCapacity) || ENTERPRISE_OUTBOUND_CAPACITY.min;

      value = Math.max(
        ENTERPRISE_OUTBOUND_CAPACITY.min,
        Math.min(value, ENTERPRISE_OUTBOUND_CAPACITY.max),
      );

      value = roundCapacity(value);

      state.inputOutboundCapacity = value;
      state.sliderOutboundCapacity = value;
    };

    const onProceedToPayment = () => {
      const isValidated = state.outboundInputNumberRef.validate();
      if (isValidated) {
        emit('planCheckout', {
          charge: checkoutPrice.value,
          strikeCharge: strikeThroughPrice.value,
          name: PLAN_LABELS[PLAN_TYPES.ENTERPRISE_PLAN],
          type: PLAN_TYPES.ENTERPRISE_PLAN,
          quantity: state.inputOutboundCapacity,
        });
      }
    };

    // rules based on partner logged in or then enterprise
    const outboundInputRules = computed(() => {
      const limit = ENTERPRISE_OUTBOUND_CAPACITY;
      return [
        (val) => val >= limit.min
          || `Minimum of ${limit.min} outbound required`,
        (val) => val <= limit.max
          || `Maximum of ${limit.max} outbound allowed`,
      ];
    });

    // lifecycle hooks
    onMounted(() => {
      const emailCredits = props.currentPlan.email_credits || 0;

      if (emailCredits >= ENTERPRISE_OUTBOUND_CAPACITY.min) {
        state.sliderOutboundCapacity = emailCredits;
        state.inputOutboundCapacity = emailCredits;
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      checkoutPrice,
      outboundInputRules,
      strikeThroughPrice,
      showFormattedCapacity,

      // methods
      onInputChange,
      onInputBlur,
      onProceedToPayment,
      numbersInDecimalFormat,
      getNumberalInKWithoutDecimals,

      // constants
      ENTERPRISE_OUTBOUND_CAPACITY,
    };
  },
});
</script>

<style lang="scss" scoped>
.select-enterprise-plan-card {
  max-width: 585px;

  .app-negative-button {
    position: absolute;
    top: 12px;
    right: 12px;
  }

  .enterprise-plan-content {
    padding: 40px 32px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 24px;
    }

    .enterprise-plan-header-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;
      line-height: normal;

      text-align: center;
    }

    .enterprise-plan-desc-text {
      color: rgba($color: var(--black-rgb), $alpha: 0.8);
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-top: 8px;
      margin-bottom: 32px;

      text-align: center;
    }

    .outbound-slider-container {
      width: 100%;

      .slider-label-text {
        color: $grey;
        font-size: 12px;
        font-weight: 400;
        line-height: 16px; /* 133.333% */
      }
    }

    :deep(.outbound-slider) {
      width: 100%;
      border-radius: 3px;

      .q-slider__inner {
        background: rgba($color: var(--primary-rgb), $alpha: 0.1);
      }

      .q-slider__selection {
        background: linear-gradient(90deg, $primary 0%, #D4128D 100%);
      }

      .q-slider__thumb {
        position: relative;

        &::after {
          content: "";

          position: absolute; /* make it layer correctly */
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

          background-image: url('/icons/slider.svg');
          display: block;
          width: 32px; /* adjust as needed */
          height: 32px; /* adjust as needed */
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;

          z-index: 2; /* ensure it's above */
          pointer-events: none;
        }
      }

      .q-slider__pin--h-standard {
        bottom: 24px;
      }

      .q-slider__text-container {
        background: linear-gradient(90deg, $primary 0%, #D4128D 100%);
      }
    }

    .outbound-selected-wrapper {
      width: 100%;
      margin-top: 20px;

      display: flex;
      flex-direction: column;
      align-items: center;

      .outbound-label-block {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 8px;
        width: fit-content;

        .outbound-label-text {
          color: rgba($color: var(--black-rgb), $alpha: 0.8);
          font-size: 14px;
          font-weight: 400;
          line-height: 16px;
        }
      }

      .volume-info-alert-box {
        padding: 0px;
        background: unset;
        margin-top: 16px;
        width: fit-content;
      }

      :deep(.app-input-field-height) {
        min-width: 132px;

        .q-field__native {
          color: $black;
          font-size: 18px;
          font-weight: 600;
          line-height: normal;

          text-align: center;
        }
      }
    }
  }

  .enterprise-plan-footer {
    padding: 32px;
    background: rgba($color: var(--primary-rgb), $alpha: 0.05);

    display: flex;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
      flex-direction: column;
      gap: 12px;

      .checkout-price-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
    }

    .empty-checkout-price {
      min-height: 78px;
    }

    .enterprise-plan-footer-text {
      color: $black;
      font-size: 13px;
      font-weight: 500;
      line-height: normal;
      text-transform: uppercase;
    }

    .enterprise-plan-price-text {
      color: $black;
      font-size: 28px;
      font-style: normal;
      font-weight: 600;
      line-height: 22px; /* 78.571% */

      margin: 10px 0px;

      .strike-through-price {
        color: rgba($color: var(--black-rgb), $alpha: 0.4);
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        text-decoration-line: line-through;

        margin-left: 4px;
      }
    }

    .billed-monthly-text {
      color: rgba($color: var(--black-rgb), $alpha: 0.8);
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;
    }
  }
}
</style>
