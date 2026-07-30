<template>
  <div
    class="master-inbox-email-preview"
  >
    <!-- Dialog -->
    <q-dialog
      v-model="showDeleteThreadModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteThread
        :threadId="threadId"
        @onSuccessfulDeleteThread="onSuccessfulDeleteThread"
      />
    </q-dialog>

    <!-- Loader -->
    <ApiLoader :show="isApiProcessing" />

    <!-- Required to check if the page is scrolled. We use the boolean as a condition
      to show border if required -->
    <q-intersection
      @visibility="onVisibilityChange"
    >
    </q-intersection>

    <!-- Header -->
    <SkyBoxEmailPreviewHeader
      :canMoveLeft="canMoveLeft"
      :canMoveRight="canMoveRight"
      :isPageScrolled="isPageScrolled"
      :activeEmailJson="activeEmailJson"
      :threadTypeJson="threadTypeJson"

      @onClickDelete="onDeleteThread"
      @onClickUnread="onMarkAsUnread"
      @onClickImportant="$emit('toggleEmailImportance')"

      @onClickClose="$emit('onClickClose')"
      @onClickLeftArrow="$emit('onClickLeftArrow')"
      @onClickRightArrow="$emit('onClickRightArrow')"
    />

    <!-- Content -->
    <SkyBoxEmailPreviewContent
      v-if="showEmailPreviewContent"

      :threadMessages="threadMessages"
      :showReplyForwardAction="threadTypeJson.showReplyForwardAction"

      @refetchThreadById="refetchThreadById"
    />
  </div>
</template>

<script>
// vue
import {
  defineComponent, toRefs, reactive, onMounted, getCurrentInstance, computed, watch,
} from 'vue';

// utils
import { postApiCall } from 'src/utils/apiRequests.js';
import { fetchThreadById } from 'src/utils/skyboxApi.js';
import { scrollToTheTopByElementId } from 'src/utils/htmlScrollApi.js';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import DeleteThread from 'components/MasterInbox/Modals/DeleteThread.vue';
import SkyBoxEmailPreviewHeader from 'components/MasterInbox/EmailPreview/Header.vue';
import SkyBoxEmailPreviewContent from 'components/MasterInbox/EmailPreview/Content.vue';

export default defineComponent({
  name: 'SkyBoxEmailPreview',

  emits: ['updateActiveEmailJson', 'onClickClose', 'onClickUnread', 'onDeleteActiveEmailJson', 'onClickLeftArrow', 'onClickRightArrow', 'toggleEmailImportance'],

  components: {
    ApiLoader,
    DeleteThread,
    SkyBoxEmailPreviewHeader,
    SkyBoxEmailPreviewContent,
  },

  props: {
    activeEmailJson: {
      type: Object,
      required: true,
    },
    canMoveLeft: {
      type: Boolean,
      default: false,
    },
    canMoveRight: {
      type: Boolean,
      default: false,
    },

    threadTypeJson: {
      type: Object,
      default: () => {},
    },
  },

  setup(props, { emit }) {
    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isPageScrolled: false,
      isApiProcessing: false,

      showEmailPreviewContent: false,

      threadMessages: [],

      showDeleteThreadModal: false,
    });

    // computed
    const threadId = computed(() => props.activeEmailJson.thread_id);

    // methods
    const onVisibilityChange = (isVisible) => {
      state.isPageScrolled = !isVisible;
    };

    const resetToDefaultState = () => {
      state.isPageScrolled = false;
      state.isApiProcessing = true;
      state.showEmailPreviewContent = false;

      state.threadMessages = [];
    };

    const changeReadStatus = async (readStatus) => {
      try {
        emit('updateActiveEmailJson', {
          ...props.activeEmailJson,
          is_unread: !readStatus,
        });

        await postApiCall({
          endpoint: 'skybox/update-is-read-flag',
          payload: {
            thread_id: threadId.value,
            is_read: readStatus,
          },
        });

        return true;
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });

        // come back to the previous state
        emit('updateActiveEmailJson', {
          ...props.activeEmailJson,
          is_unread: readStatus,
        });

        return false;
      }
    };

    const onDeleteThread = () => {
      state.showDeleteThreadModal = true;
    };

    const onSuccessfulDeleteThread = () => {
      state.showDeleteThreadModal = false;

      emit('onDeleteActiveEmailJson');
    };

    const makeThreadByIdApiCall = async () => {
      try {
        resetToDefaultState();

        if (props.activeEmailJson.is_unread) {
          changeReadStatus(true);
        }

        const response = await fetchThreadById(threadId.value);

        state.threadMessages = response;

        state.showEmailPreviewContent = true;

        scrollToTheTopByElementId('skyboxLeadsRightSection');
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    const onMarkAsUnread = async () => {
      try {
        changeReadStatus(false);

        emit('onClickClose');
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      }
    };

    const refetchThreadById = () => {
      makeThreadByIdApiCall();
    };

    onMounted(() => {
      makeThreadByIdApiCall();
    });

    watch(() => props.activeEmailJson, (newValue, oldValue) => {
      if (newValue.thread_id !== oldValue.thread_id) {
        makeThreadByIdApiCall();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      threadId,
      isMobileDevice,

      // methods
      onDeleteThread,
      onMarkAsUnread,
      onVisibilityChange,
      refetchThreadById,
      onSuccessfulDeleteThread,
    };
  },
});
</script>

<style lang="scss" scoped>
.master-inbox-email-preview {
  width: 100%;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    background: $white;
  }
}
</style>
