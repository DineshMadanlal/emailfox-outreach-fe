<template>
  <div class="linkedin-by-id-page">
    <!-- Check if the page is scrolled -->
    <q-intersection
      @visibility="onVisibilityChange"
    />

    <!-- Dialogs -->
    <!-- Delete LinkedIn Account -->
    <q-dialog
      v-model="modals.showDeleteLinkedIn"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteLinkedIn
        :editLinkedInJson="accountByJson"
        @onSuccessfulDelete="onSuccessfulDeleteAccount"
      />
    </q-dialog>

    <!-- Update LinkedIn Limits Modal -->
    <q-dialog
      v-model="modals.showLinkedInLimits"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <UpdateLinkedInLimits
        :editLinkedInJson="accountByJson"
        @sendingLimitsUpdated="onUpdateAccountByIdJson"
      />
    </q-dialog>

    <!-- LinkedIn Proxy Settings Modal -->
    <q-dialog
      v-model="modals.showLinkedInProxySettings"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <LinkedInProxySettings
        :editLinkedInJson="accountByJson"
        @proxySettingsUpdated="onUpdateAccountByIdJson"
      />
    </q-dialog>

    <!-- API Loader -->
    <ApiLoader
      :show="showApiLoader"
    />

    <!-- Header -->
    <LinkedInByIdHeader
      v-if="accountByJson.id"

      :accountByJson="accountByJson"
      :isPageScrolled="isPageScrolled"

      @deleteAccount="modals.showDeleteLinkedIn = true"
      @editSendingLimits="modals.showLinkedInLimits = true"
      @updateProxySettings="modals.showLinkedInProxySettings = true"
    />

    <!-- Child Sub-Routes (Overview, Campaigns, Activities) -->
    <router-view
      v-if="accountByJson.id"
      :accountByJson="accountByJson"

      @updateAccountByIdJson="onUpdateAccountByIdJson"
      @editSendingLimits="modals.showLinkedInLimits = true"
      @updateProxySettings="modals.showLinkedInProxySettings = true"
    />
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, onMounted, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// router
import { useRoute, useRouter } from 'vue-router';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Import the pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// utils
import { convertStringToNumber } from 'src/utils/numbers';
import { getLinkedInAccountById } from 'src/utils/connectedAccountsApi';

// Components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import LinkedInByIdHeader from 'components/LinkedInById/Header.vue';
import DeleteLinkedIn from 'components/ConnectedAccounts/Modals/DeleteLinkedIn.vue';
import UpdateLinkedInLimits from 'components/ConnectedAccounts/Modals/UpdateLinkedInLimits.vue';
import LinkedInProxySettings from 'components/ConnectedAccounts/Modals/LinkedInProxySettings.vue';

export default defineComponent({
  name: 'LinkedInById',

  components: {
    ApiLoader,
    LinkedInByIdHeader,
    DeleteLinkedIn,
    UpdateLinkedInLimits,
    LinkedInProxySettings,
  },

  setup() {
    // store
    const userStore = useUserPreferencesStore();

    // current instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // router
    const $route = useRoute();
    const $router = useRouter();

    // state
    const state = reactive({
      isPageScrolled: false,
      accountByJson: {},

      loaders: {
        fetchApi: false,
      },

      modals: {
        showDeleteLinkedIn: false,
        showLinkedInLimits: false,
        showLinkedInProxySettings: false,
      },
    });

    // computed
    const accountId = computed(() => convertStringToNumber($route.params.accountId));

    const showApiLoader = computed(() => state.loaders.fetchApi && isEmpty(state.accountByJson));

    // methods
    const onVisibilityChange = (isVisible) => {
      state.isPageScrolled = !isVisible;
    };

    const onUpdateAccountByIdJson = (updatedJson) => {
      state.accountByJson = {
        ...state.accountByJson,
        ...updatedJson,
      };

      state.modals.showLinkedInLimits = false;
      state.modals.showLinkedInProxySettings = false;
    };

    const makeApiCallOnMounted = async () => {
      try {
        state.loaders.fetchApi = true;

        const response = await getLinkedInAccountById(accountId.value);

        if (isEmpty(response)) {
          appContext.config.globalProperties.$toast({
            warning: true,
            message: 'LinkedIn Account Not Found',
          });

          $router.push('/outreach/linkedin/accounts');
        } else {
          state.accountByJson = response;

          useMeta(generateMetadata(state.accountByJson.name || 'LinkedIn Account'));
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });

        $router.push('/outreach/linkedin/accounts');
      } finally {
        state.loaders.fetchApi = false;
      }
    };

    const onSuccessfulDeleteAccount = () => {
      state.modals.showDeleteLinkedIn = false;
      $router.push('/outreach/linkedin/accounts');
    };

    onMounted(() => {
      const {
        tableData,
      } = userStore.linkedInAccountsState || {};

      // filter the tableData to find the account with the matching accountId
      const accountFromStore = tableData?.find((account) => account.id === accountId.value);

      if (accountFromStore) {
        state.accountByJson = accountFromStore;

        useMeta(generateMetadata(state.accountByJson.name || 'LinkedIn Account'));
      }

      // call the API to fetch the account details on mounted
      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      showApiLoader,

      // methods
      onVisibilityChange,
      onUpdateAccountByIdJson,
      onSuccessfulDeleteAccount,
    };
  },
});
</script>

<style lang="scss" scoped>
.linkedin-by-id-page {
  width: 100%;
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}
</style>
