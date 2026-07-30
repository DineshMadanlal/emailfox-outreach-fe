<template>
  <div class="api-settings">
    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          API Key
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Securely generate and manage API keys to
          integrate with external applications and automate workflows.
        </p>
      </div>

      <!-- right side -->
      <div class="settings-header-right-side">
      </div>
    </div>

    <!-- Content -->
    <div class="settings-section-content">
      <h4 class="api-header-text">
        API Key
      </h4>

      <p class="api-desc-text">
        Your secret key grants you access to our API.
      </p>

      <!-- API Key box -->
      <div
        class="api-key-box"
        v-if="userApiKey"
      >
        <p class="api-key-text">
          {{ userApiKey }}
        </p>

        <div
          v-ripple:primary
          class="copy-api-key-block"

          @click="onCopyApiKey"
        >
          <LocalSvgIcon image="copy" class="copy-icon" />

          <p class="copy-api-key-text">
            Copy
          </p>
        </div>
      </div>

      <!-- Cancel -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        :loading="isApiLoading"

        color="primary"
        :label="apiKeyCopyText"

        class="light-primary-btn"

        @click="onGenerateApiKey"
      />

      <!-- API Documentation -->
      <div class="api-docs-wrapper">
        <h4 class="api-header-text">
          API Documentation
        </h4>

        <p class="api-desc-text">
          Explore API endpoints, including GET, POST, and DELETE methods,
          to integrate and automate workflows
          seamlessly. Access detailed guides and examples to help you get started.
        </p>

        <!-- Button -->
        <q-btn
          flat
          no-caps
          unelevated
          v-close-popup

          type="a"
          target="_blank"
          :href="apiEndpointDocsLink"

          color="primary"
          class="btn-font-weight-500"
        >
          <div class="flex no-wrap items-center">
            <p class="block">
              Go to API Documentation
            </p>

            <LocalSvgIcon image="launch" class="launch-icon" />
          </div>
        </q-btn>

        <!-- View API Documentation -->

      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed,
  getCurrentInstance, onMounted,
} from 'vue';

// quasar
import { useMeta, copyToClipboard } from 'quasar';

// Import the Pinia store
import { useAuthStore } from 'src/stores/auth';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { postApiCall, getApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'AppApi',

  setup() {
    // instance
    const { appContext } = getCurrentInstance();

    // Access the authentication store
    const authStorePinia = useAuthStore();

    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('API Keys'));

    // computed
    const userApiKey = computed(() => authStorePinia.getApiKey);

    const apiKeyCopyText = computed(() => {
      if (userApiKey.value) {
        return 'Regenerate API Key';
      }
      return 'Generate API Key';
    });

    // state
    const state = reactive({
      isApiLoading: false,
    });

    // computed
    const apiEndpointDocsLink = computed(() => {
      if (true) {
        return '';
      }

      // const isPrimaryApp = isMainApp();

      // if (isPrimaryApp) {
      //   return 'https://api.emailfox.ai';
      // }

      return '';
    });

    // methods
    const onCopyApiKey = () => {
      // copy api key using clipboard
      copyToClipboard(userApiKey.value).then(() => {
        // show toast
        appContext.config.globalProperties.$toast({
          message: 'API Key copied successfully',
        });
      });
    };

    const onGenerateApiKey = async () => {
      try {
        state.isApiLoading = true;

        // api call
        const response = await postApiCall({
          endpoint: '/users/generate-api-key',
        });

        authStorePinia.setMultipleFields({ apiKey: response.api_key });

        // show toast
        appContext.config.globalProperties.$toast({
          message: 'API Key generated successfully',
        });
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Error generating API Key',
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const fetchUserApiKey = async () => {
      try {
        state.isApiLoading = true;

        const response = await getApiCall({
          endpoint: '/users/api-key',
        });

        authStorePinia.setMultipleFields({ apiKey: response.api_key });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Error fetching API Key',
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    // lifecycle hook
    onMounted(() => {
      fetchUserApiKey();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      userApiKey,
      apiKeyCopyText,
      apiEndpointDocsLink,

      // methods
      onCopyApiKey,
      onGenerateApiKey,
    };
  },

});
</script>

<style lang="scss" scoped>
.api-settings {
  width: 100%;

  .api-header-text {
    color: $black;
    font-size: 14px;
    font-weight: 500;
  }

  .api-desc-text {
    color: rgba($color: var(--black-rgb), $alpha: 0.8);
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;

    margin-top: 4px;
    margin-bottom: 20px;

    max-width: 668px;
  }

  .launch-icon {
    margin-left: 8px;
  }

  .light-primary-btn {
    margin-bottom: 32px;
  }

  .api-docs-wrapper {
    padding-top: 32px;
    border-top: 1px solid $grey-50;
  }

  .api-key-box {
    width: 100%;
    max-width: 500px;
    margin-bottom: 32px;

    display: flex;

    border-radius: 6px;
    background: $white;
    border: 1px solid $blue-grey;

    justify-content: space-between;

    .api-key-text {
      padding: 12px;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }

    .copy-icon {
      min-width: 14px;
      min-height: 14px;
    }

    .copy-api-key-block {
      cursor: pointer;

      border-radius: 0px 6px 6px 0px;

      border-left: 1px solid $blue-grey;

      display: flex;
      align-items: center;

      padding: 12px;

      .copy-api-key-text {
        margin-left: 12px;

        color: $grey;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px; /* 114.286% */
      }
    }
  }

}
</style>
