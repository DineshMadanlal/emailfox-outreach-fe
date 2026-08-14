<template>
  <div class="account-table-container">
    <!-- Column Visibility -->
    <q-dialog
      v-model="modals.showColumnsVisibilityModal"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ColumnsVisibility
        sourceType="linkedin"
        :baseColumns="baseColumns"
        :dynamicColumns="dynamicColumns"
        v-model:visibleColumns="tableState.visibleColumns"

        @update:visible-columns="onUpdateVisibleColumns"
      />
    </q-dialog>

    <!-- Header -->
    <AppHeader
      v-if="fromAllLinkedInPage"
      title="LinkedIn Accounts"
    >
      <template v-slot:headerRightSection>
        <!-- Connect LinkedIn -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Connect LinkedIn"

          @click="onConnectLinkedInAccount"

          v-if="!showLinkedInIllustration"
        />
      </template>
    </AppHeader>

    <!-- Loader -->
    <ApiLoader
      :show="true"

      v-if="showApiLoader"
    />

    <div
      v-else
      class="account-table-content-container"
    >
      <!-- Show loader when the API is processing -->
      <ApiLoader
        :show="showApiLoader"

        v-if="!showLinkedInIllustration"
      />

      <LinkedInAccountsIllustration
        v-if="showLinkedInIllustration"

        @connectAccount="onConnectLinkedInAccount"
      />

      <!-- Filter Header -->
      <div
        v-else
        class="filter-header"
      >
        <!-- search input -->
        <AppSearchInput
          :debounce="500"
          v-model="tableState.filters.searchText"

          class="account-filter-input"
          moreClasses="dead-small"
          placeholder="Search account"

          @update:modelValue="onSearchAccounts"
        />

        <q-space />

        <!--  -->
        <ColumnsVisibilityButton
          @click="modals.showColumnsVisibilityModal = true"
        />
      </div>

      <!-- Table -->
      <q-table
        virtual-scroll

        v-if="!showLinkedInIllustration"
        v-model:pagination="tableState.pagination"

        separator="cell"
        selection="multiple"
        class="app-table all-accounts-table app-paginated-table sticky-first-col"

        :rows="tableState.data"
        :columns="tableColumns"

        :loading="loaders.isFetchApi"

        v-model:selected="tableState.selectedRows"

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

                  v-model="tableState.showTableMultiSelectMenu"
                >
                  <!-- quasar list -->
                  <q-list style="min-width: 270px">
                    <TableMultiSelect
                      multiSelectType="mailboxes"
                      :multiSelectOptionJson="multiSelectOptionJson"

                      :totalList="tableState.pagination.rowsNumber"
                      :totalCurrentList="tableState.data.length"

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
                v-model="tableState.pagination.rowsPerPage"

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
        <!-- Account Name -->
        <template v-slot:body-cell-accountName="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <div>
                {{ props.row.name }}
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-status="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <div>
                {{ props.row.status }}
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Profile Views -->
        <template v-slot:body-cell-profileViews="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
            </router-link>
          </q-td>
        </template>

        <!-- Connection Requests -->
        <template v-slot:body-cell-connectionRequest="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
            </router-link>
          </q-td>
        </template>

        <!-- Messages -->
        <template v-slot:body-cell-messages="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
            </router-link>
          </q-td>
        </template>

        <!-- Likes -->
        <template v-slot:body-cell-likes="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
            </router-link>
          </q-td>
        </template>

        <!-- Inmails -->
        <template v-slot:body-cell-inmails="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
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
  defineComponent, toRefs, reactive, getCurrentInstance, onMounted, computed,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import AppHeader from 'components/Headers/AppHeader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import TableMultiSelect from 'components/Menu/TableMultiSelect.vue';
import ColumnsVisibility from 'components/Modals/ColumnsVisibility.vue';
import ColumnsVisibilityButton from 'components/Buttons/ColumnsVisibility.vue';
import LinkedInAccountsIllustration from 'components/Illustrations/LinkedInAccounts.vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { getNumeralAmount } from 'src/utils/numbers';

// Import the pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// constants
import {
  TABLE_MULTI_SELECT_OPTIONS, DEFAULT_TABLE_PAGINATION,
} from 'boot/constants';

