<template>
  <div class="master-inbox-page-content">
    <!-- Empty State -->
    <div
      v-if="isEmailListEmpty"
      class="master-inbox-empty-state-wrapper"
    >
      <!-- App Header -->
      <AppHeader :title="threadTypeJson.title">
      </AppHeader>

      <!-- Empty State -->
      <SkyBoxIllustration
        :emptyStateJson="threadTypeJson.emptyState"
      />
    </div>

    <!--  -->
    <div
      v-else
      class="master-inbox-leads-wrapper"
    >
      <!-- Left Section -->
      <div
        id="skyboxLeadsLeftSection"
        class="master-inbox-leads-left-section"
        :class="{ 'right--active': !!activeThreadId }"
        :style="{ height: `${pageHeight}px` }"
      >
        <!-- App Header -->
        <AppHeader
          :class="{ 'campaign-inbox-header': sequenceByIdPage }"
          :title="sequenceByIdPage ? 'Campaign Inbox' : threadTypeJson.title"
        >
          <!-- Left Section -->
          <template v-slot:headerLeftSection>
            <!-- Reload -->
            <q-btn
              flat
              no-caps
              unelevated

              class="reload-btn"
              id="skyboxEmailListReloadBtn"
              :class="{ 'is-refreshing': isRefreshingEmailList }"

              @click="onRefreshEmailList"
              :disable="isRefreshingEmailList"
            >
              <LocalSvgIcon
                image="reload"
                classes="reload-icon"
              />
            </q-btn>

          </template>

          <!-- Right Section -->
          <template
            v-if="showAppHeaderThreadList"
            v-slot:headerRightSection
          >
            <EmailThreadListHeader
              :isApiProcessing="isApiProcessing"

              v-model:searchFreeText="searchFreeText"
              v-model:filterDomainsArray="filterDomainsArray"
              v-model:filterMailboxesArray="filterMailboxesArray"

              @update:searchFreeText="onApplyFilters"
              @update:filterDomainsArray="onUpdateFilterDomainsArray"
              @update:filterMailboxesArray="onUpdateFilterMailboxesArray"

              @refreshEmailList="onRefreshEmailList"
            />
          </template>

          <!-- Header Bottom Section -->
          <template
            v-else
            v-slot:headerBottomSection
          >
            <!--  -->
            <EmailThreadListHeader
              mobileView
              :isApiProcessing="isApiProcessing"

              v-model:searchFreeText="searchFreeText"
              v-model:filterDomainsArray="filterDomainsArray"
              v-model:filterMailboxesArray="filterMailboxesArray"

              @update:searchFreeText="onApplyFilters"
              @update:filterDomainsArray="onUpdateFilterDomainsArray"
              @update:filterMailboxesArray="onUpdateFilterMailboxesArray"

              @refreshEmailList="onRefreshEmailList"

              class="q-mt-sm"
            />
          </template>
        </AppHeader>

        <!-- Email List -->
        <div
          ref="emailListWrapperRef"
          class="email-list-wrapper"
        >
          <!-- Empty State -->
          <p
            v-if="emailList.length === 0 && !isApiProcessing"
            class="master-inbox-empty-state-text"
          >
            No emails to show here. Try adjusting your filters
            or start managing your emails by creating domains and mailboxes - all in one place.
          </p>

          <div
            v-else
            class="full-width"
          >
            <div
              v-for="(groupedEmails, date) in groupedEmailsByDate"
              :key="`master-inbox-emails-by-date-${date}`"
              class="full-width"
            >
              <p class="master-inbox-email-list-date-text">
                {{ date }}
              </p>

              <!--  -->
              <SkyBoxEmailListItem
                v-for="(email, index) in groupedEmails"
                :id="`master-inbox--lead-${email.emailIndex}`"
                :key="`master-inbox-email-list-item-${email.id}-${index}`"

                :emailJson="emailList[email.emailIndex]"
                :activeThreadId="activeThreadId"
                :threadTypeJson="threadTypeJson"

                @click="onClickEmailListItem(email.emailIndex)"
                @toggleEmailImportance="toggleEmailImportance({
                  emailJson: emailList[email.emailIndex],
                  index: email.emailIndex,
                })"
              />
            </div>

          </div>
        </div>

        <!-- Paginated Footer -->
        <SkyBoxPaginatedFooter
          v-if="!isEmailListEmpty"

          v-model:pagination="pagination"

          @update:pagination="onUpdatePagination"
        />
      </div>

      <!-- Right Section -->
      <div
        v-if="activeThreadId"
        id="skyboxLeadsRightSection"
        class="master-inbox-leads-right-section hide-scrollbar"
        :style="{ height: `${pageHeight}px` }"
      >
        <!-- Preview Email -->
        <SkyBoxEmailPreview
          :canMoveLeft="canMoveUp"
          :canMoveRight="canMoveDown"
          :threadTypeJson="threadTypeJson"
          :activeEmailJson="activeEmailJson"

          @updateActiveEmailJson="onUpdateActiveEmailJson"
          @onDeleteActiveEmailJson="onDeleteActiveEmailJson"

          @toggleEmailImportance="toggleEmailImportance({
            emailJson: activeEmailJson,
            index: selectedEmailListIdx,
          })"

          @onClickClose="onClickEmailListItem(null, false)"
          @onClickLeftArrow="onClickEmailListItem(selectedEmailListIdx - 1, true)"
          @onClickRightArrow="onClickEmailListItem(selectedEmailListIdx + 1, true)"
        />

        <!-- Dialog -->
        <q-dialog
          maximized
          persistent
          v-model="showSkyboxEmailPreviewModal"
          class="app-modal-dialog"

          :transition-show="isMobileDevice ? 'slide-up' : ''"
          :transition-hide="isMobileDevice ? 'slide-down' : ''"
        >
          <!-- Preview Email -->
          <SkyBoxEmailPreview
            :canMoveLeft="canMoveUp"
            :canMoveRight="canMoveDown"
            :threadTypeJson="threadTypeJson"
            :activeEmailJson="activeEmailJson"

            @onClickClose="onClickEmailListItem(null, false)"
            @onClickLeftArrow="onClickEmailListItem(selectedEmailListIdx - 1, true)"
            @onClickRightArrow="onClickEmailListItem(selectedEmailListIdx + 1, true)"

            @toggleEmailImportance="toggleEmailImportance({
              emailJson: activeEmailJson,
              index: selectedEmailListIdx,
            })"

            @updateActiveEmailJson="onUpdateActiveEmailJson"
            @onDeleteActiveEmailJson="onDeleteActiveEmailJson"
          />
        </q-dialog>
      </div>
    </div>

  </div>
