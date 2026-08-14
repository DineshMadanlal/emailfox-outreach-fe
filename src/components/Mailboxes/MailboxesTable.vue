<template>
  <div class="mailboxes-table-container">
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
        sourceType="mailboxes"
        :baseColumns="baseColumns"
        :dynamicColumns="dynamicColumns"
        v-model:visibleColumns="visibleColumns"

        @update:visible-columns="onUpdateVisibleColumns"
      />
    </q-dialog>

    <!-- Dialog -->
    <q-dialog
      v-model="showDeleteMailboxModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteMailbox
        :domainId="selectedMailboxJson?.domain_id"
        :mailboxId="selectedMailboxJson?.id"
        @onSuccessfulDeleteMailbox="onSuccessfulDeleteMailbox"
      />
    </q-dialog>

    <!-- Action Config -->
    <q-dialog
      v-model="showActionConfigModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ActionConfig
        :filters="filters"
        :actionType="actionType"

        :selectedMailboxes="selectedMailboxes"
        :multiSelectOptionJson="multiSelectOptionJson"

        @onSuccessfulUpdate="onSuccessfulAction"
      />
    </q-dialog>

    <!--  -->
    <q-dialog
      seamless
      :model-value="!!selectedMailboxesLength"

      position="bottom"
      class="app-table-selection-dialog"
    >
      <MailboxesActionSummary
        :totalCount="pagination.rowsNumber"
        :numberOfSelectedMailboxes="selectedMailboxesLength"

        @onCancel="selectedMailboxes = []"
        @on-action="onActionConfig"
      />
    </q-dialog>

    <!-- Header -->
    <AppHeader
      v-if="fromAllMailboxesPage"
      title="Mailboxes"
    >
      <template v-slot:headerRightSection>
        <div
          v-if="showMailboxFilters"
          class="all-mailbox-header-right-section"
        >
          <MailboxFilters
            :canFilter="!showAllMailboxesIllustration"
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
      class="mailboxes-table-content-container"
    >
      <!-- Show loader when the API is processing -->
      <ApiLoader
        :show="showApiLoader"

        v-if="!showAllMailboxesIllustration"
      />

      <MailboxesSummary
        :key="mailboxesSummaryKey"
        v-if="fromAllMailboxesPage && !showAllMailboxesIllustration"
      />

      <AllMailboxesIllustration
        v-if="showAllMailboxesIllustration"
      />

      <!-- Filter Header -->
      <div
        v-else
        class="filter-mailboxes-header"
      >
        <!-- search input -->
        <AppSearchInput
          :debounce="500"
          v-model="filters.searchText"

          class="mailbox-filter-input"
          moreClasses="dead-small"
          placeholder="Search email"

          @update:modelValue="onSearchMailboxInput"
        />

        <!-- Provider -->
        <SelectProvider
          :clearable="true"
          v-model="filters.provider"

          class="dead-small dd-filter"

          @update:modelValue="onFetchMailboxRecords"
        />

        <!-- Warmup Status -->
        <SelectWarmupStatus
          :clearable="true"
          v-model="filters.warmupStatus"

          class="dead-small dd-filter"

          @update:modelValue="onFetchMailboxRecords"
        />

        <!-- Connection Status -->
        <SelectMailboxConnection
          :clearable="true"
          v-model="filters.status"

          class="dead-small dd-filter status-dd"

          @update:modelValue="onFetchMailboxRecords"
        />

        <MoreFilters
          :isFilterApplied="isFilterApplied"
          class="table-more-filters-btn"
        >
          <MailboxMoreFilters
            v-model:filterStatus="filters.status"
            v-model:filterProvider="filters.provider"
            v-model:filterWarmupStatus="filters.warmupStatus"

            @update:filterStatus="onUpdateFiltersModelValue('status', $event)"
            @update:filterProvider="onUpdateFiltersModelValue('provider', $event)"
            @update:filterWarmupStatus="onUpdateFiltersModelValue('warmupStatus', $event)"
          />
        </MoreFilters>

        <!-- Clear Filter -->
        <ResetFiltersButton
          v-if="isFilterApplied"
          @click="clearAllFilters"
        />

        <q-space />

        <!--  -->
        <ColumnsVisibilityButton
          @click="showColumnsVisibilityModal = true"
        />
      </div>

      <!--  -->
      <q-table
        virtual-scroll

        v-if="!showAllMailboxesIllustration"
        v-model:pagination="pagination"

        separator="cell"
        selection="multiple"
        class="app-table all-mailboxes-table app-paginated-table sticky-first-col"

        :rows="tableData"
        :columns="tableColumns"

        :loading="isApiProcessing"

        v-model:selected="selectedMailboxes"

        @request="onRequest"
      >
        <!-- Header Slots -->
        <template #header="props">
          <q-tr :props="props">
            <q-th
              auto-width
            >
              <q-checkbox
                dense
                color="primary"
                class="app-checkbox"

                v-model="props.selected"

                v-if="props.selected || props.selected === null"

                @update:modelValue="resetTableMultiSelect"
              />

              <q-checkbox
                v-else

                dense
                color="primary"
                class="header-selection-checkbox app-checkbox"

                :model-value="props.selected"
              >
                <q-menu
                  transition-show="jump-down"
                  transition-hide="jump-up"

                  v-model="showTableMultiSelectMenu"
                >
                  <!-- quasar list -->
                  <q-list style="min-width: 270px">
                    <TableMultiSelect
                      multiSelectType="mailboxes"
                      :multiSelectOptionJson="multiSelectOptionJson"

                      :totalList="pagination.rowsNumber"
                      :totalCurrentList="tableData.length"

                      @updateMultiSelect="updateMultiSelect"
                    />
                  </q-list>
                </q-menu>
              </q-checkbox>
            </q-th>
            <!-- rest of the slot -->
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              <div
                class="flex no-wrap items-center"
              >
                {{ col.label }}

                <InfoTooltip
                  v-if="col.tooltip"
                  class="q-ml-sm"
                  iconName="circle-question"
                  :tooltipText="col.tooltip"
                />
              </div>
            </q-th>
          </q-tr>
        </template>

        <!-- template body checkbox -->
        <template v-slot:body-selection="scope">
          <q-checkbox
            dense
            color="primary"
            class="app-checkbox"

            v-model="scope.selected"

            @click="onTableRowSelect"
          />
        </template>

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

                @update:model-value="onFetchMailboxRecords"

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
        <!-- Full Name -->
        <template v-slot:body-cell-nameAndEmail="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/mailbox/${props.row.id}`"
              class="mailbox-route-link"
            >
              <div>
                <div class="mailbox-name-text">
                  {{ props.row.name }}
                </div>

                <div class="mailbox-email-text">
                  {{ props.row.email }}
                </div>
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Provider -->
        <template v-slot:body-cell-provider="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/mailbox/${props.row.id}`"
              class="mailbox-route-link"
            >
              <EspProvider
                :provider="props.row.provider || 'GMAIL'"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Deliverability Score -->
        <template v-slot:body-cell-deliverabilityScore="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/mailbox/${props.row.id}`"
              class="mailbox-route-link"
            >
              <DeliverabilityScore
                :score="props.row.health_score"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-status="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/mailbox/${props.row.id}`"
              class="mailbox-route-link"
            >
              <ConnectionStatus
                :isConnected="props.row.status === WARMUP_STATUS.ACTIVE"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Sent -->
        <template v-slot:body-cell-sent="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/mailbox/${props.row.id}`"
              class="mailbox-route-link"
            >
              <div class="flex no-wrap items-center">
                <LocalSvgIcon
                  image="sent"
                  classes="mailbox-icon"
                />

                <div>
                  {{ getNumeralAmount(props.row.emails_sent_today) }}
                  /
                  {{ props.row.sending_limit_per_day }} per day
                </div>
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Email Authentication -->
        <template v-slot:body-cell-emailAuthentication="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/mailbox/${props.row.id}`"
              class="mailbox-route-link"
            >
              <EmailAuthentication />
            </router-link>
          </q-td>
        </template>

        <!-- Warmup Status -->
        <template v-slot:body-cell-warmupStatus="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/mailbox/${props.row.id}`"
              class="mailbox-route-link"
            >
              <WarmupStatus
                :mailboxJson="props.row"

                @onEnableWarmup="onEnableWarmupByMailboxId(props.row)"
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
import size from 'lodash/size';
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, reactive, toRefs, computed,
  getCurrentInstance, onMounted,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// vue router
