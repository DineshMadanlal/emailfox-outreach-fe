<template>
  <q-card flat class="add-options-card">
    <!-- loader -->
    <ApiLoader
      :show="showApiLoader"
    />

    <!-- Add Sender Mailboxes -->
    <q-dialog
      v-model="modals.showAddSenderLinkedInModal"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <AddSenderLinkedIn
        :campaignId="campaignById.id"

        @onAddAccounts="onAccountsAddedToCampaign"
      />
    </q-dialog>

    <!-- Remove Sender Mailboxes -->
    <q-dialog
      v-model="modals.showRemoveSenderLinkedInModal"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <RemoveSenderLinkedIn
        :campaignId="campaignById.id"

        @onRemoveAccounts="onAccountsRemovedFromCampaign"
      />
    </q-dialog>

    <!-- header -->
    <div class="options-header">
      <div class="header-icon-squared">
        <LocalSvgIcon image="linkedin" class="option-header-icon" />
      </div>

      <p class="option-header-text">
        Sender LinkedIn Accounts
      </p>

      <q-space />

      <div
        class="manage-action-flex"

        v-if="hasConnectedAccounts"
      >
        <!-- Remove -->
        <q-btn
          flat
          dense
          no-caps
          unelevated

          color="grey"

          @click="modals.showRemoveSenderLinkedInModal = true"
        >
          <div class="flex no-wrap items-center">
            <LocalSvgIcon
              image="circle-remove"
            />

            <div class="q-ml-sm">
              Remove
            </div>
          </div>
        </q-btn>

        <!-- Add -->
        <q-btn
          flat
          dense
          no-caps
          unelevated
          color="primary"

          @click="modals.showAddSenderLinkedInModal = true"
        >
          <div class="flex no-wrap items-center">
            <LocalSvgIcon
              image="circle-plus"
              classes="circle-plus-icon"
            />

            <div class="q-ml-sm">
              Add
            </div>
          </div>
        </q-btn>
      </div>
    </div>

    <div
      v-if="hasConnectedAccounts"
      class="full-width"
    >
      <!-- content -->
      <div
        class="connected-accounts-content custom-scrollbar"
      >
        <!--  -->
        <ConnectedLinkedInAccounts
          :accounts="connectedAccounts"
        />

        <!-- Loader -->
        <div
          v-if="isApiLoading"
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

          v-if="!isApiLoading"
        >
        </q-intersection>
      </div>
      <!--  -->
      <div class="total-mailboxes">
        <div class="number-text">
          {{ ui.total }}
        </div>

        <div class="selected-label-text">
          {{ $pluralize('LinkedIn Account', ui.total) }} Connected
        </div>
      </div>
    </div>

    <!-- Empty: Ability for the user to add new sender mailboxes -->
    <div
      v-else
      class="empty-content"
    >
      <!-- Select Mailbox -->
      <q-card
        flat
        class="select-linkedin-card"

        @click="modals.showAddSenderLinkedInModal = true"
      >
        <!-- Icon -->
        <div class="mail-circle-icon-container">
          <LocalSvgIcon image="linkedin" class="linkedin-icon" />
        </div>

        <p class="select-linkedin-label-text">
          Select LinkedIn Account
        </p>

        <p class="select-linkedin-desc-text">
          Select a LinkedIn account to send your campaign messages from.
        </p>
      </q-card>
    </div>
</q-card>
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, reactive, toRefs, onMounted, getCurrentInstance, computed,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import ConnectedLinkedInAccounts from 'components/CampaignWorkflow/ContactsAndAccounts/ConnectedLinkedInAccounts.vue';
import AddSenderLinkedIn from 'components/CampaignWorkflow/ContactsAndAccounts/Modals/AddSenderLinkedIn.vue';
import RemoveSenderLinkedIn from 'components/CampaignWorkflow/ContactsAndAccounts/Modals/RemoveSenderLinkedIn.vue';

// Utils
import { getApiCall } from 'src/utils/apiRequests';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { INFINITE_SCROLL_MAX_LIMIT } from 'boot/constants';

