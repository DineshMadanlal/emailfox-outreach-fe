<template>
  <div class="mailbox-warmup-page">
    <!-- Api Loader -->
    <ApiLoader
      show

      v-if="isApiLoading"
    />

    <!-- If warmup enabled -->
    <MailboxByIdWarmupAnalytics
      v-if="isWarmupEnabled"

      :mailboxByJson="mailboxByJson"
      :mailboxWarmupDetails="mailboxWarmupDetails"

      @unblockWarmup="$emit('unblockWarmup')"
    />

    <!-- If warmup not enabled -->
    <MailboxByIdEnableWarmup
      v-else
      :mailboxByJson="mailboxByJson"

      @reloadApiCalls="reloadApiCalls"
    />
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, onMounted, reactive, toRefs, getCurrentInstance, computed, watch,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import MailboxByIdEnableWarmup from 'components/MailboxById/EnableWarmup.vue';
import MailboxByIdWarmupAnalytics from 'components/MailboxById/WarmupAnalytics.vue';

// utils
import { getMailboxWarmupDetails } from 'src/utils/warmupApi';

export default defineComponent({
  name: 'MailboxByIdWarmup',

  emits: ['unblockWarmup', 'reloadPage'],

  props: {
    mailboxByJson: {
      type: Object,
      default: () => ({}),
    },
    warmupDetails: {
      type: Object,
      default: () => ({}),
    },
  },

  components: {
    ApiLoader,
    MailboxByIdEnableWarmup,
    MailboxByIdWarmupAnalytics,
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,

      mailboxWarmupDetails: null,
    });

    // computed
    const isWarmupEnabled = computed(() => !!state.mailboxWarmupDetails?.warmup_profile_id);

    // methods
    const makeApiCallOnMounted = async () => {
      try {
        state.isApiLoading = isEmpty(state.mailboxWarmupDetails);

        const response = await getMailboxWarmupDetails({
          mailboxId: props.mailboxByJson.id,
        });

        state.mailboxWarmupDetails = response;
      } catch (error) {
        // this is hardcoded because the API returns
        // 404 when warmup settings are not found for a mailbox.We need to
        // handle this case separately because it's not really an error,
        // it just means that warmup is not enabled for this mailbox.
        if (error.message.includes('Warmup settings not found for this mailbox.')) {
          state.mailboxWarmupDetails = null;
          return;
        }

        // Show a toaster
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const reloadApiCalls = () => {
      emit('reloadPage');
    };

    // lifecycle hook
    onMounted(() => {
      makeApiCallOnMounted();

      //
      if (props.warmupDetails && Object.keys(props.warmupDetails).length > 0) {
        state.mailboxWarmupDetails = props.warmupDetails;
      }
    });

    // watch warmup details
    watch(
      () => props.warmupDetails,
      (newVal) => {
        if (newVal && Object.keys(newVal).length > 0) {
          state.mailboxWarmupDetails = newVal;
        }
      },
      { immediate: true },
    );

    return {
      // state
      ...toRefs(state),

      // computed
      isWarmupEnabled,

      // methods
      reloadApiCalls,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailbox-warmup-page {
  width: 100%;
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow-x: hidden;

  padding: 20px;

  @include custom-scrollbar;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;
  }
}
</style>
