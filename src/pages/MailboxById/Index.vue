<template>
  <div class="mailbox-by-id-page">
    <!-- Required to check if the page is scrolled. We use the boolean as a condition
    to show border if required -->
    <q-intersection
      @visibility="onVisibilityChange"
    >
    </q-intersection>

    <!-- Dialog -->
    <q-dialog
      v-model="modals.showDeleteMailbox"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteMailbox
        :mailboxId="mailboxByJson.id"
        :domainId="mailboxByJson.domain_id"

        @onSuccessfulDeleteMailbox="onSuccessfulDeleteMailbox"
      />
    </q-dialog>

    <!-- Unblock Warmup Dialog -->
    <q-dialog
      persistent
      v-model="modals.showUnblockWarmup"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <UnblockWarmup
        :mailboxByJson="mailboxByJson"
        :warmupDetails="warmupDetails"
        @unblockSuccess="onSuccessfulUnblockWarmup"
      />
    </q-dialog>

    <!-- Api loader -->
    <ApiLoader :show="fetchMailboxByIdApiLoading" />

    <!-- Header -->
    <MailboxByIdHeader
      v-if="mailboxByJson.id"
      :domainName="domainName"
      :mailboxByJson="mailboxByJson"
      :isPageScrolled="isPageScrolled"

      @deleteMailbox="onDeleteMailbox"
    />

    <!-- Mailbox by ID -->
    <router-view
      v-if="mailboxByJson.id"

      :key="routerKey"

      :warmupDetails="warmupDetails"
      :mailboxByJson="mailboxByJson"

      @updateMailbox="onUpdateMailboxJson"
      @reloadPage="onReloadPage"
      @unblockWarmup="modals.showUnblockWarmup = true"
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

// utils
import { convertStringToNumber } from 'src/utils/numbers';
import { getMailboxWarmupDetails } from 'src/utils/warmupApi';
import { getMailboxById } from 'src/utils/domainMailboxesApi';

// Components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import MailboxByIdHeader from 'components/MailboxById/Header.vue';
import DeleteMailbox from 'components/Domains/Modals/DeleteMailbox.vue';
import UnblockWarmup from 'components/MailboxById/Modals/UnblockWarmup.vue';

// constants
import { WARMUP_STATUS } from 'src/boot/warmup-constants';

export default defineComponent({
  name: 'MailboxById',

  components: {
    ApiLoader,
    DeleteMailbox,
    UnblockWarmup,
    MailboxByIdHeader,
  },

  setup() {
    // current instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // router
    const $route = useRoute();
    const $router = useRouter();

    // state
    const state = reactive({
      routerKey: 0,

      isPageScrolled: false,

      mailboxByJson: {},
      warmupDetails: null,
      fetchMailboxByIdApiLoading: false,

      // modals
      modals: {
        showDeleteMailbox: false,
        showUnblockWarmup: false,
      },
    });

    // computed
    const mailboxId = computed(() => convertStringToNumber($route.params.mailboxId));

    const domainName = computed(() => {
      if (!state.mailboxByJson?.email?.includes('@')) return '';
      return state.mailboxByJson.email?.split('@')[1];
    });

    // methods
    const onVisibilityChange = (isVisible) => {
      state.isPageScrolled = !isVisible;
    };

    const fetchMailboxWarmupDetails = async () => {
      try {
        // make api call to fetch warmup details
        const response = await getMailboxWarmupDetails({
          mailboxId: mailboxId.value,
        });

        state.warmupDetails = response || {};
      } catch (error) {
        if (error.message.includes('Warmup settings not found for this mailbox.')) {
          state.warmupDetails = null;
        }
      }
    };

    const makeApiCallOnMounted = async () => {
      try {
        state.fetchMailboxByIdApiLoading = isEmpty(state.mailboxByJson);

        // make api call
        const response = await getMailboxById(mailboxId.value);

        if (isEmpty(response)) {
          // show error warning
          appContext.config.globalProperties.$toast({
            warning: true,
            message: 'Mailbox Not Found',
          });

          // Push to error page
          $router.push('/outreach/mailbox-not-found');
        } else {
          state.mailboxByJson = response;

          if (response.warmup_status === WARMUP_STATUS.BLOCKED) {
            fetchMailboxWarmupDetails();
          }

          // metadata
          useMeta(generateMetadata(state.mailboxByJson.email));
        }
      } catch (error) {
        // show error warning
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });

        // Push to error page
        $router.push('/outreach/mailbox-not-found');
      } finally {
        state.fetchMailboxByIdApiLoading = false;
      }
    };

    const onDeleteMailbox = () => {
      state.modals.showDeleteMailbox = true;
    };

    const onSuccessfulDeleteMailbox = () => {
      state.modals.showDeleteMailbox = false;

      // Push to the previous page
      $router.go(-1);
    };

    const onReloadPage = () => {
      makeApiCallOnMounted();
      state.routerKey += 1;
    };

    const onSuccessfulUnblockWarmup = () => {
      state.modals.showUnblockWarmup = false;

      onReloadPage();
    };

    const onUpdateMailboxJson = (updatedMailbox) => {
      state.mailboxByJson = { ...updatedMailbox };
    };

    // lifecycle hooks
    onMounted(() => {
      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      domainName,
      isMobileDevice,

      // methods
      onReloadPage,
      onDeleteMailbox,
      onVisibilityChange,
      onUpdateMailboxJson,
      onSuccessfulDeleteMailbox,
      onSuccessfulUnblockWarmup,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailbox-by-id-page {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
