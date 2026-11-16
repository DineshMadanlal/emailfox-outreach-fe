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
        :isUpdateName="isUpdateName"
        :campaignJson="selectedCampaignJson"

        @onUpdateCampaign="onUpdateCampaign"
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

        <!-- Contact Sequence Illustration -->
        <div
          v-else-if="contactId"
          class="contact-sequence-illustration"
        >
          <LocalSvgIcon
            image="sequences"
            :isIconFolder="false"
            :isIllustrationFolder="true"
          />

          <p class="illustration-header-text">
            No sequences linked to this contact
          </p>

          <p class="illustration-body-text">
            This contact hasn’t been enrolled in any campaigns yet.
          </p>
        </div>

        <!-- Mailbox Sequence Illustration -->
        <MailboxSequenceIllustration
          v-else
        />
      </div>

      <!-- Filter Header -->
      <div v-else-if="!contactId"
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
        class="app-table all-campaigns-table app-paginated-table no-border-left"

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

                :options="[5, 10, 25, 50, 75, 100]"
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
        <!-- Name -->
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <router-link
              :to="getRouterLinkForCampaign(props.row)"
              class="campaigns-route-link"
            >
              <CampaignDetails
                :tableRowJson="props.row"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
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

        <!-- Leads -->
        <template v-slot:body-cell-leads="props">
          <q-td :props="props">
            <router-link
              :to="getRouterLinkForCampaign(props.row)"
              class="campaigns-route-link"
            >
              <span class="contacts-count-text">
                {{ getLeadsCount(props.row) }}
              </span>
            </router-link>
          </q-td>
        </template>

        <!-- Sent -->
        <template v-slot:body-cell-sent="props">
          <q-td :props="props">
            <router-link
              :to="getRouterLinkForCampaign(props.row)"
              class="campaigns-route-link"
            >
              <CampaignStats
                showSparkline
                trendColor="primary"
                icon="sequences"

                :value="getSentStats(props.row).value"
                :trendData="getTrendData(props.row, 'sent')"
                :isDrafted="props.row.status === CAMPAIGN_STATUS.DRAFTED.value"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Replied -->
        <template v-slot:body-cell-replied="props">
          <q-td :props="props">
            <router-link
              :to="getRouterLinkForCampaign(props.row)"
              class="campaigns-route-link"
            >
              <CampaignStats
                showSparkline

                icon="seq-replied"
                trendColor="positive"
                statClass="replied-stat"

                :value="getRepliesStats(props.row).value"
                :subValue="getRepliesStats(props.row).rate"
                :trendData="getTrendData(props.row, 'replied')"
                :isDrafted="props.row.status === CAMPAIGN_STATUS.DRAFTED.value"
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
                icon="positive-reply"
                :statClass="getPositiveRepliesStats(props.row).value > 0
                  ? 'positive-reply-stat' : ''"

                :value="getPositiveRepliesStats(props.row).value"
                :subValue="getPositiveRepliesStats(props.row).rate"
                :isDrafted="props.row.status === CAMPAIGN_STATUS.DRAFTED.value"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Bounced -->
        <template v-slot:body-cell-bounced="props">
          <q-td :props="props">
            <router-link
              :to="getRouterLinkForCampaign(props.row)"
              class="campaigns-route-link"
            >
              <CampaignStats
                showSparkline

                icon="seq-bounced"
                statClass="bounced-stat"

                trendColor="negative"
                :value="getBouncedStats(props.row).value"
                :subValue="getBouncedStats(props.row).rate"
                :trendData="getTrendData(props.row, 'bounced')"

                :isDrafted="props.row.status === CAMPAIGN_STATUS.DRAFTED.value"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Tags -->
        <template v-slot:body-cell-tags="props">
          <q-td :props="props">
            <TagsDisplay
              :tagIds="props.row.tags || []"
              :maxVisible="1"
            />
          </q-td>
        </template>

        <!-- Actions -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="actions-cell">
              <q-btn
                dense
                outlined
                unelevated
                :disable="isReadOnly"
                class="more-action-btn"
              >
                <LocalSvgIcon
                  image="more"
                  classes="more-menu-icon"
                />

                <CampaignMoreOptions
                  v-if="!isReadOnly"

                  :campaignStatus="props.row.status"

                  @cloneCampaign="onCloneCampaign(props.row)"
                  @renameCampaign="onRenameCampaign(props.row)"
                  @pauseCampaign="onPauseCampaign(props.row)"
                  @resumeCampaign="handleResumeCampaign(props.row)"
                  @archiveCampaign="onArchiveCampaign(props.row)"
                />

                <AppTooltip
                  v-if="isReadOnly"
                  content="You have read-only access in this workspace"
                />
              </q-btn>
            </div>
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