import { useRoute } from 'vue-router';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { formatDate1 } from 'src/utils/dates';
import { getApiCall } from 'src/utils/apiRequests';
import { getNumeralAmount, findPercentage } from 'src/utils/numbers';
import { getDeliverabilityRateJson, getBouncedRateJson } from 'src/utils/helperFunctions';

// components
import AppHeader from 'components/Headers/AppHeader.vue';
import ApiLoader from 'components/General/ApiLoader.vue';
import InfoTooltip from 'components/General/InfoTooltip.vue';

import MoreFilters from 'components/Buttons/MoreFilters.vue';
import MailboxMoreFilters from 'components/Menu/MailboxMoreFilters.vue';

import MailboxFilters from 'components/Mailboxes/MailboxFilters.vue';
import TableMultiSelect from 'components/Menu/TableMultiSelect.vue';
import DeleteMailbox from 'components/Domains/Modals/DeleteMailbox.vue';
import AllMailboxesIllustration from 'components/Illustrations/AllMailboxes.vue';
import ColumnsVisibility from 'components/Modals/ColumnsVisibility.vue';
import EspProvider from 'components/Mailboxes/EspProvider.vue';
import ConnectionStatus from 'components/Mailboxes/ConnectionStatus.vue';
import MailboxesActionSummary from 'components/Mailboxes/Modals/MailboxesActionSummary.vue';
import DeliverabilityScore from 'components/Mailboxes/DeliverabilityScore.vue';
import EmailAuthentication from 'components/Mailboxes/EmailAuthentication.vue';
import WarmupStatus from 'components/Mailboxes/WarmupStatus.vue';

