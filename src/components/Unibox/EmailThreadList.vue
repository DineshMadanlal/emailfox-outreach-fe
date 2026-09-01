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
        :style="{ height: pageHeight ? `${pageHeight}px` : '100%' }"
        @scroll.passive="onScroll"
      >
        <!-- Unibox Header -->
        <UniboxHeader
          :filters="filters"
          :campaigns="campaignsList"
          :totalList="pagination.count"
          :title="threadTypeConfig.title"
          :compactView="isMobileDevice || !!activeThreadId"
          :isRefreshing="flags.isRefreshing"
          :totalCurrentList="emailList.length"
          :isApiProcessing="flags.isApiProcessing"
          :replyCategories="replyCategoriesList"

          @refresh="onRefreshEmailList"
          @reset-filters="onResetFilters"
          @update:filters="onUpdateFilters"
        >
          <!-- Selection Subbar Slot (Below Filters) -->
          <template #headerSelection>
            <div class="header-select-all-group flex items-center">
              <!-- When items are selected: Click unchecks all (no menu) -->
              <q-checkbox
                v-if="isSelectionActive"

                dense
                color="primary"
                class="header-selection-checkbox app-checkbox"

                :model-value="isAllSelected ? true : null"
                @update:model-value="resetTableMultiSelect"
              />

              <!-- When nothing is selected: Click opens TableMultiSelect menu -->
              <q-checkbox
                v-else
                dense
                color="primary"
                label="Select"
                class="header-selection-checkbox app-checkbox"
                :model-value="false"
              >
                <q-menu
                  transition-show="jump-down"
                  transition-hide="jump-up"
                >
                  <TableMultiSelect
                    multiSelectType="unibox"
                    :totalList="pagination.count"
                    :totalCurrentList="emailList.length"
                    :multiSelectOptionJson="multiSelectOptionJson"
                    @updateMultiSelect="onUpdateMultiSelect"
                  />
                </q-menu>
              </q-checkbox>

              <span
                v-if="selectedCount > 0"
                class="select-all-label cursor-pointer"
              >
                {{ getNumeralAmount(selectedCount) }} selected
              </span>
            </div>
          </template>
        </UniboxHeader>

        <!-- Email List Container -->
        <div class="unibox-email-list-wrapper hide-scrollbar">
          <!-- No search results state when filters are applied -->
          <div
            v-if="emailList.length === 0 && !flags.isApiProcessing"
            class="unibox-no-results-state q-pa-lg text-center"
          >
            <p class="text-grey text-body2">
              No emails match your current filters. Try adjusting or resetting filters.
            </p>
          </div>

          <!-- Email Items grouped by date headings -->
          <div
            v-else
            class="email-items-container full-width"
          >
            <div
              v-for="(groupedEmails, dateHeading) in groupedEmailsByDate"
              :key="`unibox-date-group-${dateHeading}`"
              class="unibox-date-group-section full-width"
            >
              <!-- Date Header Heading -->
              <div class="unibox-date-group-header">
                <span class="date-heading-text">
                  {{ dateHeading.toUpperCase() }}
                </span>
              </div>

              <!-- List Items -->
              <UniboxEmailListItem
                v-for="email in groupedEmails"
                :key="`unibox-email-thread-${email.id || email.contact_mapping_id}`"
                :emailJson="email"
                :compactView="isMobileDevice || !!activeThreadId"
                :isActive="email.contact_mapping_id === activeThreadId
                  || String(email.id) === activeThreadId"
                :isSelected="isEmailSelected(email)"

                @click="onClickEmailListItem(email)"
                @toggle-star="onToggleStar(email)"
                @toggle-select="onToggleSelect(email)"
              />
            </div>

            <!-- Infinite Scroll Loading Spinner -->
            <div
              v-if="flags.isLoadingMore"
              class="unibox-loading-more-spinner flex flex-center q-py-md full-width"
            >
              <q-spinner-dots
                color="primary"
                size="28px"
              />
            </div>

            <!-- End of list notice -->
            <div
              v-else-if="!pagination.hasMore && emailList.length > 0 && flags.areResultsFetchedOnce"
              class="unibox-end-of-results-notice"
            >
              All emails loaded ({{ pagination.count }})
            </div>
          </div>
        </div>
      </div>

      <!-- Right Section: Email Conversation Preview Pane -->
      <div
        v-if="activeThreadId && !isMobileDevice"
        id="uniboxLeadsRightSection"
        class="unibox-leads-right-section hide-scrollbar"
        :style="{ height: pageHeight ? `${pageHeight}px` : '100%' }"
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
  defineComponent,
  reactive,
  toRefs,
  computed,
  onMounted,
  onUnmounted,
  watch,
  getCurrentInstance,
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
import UniboxEmailListItem from 'components/Unibox/EmailListItem.vue';
import TableMultiSelect from 'components/Menu/TableMultiSelect.vue';

