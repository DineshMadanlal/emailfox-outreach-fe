<template>
  <EspBreakdown
    :showLoader="isApiLoading"
    :espPerformanceMetrics="backendResponse"
  />
</template>

<script>
// vue
import {
  defineComponent, onMounted, reactive, toRefs, getCurrentInstance,
} from 'vue';

// Components
import EspBreakdown from 'components/DomainById/EspBreakdown.vue';

// utils
import { getMailboxWarmupEspBreakdown } from 'src/utils/warmupApi';

export default defineComponent({
  name: 'WarmupEspBreakdown',

  components: {
    EspBreakdown,
  },

  props: {
    mailboxId: {
      type: Number,
      default: null,
    },
  },

  setup(props) {
    //
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,

      backendResponse: {},
    });

    // methods
    const makeApiCallOnMounted = async () => {
      try {
        state.isApiLoading = true;

        const response = await getMailboxWarmupEspBreakdown({
          mailboxId: props.mailboxId,
        });

        state.backendResponse = response;
      } catch (error) {
        if (error.message.includes('No warmup')) {
          state.backendResponse = {};

          return;
        }
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    // lifecycle hook
    onMounted(() => {
      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>