import AppSearchInput from 'components/Input/AppSearchInput.vue';
import ColumnsVisibilityButton from 'components/Buttons/ColumnsVisibility.vue';
import MailboxesSummary from 'components/Mailboxes/MailboxesSummary.vue';
import SelectProvider from 'components/Dropdown/SelectProvider.vue';
import SelectWarmupStatus from 'components/Dropdown/SelectWarmupStatus.vue';
import SelectMailboxConnection from 'components/Dropdown/SelectMailboxConnection.vue';

import ResetFiltersButton from 'components/Buttons/ResetFilters.vue';
import ActionConfig from 'components/Mailboxes/Modals/ActionConfig.vue';

// Import the Pinia store
import { storeExclusions } from 'src/stores/storeExclusions.js';
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// constants
import {
  TABLE_MULTI_SELECT_OPTIONS, DEFAULT_TABLE_PAGINATION,
} from 'boot/constants';
import { WARMUP_STATUS } from 'src/boot/warmup-constants';
import { MAILBOX_ACTIONS } from 'src/boot/mailbox-constants';

export default defineComponent({
  name: 'AllMailboxes',

  components: {
    AppHeader,
    ApiLoader,
    InfoTooltip,
    MoreFilters,
    MailboxMoreFilters,

    ColumnsVisibility,
    EspProvider,
    ConnectionStatus,

    DeleteMailbox,
    MailboxFilters,
    TableMultiSelect,
    AllMailboxesIllustration,
    MailboxesActionSummary,

    DeliverabilityScore,
    EmailAuthentication,
    WarmupStatus,

    AppSearchInput,
    MailboxesSummary,
    ColumnsVisibilityButton,
    SelectProvider,
    SelectWarmupStatus,
    SelectMailboxConnection,

    ResetFiltersButton,
    ActionConfig,
  },

  props: {
    fromAllMailboxesPage: {
      type: Boolean,
      default: false,
    },
    addedFilters: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // hardcoded
    const mailboxFilters = {
      searchText: '',
      provider: '',
      warmupStatus: '',
      status: '',
    };

    // instance
    const { appContext } = getCurrentInstance();

    // route
    const $route = useRoute();

    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // store
    const userStore = useUserPreferencesStore();
    const storeExclusionsPinia = storeExclusions();

    // metadata
    useMeta(generateMetadata('All Mailboxes'));

    // state
    const state = reactive({
      isApiProcessing: true,
      areResultsFetchedOnce: false,

      tableData: [],

      // pagination
      pagination: {},

      // multi select variables
      selectedMailboxes: [],
      multiSelectOptionJson: {},
      showTableMultiSelectMenu: false,

      selectedMailboxJson: null,
      showDeleteMailboxModal: false,

      // columns visibility
      visibleColumns: [],
      showColumnsVisibilityModal: false,

      // filters
      filters: { ...mailboxFilters },

      actionType: '',
      showActionConfigModal: false,

      //
      mailboxesSummaryKey: 1,
    });

    // computed
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

    const showAllMailboxesIllustration = computed(() => {
      if (state.isApiProcessing || !state.areResultsFetchedOnce || isFilterApplied.value) {
        return false;
      }

      return state.pagination.rowsNumber === 0;
    });

    const showMailboxFilters = computed(() => {
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

    const selectedMailboxesLength = computed(() => size(state.selectedMailboxes));

    const baseColumns = [
      {
        name: 'nameAndEmail',
        label: 'Name',
        align: 'left',
      },
    ];

    const dynamicColumns = computed(() => {
      const columns = [
        {
          name: 'provider',
          label: 'Provider',
          align: 'left',
        },
        {
          name: 'warmupStatus',
          label: 'Warmup Status',
          align: 'left',
        },
        {
          name: 'deliverabilityScore',
          label: 'Deliverability Rate',
          align: 'left',
        },
        {
          name: 'status',
          label: 'Status',
          align: 'left',
        },
        {
          name: 'sent',
          label: 'Email sent / day',
          align: 'left',
        },
        // {
        //   name: 'emailAuthentication',
        //   label: 'Email Authentication',
        //   align: 'left',
        // },
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
      ];
    });

    // methods
    const updateDataToStore = (inputObject) => {
      if (props.fromAllMailboxesPage) {
        userStore.setMultipleFields({
          allMailboxesState: {
            ...userStore.allMailboxesState,
            ...inputObject,
          },
        });
      }
    };

    const updateMultiSelect = (multiSelectOptionJson) => {
      state.multiSelectOptionJson = multiSelectOptionJson;

      if (multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST
        || multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        state.selectedMailboxes = state.tableData;
      } else {
        // limit number
        state.selectedMailboxes = state.tableData
          .slice(0, multiSelectOptionJson.limitNumber);
      }

      state.showTableMultiSelectMenu = false;
    };

    // API Calls
    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.isApiProcessing = true;

        let params = {
          offset: (page - 1) * perPage,
          limit: perPage,
        };

        // filters
        const {
          searchText, provider, warmupStatus, status,
        } = state.filters || {};

        // search text
        if (searchText) {
          params.search_text = searchText;
        }

        // provider
        if (provider) {
          params.provider = provider;
        }

        // warmup status
        if (warmupStatus) {
          params.warmup_enabled = warmupStatus === WARMUP_STATUS.ACTIVE;
        }

        // status
        if (status) {
          params.status = status;
        }

        if (size(props.addedFilters)) {
          params = {
            ...params,
            ...props.addedFilters,
          };
        }

        const response = await getApiCall({
          params,
          endpoint: '/mailboxes',
          includeWorkspace: true,
        });

        const { data, count } = response;

        state.tableData = [];

        data.forEach((element) => {
          // delivery rate
          const deliveryRate = findPercentage({
            part: element.sent_count - element.bounce_count,
            whole: element.sent_count,
          });

          // bounced rate
          const bouncedRate = findPercentage({
            part: element.bounce_count,
            whole: element.sent_count,
          });

          const bouncedRateJson = getBouncedRateJson(bouncedRate);
          const deliverabilityRateJson = getDeliverabilityRateJson(deliveryRate);

          // table data
          state.tableData.push({
            ...element,
            deliveryRate,
            bouncedRate,

            bouncedRateJson,
            deliverabilityRateJson,
          });
        });

        state.selectedMailboxes = [];
        state.multiSelectOptionJson = {};

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
          message: error.message || 'Unexpected error occured. Unable to fetch mailboxes.',
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

    const onFetchMailboxRecords = () => {
      onRequest({
        pagination: state.pagination,
      });
    };

    const onUpdateFiltersModelValue = (filterKey, value) => {
      state.filters[filterKey] = value;

      onFetchMailboxRecords();
    };

    const onTableRowSelect = () => {
      if (state.tableData.length === state.selectedMailboxes.length) {
        state.multiSelectOptionJson = {
          limit: state.tableData.length,
          selectedOption: TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST,
        };
      } else {
        state.multiSelectOptionJson = null;
      }
    };

    const resetTableMultiSelect = () => {
      state.multiSelectOptionJson = {};

      state.selectedMailboxes = [];
    };

    const onDeleteMailbox = (propsRow) => {
      state.selectedMailboxJson = propsRow;

      state.showDeleteMailboxModal = true;
    };

    const onSuccessfulDeleteMailbox = () => {
      state.showDeleteMailboxModal = false;

      // remove the entry from the table
      state.tableData = state.tableData.filter(
        (mailbox) => mailbox.id !== state.selectedMailboxJson.id,
      );

      state.selectedMailboxJson = null;

      state.mailboxesSummaryKey += 1;
    };

    const makeApiCallOnMounted = async () => {
      const {
        tableData, filters, visibleColumns, pagination,
      } = userStore.allMailboxesState || {};

      if (props.fromAllMailboxesPage) {
        //
        state.pagination = pagination || DEFAULT_TABLE_PAGINATION;

        state.tableData = tableData || [];
        state.filters = filters || mailboxFilters;
      }

      state.areResultsFetchedOnce = !isEmpty(state.tableData);

      if (isEmpty(visibleColumns)) {
        state.visibleColumns = dynamicColumns.value.map((col) => col.name);
      } else {
        // set from store
        state.visibleColumns = [...visibleColumns];
      }

      onRequest({
        pagination: state.pagination,
      });
    };

    const onSearchMailboxInput = async () => {
      // trim white spaces
      state.filters.searchText = state.filters.searchText?.trim();

      onFetchMailboxRecords();
    };

    const onUpdateVisibleColumns = () => {
      // store in pinia
      updateDataToStore({
        visibleColumns: state.visibleColumns,
      });
    };

    const resetDomainByIdStoreValue = () => {
      storeExclusionsPinia.setMultipleFields({
        domainByIdJson: {},
        domainByIdEngagement: {},
      });
    };

    const clearAllFilters = () => {
      state.filters = { ...mailboxFilters };

      onFetchMailboxRecords();
    };

    const onActionConfig = (actionType) => {
      state.actionType = actionType;
      state.showActionConfigModal = true;
    };

    const onSuccessfulAction = () => {
      // force update summary by changing the key for delete
      if (state.actionType === MAILBOX_ACTIONS.DELETE) {
        state.mailboxesSummaryKey += 1;
      }

      state.actionType = '';
      state.selectedMailboxes = [];
      state.showActionConfigModal = false;

      state.multiSelectOptionJson = {};

      onFetchMailboxRecords();
    };

    const onEnableWarmupByMailboxId = (tableRow) => {
      state.selectedMailboxes = [tableRow];

      onActionConfig(MAILBOX_ACTIONS.ENABLE_WARMUP);
    };

    onMounted(() => {
      const {
        connectionSuccess, mailbox_id, email, error,
      } = $route.query;

      if (error) {
        window.opener.postMessage({
          type: 'OAUTH_AUTH_ERROR',
          error: error || 'Authentication failed',
        }, '*');
      }

      if (connectionSuccess && mailbox_id) {
        window.opener.postMessage({
          type: 'OAUTH_AUTH_SUCCESS',
          payload: {
            mailbox_id,
            email,
          },
        }, '*');
      } else {
        makeApiCallOnMounted();

        resetDomainByIdStoreValue();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      tableColumns,
      isMobileDevice,
      showApiLoader,
      showMailboxFilters,
      tablePaginationLabel,
      selectedMailboxesLength,
      showAllMailboxesIllustration,
      isFilterApplied,

      baseColumns,
      dynamicColumns,

      // methods
      formatDate1,
      onRequest,
      onDeleteMailbox,
      onTableRowSelect,
      getNumeralAmount,
      updateMultiSelect,
      onSearchMailboxInput,
      resetTableMultiSelect,
      onFetchMailboxRecords,
      onSuccessfulDeleteMailbox,
      onUpdateVisibleColumns,
      clearAllFilters,
      onUpdateFiltersModelValue,
      onActionConfig,
      onSuccessfulAction,
      onEnableWarmupByMailboxId,

      // hardcoded
      WARMUP_STATUS,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailboxes-table-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  position: relative;

  :deep(.app-header) {

    .all-mailbox-header-right-section {
      display: flex;
      align-items: center;
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-wrap: wrap;
      padding: 16px;

      .all-mailbox-header-right-section {
        order: 1;
        width: 100%;

        margin-top: 12px;
      }
    }
  }

  .app-negative-button {
    .app-negative-icon {
      @include svg-icon-stroke('path', $grey);
    }
    &:hover {
      .app-negative-icon {
        @include svg-icon-stroke('path, circle, rect', $negative);
      }
    }
  }

  .mailboxes-table-content-container {
    width: 100%;
    position: relative;
    min-height: 0;

    display: flex;
    flex-direction: column;

    .filter-mailboxes-header {
      padding: 20px;

      display: flex;
      gap: 8px;
      align-items: center;

      overflow-x: auto;
      overflow-y: hidden;

      :deep(.domains-icon) {
        @include svg-icon-stroke('path, circle, rect', $grey);
      }

      .mailbox-filter-input {
        min-width: 260px;
      }

      .dd-filter {
        min-width: 135px;

        &.status-dd {
          min-width: 165px;
        }
      }

      .table-more-filters-btn {
        height: 28px;
        display: none;
      }

      .domain-filters-dd {
        width: 100%;
        max-width: 160px;
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 12px;

        .mailbox-filter-input {
          min-width: 200px;
        }

        .table-more-filters-btn {
          display: flex;
        }

        .dd-filter {
          display: none;
        }
      }
    }
  }

  :deep(.all-mailboxes-table) {
    display: grid;
    min-height: 0;
    border-top: 0px;

    .mailbox-route-link {
      display: flex;
      align-items: center;
      height: 100%;
      width: 100%;
      text-decoration: unset;

      padding: 2px 0px;

      color: $black;
    }

    tbody {
      tr {
        .mailbox-name-text {
          color: $black;
          font-size: 14px;
          font-weight: 500;
        }
        .mailbox-email-text {
          margin-top: 4px;
          font-size: 14px;
          font-weight: 400;
          line-height: 16px;

          color: $grey-800;
        }
        &:hover {
          .mailbox-name-text {
            color: $primary;
          }
        }
      }
    }

    .mailbox-icon {
      margin-right: 8px;
    }

    .q-table__grid-content {
      display: grid;
      grid-row-gap: 16px;
      padding: 20px 12px;
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      border: 0px;
    }
  }
}
</style>