// router
import { useRouter } from 'vue-router';

// Components
import AppHeader from 'components/Headers/AppHeader.vue';
import ApiLoader from 'components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import ColumnsVisibility from 'components/Modals/ColumnsVisibility.vue';
import AllSequencesIllustration from 'components/Illustrations/AllSequences.vue';
import MailboxSequenceIllustration from 'components/Illustrations/MailboxSequence.vue';
import AppTooltip from 'components/General/AppTooltip.vue';

import ArchiveCampaign from 'components/Campaigns/Modals/ArchiveCampaign.vue';
import SaveCampaignDetails from 'components/Campaigns/Modals/SaveCampaignDetails.vue';

import CampaignStats from 'components/Campaigns/CampaignStats.vue';
import CampaignFilters from 'components/Campaigns/CampaignFilters.vue';
import CampaignDetails from 'components/Campaigns/CampaignDetails.vue';
import CampaignStatus from 'components/Campaigns/CampaignStatus.vue';
import CampaignMoreOptions from 'components/Menu/CampaignMoreOptions.vue';
import TagsDisplay from 'components/Tags/TagsDisplay.vue';

import SelectCampaignStatus from 'components/Dropdown/SelectCampaignStatus.vue';
import ColumnsVisibilityButton from 'components/Buttons/ColumnsVisibility.vue';
import ResetFiltersButton from 'components/Buttons/ResetFilters.vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { getNumeralAmount, findPercentage } from 'src/utils/numbers';
import {
  pauseCampaignById,
  cloneCampaignById,
  startCampaignById,
  getMultipleSequencesDateStats,
} from 'src/utils/campaignApi.js';

