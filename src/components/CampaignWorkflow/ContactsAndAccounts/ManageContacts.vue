<template>
  <q-card flat class="add-options-card">
    <!-- loader -->
    <ApiLoader
      :show="showApiLoader"
    />

    <!-- Upload Contacts -->
    <q-dialog
      v-model="modals.showUploadContactsModal"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <CampaignUploadContacts
        :campaignId="campaignById.id"

        @onListImported="onListsAddedToCampaign"
        @closeModal="modals.showUploadContactsModal = false"
      />
    </q-dialog>

    <!-- Map Lists -->

    <!-- header -->
    <div class="options-header">
      <div class="header-icon-squared">
        <LocalSvgIcon image="contacts" class="option-header-icon" />
      </div>

      <p class="option-header-text">
        Add Contacts
      </p>
    </div>

    <!-- content -->
    <div
      class="options-content mapped-lists-content custom-scrollbar"

      v-if="hasConnectedLists"
    >
      <!-- Loader -->
      <div
        v-if="loaders.isFetchApi"
        class="api-loader-container"
      >
        <!-- api loader -->
        <ApiLoader
          show
          size="32px"
        />
      </div>

      <!-- Add an intersection to load more activities
      - Kind of infinite scroll implementation -->
      <q-intersection
        :disable="!ui.has_next"
        @visibility="loadMoreOptions"

        v-if="!loaders.isFetchApi"
      >
      </q-intersection>
    </div>

    <!-- Empty Content -->
    <div
      class="options-content empty-content"

      v-else
    >
      <!-- Map List -->
      <div
        class="contact-option-item"
        @click="modals.showMapListModal = true"
      >
        <div class="header-icon-circled">
          <LocalSvgIcon image="folder" class="header--icon" />
        </div>

        <p class="contact-header-text">
          Map List
        </p>

        <p class="contact-label-text">
          Link your existing contact lists to this campaign to start sending outreach.
        </p>
      </div>

      <!-- Upload Contacts -->
      <div
        class="contact-option-item"
        @click="modals.showUploadContactsModal = true"
      >
        <LocalSvgIcon image="upload" />

        <p class="contact-header-text">
          Upload Contacts
        </p>

        <p>
          Import contacts from a CSV file to quickly build your outreach list.
        </p>
      </div>
    </div>
  </q-card>
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, getCurrentInstance,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import CampaignUploadContacts from 'components/CampaignWorkflow/ContactsAndAccounts/Modals/CampaignUploadContacts.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Utils
import { getApiCall } from 'src/utils/apiRequests';

// constants
import { INFINITE_SCROLL_MAX_LIMIT } from 'boot/constants';

export default defineComponent({
  name: 'ManageContacts',

  components: {
    ApiLoader,
    CampaignUploadContacts,
  },

  props: {
    campaignById: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      loaders: {
        isFetchApi: false,
      },
      ui: {
        has_next: true,
        total: 0,
        resultsFetchedOnce: false,
      },
      modals: {
        showMapListModal: false,
        showUploadContactsModal: false,
      },

      connectedLists: [],
    });

    // computed
    const showApiLoader = computed(() => state.loaders.isFetchApi && !state.ui.resultsFetchedOnce);

    const hasConnectedLists = computed(() => {
      if (!state.ui.resultsFetchedOnce) {
        return false;
      }

      return state.ui.total > 0;
    });

    // methods
    const fetchConnectedLists = async () => {
      try {
        state.loaders.isFetchApi = true;

        const params = {
          offset: size(state.connectedLists),
          limit: INFINITE_SCROLL_MAX_LIMIT,
        };

        // fetch connected accounts
        const response = await getApiCall({
          params,
          includeWorkspace: true,
          endpoint: `sequences/${props.campaignById.id}/lists`,
        });

        const lists = response.data || [];
        state.ui.has_next = response.has_next;
        state.ui.total = response.count || 0;

        // update results fetched
        state.ui.resultsFetchedOnce = true;

        //
        state.connectedLists.push(...lists);
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isFetchApi = false;
      }
    };

    const loadMoreOptions = async () => {
      await fetchConnectedLists();

      return true;
    };

    const refetchConnectedLists = async () => {
      // reset connected accounts
      state.connectedLists = [];
      state.ui.has_next = true;
      state.ui.total = 0;
      state.ui.resultsFetchedOnce = false;

      // fetch connected accounts
      await fetchConnectedLists();
    };

    const onListsAddedToCampaign = () => {
      state.modals.showMapListModal = false;
      state.modals.showUploadContactsModal = false;

      // refetch connected accounts
      refetchConnectedLists();
    };

    // lifecycle hook
    onMounted(() => {
      fetchConnectedLists();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      showApiLoader,
      hasConnectedLists,

      // methods
      loadMoreOptions,
      onListsAddedToCampaign,
    };
  },
});
</script>

<style lang="scss" scoped>
.add-options-card {
  width: 100%;
  max-width: 745px;
  border: 1px solid $grey-50;
  position: relative;

  // header
  .options-header {
    display: flex;
    flex-wrap: wrap;
    padding: 16px 20px;
    align-items: center;

    gap: 12px;
    border-bottom: 1px solid $grey-50;

    .header-icon-squared {
      height: 26px;
      min-width: 26px;
      max-width: 26px;

      padding: 5px;
      border-radius: 4px;
      border: 1px solid rgba(var(--primary-rgb), 0.2);
      background: rgba(var(--primary-rgb), 0.1);

      :deep(.option-header-icon) {
        width: 100%;
        height: 100%;

        @include svg-icon-stroke('path, circle, rect, ellipse', $grey);
      }
    }

    .option-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .mapped-lists-content {
    //
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

    height: auto;
    max-height: 210px;

    .api-loader-container {
      width: 300px;
      height: 32px;
      position: relative;
    }
  }

  .empty-content {
    display: flex;
    align-items: center;
    gap: 20px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      gap: 16px;
      flex-direction: column;
    }

    .contact-option-item {
      width: 100%;
      border-radius: 6px;
      border: 1px solid $grey-50;
      background: $white;
      cursor: pointer;
      padding: 12px;
      transition: all 0.2s ease-in-out;

      &:hover {
        border-color: rgba(var(--primary-rgb), 0.2);
        background: rgba(var(--primary-rgb), 0.05);
      }

      .contact-header-text {
        margin-top: 12px;
        margin-bottom: 8px;

        color: $primary;
        font-size: 14px;
        font-weight: 600;
        line-height: 16px;
      }

      .contact-label-text {
        color: rgba(var(--black-rgb), 0.8);
        font-size: 14px;
        line-height: 20px;
      }

      .header-icon-circled {
        min-height: 40px;
        min-width: 40px;
        max-height: 40px;
        max-width: 40px;

        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(var(--primary-rgb), 0.1);

        :deep(.header--icon) {
          width: 20px;
          height: 20px;

          @include svg-icon-stroke('path, circle, rect, ellipse', $primary);
        }
      }
    }
  }

  // content
  .options-content {
    width: 100%;
    padding: 16px 20px;
  }

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    // header
    .options-header {
      padding: 16px 12px;
    }

    // content
    .options-content {
      padding: 16px 12px;
    }
  }
}
</style>
