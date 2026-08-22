<template>
  <div class="campaigns-table-container">
    <!-- Column Visibility -->
    <q-dialog
      v-model="showColumnsVisibilityModal"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ColumnsVisibility
        sourceType="sequences"
        :baseColumns="baseColumns"
        :dynamicColumns="dynamicColumns"
        v-model:visibleColumns="visibleColumns"

        @update:visible-columns="onUpdateVisibleColumns"
      />
    </q-dialog>

    <!-- Dialog -->
    <q-dialog
      v-model="showArchiveCampaignModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ArchiveCampaign
        :selectedCampaignJson="selectedCampaignJson"

        @onSuccess="onSuccessfulArchiveCampaign"
      />
    </q-dialog>

    <!-- Dialog -->
    <q-dialog
      v-model="showSaveCampaignDetailsModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveCampaignDetails
        :campaignJson="selectedCampaignJson"
      />
    </q-dialog>

    <!-- Header -->
    <AppHeader
      title="Campaigns"
      v-if="fromAllCampaignsPage"
    >
      <template v-slot:headerRightSection>
        <div
          v-if="showCampaignFilters"
          class="all-sequence-header-right-section"
        >
          <CampaignFilters
            :canFilter="!showAllCampaignsIllustration"
            v-model:searchCampaignInput="filters.searchText"

            @createNewCampaign="onCreateNewSequence"
            @update:searchCampaignInput="onSearchData"
          />
        </div>
      </template>
    </AppHeader>

    <!-- Loader -->
    <ApiLoader
      :show="true"

      v-if="showApiLoader"
    />

    <div
      v-else
      class="campaigns-table-content-container"
    >
      <!-- Show loader when the API is processing -->
      <ApiLoader
        :show="isApiProcessing"

        v-if="!showAllCampaignsIllustration"
      />

      <div
        class="full-width"
        v-if="showAllCampaignsIllustration"
      >
        <!-- All Sequence Illustration -->
        <AllSequencesIllustration
          v-if="fromAllCampaignsPage"

          @createNewCampaign="onCreateNewSequence"
        />

        <!-- Mailbox Sequence Illustration -->
        <MailboxSequenceIllustration
          v-else
        />
      </div>

      <!-- Filter Header -->
      <div v-else
        class="filter-campaigns-header"
      >
        <!-- search input -->
        <AppSearchInput
          :debounce="500"
          v-model="filters.searchText"

          moreClasses="dead-small"

          class="campaign-filter-input"
          placeholder="Search campaign"

          @update:model-value="onSearchData"
        />

        <!-- Filter Status Dropdown -->
        <SelectCampaignStatus
          :clearable="true"

          v-model="filters.status"
          placeholder="Filter by Status"
          class="dead-small sequence-filters-dd"

          @update:model-value="onFetchAllData"
        />

        <!-- Clear Filter -->
        <ResetFiltersButton
          v-if="isFilterApplied"
          @click="clearAllFilters"
        />

        <q-space />

        <ColumnsVisibilityButton
          @click="showColumnsVisibilityModal = true"
        />
      </div>

      <!-- Table -->
      <q-table
        v-if="!showAllCampaignsIllustration"
        v-model:pagination="pagination"

        separator="cell"
        class="app-table app-table-rows-fixed
        all-campaigns-table app-paginated-table no-border-left"

        :rows="tableData"
        :columns="tableColumns"
        :loading="isApiProcessing"

        @request="onRequest"
      >
        <!-- bottom -->
        <template v-slot:bottom="scope">
          <div class="table-bottom-block">
            <!-- Records per page -->
            <div class="flex no-wrap items-center">
              <p class="records-per-page-label">
                Show
              </p>

              <!-- Select Dropdown -->
              <q-select
                dense
                outlined
                options-dense
                hide-bottom-space

                behavior="menu"
                dropdown-icon="keyboard_arrow_down"

                :options="[5, 10, 20, 30, 50]"
                v-model="pagination.rowsPerPage"

                @update:model-value="onFetchAllData"

                class="records-per-page-select"
              >
              </q-select>

              <p class="records-per-page-label">
                per page
              </p>
            </div>

            <q-space />

            <div class="flex no-wrap items-center">
              <!-- left arrow button -->
              <q-btn
                flat
                no-caps
                unelevated

                color="primary"
                class="pagination-btn"

                :disable="scope.isFirstPage"
                :class="{ 'btn-disabled': scope.isFirstPage }"

                @click="scope.prevPage"
              >
                <!-- Left Arrow -->
                <div class="pagination-btn-content">
                  <LocalSvgIcon
                    image="plain-down-arrow"
                    classes="pagination-icon left-arrow"
                  />
                </div>
              </q-btn>

              <p class="table-pagination-label">
                {{ tablePaginationLabel }}
              </p>

              <!-- right arrow button -->
              <q-btn
                flat
                no-caps
                unelevated

                color="primary"
                class="pagination-btn"

                :disable="scope.isLastPage"
                :class="{ 'btn-disabled': scope.isLastPage }"

                @click="scope.nextPage"
              >
                <!-- Right Arrow -->
                <div class="pagination-btn-content">
                  <LocalSvgIcon
                    image="plain-down-arrow"
                    classes="pagination-icon right-arrow"
                  />
                </div>
              </q-btn>
            </div>
          </div>
        </template>

        <!-- Content -->
        <!-- Name & Details -->
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <router-link
              :to="getRouterLinkForCampaign(props.row)"
              class="campaigns-route-link"
            >
              <CampaignDetails
                :tableRowJson="props.row"

                @onUpdateCampaign="onUpdateCampaign"
                @archiveCampaign="onArchiveCampaign(props.row)"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <!--  -->
            <router-link
              :to="getRouterLinkForCampaign(props.row)"
              class="campaigns-route-link"
            >
              <CampaignStatus
                :tableRowJson="props.row"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Contacts -->
        <template v-slot:body-cell-contacts="props">
          <q-td :props="props">
            <router-link
              :to="getRouterLinkForCampaign(props.row)"
              class="campaigns-route-link"
            >
              <CampaignStats
                :statsJson="getContactsStats(props.row)"

                showDraftedMessage
                :campaignStatus="props.row.status"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Replies -->
        <template v-slot:body-cell-replies="props">
          <q-td :props="props">
            <router-link
              :to="getRouterLinkForCampaign(props.row)"
              class="campaigns-route-link"
            >
              <CampaignStats
                :statsJson="getRepliesStats(props.row)"

                :campaignStatus="props.row.status"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Positive Replies -->
        <template v-slot:body-cell-positiveReplies="props">
          <q-td :props="props">
            <router-link
              :to="getRouterLinkForCampaign(props.row)"
              class="campaigns-route-link"
            >
              <CampaignStats
                :statsJson="getPositiveRepliesStats(props.row)"

                :campaignStatus="props.row.status"
              />
            </router-link>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, reactive, toRefs, computed,
  onMounted, getCurrentInstance,
} from 'vue';

