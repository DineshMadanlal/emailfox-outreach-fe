<template>
  <section class="login-page">
    <!-- container -->
    <div class="login-page-container">
      <!-- Card -->
      <q-card
        flat
        class="login-card"
      >
        <!--  -->
        <h4 class="login-header-text">
          Welcome Back!
        </h4>

        <!--  -->
        <p class="login-desc-text">
          Sign in to continue to your
          <span v-if="activeWorkspaceJson?.name">
            {{ activeWorkspaceJson.name }}
          </span>
          App
        </p>

        <SocialAuth
          v-if="false"
        />

        <!-- Quasar Form -->
        <q-form
          ref="formRef"
          class="login-form"
          @submit.prevent.stop="onSubmitForm"
        >
          <!-- Email -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Email Address"
            />

            <q-input
              dense
              outlined
              autofocus
              hide-bottom-space

              lazy-rules="ondemand"

              v-model="email"

              ref="emailRef"
              name="email"
              type="email"
              class="app-input-field-height"

              :rules="emailRules"

              @update:model-value="onInputChange"
            />
          </div>

          <!-- Password -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Password"
            />

            <q-input
              dense
              outlined
              hide-bottom-space

              v-model="password"

              name="password"
              lazy-rules="ondemand"
              class="app-input-field-height"

              :type="isPasswordInput ? 'password' : 'text'"
              :rules="passwordRules"

              @update:model-value="onInputChange"
            >
              <template v-slot:append>
                <PasswordIconToggle
                  :isPasswordInput="isPasswordInput"
                  @click="isPasswordInput = !isPasswordInput"
                />
              </template>
            </q-input>

            <!-- Forgot Password -->
            <div
              v-if="isPrimaryPlatform"
              class="flex no-wrap items-center"
            >
              <q-space />

              <router-link
                to="/forgot-password"
                class="forgot-password-link"
              >
                Forgot Password?
              </router-link>
            </div>
          </div>

          <!-- Login Button -->
          <q-btn
            no-caps
            unelevated

            type="submit"
            color="primary"

            label="Sign in"
            class="full-width auth-submit-btn"

            :loading="isApiProcessing"
          />
        </q-form>
      </q-card>

      <p
        v-if="showSignupPage"
        class="redirect-text"
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
  defineComponent, reactive, toRefs, getCurrentInstance, computed, onMounted,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// router
import { useRoute, useRouter } from 'vue-router';

// components
import InputLabel from 'components/Form/InputLabel.vue';
import SocialAuth from 'components/AuthProviders/SocialAuth.vue';
import PasswordIconToggle from 'components/Password/PasswordIconToggle.vue';

// stores
import { useAuthStore } from 'src/stores/auth';

// Utils
import { postApiCall } from 'src/utils/apiRequests';
import { isMainApp } from 'src/utils/applyBranding';
import { primaryAppRouteToLoginPage } from 'src/utils/helperFunctions';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { EMAIL_REGEX } from 'boot/constants';

export default defineComponent({
  name: 'AdminLogin',

  components: {
    InputLabel,
    SocialAuth,
    PasswordIconToggle,
  },

  setup() {
    const { generateMetadata } = useAppHelpersApi();

    // quasar
    useMeta(generateMetadata('Login'));

    // Inject the triggerToast method
    const { appContext } = getCurrentInstance();

    // store
    const authStorePinia = useAuthStore();

    // router
    const $route = useRoute();
    const $router = useRouter();

    // state
    const state = reactive({
      email: '',
      password: '',
      isPasswordInput: true,

      isApiProcessing: false,

      formRef: null,
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

    const activeWorkspaceJson = computed(() => authStorePinia.getActiveWorkspaceData);

    // methods
    const onSubmitForm = async () => {
      try {
        state.isApiProcessing = true;

        // hide toast
        appContext.config.globalProperties.$hideToast();

        const payload = {
          email: state.email,
          password: state.password,
        };

        if (activeWorkspaceJson.value?.id) {
          payload.workspace_id = activeWorkspaceData.value.id;
        }

        const response = await postApiCall({
          endpoint: '/users/login',
          payload,
        });

        // set token
        const {
          user, token,
        } = response;

        authStorePinia.setMultipleFields({
          user,
          token: token.access_token,
        });

        const redirectPath = $route.query.redirect;

        const defaultPath = '/outreach/campaigns-all';

        $router.push(redirectPath || defaultPath);
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

    const onInputChange = () => {
      state.formRef.resetValidation();
    };

    //
    onMounted(() => {
      if (isPrimaryPlatform.value && activeWorkspaceData.value?.id) {
        // do not allow workspace login in production
        if (!process.env.DEV_MODE) {
          primaryAppRouteToLoginPage();
        }
      }
    });

    return {
      emailRules: [
        (val) => EMAIL_REGEX.test(val) || 'Invalid email',
      ],
      passwordRules: [
        (val) => val.length > 7 || 'Minimum of 8 characters required',
      ],

      // state
      ...toRefs(state),

      // computed
      showSignupPage,
      isPrimaryPlatform,
      activeWorkspaceJson,

      // methods
      onSubmitForm,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.login-page {
  width: 100%;
  padding: 60px 20px;

  .login-page-container {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .redirect-text {
      color: $grey;
      font-size: 14px;
      font-weight: 400;

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

    .login-card {
      width: 100%;
      max-width: 580px;
      border-radius: 8px;
      background-color: $white;

      padding: 60px 80px;

      margin-bottom: 24px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 40px 16px;
      }

      .login-header-text {
        color: $black;
        font-size: 32px;
        font-weight: 600;
      }

      .login-desc-text {
        color: $black;
        font-size: 14px;

        margin-top: 8px;
        margin-bottom: 32px;
      }

      .login-form {
        width: 100%;
        display: grid;
        grid-row-gap: 24px;

        .forgot-password-link {
          text-align: right;
          width: fit-content;

          min-height: inherit;
          padding: 2px 4px;

          color: $grey;
          font-size: 14px;

          margin-top: 16px;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

  }
}
</style>