export default defineComponent({
  name: 'LinkedInTable',

  components: {
    ApiLoader,
    AppHeader,
    AppSearchInput,
    TableMultiSelect,
    ColumnsVisibility,
    ColumnsVisibilityButton,
    LinkedInAccountsIllustration,
  },

  props: {
    fromAllLinkedInPage: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // store
    const userStore = useUserPreferencesStore();

    //
    const linkedInFilters = {
      searchText: '',
    };

    // instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('LinkedIn Accounts'));

    // state
    const state = reactive({
      loaders: {
        isFetchApi: false,
      },

      tableState: {
        data: [],
        pagination: {},
        areResultsFetchedOnce: false,

        // multi select
        selectedRows: [],
        multiSelectOptionJson: {},
        showTableMultiSelectMenu: false,

        //
        filters: { ...linkedInFilters },

        // columns visibility
        visibleColumns: [],
      },

      modals: {
        showColumnsVisibilityModal: false,
      },
    });

    const showApiLoader = computed(() => {
      if (state.tableState.areResultsFetchedOnce) {
        return false;
      }

      return state.loaders.isFetchApi;
    });

    const isFilterApplied = computed(() => {
      // take the keys of filters and check if all are values are empty
      const filterKeys = Object.keys(state.tableState.filters);
      const areAllFiltersEmpty = filterKeys.every((key) => isEmpty(state.tableState.filters[key]));

      return !areAllFiltersEmpty;
    });

    const showLinkedInIllustration = computed(() => {
      if (state.loaders.isFetchApi
        || !state.tableState.areResultsFetchedOnce || isFilterApplied.value) {
        return false;
      }

      return state.tableState.pagination.rowsNumber === 0;
    });

    const showLinkedInFilters = computed(() => {
      if (isFilterApplied.value) {
        return true;
      }

      return state.tableState.pagination.rowsNumber !== 0;
    });

    const tablePaginationLabel = computed(() => {
      const { page, perPage, rowsNumber } = state.tableState.pagination;

      const start = (page - 1) * perPage + 1;
      const end = page * perPage;

      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    const selectedRowsCount = computed(() => size(state.tableState.selectedRows));

    const baseColumns = [
      {
        name: 'accountName',
        label: 'Account Name',
        align: 'left',
      },
      // status
      {
        name: 'status',
        label: 'Status',
        align: 'left',
      },
    ];

    const dynamicColumns = computed(() => {
      const columns = [
        // {
        //   name: 'profileViews',
        //   label: 'Profile Views per Day',
        //   align: 'left',
        // },
        // {
        //   name: 'connectionRequest',
        //   label: 'Connection Request per Day',
        //   align: 'left',
        // },
        // {
        //   name: 'messages',
        //   label: 'Messages Sent per Day',
        //   align: 'left',
        // },
        // {
        //   name: 'likes',
        //   label: 'Likes per Day',
        //   align: 'left',
        // },
        // {
        //   name: 'inmails',
        //   label: 'InMails Sent per Day',
        //   align: 'left',
        // },
      ];

      return columns;
    });

    const tableColumns = computed(() => {
      const filteredColumns = dynamicColumns.value.filter(
        (col) => state.tableState.visibleColumns.includes(col.name),
      );

      return [
        ...baseColumns,
        ...filteredColumns,
      ];
    });

    // methods
    const updateDataToStore = (inputObject) => {
      if (props.fromAllLinkedInPage) {
        userStore.setMultipleFields({
          linkedInAccountsState: {
            ...userStore.linkedInAccountsState,
            ...inputObject,
          },
        });
      }
    };

    const updateMultiSelect = (multiSelectOptionJson) => {
      state.tableState.multiSelectOptionJson = multiSelectOptionJson;

      if (multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST
        || multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        state.tableState.selectedRows = state.tableState.data;
      } else {
        // limit number
        state.tableState.selectedRows = state.tableState.data
          .slice(0, multiSelectOptionJson.limitNumber);
      }

      state.tableState.showTableMultiSelectMenu = false;
    };

    // API Calls
    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.loaders.isFetchApi = true;

        const params = {
          offset: (page - 1) * perPage,
          limit: perPage,
        };

        const response = await getApiCall({
          params,
          endpoint: '/connected-accounts/linkedin',
          includeWorkspace: true,
        });

        // response data
        state.tableState.data = response.data;
        state.tableState.pagination.rowsNumber = response.count;

        // store in pinia
        updateDataToStore({
          tableData: response.data,
          pagination: state.tableState.pagination,
          filters: state.tableState.filters,
        });
      } catch (error) {
        // Show a toaster
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isFetchApi = false;
      }
    };

    const onRequest = async (params) => {
      state.loaders.isFetchApi = true;

      state.tableState.pagination.page = params.pagination.page;
      state.tableState.pagination.perPage = params.pagination.rowsPerPage;

      await fetchData(
        state.tableState.pagination.page,
        state.tableState.pagination.perPage,
      );

      if (!state.tableState.areResultsFetchedOnce) {
        // make it true
        state.tableState.areResultsFetchedOnce = true;
      }
    };

    const onFetchLinkedInRecords = () => {
      onRequest({
        pagination: state.tableState.pagination,
      });
    };

    const onTableRowSelect = () => {
      if (state.tableState.data.length === state.tableState.selectedRows.length) {
        state.tableState.multiSelectOptionJson = {
          limit: state.tableState.data.length,
          selectedOption: TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST,
        };
      } else {
        state.tableState.multiSelectOptionJson = null;
      }
    };

    const resetTableMultiSelect = () => {
      state.tableState.multiSelectOptionJson = {};

      state.tableState.selectedRows = [];
    };

    const onUpdateVisibleColumns = () => {
      // store in pinia
      updateDataToStore({
        visibleColumns: state.tableState.visibleColumns,
      });
    };

    const onSearchAccounts = (searchText) => {
      state.tableState.filters.searchText = searchText?.trim();

      onFetchLinkedInRecords();
    };

    const makeApiCallOnMounted = async () => {
      const {
        tableData, filters, pagination, visibleColumns,
      } = userStore.linkedInAccountsState || {};

      state.tableState.pagination = pagination || DEFAULT_TABLE_PAGINATION;

      if (props.fromAllLinkedInPage) {
        // prefill
        state.tableState.data = tableData || [];
        state.tableState.filters = filters || { ...linkedInFilters };

        state.tableState.areResultsFetchedOnce = !isEmpty(tableData);

        // set from store
        state.tableState.visibleColumns = [...visibleColumns];
      }

      if (isEmpty(state.tableState.visibleColumns)) {
        state.tableState.visibleColumns = dynamicColumns.value.map((col) => col.name);
      }

      onRequest({
        pagination: state.tableState.pagination,
      });
    };

    const onConnectLinkedInAccount = () => {

    };

    // lifecycle hook
    onMounted(() => {
      makeApiCallOnMounted();
    });

    //
    return {
      // state
      ...toRefs(state),

      // computed
      baseColumns,
      dynamicColumns,
      isMobileDevice,
      tableColumns,
      showApiLoader,
      showLinkedInIllustration,
      showLinkedInFilters,
      tablePaginationLabel,
      selectedRowsCount,
      isFilterApplied,

      // methods
      onRequest,
      onFetchLinkedInRecords,
      onTableRowSelect,
      resetTableMultiSelect,
      updateMultiSelect,
      onUpdateVisibleColumns,
      onSearchAccounts,
      onConnectLinkedInAccount,
    };
  },
});
</script>

<style lang="scss" scoped>
.account-table-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  position: relative;

  :deep(.app-header) {
    padding-bottom: 0;
  }

  .account-table-content-container {
    width: 100%;
    position: relative;
    min-height: 0;
    flex: 1;

    display: flex;
    flex-direction: column;

    .filter-header {
      padding: 20px;

      display: flex;
      gap: 8px;
      align-items: center;

      overflow-x: auto;
      overflow-y: hidden;

      .account-filter-input {
        min-width: 260px;
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 12px;

        .account-filter-input {
          min-width: 200px;
        }
      }
    }

    :deep(.all-accounts-table) {
      display: grid;
      min-height: 0;
      border-top: 0px;

      .account-route-link {
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
        text-decoration: unset;

        padding: 2px 0px;

        color: $black;
      }
    }
  }
}
</style>
