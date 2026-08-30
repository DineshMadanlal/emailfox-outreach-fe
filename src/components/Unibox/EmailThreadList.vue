<template>
  <div class="unibox-page-content">
    <!-- Empty State View: Illustration Only (No Header) -->
    <UniboxEmptyState
      v-if="isEmailListEmpty"
      :threadTypeConfig="threadTypeConfig"
    />

    <!-- Active Leads View (Header + List + Preview) -->
    <div
      v-else
      class="unibox-leads-wrapper"
    >
      <!-- Left Section: Header, Email List & Footer -->
      <div
        id="uniboxLeadsLeftSection"
        class="unibox-leads-left-section"
        :class="{ 'right--active': !!activeThreadId }"
      >
        <!-- Unibox Header -->
        <UniboxHeader
          :filters="filters"
          :compactView="!!activeThreadId"
          :title="threadTypeConfig.title"
          :campaigns="campaignsList"
          :isRefreshing="flags.isRefreshing"
          :isApiProcessing="flags.isApiProcessing"
          :replyCategories="replyCategoriesList"

          @refresh="onRefreshEmailList"
          @reset-filters="onResetFilters"
          @update:filters="onUpdateFilters"
        />

        <!-- Email List Container -->
        <div
          class="unibox-email-list-wrapper hide-scrollbar"
        >
          <!-- No search results state when filters are applied -->
          <div
            v-if="emailList.length === 0 && !flags.isApiProcessing"
            class="unibox-no-results-state q-pa-lg text-center"
          >
            <p class="text-grey text-body2">
              No emails match your current filters. Try adjusting or resetting filters.
            </p>
          </div>

          <!-- Email Items Placeholder (will render email list items) -->
          <div
            v-else
            class="email-items-container full-width"
          >
          </div>
        </div>
      </div>

      <!-- Right Section: Email Conversation Preview Pane -->
      <div
        v-if="activeThreadId && !isMobileDevice"
        id="uniboxLeadsRightSection"
        class="unibox-leads-right-section hide-scrollbar"
      >
      </div>

      <!-- Mobile Preview Dialog -->
      <q-dialog
        maximized
        persistent
        v-if="isMobileDevice"
        v-model="modals.showMobilePreview"
        class="app-modal-dialog"
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <!--  -->
      </q-dialog>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, watch, getCurrentInstance,
} from 'vue';

// vue router
import { useRouter, useRoute } from 'vue-router';

// npm
import { logicAnd } from '@vueuse/math';
import { useMagicKeys, whenever } from '@vueuse/core';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// components
import UniboxHeader from 'components/Unibox/Header.vue';
import UniboxEmptyState from 'components/Unibox/EmptyState.vue';

// utils
import { getDateGroupLabel } from 'src/utils/dates';
import {
  fetchUniboxThreadList,
} from 'src/utils/unibox';

// pinia
import { useUniboxStore } from 'src/stores/unibox';

// constants
import { UNIBOX_THREAD_TYPE, DEFAULT_UNIBOX_FILTERS } from 'boot/unibox-constants';

