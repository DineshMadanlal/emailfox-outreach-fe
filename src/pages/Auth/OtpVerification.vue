<template>
  <section class="otp-verification-page">
    <!-- card -->
    <q-card flat class="otp-verification-card">
      <!-- heading -->
      <h2 class="otp-header-text">
        Check your email
      </h2>

      <!-- paragraph -->
      <p class="otp-desc-text">
        We have sent a 6-character code to the “{{ emailQuery }}”.
        The code expires shortly, enter it soon.
      </p>

      <!-- OTP form -->
      <q-form
        ref="otpForm"
        class="otp-form"
        @submit="onSubmitOtp"
      >
        <!-- container -->
        <div class="otp-container">
          <!-- Input array -->
          <q-input
            v-for="(_, index) in otpInputArray"
            :key="`otp-${index}`"

            dense
            outlined
            hide-bottom-space

            type="text"
            maxlength="1"
            ref="otpInputsRef"
            class="otp-input-box"

            v-model="otpInputArray[index]"

            mask="#######"

            @paste="onPaste($event)"
            @keydown.backspace="onBackspace(index)"
            @update:model-value="onInputChange(index)"
          />
        </div>

        <!-- submit button -->
        <q-btn
          no-caps
          unelevated

          type="submit"
          color="primary"
          label="Verify OTP"
          class="full-width"

          :loading="isApiProcessing"
          :disable="otpInputArray.join('').length !== 6"
        />
      </q-form>

      <p class="otp-help-text">
        Can’t find your code? Check your spam folder!
      </p>
    </q-card>

  </section>
</template>

<script>
// vue
import {
  computed, defineComponent, onMounted, reactive, toRefs, getCurrentInstance,
} from 'vue';

// router
import { useRoute, useRouter } from 'vue-router';

// stores
import { useAuthStore } from 'src/stores/auth';

// Utils
import { postApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'OtpVerification',

  setup() {
    // route
    const $route = useRoute();
    const $router = useRouter();

    // Inject the triggerToast method
    const { appContext } = getCurrentInstance();

    // store
    const authStorePinia = useAuthStore();

    // state
    const state = reactive({
      otpForm: null,
      otpInputsRef: [],

      /** 6 input box */
      otpInputArray: (Array(6).fill('')),

      isApiProcessing: false,
    });

    // compued
    const emailQuery = computed(() => $route.query.email);

    // methods
    const onBackspace = (index) => {
      if (index > 0 && !state.otpInputArray[index]) {
        state.otpInputsRef[index - 1].focus();
      }
    };

    const onSubmitOtp = async () => {
      try {
        state.isApiProcessing = true;

        const otp = state.otpInputArray.join('');

        if (otp.length !== 6) {
          return;
        }

        const tokenQuery = $route.query.token;

        let endpoint = `/users/verify-user?otp=${otp}`;

        if (tokenQuery) {
          endpoint = `/users/verify-user?token=${tokenQuery}&otp=${otp}`;
        }

        const response = await postApiCall({
          endpoint,
        });

        const { token, user } = response;

        authStorePinia.setMultipleFields({
          token: token?.access_token,
          user,
        });

        $router.push(`/workspace/create?newUser=${true}`);
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiProcessing = false;
      }

      // submit the form
    };

    const onInputChange = (index) => {
      const value = state.otpInputArray[index];

      if (/^\d$/.test(value)) {
        if (index < state.otpInputArray.length - 1) {
          state.otpInputsRef[index + 1].focus();
        }
      } else {
        state.otpInputArray[index] = '';
      }

      // submit the form
      state.otpForm.submit();
    };

    const onPaste = (event) => {
      const pasteData = event.clipboardData.getData('text').slice(0, state.otpInputArray.length);
      state.otpInputArray = pasteData.split('').concat(Array(state.otpInputArray.length - pasteData.length).fill(''));
      state.otpInputsRef[state.otpInputArray.length - 1].focus();

      // submit the form
      state.otpForm.submit();
    };

    onMounted(() => {
      // focus on the first input box
      state.otpInputsRef[0].focus();

      /** Check if otp is in query and submit the form */
      if ($route.query.otp) {
        state.otpInputArray = $route.query.otp.split('').concat(Array(6 - $route.query.otp.length).fill(''));

        state.otpForm.submit();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      emailQuery,

      // methods
      onPaste,
      onBackspace,
      onInputChange,

      onSubmitOtp,
    };
  },
});
</script>

<style lang="scss" scoped>
.otp-verification-page {
  width: 100%;

  display: flex;
  justify-content: center;

  padding: 52px 20px;

  .otp-verification-card {
    width: 100%;
    max-width: 580px;

    border-radius: 8px;
    background: $white;
    border: 1px solid rgba($color: var(--grey-rgb), $alpha: 0.05);

    padding: 60px 80px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 40px 16px;
    }

    .otp-header-text {
      color: $black;
      font-size: 32px;
      font-weight: 600;
    }

    .otp-desc-text {
      font-size: 14px;
      color: $black;

      margin-top: 8px;
      margin-bottom: 32px;
    }

    .otp-help-text {
      color: rgba($color: var(--grey-rgb), $alpha: 0.5);
      font-size: 14px;
      line-height: 24px; /* 171.429% */

      margin-top: 16px;
    }

    .otp-form {
      width: 100%;

      .otp-container {
        width: 100%;
        display: flex;
        align-items: center;
        margin-bottom: 32px;

        gap: 16px;

        :deep(.otp-input-box) {
          width: 100%;
          max-width: 52px;

          input {
            color: $black;
            font-size: 20px;
            font-weight: 400;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>
