<template>
  <div class="show-original-message-page">
    <ApiLoader :show="isLoading" />

    <p v-if="errorMessage">
      The message you requested does not exist.
      You might have deleted this in some other session.
      If you think this is a error, please report it
    </p>

    <pre
      v-else-if="rawMessageData"
      style="white-space: pre-wrap; word-break: break-word;"
    >
      {{ rawMessageData }}
    </pre>
  </div>
</template>
<script>
// vue
import {
  computed,
  defineComponent, onMounted, reactive, toRefs,
} from 'vue';

// vue router
import { useRoute } from 'vue-router';

// components
import ApiLoader from 'components/General/ApiLoader.vue';

// api
import { postApiCall } from 'src/utils/apiRequests.js';

export default defineComponent({
  name: 'ShowOriginalMessage',

  components: {
    ApiLoader,
  },

  setup() {
    // route
    const $route = useRoute();

    // state
    const state = reactive({
      rawMessageData: null,
      isLoading: false,

      errorMessage: '',
    });

    // computed
    const domainId = computed(() => $route.query.domainId || '');
    const email = computed(() => $route.query.email || '');
    const messageId = computed(() => $route.query.messageId || '');

    // methods
    const fetchRawMessage = async () => {
      state.isLoading = true;

      try {
        state.rawMessageData = await postApiCall({
          endpoint: 'skybox/messages/raw-downlaod',
          payload: {
            domain_id: domainId.value,
            email: email.value,
            message_id: messageId.value,
          },
        });
      } catch (error) {
        state.errorMessage = 'Error fetching raw message';
      } finally {
        state.isLoading = false;
      }
    };

    onMounted(() => {
      // methods
      fetchRawMessage();
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.show-original-message-page {
  padding: 20px;

  overflow-y: scroll;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;
  }
}
</style>
