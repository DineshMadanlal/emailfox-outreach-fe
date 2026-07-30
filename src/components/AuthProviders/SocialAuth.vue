<template>
  <div class="social-auth-container">
    <!-- Social Buttons -->
    <div class="social-buttons">
      <!-- Google -->
      <q-btn
        no-caps
        unelevated
        outline

        color="blue-grey"
        class="social-btn"

        @click="onGoogleOauth"

        :loading="isApiLoading"
      >
        <div class="flex no-wrap items-center">
          <LocalSvgIcon
            image="google"
            classes="social-icon"
          />

          <p class="social-btn-text">
            Google
          </p>
        </div>
      </q-btn>

      <!-- Microsoft -->
      <q-btn
        no-caps
        unelevated
        outline

        color="blue-grey"
        class="social-btn"

        @click="onOutlookOauth"

        :loading="isApiLoading"
      >
        <div class="flex no-wrap items-center">
          <LocalSvgIcon
            image="outlook"
            classes="social-icon"
          />

          <p class="social-btn-text">
            Microsoft
          </p>
        </div>
      </q-btn>
    </div>

    <div class="social-separator">
      <p class="or-text">
        {{ isSignupPage ? 'Or' : 'Or Sign In using' }}
      </p>

      <div class="border-line" />
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, toRefs, reactive, getCurrentInstance, computed,
} from 'vue';

// vue router
import { useRoute } from 'vue-router';

// utils
import { backendApiUrl } from 'src/utils/helperFunctions';

export default defineComponent({
  name: 'SocialAuth',

  props: {
    isSignupPage: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    // route
    const $route = useRoute();

    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,
    });

    // computed
    const tokenQuery = computed(() => $route.query.token);

    // methods
    const getBackendUrl = (provider) => {
      const currentOrigin = window.location.origin;

      const redirectUrl = encodeURIComponent(`${currentOrigin}/oauth/callback`);

      const endpoint = `/users/auth/${provider}/signin?redirectUrl=${redirectUrl}`;

      if (tokenQuery.value) {
        return `${endpoint}&token=${tokenQuery.value}`;
      }

      const baseURL = backendApiUrl();

      return `${baseURL}${endpoint}`;
    };

    // methods
    const onOutlookOauth = async () => {
      try {
        state.isApiLoading = true;

        window.location.href = getBackendUrl('microsoft');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const onGoogleOauth = async () => {
      try {
        state.isApiLoading = true;

        window.location.href = getBackendUrl('google');
      } catch (error) {
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

      // methods
      onGoogleOauth,
      onOutlookOauth,
    };
  },
});
</script>

<style lang="scss" scoped>
.social-auth-container {
  width: 100%;
  margin-bottom: 32px;

  .social-buttons {
    display: flex;
    gap: 16px;
    align-items: center;

    .social-btn {
      width: 100%;

      .social-icon {
        width: 24px;
        height: 24px;
      }

      .social-btn-text {
        color: $black;
        font-size: 14px;
        font-weight: 500;

        margin-left: 10px;
      }
    }
  }

  .social-separator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 32px;

    .or-text {
      color: $grey;
      font-size: 14px;
      font-weight: 400;
      white-space: nowrap;
    }

    .border-line {
      width: 100%;
      border-top: 1px solid $grey-50;
    }
  }
}
</style>