// store
import { useUserPreferencesStore } from 'src/stores/userPreferences';
import { useTagsStore } from 'src/stores/tags';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';
import { usePermissions } from 'src/composables/usePermissions';

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
    AppTooltip,

    CampaignStats,
    CampaignDetails,
    CampaignFilters,
    SelectCampaignStatus,
    CampaignStatus,
    CampaignMoreOptions,
    TagsDisplay,
    ColumnsVisibilityButton,
    ResetFiltersButton,
  },

  props: {
    fromAllCampaignsPage: {
      type: Boolean,
      default: false,
    },
    contactId: {
      type: [String, Number],
      default: null,
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

    // router
    const $router = useRouter();

    // composables
    const { isReadOnly } = usePermissions();
    const { isMobileDevice, showQuasarLoader, hideQuasarLoader } = useAppHelpersApi();

    // stores
    const userPreferencesStore = useUserPreferencesStore();
    const tagsStore = useTagsStore();

    // state
    const state = reactive({
      // booleans
      isApiProcessing: false,
      areResultsFetchedOnce: false,
      isUpdateName: false,

      // modal booleans
      showArchiveCampaignModal: false,
      showColumnsVisibilityModal: false,
      showSaveCampaignDetailsModal: false,

      // data
      visibleColumns: [],
      tableData: [],
      dateStatsBySeqId: {},
      pagination: { ...DEFAULT_TABLE_PAGINATION },
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
        label: 'NAME',
        align: 'left',
        field: 'name',
      },
      {
        name: 'status',
        label: 'STATUS',
        align: 'left',
        field: 'status',
      },
    ];

    const dynamicColumns = computed(() => [
      {
        name: 'leads',
        label: 'LEADS',
        align: 'left',
        field: 'leads',
      },
      {
        name: 'sent',
        label: 'SENT',
        align: 'left',
        field: 'sent',
      },
      {
        name: 'replied',
        label: 'REPLIED',
        align: 'left',
        field: 'replied',
      },
      {
        name: 'positiveReplies',
        label: 'POSITIVE REPLIES',
        align: 'left',
        field: 'positiveReplies',
      },
      {
        name: 'bounced',
        label: 'BOUNCED',
        align: 'left',
        field: 'bounced',
      },
      // {
      //   name: 'tags',
      //   label: 'TAGS',
      //   align: 'left',
      //   field: 'tags',
      // },
    ]);

    const tableColumns = computed(() => {
      const filteredColumns = dynamicColumns.value.filter(
        (col) => state.visibleColumns.includes(col.name),
      );

      return [
        ...baseColumns,
        ...filteredColumns,
        {
          name: 'actions',
          label: 'ACTIONS',
          align: 'center',
          field: 'actions',
        },
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

    const onRenameCampaign = (row) => {
      state.selectedCampaignJson = row;
      state.isUpdateName = true;
      state.showSaveCampaignDetailsModal = true;
    };

    const onUpdateCampaign = (updatedCampaignJson) => {
      state.showSaveCampaignDetailsModal = false;

      // update the table data
      state.tableData = state.tableData.map((campaign) => {
        if (campaign.id === updatedCampaignJson.id) {
          return {
            ...campaign,
            ...updatedCampaignJson,
          };
        }

        return campaign;
      });

      // update the store
      updateDataToStore({
        tableData: state.tableData,
      });
    };

    const onPauseCampaign = async (row) => {
      const oldStatus = row.status;

      onUpdateCampaign({
        ...row,
        status: CAMPAIGN_STATUS.PAUSED.value,
      });

      const response = await pauseCampaignById({
        campaignId: row.id,
        $toast: appContext.config.globalProperties.$toast,
      });

      if (!response) {
        onUpdateCampaign({
          ...row,
          status: oldStatus,
        });
      }
    };

    const handleResumeCampaign = async (row) => {
      const oldStatus = row.status;

      onUpdateCampaign({
        ...row,
        status: CAMPAIGN_STATUS.ACTIVE.value,
      });

      const response = await startCampaignById({
        campaignId: row.id,
        $toast: appContext.config.globalProperties.$toast,
      });

      if (!response) {
        onUpdateCampaign({
          ...row,
          status: oldStatus,
        });
      }
    };

    const onCloneCampaign = async (row) => {
      showQuasarLoader();

      const response = await cloneCampaignById({
        campaignId: row.id,
        $toast: appContext.config.globalProperties.$toast,
      });

      if (response) {
        $router.push(`/outreach/campaigns/${response.id}/edit`);
      }

      hideQuasarLoader();
    };

    const getLeadsCount = (row) => {
      const contactStats = row?.contact_stats || {};
      const total = contactStats.total_contacts ?? row.total_no_contacts ?? 0;
      return getNumeralAmount(total);
    };

    const getSentStats = (row) => {
      const stats = row?.stats || {};
      const emailSent = stats.email_sent || 0;
      const liSent = (stats.li_messages_sent || 0)
        + (stats.li_inmails_sent || 0);
      const totalSent = emailSent + liSent;

      return {
        value: getNumeralAmount(totalSent),
      };
    };

    const getRepliesStats = (row) => {
      if (row?.reply_rate !== undefined) {
        return {
          value: getNumeralAmount(row.replies || 0),
          rate: row.reply_rate || 0,
        };
      }

      const stats = row?.stats || {};
      const totalReplies = (stats.email_replies || 0) + (stats.li_replies || 0);
      const totalSent = (stats.email_sent || 0)
        + (stats.li_messages_sent || 0)
        + (stats.li_inmails_sent || 0);

      const rate = totalSent > 0 ? findPercentage({
        part: totalReplies,
        whole: totalSent,
      }) : 0;

      return {
        value: getNumeralAmount(totalReplies),
        rate,
      };
    };

    const getPositiveRepliesStats = (row) => {
      if (row?.positive_reply_rate !== undefined) {
        return {
          value: getNumeralAmount(row.positive_replies || 0),
          rate: row.positive_reply_rate || 0,
        };
      }

      const stats = row?.stats || {};
      const totalPositive = (stats.email_positive_replies || 0)
        + (stats.li_positive_replies || 0);
      const totalReplies = (stats.email_replies || 0) + (stats.li_replies || 0);

      const rate = totalReplies > 0 ? findPercentage({
        part: totalPositive,
        whole: totalReplies,
      }) : 0;

      return {
        value: getNumeralAmount(totalPositive),
        rate,
      };
    };

    const getBouncedStats = (row) => {
      const stats = row?.stats || {};
      const bounces = stats.email_bounces || 0;
      const emailSent = stats.email_sent || 0;

      const rate = emailSent > 0 ? findPercentage({
        part: bounces,
        whole: emailSent,
      }) : 0;

      return {
        value: getNumeralAmount(bounces),
        rate,
      };
    };

    const getTrendData = (row, metric) => {
      const list = state.dateStatsBySeqId?.[row.id]
        || state.dateStatsBySeqId?.[String(row.id)]
        || [];

      if (!Array.isArray(list) || list.length === 0) return [];

      if (metric === 'sent') {
        return list.map((item) => (item.email_sent || 0) + (item.li_messages_sent || 0));
      }
      if (metric === 'replied') {
        return list.map((item) => (item.email_replies || 0) + (item.li_replies || 0));
      }
      if (metric === 'bounced') {
        return list.map((item) => item.email_bounces || 0);
      }

      return [];
    };

    const fetchDateStats = async (seqIds) => {
      if (!Array.isArray(seqIds) || seqIds.length === 0) {
        state.dateStatsBySeqId = {};
        return;
      }

      try {
        const response = await getMultipleSequencesDateStats(seqIds);
        state.dateStatsBySeqId = response || {};
      } catch (error) {
        state.dateStatsBySeqId = {};
      }
    };

    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.isApiProcessing = true;

        const params = {
          offset: (page - 1) * perPage,
          limit: perPage,
        };

        if (state.filters.searchText) {
          params.search_text = state.filters.searchText;
        }

        if (state.filters.status) {
          params.status = state.filters.status;
        }

        const endpoint = props.contactId
          ? `/contacts/${props.contactId}/campaigns`
          : '/sequences';

        const response = await getApiCall({
          params,
          endpoint,
          includeWorkspace: true,
        });

        const { data, count } = response;

        state.tableData = data || [];
        state.pagination.rowsNumber = count;

        // Fetch sparklines data for sequences on this page
        if (state.tableData.length > 0) {
          const ids = state.tableData.map((seq) => seq.id);
          fetchDateStats(ids);
        } else {
          state.dateStatsBySeqId = {};
        }

        // store in pinia
        updateDataToStore({
          filters: state.filters,
          pagination: state.pagination,
          tableData: state.tableData,
        });
      } catch (error) {
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
      state.isUpdateName = false;
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
      } else {
        state.pagination = { ...DEFAULT_TABLE_PAGINATION };
      }

      // set from store
      const validDynamicKeys = dynamicColumns.value.map((col) => col.name);

      if (isEmpty(visibleColumns)) {
        state.visibleColumns = [...validDynamicKeys];
      } else {
        let updatedColumns = visibleColumns.map((col) => (col === 'contacts' ? 'leads' : col));
        // Keep only valid dynamic column keys (never include baseColumns or obsolete keys)
        updatedColumns = updatedColumns.filter((col) => validDynamicKeys.includes(col));

        state.visibleColumns = isEmpty(updatedColumns) ? [...validDynamicKeys] : updatedColumns;

        updateDataToStore({
          visibleColumns: [...state.visibleColumns],
        });
      }

      state.areResultsFetchedOnce = !isEmpty(state.tableData);

      // Pre-fetch tags for resolving campaign tag IDs into badges
      tagsStore.fetchTags();

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
      isReadOnly,

      tablePaginationLabel,
      headerTitle,
      showAllCampaignsIllustration,
      showCampaignFilters,
      isFilterApplied,
      CAMPAIGN_STATUS,

      // methods
      onRequest,
      onArchiveCampaign,
      onSearchData,
      onFetchAllData,
      clearAllFilters,
      onUpdateVisibleColumns,
      onSuccessfulArchiveCampaign,
      onCreateNewSequence,
      onRenameCampaign,
      onPauseCampaign,
      handleResumeCampaign,
      onCloneCampaign,

      getNumeralAmount,
      onUpdateCampaign,

      getLeadsCount,
      getSentStats,
      getRepliesStats,
      getPositiveRepliesStats,
      getBouncedStats,
      getTrendData,
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

    .contact-sequence-illustration {
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      @media (max-width: $breakpoint-xs-max) {
        padding: 20px 16px;
      }

      .illustration-header-text {
        color: $black;
        font-size: 18px;
        font-weight: 600;
        margin-top: 24px;
        text-align: center;
      }

      .illustration-body-text {
        margin-top: 8px;
        color: rgba(var(--black-rgb), 0.8);
        font-size: 14px;
        font-weight: 400;
        text-align: center;
        max-width: 430px;
      }
    }

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

      :deep(.q-table thead tr th) {
        font-size: 12px;
        font-weight: 600;
        color: $grey-700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding-top: 10px;
        padding-bottom: 10px;
      }

      .campaigns-route-link {
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
        text-decoration: unset;

        color: $black;
        padding: 6px 0px;
      }

      .contacts-count-text {
        font-size: 14px;
        color: $black;
      }

      .actions-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;

        .more-action-btn {
          width: 28px;
          height: 28px;
          min-height: 28px;
          border-radius: 6px;

          border: 1px solid $blue-grey;
          background: $white;
          padding: 0;

          .more-menu-icon {
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;

            transform: rotate(90deg);
          }

          &:hover {
            background: $grey-50;
          }
        }
      }
    }
  }
}
</style>
