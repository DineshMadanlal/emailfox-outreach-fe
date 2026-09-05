<template>
  <div
    class="unibox-conversation-preview custom-scrollbar"
  >
    <q-intersection
      @visibility="onVisibilityChange"
    />

    <!-- Top Action Toolbar -->
    <Toolbar
      :hasPrev="hasPrevThread"
      :hasNext="hasNextThread"
      :threadJson="threadJson"
      :fetchedData="fetchedData"
      :threadTypeConfig="threadTypeConfig"

      :class="{ 'page-scrolled': isPageScrolled }"

      @toggle-star="onToggleStar"
      @toggle-read="onMarkUnread"
      @view-activities="onViewActivities"

      @close="$emit('close')"
      @prev-thread="$emit('prev-thread')"
      @next-thread="$emit('next-thread')"
      @update:reply-category="handleReplyCategoryUpdate"
    />

    <!-- Main Container -->
    <div
      class="conversation-scroll-container"
    >
      <!-- Loading State -->
      <div
        v-if="isLoading || isFetchingMessages"
        class="loading-container"
      >
        <ApiLoader
          show
        />
      </div>

      <div
        v-else
        class="conversation-content-wrapper"
      >
        <template
          v-for="(message, index) in conversationMessages"
          :key="`conversation-preview-${index}-${message.id || message.message_id || ''}`"
        >
          <!-- Email Message Branch -->
          <template v-if="isEmailMessage(message)">
            <EmailMessageCard
              :messageJson="message"
              :contactData="fetchedData"
              :defaultExpanded="index === conversationMessages.length - 1"

              @reply="handleEmailReply"
              @forward="handleEmailForward"
            />
          </template>

          <!-- LinkedIn Message Branch -->
          <template v-else-if="isLinkedInMessage(message)">
            <LinkedInMessageCard
              :messageJson="message"
              :contactData="fetchedData"
              :defaultExpanded="index === conversationMessages.length - 1"
            />
          </template>
        </template>
      </div>
    </div>
    <!-- Reply Editor Modal Dialog -->
    <q-dialog
      v-model="modals.showReplyEditor"
      :maximized="modals.replyEditorType.maximized"
      :persistent="modals.replyEditorType.persistent"
      :position="modals.replyEditorType.maximized ? 'standard' : 'bottom'"
      :class="{ 'app-bottom-dialog': !modals.replyEditorType.maximized }"
    >
      <ReplyEditor
        :maximized="modals.replyEditorType.maximized"
        :messageJson="activeReplyMessage"
        :threadJson="threadJson"
        :contactData="fetchedData"
        @onMaximize="handleReplyEditorResize"
        @onSuccessReply="onSuccessReply"
        @updatePersistentStatus="handleReplyEditorPersistentStatus"
      />
    </q-dialog>

    <!-- Forward Editor Modal Dialog -->
    <q-dialog
      v-model="modals.showForwardEditor"
      :maximized="modals.forwardEditorType.maximized"
      :persistent="modals.forwardEditorType.persistent"
      :position="modals.forwardEditorType.maximized ? 'standard' : 'bottom'"
      :class="{ 'app-bottom-dialog': !modals.forwardEditorType.maximized }"
    >
      <ForwardEditor
        :maximized="modals.forwardEditorType.maximized"
        :messageJson="activeForwardMessage"
        :threadJson="threadJson"
        :contactData="fetchedData"
        @onMaximize="handleForwardEditorResize"
        @onSuccessForward="onSuccessForward"
        @updatePersistentStatus="handleForwardEditorPersistentStatus"
      />
    </q-dialog>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, watch, onMounted,
  defineAsyncComponent,
} from 'vue';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import Toolbar from 'components/Unibox/Conversation/Toolbar.vue';
import EmailMessageCard from 'components/Unibox/Conversation/MessageCards/EmailMessageCard.vue';
import LinkedInMessageCard from
  'components/Unibox/Conversation/MessageCards/LinkedInMessageCard.vue';

// utils
import {
  fetchUniboxConversationMessages,
  fetchUniboxUntrackedParsedMessage,
} from 'src/utils/unibox';

// constants
import { UNIBOX_CHANNEL_TYPE } from 'boot/unibox-constants';

