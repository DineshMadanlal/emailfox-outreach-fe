<template>
  <q-form
    class="stripe-input"
  >
    <!-- card number input -->
    <div
      id="card-element"
      class="stripe-input__card-element"
    ></div>

    <!-- if any error message -->
    <p
      v-if="errorMessage"
      class="error-message-text"
    >
      {{ errorMessage }}
    </p>
  </q-form>
</template>

<script>
// vue
import {
  defineComponent, reactive, onMounted, toRefs,
} from 'vue';

// npm
import { loadStripe } from '@stripe/stripe-js';

export default defineComponent({
  name: 'StripeInput',

  setup() {
    // state
    const state = reactive({
      stripe: null,
      elements: null,
      cardElement: null,
      errorMessage: '',
      isProcessing: false,
    });

    onMounted(async () => {
      // load stripe
      state.stripe = await loadStripe(process.env.STRIPE_PAY_PUBLISHABLE_KEY);

      // Create an instance of Elements
      state.elements = state.stripe.elements();

      // Create an instance of the card Element with autofocus
      state.cardElement = state.elements.create('card', {
        style: {
          base: {
            fontFamily: 'Inter',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
          },
        },
        hidePostalCode: true,
      });

      // Add an instance of the card Element into the `card-element` div
      state.cardElement.mount('#card-element');

      // Reset errorMessage on user typing
      state.cardElement.on('change', () => {
        if (state.errorMessage) {
          state.errorMessage = '';
        }
      });

      setTimeout(() => {
        state.cardElement.focus();
      }, 1000);
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.stripe-input {
  width: 100%;

  .stripe-input__card-element {
    width: 100%;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid $blue-grey;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 12px;
    }
  }

  .error-message-text {
    margin-top: 8px;

    color: $negative;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
