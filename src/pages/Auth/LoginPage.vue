<template>
  <section class="login-page">
    <!-- container -->
    <div class="login-page-container">
      <!--  -->
      <ApiLoader
        show
      />
    </div>
  </section>
</template>

<script>
// vue
import {
  defineComponent, onMounted, onBeforeUnmount, getCurrentInstance,
} from 'vue';

// router
import { useRouter, useRoute } from 'vue-router';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';

// stores
import { useAuthStore } from 'src/stores/auth';

// utils
import { postApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'LoginPage',

  components: {
    ApiLoader,
  },

  setup() {
    //
    const { appContext } = getCurrentInstance();

    // store
    const authStorePinia = useAuthStore();

    // router
    const $route = useRoute();
    const $router = useRouter();

    // methods
    const ssoLogin = async (tokenInput) => {
      try {
        const response = await postApiCall({
          endpoint: '/partners/sso-login',
          payload: {
            // hardcoded partner_id for now
            partner_id: 2,
            token: tokenInput,
          },
        });

        // set token
        const {
          user, token,
        } = response;

        // set user and token in store
        authStorePinia.setMultipleFields({
          user,
          token: token.access_token,
        });

        const redirectPath = $route.query.redirect;

        // router push
        $router.push(redirectPath || '/outreach/campaigns-all');
      } catch (error) {
        //
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      }
    };

    const handleMessage = async (event) => {
      if (event.data?.type !== 'EMAILFOX_SSO') {
        return;
      }

      const { token } = event.data;

      if (!token) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: 'Cannot proceed. Please try again.',
        });

        return;
      }

      // api call to verify the token and log in the user
      ssoLogin(token);
    };

    const sendMessageToParent = () => {
      // Only send if we're actually running inside an iframe
      window.parent.postMessage(
        {
          type: 'EMAILFOX_READY',
          version: '1.0.0',
          timestamp: Date.now(),
        },
        '*',
      );
    };

    // lifecycle hooks
    onMounted(() => {
      // Only send if we're actually running inside an iframe
      if (window.parent !== window) {
        sendMessageToParent();

        // 1. Start listening first
        window.addEventListener('message', handleMessage);
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener('message', handleMessage);
    });
  },
});
</script>

<style lang="scss" scoped>
.login-page {
  width: 100%;
  padding: 60px 20px;
  position: relative;
  min-height: inherit;
  display: flex;
  flex-direction: column;

  .login-page-container {
    flex: 1;

    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

  }
}
</style>
