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
            />
          </template>

          <!-- LinkedIn Message Branch -->
          <template v-else-if="isLinkedInMessage(message)">
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, watch, onMounted,
} from 'vue';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import Toolbar from 'components/Unibox/Conversation/Toolbar.vue';
import EmailMessageCard from 'components/Unibox/Conversation/MessageCards/EmailMessageCard.vue';

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
  },

  emits: [
    'close',
    'prev-thread',
    'next-thread',
    'update-category',
    'toggle-star',
    'toggle-read',
    'update:replyCategory',
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
