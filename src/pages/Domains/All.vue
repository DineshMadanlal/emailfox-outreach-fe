<template>
  <div class="all-domains">
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
        sourceType="domains"
        :baseColumns="baseColumns"
        :dynamicColumns="dynamicColumns"
        v-model:visibleColumns="visibleColumns"

        @update:visible-columns="onUpdateVisibleColumns"
      />
    </q-dialog>

    <!-- Dialog -->
    <q-dialog
      v-model="showDeleteDomainModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteDomains
        :filters="filters"
        :selectedDomains="selectedDomains"
        :multiSelectOptionJson="multiSelectOptionJson"

        @onSuccessfulDeleteDomains="onSuccessfulDeleteDomains"
      />
    </q-dialog>

    <!--  -->
    <q-dialog
      seamless
      :model-value="!!selectedDomainsLength"

      position="bottom"
      class="app-table-selection-dialog"
    >
      <DomainsActionSummary
        :totalCount="pagination.rowsNumber"
        :numberOfSelectedDomains="selectedDomainsLength"
        :multiSelectOptionJson="multiSelectOptionJson"

        @onCancel="selectedDomains = []"
        @onDelete="showDeleteDomainModal = true"
      />
    </q-dialog>

    <!-- Header -->
    <AppHeader title="Domains">
    </AppHeader>

    <!-- Loader -->
    <ApiLoader
      :show="true"

      v-if="showApiLoader"
    />

    <div
      v-else
      class="domains-table-content-container"
    >
      <!-- Show loader when the API is processing -->
      <ApiLoader
        :show="showApiLoader"

        v-if="!showAllDomainsIllustration"
      />

      <DomainsSummary
        v-if="!showAllDomainsIllustration"

        :key="domainsSummaryKey"
      />

      <AllDomainsIllustration
        v-if="showAllDomainsIllustration"
      />

      <!-- Filter Header -->
      <div
        v-else
        class="filter-domains-header"
      >
        <!-- search input -->
        <AppSearchInput
          :debounce="500"
          v-model="filters.searchText"

          class="domain-filter-input"
          moreClasses="dead-small"
          placeholder="Search domain"

          @update:modelValue="onSearchInput"
        />

        <!-- Provider -->
        <SelectProvider
          :clearable="true"
          v-model="filters.provider"

          class="dead-small dd-filter"

          @update:modelValue="onFetchRecords"
        />

        <q-space />

        <ColumnsVisibilityButton
          @click="showColumnsVisibilityModal = true"
        />
      </div>

      <!--  -->
      <q-table
        virtual-scroll

        v-if="!showAllDomainsIllustration"
        v-model:pagination="pagination"

        separator="cell"
        selection="multiple"
        class="app-table all-domains-table app-paginated-table sticky-first-col no-border-left"

        :rows="tableData"
        :columns="tableColumns"

        :loading="isApiProcessing"

        v-model:selected="selectedDomains"

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
                <p>
                  {{ col.label }}
                </p>

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

                @update:model-value="onFetchRecords"

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
        <template v-slot:body-cell-domainName="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/domain/${props.row.id}`"
              class="domain-route-link"
            >
              <div>
                <div class="domain-name-text">
                  {{ props.row.domain_name }}
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
              :to="`/outreach/domain/${props.row.id}`"
              class="domain-route-link"
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
              :to="`/outreach/domain/${props.row.id}`"
              class="domain-route-link"
            >
              <DeliverabilityScore
                :score="props.row.health_score"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Email Authentication -->
        <template v-slot:body-cell-emailAuthentication="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/domain/${props.row.id}`"
              class="domain-route-link"
            >
              <EmailAuthentication
                :tableRow="props.row"
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
import TableMultiSelect from 'components/Menu/TableMultiSelect.vue';
import DeleteDomains from 'components/Domains/Modals/DeleteDomains.vue';
import AllDomainsIllustration from 'components/Illustrations/AllDomains.vue';
import ColumnsVisibility from 'components/Modals/ColumnsVisibility.vue';
import EspProvider from 'components/Mailboxes/EspProvider.vue';
import DeliverabilityScore from 'components/Mailboxes/DeliverabilityScore.vue';
import EmailAuthentication from 'components/Mailboxes/EmailAuthentication.vue';
import DomainsActionSummary from 'components/Domains/Modals/DomainActionSummary.vue';

import AppSearchInput from 'components/Input/AppSearchInput.vue';
import ColumnsVisibilityButton from 'components/Buttons/ColumnsVisibility.vue';

import SelectProvider from 'components/Dropdown/SelectProvider.vue';
import DomainsSummary from 'components/Domains/DomainsSummary.vue';

// Import the Pinia store
import { storeExclusions } from 'src/stores/storeExclusions.js';
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// constants
import {
  TABLE_MULTI_SELECT_OPTIONS, DEFAULT_TABLE_PAGINATION,
} from 'boot/constants';

