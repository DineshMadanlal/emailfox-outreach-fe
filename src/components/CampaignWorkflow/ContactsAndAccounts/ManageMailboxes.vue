<template>
  <q-card flat class="add-options-card">
    <!-- loader -->
    <ApiLoader
      :show="showApiLoader"
    />

    <!-- Add Sender Mailboxes -->
    <q-dialog
      v-model="modals.showAddSenderMailboxesModal"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <AddSenderMailboxes
        :campaignId="campaignById.id"

        @onMailboxesAdded="onMailboxesAddedToCampaign"
      />
    </q-dialog>

    <!-- Remove Sender Mailboxes -->
    <q-dialog
      v-model="modals.showRemoveSenderMailboxesModal"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <RemoveSenderMailboxes
        :campaignId="campaignById.id"

        @onMailboxesRemoved="onMailboxesRemovedFromCampaign"
      />
    </q-dialog>

    <!-- header -->
    <div class="options-header">
      <div class="header-icon-squared">
        <LocalSvgIcon image="mail" class="option-header-icon" />
      </div>

      <p class="option-header-text">
        Sender Mailboxes
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

          @click="modals.showRemoveSenderMailboxesModal = true"
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

          @click="modals.showAddSenderMailboxesModal = true"
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
        <ConnectedMailboxes
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
          {{ $pluralize('Mailbox', ui.total) }} Connected
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
        class="select-mailbox-card"

        @click="modals.showAddSenderMailboxesModal = true"
      >
        <!-- Icon -->
        <div class="mail-circle-icon-container">
          <LocalSvgIcon image="mail" class="mail-icon" />
        </div>

        <p class="select-mailbox-label-text">
          Select Mailbox
        </p>

        <p class="select-mailbox-desc-text">
          Select a mailbox to send your campaign emails from.
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
import ConnectedMailboxes from 'components/CampaignWorkflow/ContactsAndAccounts/ConnectedMailboxes.vue';
import AddSenderMailboxes from 'components/CampaignWorkflow/ContactsAndAccounts/Modals/AddSenderMailboxes.vue';
import RemoveSenderMailboxes from 'components/CampaignWorkflow/ContactsAndAccounts/Modals/RemoveSenderMailboxes.vue';

// Utils
import { getApiCall } from 'src/utils/apiRequests';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { INFINITE_SCROLL_MAX_LIMIT } from 'boot/constants';

export default defineComponent({
  name: 'ManageMailboxes',

  components: {
    ApiLoader,
    ConnectedMailboxes,
    AddSenderMailboxes,
    RemoveSenderMailboxes,
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
        showAddSenderMailboxesModal: false,
        showRemoveSenderMailboxesModal: false,
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
          endpoint: `sequences/${props.campaignById.id}/mailboxes`,
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

    const onMailboxesAddedToCampaign = () => {
      state.modals.showAddSenderMailboxesModal = false;

      // refetch connected accounts
      refetchConnectedAccounts();
    };

    const onMailboxesRemovedFromCampaign = () => {
      state.modals.showRemoveSenderMailboxesModal = false;

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
      onMailboxesAddedToCampaign,
      onMailboxesRemovedFromCampaign,
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

        @include svg-icon-stroke('path, circle, rect, ellipse', $grey);
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

    .select-mailbox-card {
      width: 100%;
      max-width: 310px;
      cursor: pointer;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid $grey-50;

      &:hover {
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

        :deep(.mail-icon) {
          width: 20px;
          height: 20px;

          @include svg-icon-stroke('path, circle, rect, ellipse', $primary);
        }
      }

      .select-mailbox-label-text {
        margin-top: 12px;
        margin-bottom: 8px;

        color: $primary;
        font-size: 14px;
        font-weight: 600;
        line-height: 16px;
      }

      .select-mailbox-desc-text {
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