// Components
import AppHeader from 'components/Headers/AppHeader.vue';
import ApiLoader from 'components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import ColumnsVisibility from 'components/Modals/ColumnsVisibility.vue';
import AllSequencesIllustration from 'components/Illustrations/AllSequences.vue';
import MailboxSequenceIllustration from 'components/Illustrations/MailboxSequence.vue';

import ArchiveCampaign from 'components/Campaigns/Modals/ArchiveCampaign.vue';
import SaveCampaignDetails from 'components/Campaigns/Modals/SaveCampaignDetails.vue';

import CampaignStats from 'components/Campaigns/CampaignStats.vue';
import CampaignFilters from 'components/Campaigns/CampaignFilters.vue';
import CampaignDetails from 'components/Campaigns/CampaignDetails.vue';
import CampaignStatus from 'components/Campaigns/CampaignStatus.vue';

import SelectCampaignStatus from 'components/Dropdown/SelectCampaignStatus.vue';
import ColumnsVisibilityButton from 'components/Buttons/ColumnsVisibility.vue';
import ResetFiltersButton from 'components/Buttons/ResetFilters.vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { getNumeralAmount, findPercentage } from 'src/utils/numbers';

// store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { DEFAULT_TABLE_PAGINATION } from 'boot/constants';
import { CAMPAIGN_STATUS } from 'boot/campaign-constants';