// utils
import { getDateGroupLabel } from 'src/utils/dates';
import { fetchUniboxThreadList } from 'src/utils/unibox';
import { getNumeralAmount } from 'src/utils/numbers';

// pinia
import { useUniboxStore } from 'src/stores/unibox';

// constants
import { UNIBOX_THREAD_TYPE, DEFAULT_UNIBOX_FILTERS } from 'boot/unibox-constants';
import { TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';

export default defineComponent({
  name: 'UniboxEmailThreadList',

  components: {
    UniboxHeader,
    UniboxEmptyState,
    UniboxEmailListItem,
    TableMultiSelect,
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

      // state
      selectedThreadIds: [],
      multiSelectOptionJson: {},

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
        isLoadingMore: false,
        areResultsFetchedOnce: false,
      },
      pageHeight: '100%',
    });

    // Active thread ID extracted from path parameter
    const activeThreadId = computed(() => $route.params.threadId || null);

    // Unread count from store
    const unreadCount = computed(() => uniboxPinia.getInboxUnreadCount || 0);

    // Check if Select All (total across all pages) is active
    const isSelectAllTotalActive = computed(() => (
      state.multiSelectOptionJson?.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL
    ));

    // Dynamic selection count (displays total pagination count if Select All is active)
    const selectedCount = computed(() => {
      if (isSelectAllTotalActive.value) {
        return state.pagination.count;
      }
      return state.selectedThreadIds.length;
    });

    // Multi-selection state
    const isSelectionActive = computed(() => selectedCount.value > 0);

    const isAllSelected = computed(() => {
      if (isSelectAllTotalActive.value) {
        return true;
      }
      return (
        state.selectedThreadIds.length > 0
        && state.selectedThreadIds.length === state.emailList.length
      );
    });

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

    // Calculate maximum usable content height
    const updatePageMaxHeight = () => {
      const mainPageContent = document.getElementById('appMainPageContent');

      if (mainPageContent) {
        const maxHeight = mainPageContent.style.maxHeight
          || `${mainPageContent.clientHeight}px`;
        state.pageHeight = maxHeight ? maxHeight.replace('px', '') : null;
      }
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
        state.pagination.offset = response?.offset || offset;
        state.pagination.hasMore = !!response?.has_next
          && state.emailList.length < (response?.count || Infinity);

        groupEmailsByDate();

        // Update Inbox unread count badge in store
        if (props.threadType === UNIBOX_THREAD_TYPE.INBOX) {
          uniboxPinia.setField({
            field: 'inboxUnreadCount',
            value: response?.count || 0,
          });
        }

        updatePageMaxHeight();

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

    // Checks if individual email thread item is selected
    const isEmailSelected = (email) => {
      const id = email.id || email.contact_mapping_id;
      if (isSelectAllTotalActive.value) {
        return true;
      }
      return state.selectedThreadIds.includes(id);
    };

    // Toggle single thread selection
    const onToggleSelect = (email) => {
      const id = email.id || email.contact_mapping_id;

      if (isSelectAllTotalActive.value) {
        state.selectedThreadIds = state.emailList
          .map((e) => e.id || e.contact_mapping_id)
          .filter((threadId) => threadId !== id);
        state.multiSelectOptionJson = {};
        return;
      }

      const idx = state.selectedThreadIds.indexOf(id);
      if (idx > -1) {
        state.selectedThreadIds.splice(idx, 1);
        state.multiSelectOptionJson = {};
      } else {
        state.selectedThreadIds.push(id);
        if (state.selectedThreadIds.length === state.emailList.length) {
          state.multiSelectOptionJson = {
            limit: state.emailList.length,
            selectedOption: TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST,
          };
        }
      }
    };

    // Apply bulk selection from TableMultiSelect
    const onUpdateMultiSelect = (selectionData) => {
      state.multiSelectOptionJson = selectionData;

      if (selectionData.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST) {
        state.selectedThreadIds = state.emailList.map(
          (e) => e.id || e.contact_mapping_id,
        );
      } else if (selectionData.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        state.selectedThreadIds = state.emailList.map(
          (e) => e.id || e.contact_mapping_id,
        );
      }
    };

    // Reset all table multi selections
    const resetTableMultiSelect = () => {
      state.selectedThreadIds = [];
      state.multiSelectOptionJson = {};
    };

    // Toggle all currently loaded threads
    const onToggleSelectAllCurrent = () => {
      if (isSelectionActive.value) {
        resetTableMultiSelect();
      } else {
        state.selectedThreadIds = state.emailList.map(
          (e) => e.id || e.contact_mapping_id,
        );
      }
    };

    // Toggle star / important status for thread
    const onToggleStar = (email) => {
      email.is_important = !email.is_important;
    };

    // Select email item & navigate to thread route
    const onClickEmailListItem = (email) => {
      const threadId = email.id || email.contact_mapping_id;
      const basePath = props.threadType.toLowerCase().replace('_', '-');
      $router.push(`/unibox/${basePath}/${threadId}`);

      if (isMobileDevice.value) {
        state.modals.showMobilePreview = true;
      }
    };

    // Close preview pane & return to list route
    const onCloseEmailPreview = () => {
      const basePath = props.threadType.toLowerCase().replace('_', '-');
      $router.push(`/unibox/${basePath}`);
      state.modals.showMobilePreview = false;
    };

    // Load next chunk of emails for infinite scroll
    const loadMoreEmails = async () => {
      if (
        state.flags.isLoadingMore
        || state.flags.isApiProcessing
        || !state.pagination.hasMore
      ) {
        return;
      }

      try {
        state.flags.isLoadingMore = true;

        const nextOffset = state.emailList.length;
        const nextPage = state.pagination.page + 1;

        const response = await fetchUniboxThreadList({
          threadType: props.threadType,
          params: {
            offset: nextOffset,
            limit: state.pagination.limit,
            ...state.filters,
          },
        });

        const newItems = response?.data || [];
        if (newItems.length > 0) {
          state.emailList = [...state.emailList, ...newItems];
          state.pagination.page = nextPage;
          state.pagination.offset = nextOffset;
          state.pagination.count = response?.count || state.pagination.count;
          state.pagination.hasMore = !!response?.has_next
            && state.emailList.length < (response?.count || Infinity);

          groupEmailsByDate();
        } else {
          state.pagination.hasMore = false;
        }
      } catch (error) {
        appContext.config.globalProperties.$toast?.({
          warning: true,
          message: error.message || 'Failed to load more emails',
        });
      } finally {
        state.flags.isLoadingMore = false;
      }
    };

    // Scroll handler for left section container
    const onScroll = (event) => {
      if (
        !state.pagination.hasMore
        || state.flags.isLoadingMore
        || state.flags.isApiProcessing
      ) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 250) {
        loadMoreEmails();
      }
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
      state.selectedThreadIds = [];
      state.groupedEmailsByDate = {};
      state.flags.areResultsFetchedOnce = false;
      fetchThreadList();
    });

    onMounted(() => {
      updatePageMaxHeight();
      window.addEventListener('resize', updatePageMaxHeight);
      fetchThreadList();
    });

    onUnmounted(() => {
      window.removeEventListener('resize', updatePageMaxHeight);
    });

    return {
      // state
      ...toRefs(state),

      // computed
      activeThreadId,
      unreadCount,
      selectedCount,
      isSelectionActive,
      isAllSelected,
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
      onToggleSelect,
      onToggleSelectAllCurrent,
      onUpdateMultiSelect,
      resetTableMultiSelect,
      isEmailSelected,
      getNumeralAmount,
      onToggleStar,
      onClickEmailListItem,
      onCloseEmailPreview,
      loadMoreEmails,
      onScroll,
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

  .header-select-all-group {
    .select-all-label {
      font-size: 14px;
      color: $black;
      user-select: none;
      margin-left: 4px;

      transition: color 0.15s ease;
    }
  }

  .unibox-leads-wrapper {
    display: flex;
    flex: 1;

    @media (max-width: $breakpoint-xs-max) {
      display: contents;
    }

    // Left Section: Header, Email list & Pagination
    .unibox-leads-left-section {
      width: 100%;
      min-width: 0;
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;

      @include custom-scrollbar;

      // When an email thread is active, shrink left section to compact width
      &.right--active {
        max-width: 450px;
        border-right: 1px solid $grey-50;

        @media (max-width: $breakpoint-xs-max) {
          max-width: 100%;
        }

        .unibox-date-group-header {
          padding: 8px 14px 4px 14px;
        }
      }

      .unibox-email-list-wrapper {
        width: 100%;
        min-width: 0;
        flex: 1;
        position: relative;

        .unibox-date-group-section {
          width: 100%;

          .unibox-date-group-header {
            padding: 10px 20px 6px 20px;
            background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.15);

            .date-heading-text {
              color: $grey;
              font-size: 11px;
              font-weight: 600;
              letter-spacing: 0.6px;
              text-transform: uppercase;
            }
          }
        }

        .unibox-end-of-results-notice {
          text-align: center;
          padding: 8px;
          color: $grey;
          font-size: 12px;
        }
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