export default defineComponent({
  name: 'AllDomains',

  components: {
    AppHeader,
    ApiLoader,
    InfoTooltip,

    DeleteDomains,

    ColumnsVisibility,
    EspProvider,
    TableMultiSelect,
    AllDomainsIllustration,

    DeliverabilityScore,
    EmailAuthentication,

    AppSearchInput,
    DomainsActionSummary,
    ColumnsVisibilityButton,

    SelectProvider,
    DomainsSummary,
  },

  setup() {
    // hardcoded filters
    const domainFilters = {
      provider: null,
      searchText: null,
    };

    // instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // store
    const userStore = useUserPreferencesStore();
    const storeExclusionsPinia = storeExclusions();

    // metadata
    useMeta(generateMetadata('All Domains'));

    // state
    const state = reactive({
      isApiProcessing: true,
      areResultsFetchedOnce: false,

      tableData: [],

      // pagination
      pagination: {},

      // multi select variables
      selectedDomains: [],
      multiSelectOptionJson: {},
      showTableMultiSelectMenu: false,

      // table ref
      tableMaxHeight: '100%',

      showDeleteDomainModal: false,

      // columns visibility
      visibleColumns: [],
      showColumnsVisibilityModal: false,

      // filters
      filters: { ...domainFilters },

      //
      domainsSummaryKey: 1,
    });

    // computed
    const localStoredPagination = computed(() => userStore.allDomainsState?.pagination
      || DEFAULT_TABLE_PAGINATION);

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

    const showAllDomainsIllustration = computed(() => {
      if (state.isApiProcessing || !state.areResultsFetchedOnce || isFilterApplied.value) {
        return false;
      }

      return state.pagination.rowsNumber === 0;
    });

    const tablePaginationLabel = computed(() => {
      const { page, perPage, rowsNumber } = state.pagination;

      const start = (page - 1) * perPage + 1;
      const end = page * perPage;

      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    const selectedDomainsLength = computed(() => size(state.selectedDomains));

    const baseColumns = [
      {
        name: 'domainName',
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
          name: 'deliverabilityScore',
          label: 'Deliverability Rate',
          align: 'left',
        },
        {
          name: 'emailAuthentication',
          label: 'Email Authentication',
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
      ];
    });

    // methods
    const updateDataToStore = (inputObject) => {
      userStore.setMultipleFields({
        allDomainsState: {
          ...userStore.allDomainsState,
          ...inputObject,
        },
      });
    };

    const updateMultiSelect = (multiSelectOptionJson) => {
      state.multiSelectOptionJson = multiSelectOptionJson;

      if (multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST
        || multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        state.selectedDomains = state.tableData;
      } else {
        // limit number
        state.selectedDomains = state.tableData
          .slice(0, multiSelectOptionJson.limitNumber);
      }

      state.showTableMultiSelectMenu = false;
    };

    // API Calls
    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.isApiProcessing = true;

        const params = {
          offset: (page - 1) * perPage,
          limit: perPage,
        };

        // filters
        if (state.filters.searchText) {
          params.search_text = state.filters.searchText;
        }

        // provider
        if (state.filters.provider) {
          params.provider = state.filters.provider;
        }

        // api call
        const response = await getApiCall({
          params,
          endpoint: '/domains',
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

        state.selectedDomains = [];
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
          message: error.message || 'Unexpected error occured. Unable to fetch domains.',
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

    const onFetchRecords = () => {
      onRequest({
        pagination: state.pagination,
      });
    };

    const onTableRowSelect = () => {
      if (state.tableData.length === state.selectedDomains.length) {
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

      state.selectedDomains = [];
    };

    const onSuccessfulDeleteDomains = () => {
      state.showDeleteDomainModal = false;

      state.domainsSummaryKey += 1;
      onFetchRecords();
    };

    const makeApiCallOnMounted = async () => {
      const {
        tableData, filters, visibleColumns,
      } = userStore.allDomainsState || {};
      //
      state.pagination = localStoredPagination.value;

      state.tableData = tableData || [];
      state.filters = filters || { ...domainFilters };

      state.areResultsFetchedOnce = !isEmpty(state.tableData);

      if (isEmpty(visibleColumns)) {
        state.visibleColumns = dynamicColumns.value.map((col) => col.name);
      } else {
        // set from store
        state.visibleColumns = [...visibleColumns];

        updateDataToStore({
          visibleColumns: state.visibleColumns,
        });
      }

      onRequest({
        pagination: state.pagination,
      });
    };

    const onSearchInput = async () => {
      // trim the search text before making the API call
      state.filters.searchText = state.filters.searchText.trim();

      onFetchRecords();
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

    onMounted(() => {
      makeApiCallOnMounted();

      resetDomainByIdStoreValue();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      tableColumns,
      isMobileDevice,
      showApiLoader,
      tablePaginationLabel,
      selectedDomainsLength,
      showAllDomainsIllustration,

      baseColumns,
      dynamicColumns,

      // methods
      formatDate1,
      onRequest,
      onTableRowSelect,
      getNumeralAmount,
      updateMultiSelect,
      onSearchInput,
      resetTableMultiSelect,
      onFetchRecords,
      onSuccessfulDeleteDomains,
      onUpdateVisibleColumns,
    };
  },
});
</script>

<style lang="scss" scoped>
.all-domains {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  :deep(.app-header) {

    .all-domain-header-right-section {
      display: flex;
      align-items: center;
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-wrap: wrap;
      padding: 16px;

      .all-domain-header-right-section {
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

  .domains-table-content-container {
    width: 100%;
    position: relative;
    min-height: 0;

    display: flex;
    flex-direction: column;

    .filter-domains-header {
      padding: 20px;

      display: flex;
      gap: 8px;
      align-items: center;

      :deep(.domains-icon) {
        @include svg-icon-stroke('path, circle, rect', $grey);
      }

      .domain-filter-input {
        min-width: 260px;
      }

      .dd-filter {
        min-width: 135px;
      }

      .domain-more-filters-btn {
        height: 28px;
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 12px;

        overflow-x: auto;
        overflow-y: hidden;

        .domain-filter-input {
          min-width: 200px;
        }
      }

      .domain-filters-dd {
        width: 100%;
        max-width: 160px;
      }
    }
  }

  :deep(.all-domains-table) {
    display: grid;
    min-height: 0;
    border-top: 0px;

    .domain-route-link {
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
        .domain-name-text {
          color: $black;
          font-size: 14px;
          font-weight: 500;
        }
        &:hover {
          .domain-name-text {
            color: $primary;
          }
        }
      }
    }

    .domain-icon {
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