export default defineComponent({
  name: 'CampaignsTable',

  components: {
    AppHeader,
    ApiLoader,
    AppSearchInput,
    ArchiveCampaign,
    SaveCampaignDetails,
    ColumnsVisibility,
    AllSequencesIllustration,
    MailboxSequenceIllustration,

    CampaignStats,
    CampaignDetails,
    CampaignFilters,
    SelectCampaignStatus,
    CampaignStatus,
    ColumnsVisibilityButton,
    ResetFiltersButton,
  },

  props: {
    fromAllCampaignsPage: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // hardcoded
    const campaignFilters = {
      searchText: '',
      status: '',
    };

    // instance
    const { appContext } = getCurrentInstance();

    // store
    const userPreferencesStore = useUserPreferencesStore();

    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      // booleans
      isApiProcessing: false,
      areResultsFetchedOnce: false,

      // modal booleans
      showArchiveCampaignModal: false,
      showColumnsVisibilityModal: false,
      showSaveCampaignDetailsModal: false,

      // data
      visibleColumns: [],
      tableData: [],
      pagination: {},
      selectedCampaignJson: {},

      // filters
      filters: { ...campaignFilters },
    });

    // computed
    const localStoredPagination = computed(() => userPreferencesStore
      .allCampaignsState?.pagination || DEFAULT_TABLE_PAGINATION);

    const headerTitle = computed(() => {
      if (state.pagination.rowsNumber) {
        return `Campaigns (${getNumeralAmount(state.pagination.rowsNumber)})`;
      }

      return 'Campaigns';
    });

    const showApiLoader = computed(() => {
      if (state.areResultsFetchedOnce) {
        return false;
      }

      return state.isApiProcessing;
    });

    const isFilterApplied = computed(() => {
      // take the keys of filters and check if all are values are empty
      const filterKeys = Object.keys(state.filters);
      const areAllFiltersEmpty = filterKeys.every((key) => isEmpty(state.filters[key]));

      return !areAllFiltersEmpty;
    });

    const showAllCampaignsIllustration = computed(() => {
      if (state.isApiProcessing || !state.areResultsFetchedOnce || isFilterApplied.value) {
        return false;
      }

      return state.pagination.rowsNumber === 0;
    });

    const showCampaignFilters = computed(() => {
      if (isFilterApplied.value) {
        return true;
      }

      return state.pagination.rowsNumber !== 0;
    });

    const tablePaginationLabel = computed(() => {
      const { page, perPage, rowsNumber } = state.pagination;

      const start = (page - 1) * perPage + 1;
      const end = page * perPage;

      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    const baseColumns = [
      {
        name: 'name',
        label: 'Name',
        align: 'left',
      },
      {
        name: 'status',
        label: 'Status',
        align: 'left',
      },
    ];

    const dynamicColumns = computed(() => {
      const columns = [
        {
          name: 'contacts',
          label: 'Contacts',
          align: 'left',
        },
        {
          name: 'replies',
          label: 'Replies',
          align: 'left',
        },
        {
          name: 'positiveReplies',
          label: 'Positive Replies',
          align: 'left',
        },
      ];

      return columns;
    });

    const tableColumns = computed(() => {
      const filteredColumns = dynamicColumns.value.filter(
        (col) => state.visibleColumns.includes(col.name),
      );

      return [
        ...baseColumns,
        ...filteredColumns,
        // {
        //   name: 'actions',
        //   label: '',
        //   align: 'left',
        // },
      ];
    });

    // methods
    const updateDataToStore = (inputObject) => {
      if (props.fromAllCampaignsPage) {
        userPreferencesStore.setMultipleFields({
          allCampaignsState: {
            ...userPreferencesStore.allCampaignsState,
            ...inputObject,
          },
        });
      }
    };

    const onArchiveCampaign = (propsRow) => {
      state.selectedCampaignJson = propsRow;

      state.showArchiveCampaignModal = true;
    };

    const onSuccessfulArchiveCampaign = () => {
      state.showArchiveCampaignModal = false;

      // remove the entry from the table
      state.tableData = state.tableData.filter(
        (sequence) => sequence.id !== state.selectedCampaignJson.id,
      );

      state.selectedCampaignJson = null;
      state.pagination.rowsNumber -= 1;

      // update the store
      updateDataToStore({
        tableData: state.tableData,
      });
    };

    const getContactsStats = (row) => {
      const contactStats = row?.contact_stats || {};

      const total = contactStats.total_contacts;
      const active = contactStats.active_count;

      return {
        value: getNumeralAmount(total),
        label: `${getNumeralAmount(active)} Active`,
      };
    };

    const getRepliesStats = (row) => {
      const stats = row?.stats || {};

      // email replies
      const emailReplies = stats.email_replies || 0;

      // linkedin replies
      const liReplies = stats.li_replies || 0;

      // total replies
      const totalReplies = emailReplies + liReplies;

      // email sent
      const emailSent = stats.email_sent || 0;

      // linkedin sent
      const liSent = (stats.li_messages_sent || 0)
        + (stats.li_inmails_sent || 0);
      const totalSent = emailSent + liSent;

      //
      const rate = totalSent > 0 ? findPercentage({
        part: totalReplies,
        whole: totalSent,
      }) : 0;

      return {
        icon: 'seq-replied',
        class: 'information',
        value: `${rate}%`,
        label: `${getNumeralAmount(totalReplies)} Response Rate`,
      };
    };

    const getPositiveRepliesStats = (row) => {
      const stats = row?.stats || {};

      const emailPositive = stats.email_positive_replies || 0;
      const liPositive = stats.li_positive_replies || 0;
      const totalPositive = emailPositive + liPositive;

      const emailReplies = stats.email_replies || 0;
      const liReplies = stats.li_replies || 0;
      const totalReplies = emailReplies + liReplies;

      const rate = totalReplies > 0 ? findPercentage({
        part: totalPositive,
        whole: totalReplies,
      }) : 0;

      return {
        icon: 'positive-reply',
        value: `${rate}%`,
        label: `${getNumeralAmount(totalPositive)} Qualified`,
      };
    };

    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.isApiProcessing = true;

        const params = {
          offset: (page - 1) * perPage,
          limit: perPage,
        };

        // search text
        if (state.filters.searchText) {
          params.search_text = state.filters.searchText;
        }

        // status
        if (state.filters.status) {
          params.status = state.filters.status;
        }

        // API Call
        const response = await getApiCall({
          params,
          endpoint: '/sequences',
          includeWorkspace: true,
        });

        const { data, count } = response;

        state.tableData = data || [];
        state.pagination.rowsNumber = count;

        // store in pinia
        updateDataToStore({
          filters: state.filters,
          pagination: state.pagination,
          tableData: state.tableData,
        });
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occured. Unable to fetch sequences.',
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    const onRequest = async (params) => {
      state.isApiProcessing = true;

      state.pagination.page = params.pagination.page;
      state.pagination.perPage = params.pagination.rowsPerPage;

      await fetchData(
        state.pagination.page,
        state.pagination.perPage,
      );

      if (!state.areResultsFetchedOnce) {
        // make it true
        state.areResultsFetchedOnce = true;
      }
    };

    const onFetchAllData = () => {
      onRequest({
        pagination: state.pagination,
      });
    };

    const clearAllFilters = () => {
      state.filters = { ...campaignFilters };

      onFetchAllData();
    };

    const onSearchData = () => {
      onFetchAllData();
    };

    const onUpdateVisibleColumns = () => {
      updateDataToStore({
        visibleColumns: [...state.visibleColumns],
      });
    };

    const onCreateNewSequence = () => {
      state.selectedCampaignJson = null;

      state.showSaveCampaignDetailsModal = true;
    };

    const getRouterLinkForCampaign = (campaignJson) => {
      if (!campaignJson || !campaignJson.id) {
        return '';
      }

      if (campaignJson.status === CAMPAIGN_STATUS.DRAFTED.value) {
        return `/outreach/campaigns/${campaignJson.id}/edit`;
      }

      return `/outreach/campaigns/${campaignJson.id}`;
    };

    const onUpdateCampaign = (updatedCampaignJson) => {
      // update the table data
      state.tableData = state.tableData.map((campaign) => {
        if (campaign.id === updatedCampaignJson.id) {
          return updatedCampaignJson;
        }

        return campaign;
      });

      // update the store
      updateDataToStore({
        tableData: state.tableData,
      });
    };

    const makeApiCallOnMounted = async () => {
      const {
        filters,
        tableData,
        visibleColumns,
      } = userPreferencesStore.allCampaignsState || {};

      if (props.fromAllCampaignsPage && userPreferencesStore.allCampaignsState) {
        state.tableData = tableData || [];
        state.pagination = localStoredPagination.value;
        state.filters = filters || { ...campaignFilters };
      }

      // set from store
      if (isEmpty(visibleColumns)) {
        const columns = [
          ...baseColumns,
          ...dynamicColumns.value,
        ];
        state.visibleColumns = columns.map((col) => col.name);
      } else {
        state.visibleColumns = [...visibleColumns];

        updateDataToStore({
          visibleColumns: [...visibleColumns],
        });
      }

      state.areResultsFetchedOnce = !isEmpty(state.tableData);

      onRequest({
        pagination: state.pagination,
      });
    };

    onMounted(() => {
      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      tableColumns,
      showApiLoader,

      baseColumns,
      dynamicColumns,
      isMobileDevice,

      tablePaginationLabel,
      headerTitle,
      showAllCampaignsIllustration,
      showCampaignFilters,
      isFilterApplied,

      // methods
      onRequest,
      onArchiveCampaign,
      onSearchData,
      onFetchAllData,
      clearAllFilters,
      onUpdateVisibleColumns,
      onSuccessfulArchiveCampaign,
      onCreateNewSequence,

      getNumeralAmount,
      onUpdateCampaign,

      getContactsStats,
      getRepliesStats,
      getPositiveRepliesStats,
      getRouterLinkForCampaign,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaigns-table-container {
  width: 100%;
  flex: 1;
  display: flex;
  min-height: 0;
  flex-direction: column;

  :deep(.app-header) {
    padding-bottom: 0px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-wrap: wrap;
      padding: 16px;

      .all-sequence-header-right-section {
        order: 1;
        width: 100%;

        margin-top: 12px;
      }
    }
  }

  .campaigns-table-content-container {
    width: 100%;
    position: relative;
    min-height: 0;

    display: flex;
    flex-direction: column;

    .filter-campaigns-header {
      padding: 20px;

      display: flex;
      gap: 8px;
      align-items: center;

      :deep(.domains-icon) {
        @include svg-icon-stroke('path, circle, rect', $grey);
      }

      .campaign-filter-input {
        width: 260px;
      }

      .sequence-filters-dd {
        width: 100%;
        max-width: 180px;
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 12px;
        border-bottom: 1px solid $grey-50;

        overflow-x: auto;
        flex-wrap: nowrap;
        overflow-y: hidden;

        .campaign-filter-input {
          min-width: 200px;
        }
      }
    }

    .all-campaigns-table {
      width: 100%;
      border-top: 0px;
      display: grid;
      min-height: 0;
      background: $white;

      :deep(.q-table__middle) {
        height: 100%;
        overflow-x: auto;
        overflow-y: auto;
      }

      .campaigns-route-link {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        text-decoration: unset;

        color: $black;
        padding: 8px 0px;
      }

      .actions-cell {
        display: flex;
        align-items: center;
        gap: 20px;
      }
    }
  }
}
</style>
