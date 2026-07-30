<template>
  <ApiLoader
    show
  />
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, onMounted, computed, getCurrentInstance,
} from 'vue';

// vue router
import { useRoute, useRouter } from 'vue-router';

// components
import ApiLoader from 'components/General/ApiLoader.vue';

// stores
import { useAuthStore } from 'src/stores/auth';

// utils
import { getApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'OAuthCallback',

  components: {
    ApiLoader,
  },

  setup() {
    // app context
    const { appContext } = getCurrentInstance();

    // store
    const authStorePinia = useAuthStore();

    // route
    const $route = useRoute();
    const $router = useRouter();

    // computed
    const activeWorkspaceJson = computed(() => authStorePinia.getActiveWorkspaceData);

    // methods
    const getUserDetails = async () => {
      try {
        const response = await getApiCall({
          endpoint: '/users/me',
        });

        authStorePinia.setMultipleFields({
          user: response,
        });
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      }
    };

    onMounted(async () => {
      const { token } = $route.query;

      authStorePinia.setMultipleFields({
        token,
      });

      await getUserDetails();

      // push
      const redirectPath = $route.query.redirect;

      let defaultPath = '';

      if (isEmpty(activeWorkspaceJson.value)) {
        defaultPath = '/workspace/create';
      } else {
        defaultPath = '/outreach/campaigns-all';
      }

      $router.push(redirectPath || defaultPath);
    });
  },
});
</script>