</template>

<script>
// lodash
import size from 'lodash/size';
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, onMounted, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// vue router
import { useRouter, useRoute } from 'vue-router';

// components
import AppHeader from 'components/Headers/AppHeader.vue';

import SkyBoxIllustration from 'components/Illustrations/SkyBox.vue';
import SkyBoxEmailListItem from 'components/MasterInbox/EmailListItem.vue';
import SkyBoxEmailPreview from 'components/MasterInbox/EmailPreview/Index.vue';
import SkyBoxPaginatedFooter from 'components/MasterInbox/PaginatedFooter.vue';
import EmailThreadListHeader from 'components/MasterInbox/EmailThreadListHeader.vue';

// utils
import { getDateGroupLabel } from 'src/utils/dates';
import { postApiCall } from 'src/utils/apiRequests';
import { fetchEmailList } from 'src/utils/skyboxApi';
import { scrollToTheTopByElementId } from 'src/utils/htmlScrollApi.js';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// store pinia
import { useAuthStore } from 'src/stores/auth.js';
import { useSkyboxStore } from 'src/stores/skybox.js';

// npm
import { logicAnd } from '@vueuse/math';
import { useMagicKeys, whenever } from '@vueuse/core';

// constants
import { EMAIL_THREAD_TYPE } from 'boot/constants';

