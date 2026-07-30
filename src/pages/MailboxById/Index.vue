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
      v-model="showDeleteMailboxModal"
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

      :mailboxByJson="mailboxByJson"
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
import { getMailboxById } from 'src/utils/domainMailboxesApi';

// Components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import MailboxByIdHeader from 'components/MailboxById/Header.vue';
import DeleteMailbox from 'components/Domains/Modals/DeleteMailbox.vue';

export default defineComponent({
  name: 'MailboxById',

  components: {
    ApiLoader,
    DeleteMailbox,
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
      isPageScrolled: false,

      mailboxByJson: {},
      fetchMailboxByIdApiLoading: false,

      // modals
      showDeleteMailboxModal: false,
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

    const makeApiCallOnMounted = async () => {
      try {
        state.fetchMailboxByIdApiLoading = true;

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
      state.showDeleteMailboxModal = true;
    };

    const onSuccessfulDeleteMailbox = () => {
      state.showDeleteMailboxModal = false;

      // Push to the previous page
      $router.go(-1);
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
      onVisibilityChange,
      onDeleteMailbox,
      onSuccessfulDeleteMailbox,
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
