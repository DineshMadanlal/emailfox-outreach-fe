<template>
  <q-card
    v-if="readOnlyView"
    flat
    class="master-inbox-reply-thread"
  >
    <ApiLoader
      :show="isEmailDetailsLoading"
    />

    <ReadOnlyReplyThreadHeader
      @click="readOnlyView = false"

      :eachThreadJson="eachThreadJson"
      :fromNameAndEmail="fromNameAndEmail"
    />
  </q-card>

  <q-card
    v-else

    flat
    class="master-inbox-reply-thread"
  >
    <ApiLoader
      :show="isEmailDetailsLoading"
    />

    <!-- Modals -->
    <q-dialog
      :position="replyEditorModalType.maximized ? 'standard' : 'bottom'"
      :class="{ 'app-bottom-dialog': !replyEditorModalType.maximized }"

      v-model="showSkyBoxReplyEditorModal"

      :maximized="replyEditorModalType.maximized"
      :persistent="replyEditorModalType.persistent"
    >
      <SkyBoxReplyEditor
        :eachThreadJson="eachThreadJson"
        :latestReplyInHtml="replyContent"
        :detailedEmailJson="detailedEmailJson"
        :maximized="replyEditorModalType.maximized"

        @onSuccessReply="onRefetchThreadById"
        @onMaximize="handleReplyEditorResize"
        @updatePersistentStatus="handleReplyEditorPersistentStatus"
      />
    </q-dialog>

    <q-dialog
      :position="forwardEditorModalType.maximized ? 'standard' : 'bottom'"
      :class="{ 'app-bottom-dialog': !forwardEditorModalType.maximized }"

      v-model="showSkyBoxForwardEditorModal"

      :maximized="forwardEditorModalType.maximized"
      :persistent="forwardEditorModalType.persistent"
    >
      <SkyBoxForwardEditor
        :eachThreadJson="eachThreadJson"
        :latestReplyInHtml="replyContent"
        :detailedEmailJson="detailedEmailJson"
        :maximized="forwardEditorModalType.maximized"

        @onSuccessForward="onRefetchThreadById"
        @onMaximize="handleForwardEditorResize"
        @updatePersistentStatus="handleForwardEditorPersistentStatus"
      />
    </q-dialog>

    <!-- Header -->
    <ReplyThreadHeader
      @click="readOnlyView = true"

      :eachThreadJson="eachThreadJson"
      :fromNameAndEmail="fromNameAndEmail"
      :showReplyForwardAction="showReplyForwardAction"

      @onReply="onReply"
      @onForward="onForward"
      @showOriginal="onShowOriginal"
    />

    <div class="reply-thread-content">
      <AppEditor
        :isEditable="false"
        v-model="replyContent"
        :addExtraHeightForIframe="0"
      />

      <EmailAttachments
        v-if="emailAttachments.length"

        :eachThreadJson="eachThreadJson"
        :emailAttachments="emailAttachments"
      />

      <ReplyForwardAction
        @onReply="onReply"
        @onForward="onForward"

        v-if="showReplyForwardAction"
      />
    </div>
  </q-card>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, computed, reactive, toRefs, onMounted, watch, getCurrentInstance,
  defineAsyncComponent,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import ReplyThreadHeader from 'components/MasterInbox/EmailPreview/ReplyThreadHeader.vue';
import ReplyForwardAction from 'components/MasterInbox/EmailPreview/ReplyForwardAction.vue';
import EmailAttachments from 'components/MasterInbox/EmailPreview/EmailAttachments.vue';
import ReadOnlyReplyThreadHeader from 'components/MasterInbox/EmailPreview/ReadOnlyReplyThreadHeader.vue';

import SkyBoxReplyEditor from 'components/MasterInbox/Modals/ReplyEditor.vue';
import SkyBoxForwardEditor from 'components/MasterInbox/Modals/ForwardEditor.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { postApiCall } from 'src/utils/apiRequests.js';
import { getFromAndEmailJson } from 'src/utils/skyboxApi.js';
import { trimMessageId } from 'src/utils/helperFunctions';