export default defineComponent({
  name: 'EmailThreadList',

  components: {
    AppHeader,
    SkyBoxIllustration,
    SkyBoxEmailPreview,
    SkyBoxEmailListItem,
    SkyBoxPaginatedFooter,
    EmailThreadListHeader,
  },

  props: {
    threadType: {
      type: String,
      default: '',
    },
    sequenceByIdPage: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // app context
    const { appContext } = getCurrentInstance();

    // Access the user store
    const authStorePinia = useAuthStore();

    // router
    const $route = useRoute();
    const $router = useRouter();

    // store
    const skyboxPinia = useSkyboxStore();

    // composables
    const { isNotTyping, isMobileDevice, isNoDialogOpen } = useAppHelpersApi();

    // computed
    const isCreditCardSubscribed = computed(() => authStorePinia.isCreditCardSubscribed);

    // magic keys for shortcuts
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

      selectedEmailListIdx: null,

      // pagination
      pagination: {
        page: 1,
        rowsPerPage: 25,
        hasMore: true,
      },

      isApiProcessing: true,
      areResultsFetchedOnce: false,
      isRefreshingEmailList: false,

      pageHeight: '100%',

      // filters
      searchFreeText: '',
      filterDomainsArray: [],
      filterMailboxesArray: [],

      // modal
      showSkyboxEmailPreviewModal: false,

      // ref
      emailListWrapperRef: null,
    });

    // computed
    const activeEmailJson = computed(() => state.emailList[state.selectedEmailListIdx] || {});
    const activeThreadId = computed(() => activeEmailJson.value?.thread_id);

    const selectedFolderJson = computed(() => skyboxPinia.getSelectedFolderJson || {});

    const showAppHeaderThreadList = computed(() => {
      if (activeThreadId.value || isMobileDevice.value) {
        return false;
      }

      return true;
    });

    const areFiltersApplied = computed(() => {
      if (state.searchFreeText
        || size(state.filterDomainsArray) || size(state.filterMailboxesArray)
      ) {
        return true;
      }

      return false;
    });

    const isEmailListEmpty = computed(() => {
      if (areFiltersApplied.value) {
        return false;
      }

      if (state.areResultsFetchedOnce) {
        // if results are fetched once and the page number is 1, then show empty state
        return isEmpty(state.emailList) && state.pagination.page === 1 && !state.isApiProcessing;
      }

      return false;
    });

    const threadTypeJson = computed(() => {
      if (props.threadType === EMAIL_THREAD_TYPE.INBOX) {
        return {
          title: 'Inbox',
          showImportant: true,
          showReplyForwardAction: true,
          apiEndPoint: 'skybox/inbox',
          apiResponseString: 'inbox_thread_list',
          emptyState: {
            title: 'Your Inbox Awaits',
            body: 'No emails to show here. Try adjusting your filters or start managing your emails by creating domains and mailboxes - all in one place.',
          },
        };
      }

      if (props.threadType === EMAIL_THREAD_TYPE.SENT) {
        return {
          isSent: true,
          title: 'Sent',
          apiEndPoint: 'skybox/sent',
          apiResponseString: 'sent_thread_list',
          emptyState: {
            title: 'No Sent Emails Yet',
            body: 'No sent emails match your filters. Start sending messages to see them here.',
          },
        };
      }

      if (props.threadType === EMAIL_THREAD_TYPE.BOUNCED) {
        return {
          title: 'Bounced',
          isBounced: true,
          apiEndPoint: 'skybox/bounce',
          apiResponseString: 'bounce_thread_list',
          emptyState: {
            title: 'No Bounces to Show',
            body: 'You’re all clear - no bounced emails found. If any get rejected, they\'ll show up here.',
            cta: 'View Sent Emails',
            ctaRoute: '/unibox/sent',
          },
        };
      }

      if (props.threadType === EMAIL_THREAD_TYPE.SPAM) {
        return {
          title: 'Spam',
          isSpam: true,
          apiEndPoint: 'skybox/spam',
          apiResponseString: 'spam_thread_list',
          emptyState: {
            title: 'No Spam Emails Detected',
            body: 'Awesome - none of your emails landed in spam. If they do, you’ll see them here.',
            cta: 'View Sent Emails',
            ctaRoute: '/unibox/sent',
          },
        };
      }

      if (props.threadType === EMAIL_THREAD_TYPE.IMPORTANT) {
        return {
          title: 'Important',
          showImportant: true,
          showReplyForwardAction: true,
          apiEndPoint: 'skybox/important',
          apiResponseString: 'important_thread_list',
          emptyState: {
            title: 'Nothing Marked as Important',
            body: 'No important emails found. Star messages you care about to see them here.',
            cta: 'Go to Inbox',
            ctaRoute: '/unibox/inbox',
          },
        };
      }

      // Default: Important
      return {
        title: selectedFolderJson.value.name || 'Folder Inbox',
        showImportant: true,
        showReplyForwardAction: true,
        apiEndPoint: `skybox/mail-folders/${selectedFolderJson.value.id}/inbox`,
        apiResponseString: 'inbox_thread_list',
        emptyState: {
          title: 'No Emails in This Folder Yet',
          body: 'Emails will appear here once incoming messages match this folder\'s rules. You can check your main inbox in the meantime.',
          cta: 'Go to Inbox',
          ctaRoute: '/unibox/inbox',
        },
      };
    });

    const canMoveUp = computed(() => {
      if (isEmpty(state.emailList)) {
        return false;
      }

      return state.selectedEmailListIdx > 0;
    });

    const canMoveDown = computed(() => {
      if (isEmpty(state.emailList)) {
        return false;
      }

      return state.selectedEmailListIdx < state.emailList.length - 1;
    });

    const updatePageMaxHeight = () => {
      const mainPageContentElement = document.getElementById('appMainPageContent');

      if (mainPageContentElement) {
        // print style
        const { maxHeight } = mainPageContentElement.style;

        state.pageHeight = maxHeight.replace('px', '');

        if (props.sequenceByIdPage) {
          // reduce height of the ID #sequenceByIdHeader
          const sequenceByIdHeaderElement = document.getElementById('sequenceByIdHeader');
          if (sequenceByIdHeaderElement) {
            const sequenceByIdHeaderHeight = sequenceByIdHeaderElement.offsetHeight;
            state.pageHeight -= sequenceByIdHeaderHeight;
          }
        }
      }
    };

    const resetEmailListState = () => {
      state.selectedEmailListIdx = null;
      state.groupedEmailsByDate = {};
      state.emailList = [];

      state.pagination = {
        page: 1,
        rowsPerPage: 25,
        hasMore: true,
      };

      state.isApiProcessing = true;
      state.areResultsFetchedOnce = false;

      state.searchFreeText = '';
      state.filterDomainsArray = [];
      state.filterMailboxesArray = [];

      updatePageMaxHeight();
    };

    const groupedData = () => {
      const newGroupedEmailsByDate = {};

      state.emailList.forEach((thread, index) => {
        const date = getDateGroupLabel(thread.latest_time);

        if (!newGroupedEmailsByDate[date]) {
          newGroupedEmailsByDate[date] = [];
        }

        newGroupedEmailsByDate[date].push({
          ...thread,
          emailIndex: index,
        });
      });

      state.groupedEmailsByDate = {
        ...newGroupedEmailsByDate,
      };

      // scroll to the top of the email list
      if (state.emailListWrapperRef && state.emailListWrapperRef.scrollTop !== 0) {
        state.emailListWrapperRef.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    };

    const fetchInboxEmailList = async (threadId) => {
      try {
        state.isApiProcessing = true;

        const { page, rowsPerPage: perPage } = state.pagination;

        const apiParams = {
          offset: (page - 1) * perPage,
          limit: perPage,
        };

        if (threadId) {
          apiParams.thread_id = threadId;
        }

        if (areFiltersApplied.value) {
          // search free text
          if (state.searchFreeText) {
            apiParams.search_text = state.searchFreeText;
          }

          // filter domain
          if (size(state.filterDomainsArray)) {
            apiParams.domain_ids = state.filterDomainsArray;
          }

          // filter by from email
          if (size(state.filterMailboxesArray)) {
            const mailboxEmails = state.filterMailboxesArray.map((data) => data.email);
            apiParams.mailbox_emails = mailboxEmails;
          }
        }

        // fetch email list
        const response = await fetchEmailList({
          apiEndPoint: threadTypeJson.value.apiEndPoint,
          apiParams,
        });

        //
        state.emailList = response[threadTypeJson.value.apiResponseString] || [];

        state.pagination.hasMore = response.has_more;

        groupedData();

        if (threadId && state.emailList.length > 0) {
          state.selectedEmailListIdx = 0;
        } else {
          // reset the selected email list index
          state.selectedEmailListIdx = null;
        }

        state.isApiProcessing = false;
        state.areResultsFetchedOnce = true;

        updatePageMaxHeight();

        scrollToTheTopByElementId('skyboxLeadsLeftSection');

        return true;
      } catch (error) {
        state.isApiProcessing = false;

        return false;
      }
    };

    const onApplyFilters = () => {
      state.selectedEmailListIdx = null;

      state.pagination = {
        page: 1,
        rowsPerPage: 25,
        hasMore: true,
      };

      fetchInboxEmailList();
    };

    const onUpdateFilterDomainsArray = () => {
      if (size(state.filterMailboxesArray)) {
        state.filterMailboxesArray = [];
      }

      onApplyFilters();
    };

    const onUpdateFilterMailboxesArray = () => {
      if (size(state.filterDomainsArray)) {
        state.filterDomainsArray = [];
      }

      onApplyFilters();
    };

    const onUpdatePagination = () => {
      state.selectedEmailListIdx = null;

      fetchInboxEmailList();
    };

    const onRefreshEmailList = async () => {
      $router.replace({
        query: {},
      });

      state.isRefreshingEmailList = true;

      // reset the email list state
      resetEmailListState();

      // fetch the email list
      await fetchInboxEmailList();

      state.isRefreshingEmailList = false;
    };

    const onClickEmailListItem = async (idx, shouldScrollToElement) => {
      if (shouldScrollToElement) {
        const element = document.getElementById(`master-inbox--lead-${idx}`);

        /** adding settimeout is important for it to work */
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 250);
      }

      state.selectedEmailListIdx = idx;

      if (isMobileDevice.value) {
        state.showSkyboxEmailPreviewModal = true;
      } else {
        // $router.replace({
        //   query: {
        //     threadId: activeThreadId.value,
        //   },
        // });
      }
    };

    const onUpdateActiveEmailJson = (updatedEmailJson) => {
      state.emailList[state.selectedEmailListIdx] = updatedEmailJson;
    };

    const onDeleteActiveEmailJson = () => {
      const activeIndex = Number(state.selectedEmailListIdx);
      const deletedEmailJson = state.emailList[activeIndex];

      // delete it from grouped emails by date
      const groupedDate = getDateGroupLabel(deletedEmailJson.latest_time);

      // clear selection first
      state.selectedEmailListIdx = null;

      let groupedEmails = state.groupedEmailsByDate[groupedDate] || [];

      if (groupedEmails) {
        groupedEmails = groupedEmails.filter(
          (email) => email.emailIndex !== activeIndex,
        );

        state.groupedEmailsByDate[groupedDate] = groupedEmails.filter(
          (email) => email.emailIndex !== activeIndex,
        );
      }

      /* ----------------------------------
        * 2. Remove from main list (SYNC)
        * ----------------------------------
      * */
      state.emailList.splice(activeIndex, 1);

      /* ----------------------------------
        * 3. Recalculate emailIndex
        * ----------------------------------
      * */
      state.emailList.forEach((email, idx) => {
        email.emailIndex = idx;
      });

      /* ----------------------------------
        * 4. Fix grouped indexes
        * ---------------------------------- */
      Object.keys(state.groupedEmailsByDate).forEach((date) => {
        state.groupedEmailsByDate[date] = state.groupedEmailsByDate[date].map((email) => ({
          ...email,
          emailIndex: email.emailIndex > activeIndex
            ? email.emailIndex - 1
            : email.emailIndex,
        }));
      });

      // empty the route query thread ID
      if ($route.query.threadId) {
        $router.replace({
          query: {},
        });

        fetchInboxEmailList();
      }

      // has more and if email list is empty
      if (state.pagination.hasMore && state.emailList.length === 0) {
        fetchInboxEmailList();
      }
    };

    const toggleEmailImportance = async ({ emailJson, index }) => {
      const isImportant = !emailJson.is_important;

      try {
        state.emailList[index].is_important = isImportant;

        await postApiCall({
          endpoint: 'skybox/update-is-important-flag',
          payload: {
            thread_id: emailJson.thread_id,
            is_important: isImportant,
          },
        });
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });

        // come back to the previous state
        state.emailList[index].is_important = !isImportant;
      }
    };

    onMounted(() => {
      updatePageMaxHeight();

      fetchInboxEmailList($route.query.threadId);
    });

    // Shortcuts
    /** up arrow */
    whenever(logicAnd(magicKeys.left, isNotTyping, isNoDialogOpen), () => {
      if (isEmpty(state.emailList)) {
        // return if no leads
        return;
      }

      /** Move one lead up */
      if (state.selectedEmailListIdx === null) {
        onClickEmailListItem(0, true);
      } else {
        const updatedIndex = state.selectedEmailListIdx - 1;

        if (updatedIndex >= 0) {
          onClickEmailListItem(updatedIndex, true);
        }
      }
    });

    /** down arrow */
    whenever(logicAnd(magicKeys.right, isNotTyping, isNoDialogOpen), () => {
      if (isEmpty(state.emailList)) {
        // return if no leads
        return;
      }

      /** Move one lead up */
      if (state.selectedEmailListIdx === null) {
        onClickEmailListItem(0, true);
      } else {
        const updatedIndex = state.selectedEmailListIdx + 1;

        if (updatedIndex <= state.emailList.length - 1) {
          onClickEmailListItem(updatedIndex, true);
        }
      }
    });

    /** Escape key */
    whenever(logicAnd(magicKeys.escape, isNotTyping, isNoDialogOpen), () => {
      if (state.selectedEmailListIdx !== null) {
        // Deselect the currently selected email
        state.selectedEmailListIdx = null;
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      canMoveUp,
      canMoveDown,
      activeThreadId,
      activeEmailJson,
      isMobileDevice,
      threadTypeJson,
      isEmailListEmpty,
      isCreditCardSubscribed,
      showAppHeaderThreadList,

      // methods
      onApplyFilters,
      onRefreshEmailList,
      onUpdatePagination,
      onClickEmailListItem,
      onUpdateActiveEmailJson,
      onDeleteActiveEmailJson,
      toggleEmailImportance,
      onUpdateFilterDomainsArray,
      onUpdateFilterMailboxesArray,
    };
  },
});
</script>

