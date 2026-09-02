<template>
  <div class="unibox-conversation-preview">
    <!-- Top Action Toolbar -->
    <Toolbar
      :hasPrev="hasPrevThread"
      :hasNext="hasNextThread"
      :threadJson="threadJson"
      :fetchedData="fetchedData"
      :threadTypeConfig="threadTypeConfig"

      @toggle-star="onToggleStar"
      @toggle-read="onMarkUnread"
      @view-activities="onViewActivities"

      @close="$emit('close')"
      @prev-thread="$emit('prev-thread')"
      @next-thread="$emit('next-thread')"
    />

    <!-- Main Container -->
    <div class="conversation-scroll-container hide-scrollbar">
      <!-- Loading State -->
      <div
        v-if="isLoading || isFetchingMessages"
        class="loading-container flex flex-center"
      >
        <ApiLoader
          show
        />
      </div>

      <div
        v-else
        class="conversation-content-wrapper"
      >
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent,
  reactive,
  toRefs,
  watch,
  onMounted,
} from 'vue';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import Toolbar from 'components/Unibox/Conversation/Toolbar.vue';

// utils
import {
  fetchUniboxConversationMessages,
  fetchUniboxUntrackedParsedMessage,
} from 'src/utils/unibox';

export default defineComponent({
  name: 'UniboxConversationPreview',

  components: {
    Toolbar,
    ApiLoader,
  },

  emits: [
    'close',
    'prev-thread',
    'next-thread',
    'update-category',
    'toggle-star',
    'toggle-read',
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

      // methods
      onToggleStar,
      onMarkUnread,
      onViewActivities,
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

    .loading-container {
      position: relative;
      padding: 60px 16px;
    }

    .conversation-content-wrapper {
    }
  }
}
</style>
