<template>
  <section class="reset-password-page">
    <!-- Card -->
    <q-card
      v-if="isPasswordReset"
      flat
      class="reset-password-card"
    >
      <!-- Icon -->
      <LocalSvgIcon
        image="lock"

        :isIconFolder="false"
        :isIllustrationFolder="true"

        classes="lock-icon"
      />

      <!-- header -->
      <h4 class="reset-pw-header-text">
        New password updated
      </h4>

      <!-- label -->
      <p class="reset-pw-label-text">
        You can now sign into your Mailer account with the updated
        credentails.
      </p>

      <!-- Back to sign in -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        class="full-width"
        label="Back to Sign In"

        to="/login"
      />
    </q-card>

    <!-- Card -->
    <q-card
      v-else
      flat
      class="reset-password-card"
    >
      <!-- header -->
      <h4 class="reset-pw-header-text">
        Reset your Password
      </h4>

      <!-- label -->
      <p class="reset-pw-label-text">
        Please set a new password for your account.
      </p>

      <!-- Quasar Form -->
      <q-form
        ref="formRef"
        class="reset-pw-form"
        @submit.prevent.stop="onSubmitForm"
      >
        <!-- New Password -->
        <div class="full-width">
          <p class="form-label-text">
            New  Password
          </p>

          <q-input
            dense
            outlined
            autofocus
            hide-bottom-space

            v-model="newPassword"

            name="password"
            lazy-rules="ondemand"
            class="app-input-field-height"

            :type="isPasswordInput ? 'password' : 'text'"
            :rules="passwordRulesArray"

            @update:model-value="onPasswordInputChange"
          >
            <template v-slot:append>
              <PasswordIconToggle
                :isPasswordInput="isPasswordInput"
                @click="isPasswordInput = !isPasswordInput"
              />
            </template>
          </q-input>

          <!-- Password rules -->
          <PasswordCriteria :password="newPassword" />
        </div>

        <!-- Confirm Password -->
        <div class="full-width">
          <p class="form-label-text">
            Confirm Password
          </p>

          <q-input
            dense
            outlined
            hide-bottom-space

            v-model="confirmPassword"

            type="password"
            name="confirmPassword"
            lazy-rules="ondemand"
            class="app-input-field-height"

            :rules="confirmPasswordRulesArray"

            @update:model-value="onPasswordInputChange"
          />
        </div>

        <!-- Reset Pw Button -->
        <q-btn
          no-caps
          unelevated

          type="submit"
          color="primary"

          label="Reset Password"
          class="full-width auth-submit-btn"

          :loading="isApiProcessing"
        />
      </q-form>
    </q-card>
  </section>
</template>

<script>
// vue
import {
  computed, defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// vue router
import { useRoute } from 'vue-router';

// Components
import PasswordCriteria from 'components/Password/PasswordCriteria.vue';
import PasswordIconToggle from 'components/Password/PasswordIconToggle.vue';

// Utils
import { postApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'ResetPassword',

  components: {
    PasswordCriteria,
    PasswordIconToggle,
  },

  setup() {
    // route
    const $route = useRoute();

    // meta
    useMeta({
      title: 'Reset Password',
      description: 'Reset your password',
    });

    // Inject the triggerToast method
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      formRef: null,

      isPasswordInput: true,
      newPassword: '',
      confirmPassword: '',

      isApiProcessing: false,

      isPasswordReset: false,
    });

    const passwordRulesArray = [
      // atleast 8 characters
      (val) => val.length >= 8 || '',
      // atleast one lower case
      (val) => /[a-z]/.test(val) || '',
      // atleast one upper case
      (val) => /[A-Z]/.test(val) || '',
    ];

    const confirmPasswordRulesArray = computed(() => [
      (val) => val === state.newPassword || 'Passwords do not match',
    ]);

    // methods
    const onSubmitForm = async () => {
      try {
        // get token from query
        const tokenQuery = $route.query.token;

        state.isApiProcessing = true;

        await postApiCall({
          endpoint: '/auth/reset-password',
          payload: {
            token: tokenQuery,
            newPassword: state.newPassword,
          },
        });

        state.isPasswordReset = true;
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    const onPasswordInputChange = () => {
      state.formRef.resetValidation();
    };

    return {
      // hardcoded rules
      passwordRulesArray,

      // state
      ...toRefs(state),

      // computed
      confirmPasswordRulesArray,

      // methods
      onSubmitForm,
      onPasswordInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.reset-password-page {
  width: 100%;
  padding: 60px 20px;

  display: flex;
  justify-content: center;

  .reset-password-card {
    width: 100%;
    max-width: 580px;

    background: $white;
    border-radius: 8px;
    padding: 60px 80px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 40px 16px;
    }

    .lock-icon {
      margin-bottom: 24px;
    }

    .reset-pw-header-text {
      color: $black;
      font-size: 32px;
      font-weight: 600;
    }

    .reset-pw-label-text {
      margin-top: 8px;
      margin-bottom: 32px;

      color: $black;
      font-size: 14px;
    }

    .reset-pw-form {
      width: 100%;
      display: grid;
      grid-row-gap: 24px;

      .form-label-text {
        color: $black;
        font-size: 14px;

        margin-bottom: 6px;
      }
    }
  }
}
</style>