<style lang="scss" scoped>
.master-inbox-page-content {
  width: 100%;
  position: relative;
  min-height: inherit;

  display: grid;
  grid-template-rows: max-content;

  :deep(.app-header) {
    padding: 16px;
    border-radius: 0px;
  }

  .master-inbox-leads-wrapper {
    display: flex;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      display: contents;
    }

    .master-inbox-leads-left-section {
      width: 100%;
      position: relative;
      overflow-y: auto;

      display: flex;
      flex-direction: column;

      // include custom scrollbar
      @include custom-scrollbar;

      :deep(.campaign-inbox-header) {
        .app-header-menu-icon {
          display: none;
        }
      }

      .reload-btn {
        padding: 4px;

        min-width: unset;
        min-height: unset;
        margin-left: 10px;

        :deep(.reload-icon) {
          width: 100%;
          height: 100%;
        }

        &.is-refreshing {
          :deep(.reload-icon) {
            animation: spin 1s linear infinite;
          }
        }
      }

      &.right--active {
        max-width: 360px;
        border-right: 1px solid $grey-50;

        @media (max-width: $breakpoint-xs-max) {
          max-width: 100%;
        }

      :deep(.master-inbox-email-list-item) {
        .master-inbox-name-text {
          max-width: 250px;

          text-transform: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
      }

      :deep(.master-inbox-subject-text) {
        max-width: 225px;
      }
    }

      .master-inbox-email-list-item {
        border-top: 1px solid $grey-50;

        &:first-child {
          border-top: none;
        }
      }

      .email-list-wrapper {
        width: 100%;
        flex: 1;

        position: relative;
        overflow-y: auto;

        .master-inbox-email-list-date-text {
          width: 100%;
          color: $grey;
          font-size: 12px;
          font-weight: 600;
          line-height: 16px;
          text-transform: uppercase;

          padding: 8px 16px;

          position: sticky;
          top: 0;
          z-index: 2;
          backdrop-filter: blur(100px);
          background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.4);
        }

        .master-inbox-empty-state-text {
          padding: 16px;
          text-align: center;
          font-size: 14px;
          color: $grey;
        }
      }
    }

    .master-inbox-leads-right-section {
      width: 100%;
      overflow-y: scroll;
      position: relative;
      background: rgba($color: var(--grey-50-rgb), $alpha: 0.3);

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        display: none;
      }
    }
  }
}
</style>
