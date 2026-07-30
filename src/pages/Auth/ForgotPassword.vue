<template>
  <section class="forgot-password-page">
    <!-- container -->
    <div class="forgot-pw-page-container">
      <!-- card -->
      <q-card
        v-if="isEmailSent"
        flat
        class="forgot-pw-card"
      >
        <!-- Icon -->
        <LocalSvgIcon
          image="email-sent"

          :isIconFolder="false"
          :isIllustrationFolder="true"

          class="email-sent-icon"
        />

        <!-- header -->
        <h4 class="forgot-pw-header-text">
          Reset link sent!
        </h4>

        <!-- label -->
        <p class="forgot-pw-label-text">
          Check your <b>{{ email }}</b> inbox for instructions on how to reset your password.
        </p>

        <!-- Wrong email -->
        <p class="wrong-email-text">
          Wrong email address? Please
          <span @click="reEnterEmailAddress">
            re-enter email address.
          </span>
        </p>

        <!--  -->
        <InfoAlertBox
          alert="Your reset link expired after 24 hours or has already been used."
        >
        </InfoAlertBox>

      </q-card>

      <!--  -->
      <q-card
        v-else
        flat
        class="forgot-pw-card"
      >
        <h4 class="forgot-pw-header-text">
          Forgot Password
        </h4>

        <p class="forgot-pw-label-text">
          Enter your email address and we will send you a link to reset your password.
        </p>

        <!-- Quasar Form -->
        <q-form
          ref="formRef"
          class="forgot-pw-form"
          @submit.prevent.stop="onSubmitForm"
        >
          <!-- Email -->
          <div class="full-width">
            <p class="form-label-text">
              Email Address
            </p>

            <q-input
              dense
              outlined
              autofocus
              hide-bottom-space

              v-model="email"

              name="email"
              type="email"
              ref="emailInputRef"
              lazy-rules="ondemand"
              class="app-input-field-height"

              :rules="emailRules"

              @update:model-value="onEmailInputChange"
            >
            </q-input>
          </div>

          <!-- button -->
          <q-btn
            no-caps
            unelevated

            :loading="isApiProcessing"

            type="submit"
            color="primary"
            class="full-width reset-btn-link auth-submit-btn"
            label="Get a Reset Link"
          >
          </q-btn>
        </q-form>

        <p class="redirect-text">
          Know your password?
          <router-link
            to="/login"
            class="redirect-page-link"
          >
            Back to Sign In
          </router-link>
        </p>
      </q-card>

      <p
        class="redirect-text"
        v-if="showSignupPage"
      >
        Don't have an account?
        <router-link
          to="/signup"
          class="redirect-page-link"
        >
          Register now
        </router-link>
      </p>
    </div>

  </section>
</template>
<script>
// vue
import {
  defineComponent, toRefs, reactive, onMounted, getCurrentInstance, computed,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// stores
import { useAuthStore } from 'src/stores/auth';

// vue-router
import { useRoute } from 'vue-router';

// components
import InfoAlertBox from 'src/components/Alerts/InfoAlertBox.vue';

// Utils
import { postApiCall } from 'src/utils/apiRequests';
import { isMainApp } from 'src/utils/applyBranding';

// constants
import { EMAIL_REGEX } from 'boot/constants';

export default defineComponent({
  name: 'ForgotPassword',

  components: {
    InfoAlertBox,
  },

  setup() {
    // meta
    useMeta({
      title: 'Forgot Password',
      description: 'Forgot Password',
    });

    // route
    const $route = useRoute();

    // store
    const authStorePinia = useAuthStore();

    // Inject the triggerToast method
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      email: '',
      formRef: null,
      emailInputRef: null,

      isApiProcessing: false,

      isEmailSent: false,
    });

    // computed
    const isPrimaryPlatform = computed(() => isMainApp());

    const activeWorkspaceData = computed(() => authStorePinia.activeWorkspaceData);

    const showSignupPage = computed(() => {
      if (isPrimaryPlatform.value && !activeWorkspaceData.value?.id) {
        // only show
        return true;
      }

      return false;
    });

    // methods
    const onSubmitForm = async () => {
      try {
        state.isApiProcessing = true;

        await postApiCall({
          endpoint: '/users/forget-password',
          payload: {
            email: state.email,
          },
        });

        // set email sent
        state.isEmailSent = true;
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    const reEnterEmailAddress = () => {
      state.email = '';
      state.isEmailSent = false;

      state.emailInputRef.focus();
    };

    const onEmailInputChange = () => {
      state.formRef.resetValidation();
    };

    // lifecycle
    onMounted(() => {
      const emailQuery = $route.query.email;

      if (emailQuery) {
        state.email = emailQuery;
      }
    });

    return {
      emailRules: [
        (val) => EMAIL_REGEX.test(val) || 'Invalid email',
      ],

      // state
      ...toRefs(state),

      // computed
      showSignupPage,

      // methods
      onSubmitForm,
      onEmailInputChange,
      reEnterEmailAddress,
    };
  },
});
</script>

<style lang="scss" scoped>
.forgot-password-page {
  width: 100%;
  padding: 60px 20px;

  .forgot-pw-page-container {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .redirect-text {
      color: $grey;
      font-size: 14px;
      font-weight: 400;
      margin-top: 24px;
      text-align: center;

      .redirect-page-link {
        color: $primary;
        font-weight: 500;
        text-decoration: none;

        margin-left: 6px;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .forgot-pw-card {
      width: 100%;
      max-width: 580px;
      border-radius: 8px;
      background-color: $white;

      padding: 60px 80px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 40px 16px;
      }

      .email-sent-icon {
        margin-bottom: 24px;
      }

      .forgot-pw-header-text {
        color: $black;
        font-size: 32px;
        font-weight: 600;
      }

      .forgot-pw-label-text {
        margin-top: 8px;
        margin-bottom: 32px;

        color: $black;
        font-size: 14px;
      }

      .wrong-email-text {
        color: $grey;
        font-size: 14px;

        margin-top: 32px;
        margin-bottom: 32px;

        span {
          color: $primary;
          cursor: pointer;

          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .form-label-text {
        color: $black;
        font-size: 14px;

        margin-bottom: 6px;
      }

      .reset-btn-link {
        margin-top: 32px;
      }
    }
  }
}
</style>