export default defineComponent({
  name: 'SkyBoxReplyThread',

  emits: ['refetchThreadById'],

  components: {
    ApiLoader,
    EmailAttachments,
    ReplyThreadHeader,
    ReplyForwardAction,
    ReadOnlyReplyThreadHeader,

    SkyBoxReplyEditor,
    SkyBoxForwardEditor,
    AppEditor: defineAsyncComponent(() => import('components/Editor/AppEditor.vue')),
  },

  props: {
    defaultOpened: {
      type: Boolean,
      default: false,
    },
    eachThreadJson: {
      type: Object,
      required: true,

      default: () => ({}),
    },
    showReplyForwardAction: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    //
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      readOnlyView: true,

      replyEditorModalType: {},
      showSkyBoxReplyEditorModal: false,

      forwardEditorModalType: {},
      showSkyBoxForwardEditorModal: false,

      detailedEmailJson: {},
      isEmailDetailsLoading: false,
    });

    // computed
    const replyContent = computed(() => {
      if (isEmpty(state.detailedEmailJson)) {
        return props.eachThreadJson.message_preview || '';
      }

      const { html, text_as_html, text } = state.detailedEmailJson;

      if (html && html !== 'false') {
        return html;
      } if (text_as_html && text_as_html.trim() !== '') {
        return text_as_html;
      }
      return text || '';
    });

    const emailAttachments = computed(() => state.detailedEmailJson.attachments || []);

    const fromNameAndEmail = computed(() => {
      const { from } = props.eachThreadJson;

      return getFromAndEmailJson(from);
    });

    // methods
    const onReply = () => {
      if (isMobileDevice.value) {
        state.replyEditorModalType = {
          maximized: true,
        };
      } else {
        state.replyEditorModalType = {
          maximized: false,
        };
      }

      state.showSkyBoxReplyEditorModal = true;
    };

    const onForward = () => {
      if (isMobileDevice.value) {
        state.forwardEditorModalType = {
          maximized: true,
        };
      } else {
        state.forwardEditorModalType = {
          maximized: false,
        };
      }

      state.showSkyBoxForwardEditorModal = true;
    };

    const onShowOriginal = () => {
      const url = `/unibox/raw?email=${props.eachThreadJson.email}&domainId=${props.eachThreadJson.domain_id}&messageId=${trimMessageId(props.eachThreadJson.message_id)}`;

      window.open(url, '_blank');
    };

    const onRefetchThreadById = () => {
      state.showSkyBoxReplyEditorModal = false;

      // reset reply editor modal type
      state.replyEditorModalType = {};

      emit('refetchThreadById');
    };

    const handleReplyEditorResize = () => {
      state.replyEditorModalType.maximized = !state.replyEditorModalType.maximized;
    };

    const handleReplyEditorPersistentStatus = (status) => {
      state.replyEditorModalType.persistent = status;
    };

    const handleForwardEditorResize = () => {
      state.forwardEditorModalType.maximized = !state.forwardEditorModalType.maximized;
    };

    const handleForwardEditorPersistentStatus = (status) => {
      state.forwardEditorModalType.persistent = status;
    };

    const fetchDetailedEmailJson = async () => {
      try {
        state.isEmailDetailsLoading = true;

        // api call to fetch detailed email JSON
        const response = await postApiCall({
          endpoint: 'skybox/messages/json-view',
          payload: {
            type: props.eachThreadJson.type,
            email: props.eachThreadJson.email,
            domain_id: props.eachThreadJson.domain_id,
            message_id: trimMessageId(props.eachThreadJson.message_id),
          },
        });

        state.detailedEmailJson = response;
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to fetch detailed email data.',
        });
      } finally {
        state.isEmailDetailsLoading = false;
      }
    };

    // Lifecycle
    onMounted(() => {
      state.readOnlyView = !props.defaultOpened;
    });

    watch(() => state.readOnlyView, (newValue) => {
      if (!newValue && isEmpty(state.detailedEmailJson)) {
        fetchDetailedEmailJson();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      replyContent,
      fromNameAndEmail,
      emailAttachments,

      // methods
      onReply,
      onForward,
      onShowOriginal,
      onRefetchThreadById,
      handleReplyEditorResize,
      handleForwardEditorResize,

      handleReplyEditorPersistentStatus,
      handleForwardEditorPersistentStatus,

    };
  },
});
</script>

<style lang="scss" scoped>
.master-inbox-reply-thread {
  width: 100%;
  padding: 0px;
  border: 1px solid $grey-50;

  .reply-thread-content {
    width: 100%;
    padding: 0px 12px;
    border-top: 1px solid $grey-50;
  }
}
</style>