export default defineComponent({
  name: 'UniboxEmailThreadList',

  components: {
    UniboxHeader,
    UniboxEmptyState,
  },

  props: {
    threadType: {
      type: String,
      required: true,
      default: UNIBOX_THREAD_TYPE.INBOX,
    },
  },

  setup(props) {
    const { appContext } = getCurrentInstance();

    // router
    const $route = useRoute();
    const $router = useRouter();

    // store
    const uniboxPinia = useUniboxStore();

    // composables
    const { isNotTyping, isMobileDevice, isNoDialogOpen } = useAppHelpersApi();

    // keyboard shortcuts
    const magicKeys = useMagicKeys({
      passive: false,
      onEventFired(e) {
        if (e.metaKey && (e.ctrlKey || e.shiftKey)) {
          e.preventDefault();
        }
      },
    });

    // state
    const state = reactive({
      emailList: [],
      groupedEmailsByDate: {},

      // filters JSON
      filters: { ...DEFAULT_UNIBOX_FILTERS },

      // pagination
      pagination: {
        page: 1,
        limit: 25,
        offset: 0,
        count: 0,
        hasMore: true,
      },

      // modal visibility states
      modals: {
        showMobilePreview: false,
        showDeleteThread: false,
      },

      // loading & status flags
      flags: {
        isApiProcessing: true,
        isRefreshing: false,
        areResultsFetchedOnce: false,
      },
    });

    // Active thread ID extracted from path parameter
    const activeThreadId = computed(() => $route.params.threadId || null);

    // Cached filter lists from store
    const campaignsList = computed(() => uniboxPinia.getCampaignsList);
    const replyCategoriesList = computed(() => uniboxPinia.getReplyCategoriesList);

    // Dynamic title & empty state config according to threadType
    const threadTypeConfig = computed(() => {
      switch (props.threadType) {
        case UNIBOX_THREAD_TYPE.UNTRACKED_REPLIES:
          return {
            title: 'Untracked Replies',
            emptyState: {
              title: 'No Untracked Replies',
              body: 'Replies that are not linked to tracked sequences will appear here.',
              cta: 'Go to Inbox',
              ctaRoute: '/unibox/inbox',
            },
          };

        case UNIBOX_THREAD_TYPE.IMPORTANT:
          return {
            title: 'Important',
            emptyState: {
              title: 'Nothing Marked as Important',
              body: 'Star messages you care about to see them here.',
              cta: 'Go to Inbox',
              ctaRoute: '/unibox/inbox',
            },
          };

        case UNIBOX_THREAD_TYPE.BOUNCED:
          return {
            title: 'Bounced',
            emptyState: {
              title: 'No Bounced Emails',
              body: 'You are all clear. If any messages bounce, they will show up here.',
              cta: 'Go to Inbox',
              ctaRoute: '/unibox/inbox',
            },
          };

        case UNIBOX_THREAD_TYPE.INBOX:
        default:
          return {
            title: 'Inbox',
            emptyState: {
              title: 'Your Inbox is Clear',
              body: 'No emails to display. Adjust your filters or start reaching out to leads.',
            },
          };
      }
    });

    // Check if any filter is active
    const areFiltersApplied = computed(() => {
      const f = state.filters;
      return !!(
        f.search_text
        || f.domain
        || f.mailbox
        || f.seq_id
        || f.reply_category_id
        || f.channel
      );
    });

    // Check if email list is completely empty with no filters applied
    const isEmailListEmpty = computed(() => {
      if (areFiltersApplied.value) {
        return false;
      }
      if (state.flags.areResultsFetchedOnce) {
        return state.emailList.length === 0 && !state.flags.isApiProcessing;
      }
      return false;
    });

    // Groups fetched email list items by readable date headings
    const groupEmailsByDate = () => {
      const newGrouped = {};

      state.emailList.forEach((thread, index) => {
        const dateKey = getDateGroupLabel(thread.latest_time || thread.date);

        if (!newGrouped[dateKey]) {
          newGrouped[dateKey] = [];
        }

        newGrouped[dateKey].push({
          ...thread,
          emailIndex: index,
        });
      });

      state.groupedEmailsByDate = newGrouped;
    };

    // Main fetch function for Unibox threads
    const fetchThreadList = async () => {
      try {
        state.flags.isApiProcessing = true;

        const { page, limit } = state.pagination;
        const offset = (page - 1) * limit;

        const response = await fetchUniboxThreadList({
          threadType: props.threadType,
          params: {
            offset,
            limit,
            ...state.filters,
          },
        });

        state.emailList = response?.data || [];
        state.pagination.count = response?.count || 0;
        state.pagination.hasMore = !!response?.has_next;
        state.pagination.offset = response?.offset || offset;

        groupEmailsByDate();

        state.flags.areResultsFetchedOnce = true;
        return true;
      } catch (error) {
        appContext.config.globalProperties.$toast?.({
          warning: true,
          message: error.message || 'Failed to fetch emails',
        });
        return false;
      } finally {
        state.flags.isApiProcessing = false;
        state.flags.isRefreshing = false;
      }
    };

    // Pre-loads campaign and reply category options into store cache
    const loadFilterOptions = async () => {
      try {
        await Promise.allSettled([
          uniboxPinia.fetchCampaigns({ force: true }),
          uniboxPinia.fetchReplyCategories({ force: true }),
        ]);
      } catch (error) {
        // non-blocking
      }
    };

    // Apply active filters and reset pagination
    const onApplyFilters = () => {
      state.pagination.page = 1;
      state.pagination.offset = 0;
      fetchThreadList();
    };

    // Filter update handler
    const onUpdateFilters = (updatedFilters) => {
      state.filters = { ...updatedFilters };

      onApplyFilters();
    };

    // Reset filters
    const onResetFilters = () => {
      state.filters = { ...DEFAULT_UNIBOX_FILTERS };
      onApplyFilters();
    };

    // Refresh email list
    const onRefreshEmailList = async () => {
      state.flags.isRefreshing = true;
      state.pagination.page = 1;
      state.pagination.offset = 0;
      await fetchThreadList();
    };

    // Select email item & navigate to thread route
    const onClickEmailListItem = (threadId) => {
      const basePath = $route.path.split('/')[2] || 'inbox';
      $router.push(`/unibox/${basePath}/${threadId}`);

      if (isMobileDevice.value) {
        state.modals.showMobilePreview = true;
      }
    };

    // Close preview pane & return to list route
    const onCloseEmailPreview = () => {
      const basePath = $route.path.split('/')[2] || 'inbox';
      $router.push(`/unibox/${basePath}`);
      state.modals.showMobilePreview = false;
    };

    // Escape shortcut to close preview
    whenever(logicAnd(magicKeys.escape, isNotTyping, isNoDialogOpen), () => {
      if (activeThreadId.value) {
        onCloseEmailPreview();
      }
    });

    // Watch active thread parameter changes
    watch(activeThreadId, (newId) => {
      if (newId && isMobileDevice.value) {
        state.modals.showMobilePreview = true;
      }
    });

    // Watch threadType tab changes (Inbox <-> Untracked <-> Important <-> Bounced)
    watch(() => props.threadType, () => {
      state.pagination.page = 1;
      state.pagination.offset = 0;
      state.emailList = [];
      state.groupedEmailsByDate = {};
      state.flags.areResultsFetchedOnce = false;
      fetchThreadList();
    });

    onMounted(() => {
      fetchThreadList();
      loadFilterOptions();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      activeThreadId,
      campaignsList,
      replyCategoriesList,
      isMobileDevice,
      threadTypeConfig,
      isEmailListEmpty,
      areFiltersApplied,

      // methods
      onUpdateFilters,
      onApplyFilters,
      onResetFilters,
      onRefreshEmailList,
      onClickEmailListItem,
      onCloseEmailPreview,
      fetchThreadList,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-page-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  min-height: inherit;

  .unibox-leads-wrapper {
    display: flex;
    flex: 1;

    @media (max-width: $breakpoint-xs-max) {
      display: contents;
    }

    // Left Section: Header, Email list & Pagination
    .unibox-leads-left-section {
      width: 100%;
      position: relative;
      overflow-y: auto;

      flex: 1;
      display: flex;
      flex-direction: column;

      @include custom-scrollbar;

      // When an email thread is active, shrink left section to compact width
      &.right--active {
        max-width: 360px;
        border-right: 1px solid $grey-50;

        @media (max-width: $breakpoint-xs-max) {
          max-width: 100%;
        }
      }

      .unibox-email-list-wrapper {
        width: 100%;
        flex: 1;
        position: relative;
        overflow-y: auto;
      }
    }

    // Right Section: Conversation Preview
    .unibox-leads-right-section {
      width: 100%;
      overflow-y: scroll;
      position: relative;
      background: rgba($color: var(--grey-50-rgb), $alpha: 0.3);

      display: flex;
      flex: 1;
      flex-direction: column;

      @media (max-width: $breakpoint-xs-max) {
        display: none;
      }
    }
  }
}
</style>