export default defineComponent({
  name: 'UniboxConversationPreview',

  components: {
    Toolbar,
    ApiLoader,
    EmailMessageCard,
    LinkedInMessageCard,
    ReplyEditor: defineAsyncComponent(
      () => import('components/Unibox/Modals/ReplyEditor.vue'),
    ),
    ForwardEditor: defineAsyncComponent(
      () => import('components/Unibox/Modals/ForwardEditor.vue'),
    ),
  },

  emits: [
    'close',
    'prev-thread',
    'next-thread',
    'update-category',
    'toggle-star',
    'toggle-read',
    'update:replyCategory',
    'onSuccessReply',
    'onSuccessForward',
  ],

  props: {
    threadJson: {
      type: Object,
      default: () => ({}),
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    hasPrevThread: {
      type: Boolean,
      default: false,
    },
    hasNextThread: {
      type: Boolean,
      default: false,
    },
    threadTypeConfig: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      fetchedData: null,
      isFetchingMessages: false,
      isPageScrolled: false,

      // Modal dialogs state
      modals: {
        showReplyEditor: false,
        replyEditorType: {
          maximized: false,
          persistent: false,
        },
        showForwardEditor: false,
        forwardEditorType: {
          maximized: false,
          persistent: false,
        },
      },
      activeReplyMessage: null,
      activeForwardMessage: null,
    });

    // methods
    // Fetch conversation message history for contact_mapping_id (tracked) or id (untracked)
    const loadMessages = async () => {
      const thread = props.threadJson;
      const mappingId = thread?.contact_mapping_id;
      const rawId = thread?.id;

      // Determine if UUID (contact_mapping_id) or numeric id (untracked)
      const isUUID = !!mappingId || (typeof rawId === 'string' && rawId.includes('-'));
      const targetId = mappingId || rawId;

      if (!targetId) {
        state.fetchedData = null;
        return;
      }

      try {
        state.isFetchingMessages = true;
        if (isUUID) {
          // Tracked campaign conversation
          const response = await fetchUniboxConversationMessages({
            contactMappingId: targetId,
          });
          state.fetchedData = response?.data || response;
        } else {
          // Untracked parsed message
          const response = await fetchUniboxUntrackedParsedMessage({
            id: targetId,
          });
          state.fetchedData = response?.data || response;
        }
      } catch (error) {
        state.fetchedData = null;
      } finally {
        state.isFetchingMessages = false;
      }
    };

    const onToggleStar = () => {
      emit('toggle-star', props.threadJson);
    };

    const onMarkUnread = () => {
      emit('toggle-read', props.threadJson);
    };

    const onViewActivities = () => {
      // Activities panel toggle
    };

    const handleReplyCategoryUpdate = async (newValue) => {
      if (state.fetchedData) {
        state.fetchedData.reply_category_id = newValue;
      }
      emit('update:replyCategory', newValue);
    };

    const onVisibilityChange = (isVisible) => {
      state.isPageScrolled = !isVisible;
    };

    // Computed messages list from fetchedData
    const conversationMessages = computed(() => {
      if (!state.fetchedData) return [];
      if (Array.isArray(state.fetchedData.messages)) {
        return state.fetchedData.messages;
      }
      // Single message fallback (e.g. untracked parsed reply)
      return [state.fetchedData];
    });

    // Helper condition checks for message channels
    const isEmailMessage = (message) => (
      !message?.step_type
      || message.step_type === UNIBOX_CHANNEL_TYPE.EMAIL
    );

    const isLinkedInMessage = (message) => !!(
      message?.step_type?.startsWith(UNIBOX_CHANNEL_TYPE.LINKEDIN)
    );

    // Reply trigger: open ReplyEditor with active message context
    const handleEmailReply = (messageJson) => {
      state.activeReplyMessage = messageJson;
      state.modals.showReplyEditor = true;
    };

    // Callback on successful email reply: close modal and reload conversation
    const onSuccessReply = () => {
      state.modals.showReplyEditor = false;
      loadMessages();
      emit('onSuccessReply');
    };

    // Toggle full-screen / maximized modal view
    const handleReplyEditorResize = () => {
      const isMax = state.modals.replyEditorType.maximized;
      state.modals.replyEditorType.maximized = !isMax;
    };

    // Keep modal open if user has draft content
    const handleReplyEditorPersistentStatus = (status) => {
      state.modals.replyEditorType.persistent = status;
    };

    // Forward trigger: open ForwardEditor with active message context
    const handleEmailForward = (messageJson) => {
      state.activeForwardMessage = messageJson;
      state.modals.showForwardEditor = true;
    };

    // Callback on successful email forward: close modal and reload conversation
    const onSuccessForward = () => {
      state.modals.showForwardEditor = false;
      loadMessages();
      emit('onSuccessForward');
    };

    // Toggle full-screen / maximized modal view for forward editor
    const handleForwardEditorResize = () => {
      const isMax = state.modals.forwardEditorType.maximized;
      state.modals.forwardEditorType.maximized = !isMax;
    };

    // Keep forward modal open if user has draft content
    const handleForwardEditorPersistentStatus = (status) => {
      state.modals.forwardEditorType.persistent = status;
    };

    // lifecycle hooks
    watch(() => props.threadJson?.contact_mapping_id || props.threadJson?.id, () => {
      loadMessages();
    });

    onMounted(() => {
      loadMessages();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      conversationMessages,

      // methods
      isEmailMessage,
      isLinkedInMessage,
      onToggleStar,
      onMarkUnread,
      onViewActivities,
      onVisibilityChange,
      handleReplyCategoryUpdate,

      handleEmailReply,
      onSuccessReply,
      handleReplyEditorResize,
      handleReplyEditorPersistentStatus,

      handleEmailForward,
      onSuccessForward,
      handleForwardEditorResize,
      handleForwardEditorPersistentStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-conversation-preview {
  flex: 1;
  display: flex;
  flex-direction: column;

  .conversation-scroll-container {
    overflow-y: auto;
    background-color: #F8FAFC;

    flex: 1;
    display: flex;
    flex-direction: column;

    .loading-container {
      position: relative;
      padding: 60px 16px;
    }

    .conversation-content-wrapper {
      padding: 20px;

      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }
}
</style>