export default defineComponent({
  name: 'ManageLinkedIn',

  components: {
    ApiLoader,
    ConnectedLinkedInAccounts,
    AddSenderLinkedIn,
    RemoveSenderLinkedIn,
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
      isApiLoading: false,

      connectedAccounts: [],

      ui: {
        has_next: true,
        total: 0,
        resultsFetchedOnce: false,
      },

      modals: {
        showAddSenderLinkedInModal: false,
        showRemoveSenderLinkedInModal: false,
      },
    });

    // computed
    const hasConnectedAccounts = computed(() => {
      if (!state.ui.resultsFetchedOnce) {
        return false;
      }

      return state.ui.total > 0;
    });

    const showApiLoader = computed(() => state.isApiLoading && !state.ui.resultsFetchedOnce);

    // methods
    const fetchConnectedAccounts = async () => {
      try {
        state.isApiLoading = true;

        const params = {
          offset: size(state.connectedAccounts),
          limit: INFINITE_SCROLL_MAX_LIMIT,
        };

        // fetch connected accounts
        const response = await getApiCall({
          params,
          includeWorkspace: true,
          endpoint: `sequences/${props.campaignById.id}/linkedin-accounts`,
        });

        const accounts = response.data || [];
        state.ui.has_next = response.has_next;
        state.ui.total = response.count || 0;

        // update results fetched
        state.ui.resultsFetchedOnce = true;

        //
        state.connectedAccounts.push(...accounts);
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const loadMoreOptions = async () => {
      await fetchConnectedAccounts();

      return true;
    };

    const refetchConnectedAccounts = async () => {
      // reset connected accounts
      state.connectedAccounts = [];
      state.ui.has_next = true;
      state.ui.total = 0;
      state.ui.resultsFetchedOnce = false;

      // fetch connected accounts
      await fetchConnectedAccounts();
    };

    const onAccountsAddedToCampaign = () => {
      state.modals.showAddSenderLinkedInModal = false;

      // refetch connected accounts
      refetchConnectedAccounts();
    };

    const onAccountsRemovedFromCampaign = () => {
      state.modals.showRemoveSenderLinkedInModal = false;

      // refetch connected accounts
      refetchConnectedAccounts();
    };

    // lifecycle hooks
    onMounted(() => {
      // fetch connected accounts
      fetchConnectedAccounts();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      showApiLoader,
      hasConnectedAccounts,

      // methods
      loadMoreOptions,
      onAccountsAddedToCampaign,
      onAccountsRemovedFromCampaign,
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
  border-radius: 6px;

  // header
  .options-header {
    display: flex;
    flex-wrap: wrap;
    padding: 16px 20px;
    align-items: center;

    gap: 12px;
    border-bottom: 1px solid $grey-50;

    .manage-action-flex {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

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
      }
    }

    .option-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
    }

    :deep(.circle-plus-icon) {
      @include svg-icon-stroke('path, circle', $primary);
    }
  }

  .connected-accounts-content {
    width: 100%;
    height: auto;
    max-height: 210px;
    overflow-y: auto;
    padding: 0px;

    .api-loader-container {
      width: 300px;
      height: 32px;
      position: relative;
    }
  }

  .total-mailboxes {
    width: 100%;
    padding: 16px 20px;
    background: rgba(var(--primary-rgb), 0.05);

    display: flex;
    align-items: center;
    gap: 6px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }

    .number-text {
      color: $primary;
      font-size: 18px;
      font-weight: 600;
    }

    .selected-label-text {
      color: $black;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .empty-content {
    width: 100%;
    padding: 16px 20px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }

    .select-linkedin-card {
      width: 100%;
      max-width: 310px;
      cursor: pointer;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid $grey-50;
      transition: all 0.2s ease-in-out;

      &:hover {
        border-color: rgba(var(--primary-rgb), 0.2);
        background: rgba(var(--primary-rgb), 0.05);
      }

      .mail-circle-icon-container {
        min-height: 40px;
        min-width: 40px;
        max-height: 40px;
        max-width: 40px;

        border-radius: 50%;
        background: rgba(var(--primary-rgb), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(.linkedin-icon) {
          min-width: 20px;
          min-height: 20px;
        }
      }

      .select-linkedin-label-text {
        margin-top: 12px;
        margin-bottom: 8px;

        color: $primary;
        font-size: 14px;
        font-weight: 600;
        line-height: 16px;
      }

      .select-linkedin-desc-text {
        color: rgba(var(--black-rgb), 0.8);
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
      }
    }
  }

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    // header
    .options-header {
      padding: 16px 12px;
    }
  }
}
</style>
