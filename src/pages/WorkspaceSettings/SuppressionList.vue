<template>
  <div class="suppress-list-settings">
    <!-- Dialog -->
    <q-dialog
      v-model="showAddSuppressListModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <AddEntry
        @onSuccessfulAdd="onSuccessfulAdd"
      />
    </q-dialog>

    <!-- Delete Confirmation -->
    <q-dialog
      v-model="showDeleteSuppressionModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteSuppression
        :filters="filters"
        :selectedData="selectedData"
        :multiSelectOptionJson="multiSelectOptionJson"

        @deleteSuccess="onDeleteSuccess"
      />
    </q-dialog>

    <!-- Table Action Summary -->
    <q-dialog
      seamless
      :model-value="!!selectedDataLength"

      position="bottom"
      class="app-table-selection-dialog"
    >
      <SuppressionActionSummary
        :totalCount="pagination.rowsNumber"
        :numberOfSelectedData="selectedDataLength"
        :multiSelectOptionJson="multiSelectOptionJson"

        @onCancel="selectedData = []"
        @onDelete="onRequestDelete"
      />
    </q-dialog>

    <!-- Upload CSV -->
    <q-dialog
      v-model="showUploadSuppressCsvModal"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <UploadCsv
        @onSuccessfulAdd="onSuccessfulAdd"
      />
    </q-dialog>

    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          Blocklist
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Contacts and emails that will never receive messages from your workspace.
        </p>
      </div>

      <!-- right side -->
      <div class="settings-header-right-side">
        <q-btn-group v-if="!isTableEmpty">
          <!-- Add entry -->
          <q-btn
            no-caps
            unelevated

            color="primary"
            label="Add Entry"
            :style="{ minWidth: '120px' }"

            @click="showAddSuppressListModal = true"
          />
          <!-- Button Menu -->
          <q-btn
            no-caps
            unelevated

            :style="{ backgroundColor: primaryDarkenColor }"
          >
            <LocalSvgIcon
              image="plain-down-arrow"
              classes="plain-down-arrow-icon"
              :class="{ 'rotate-180': importCsvMenuOpen }"
            />

            <!-- menu -->
            <SuppressionListOptions
              v-model="importCsvMenuOpen"

              @importCsv="showUploadSuppressCsvModal = true"
            />
          </q-btn>
        </q-btn-group>

      </div>
    </div>

    <!-- Illustration -->
    <div
      v-if="isTableEmpty"
      class="settings-section-content"
    >
      <SuppressionListIllustration
        @addEntry="showAddSuppressListModal = true"
        @importCsv="showUploadSuppressCsvModal = true"
      />
    </div>

    <!-- Content -->
    <div
      v-else
      class="settings-section-content"
    >
      <!-- filter options -->
      <div
        class="table-filter-options"
      >
        <!--  -->
        <AppSearchInput
          :debounce="500"
          v-model="filters.searchText"

          class="search-filter-input"
          moreClasses="dead-small"
          placeholder="Search List"

          @update:modelValue="onSearchInput"
        />
      </div>

      <!-- Table -->
      <q-table
        hide-pagination
        v-model:pagination="pagination"

        separator="cell"
        selection="multiple"
        class="app-table app-table-rows-fixed suppression-table app-paginated-table"

        :rows="tableData"
        :columns="tableColumns"
        :loading="isApiProcessing"
        v-model:selected="selectedData"

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

        <!-- Value -->
        <template v-slot:body-cell-value="props">
          <q-td
            :props="props"
            class="table-column-value"
          >
            <div>
              {{ props.row.value || '-' }}
            </div>
          </q-td>
        </template>

        <!-- type -->
        <template v-slot:body-cell-type="props">
          <q-td
            :props="props"
            class="table-column-value"
          >
            <div>
              {{ props.row.value?.includes('@') ? 'Email' : 'Domain' }}
            </div>
          </q-td>
        </template>

        <!-- source -->
        <template v-slot:body-cell-source="props">
          <q-td
            :props="props"
            class="table-column-value"
          >
            <div>
              {{ SUPPRESSION_TYPE[props.row.suppression_type]?.label || '-' }}
            </div>
          </q-td>
        </template>

        <!-- Blocked on -->
        <template v-slot:body-cell-blockedOn="props">
          <q-td
            :props="props"
            class="table-column-value"
          >
            <div>
              {{ formatDateTimeWithYear(props.row.created_at) }}
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, getCurrentInstance, onMounted,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// Components
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import TableMultiSelect from 'components/Menu/TableMultiSelect.vue';
import SuppressionListOptions from 'components/Menu/SuppressionListOptions.vue';
import SuppressionListIllustration from 'components/Illustrations/SuppressionList.vue';

import AddEntry from 'components/Suppression/Modals/AddEntry.vue';
import UploadCsv from 'components/Suppression/Modals/UploadCsv.vue';
import DeleteSuppression from 'components/Suppression/Modals/DeleteSuppression.vue';
import SuppressionActionSummary from 'components/Suppression/Modals/SuppressionActionSummary.vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { getNumeralAmount } from 'src/utils/numbers';
import { formatDateTimeWithYear } from 'src/utils/dates';
import { darkenColor, getBrandColorByName } from 'src/utils/quasarHelpers';

// composition API
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { SUPPRESSION_TYPE } from 'boot/campaign-constants';
import { DEFAULT_TABLE_PAGINATION, TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';

export default defineComponent({
  name: 'SuppressionListSettings',

  components: {
    AddEntry,
    UploadCsv,
    AppSearchInput,
    TableMultiSelect,
    DeleteSuppression,
    SuppressionListOptions,
    SuppressionActionSummary,
    SuppressionListIllustration,
  },

  setup() {
    // app context
    const { appContext } = getCurrentInstance();

    // composition API
    const { isMobileDevice, generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Suppression List'));

    // state
    const state = reactive({
      // multi select variables
      selectedData: [],
      multiSelectOptionJson: {},
      showTableMultiSelectMenu: false,

      //
      pagination: DEFAULT_TABLE_PAGINATION,

      tableData: [],
      filters: {
        searchText: '',
      },

      // loading
      isApiProcessing: false,
      areResultsFetchedOnce: false,

      importCsvMenuOpen: false,

      // modals
      showAddSuppressListModal: false,
      showUploadSuppressCsvModal: false,
      showDeleteSuppressionModal: false,

      //
      selectedTableDataJson: null,
    });

    // computed
    const primaryDarkenColor = computed(() => {
      const primaryColor = getBrandColorByName('primary');
      return darkenColor(primaryColor, 25);
    });

    const isFilterApplied = computed(() => !!state.filters.searchText);

    const isTableEmpty = computed(() => {
      if (state.isApiProcessing || !state.areResultsFetchedOnce || isFilterApplied.value) {
        return false;
      }

      return state.pagination.rowsNumber === 0;
    });

    const selectedDataLength = computed(() => state.selectedData?.length || 0);

    const tablePaginationLabel = computed(() => {
      const { page, perPage, rowsNumber } = state.pagination;

      const start = (page - 1) * perPage + 1;
      const end = page * perPage;

      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    const tableColumns = computed(() => {
      const columns = [
        {
          name: 'value',
          label: 'Value',
          field: 'value',
          align: 'left',
        },
        {
          name: 'type',
          label: 'Type',
          field: 'type',
          align: 'left',
        },
        {
          name: 'source',
          label: 'Source',
          field: 'source',
          align: 'left',
        },
        {
          name: 'blockedOn',
          label: 'Blocked On',
          align: 'left',
        },
      ];

      return columns;
    });

    // methods
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

        // api call
        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: '/global-suppressions',
          params,
        });

        const { data, count } = response;

        // table data
        state.tableData = data;

        state.selectedData = [];

        state.pagination.rowsNumber = count;
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    const onRequest = async (params) => {
      state.pagination.page = params.pagination.page;
      state.pagination.perPage = params.pagination.rowsPerPage;

      await fetchData(state.pagination.page, state.pagination.rowsPerPage);

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

    const onSuccessfulAdd = () => {
      // close the modal
      state.showAddSuppressListModal = false;
      state.showUploadSuppressCsvModal = false;

      onFetchRecords();
    };

    const onSearchInput = async () => {
      // trim the search text before making the API call
      state.filters.searchText = state.filters.searchText.trim();

      onFetchRecords();
    };

    const onRequestDelete = () => {
      state.showDeleteSuppressionModal = true;
    };

    const onDeleteSuccess = () => {
      // close the modal
      state.showDeleteSuppressionModal = false;

      // remove the deleted row from the table data
      onFetchRecords();
    };

    const updateMultiSelect = (multiSelectOptionJson) => {
      state.multiSelectOptionJson = multiSelectOptionJson;

      if (multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST
        || multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        state.selectedData = state.tableData;
      } else {
        // limit number
        state.selectedData = state.tableData
          .slice(0, multiSelectOptionJson.limitNumber);
      }

      state.showTableMultiSelectMenu = false;
    };

    const onTableRowSelect = () => {
      if (state.tableData.length === state.selectedData.length) {
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

      state.selectedData = [];
    };

    // lifecycle hook
    onMounted(() => {
      onFetchRecords();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      isTableEmpty,
      tableColumns,
      selectedDataLength,
      primaryDarkenColor,
      tablePaginationLabel,

      // methods
      onRequest,
      onSearchInput,
      onFetchRecords,
      onSuccessfulAdd,
      onRequestDelete,
      onDeleteSuccess,
      updateMultiSelect,
      onTableRowSelect,
      resetTableMultiSelect,
      formatDateTimeWithYear,

      // HARDCODED
      SUPPRESSION_TYPE,
    };
  },
});
</script>

<style lang="scss" scoped>
.suppress-list-settings {
  width: 100%;
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;

  // header
  .settings-section-header {
    padding-bottom: 0px !important;
    border-bottom: 0px !important;

    .settings-header-right-side {
      :deep(.plain-down-arrow-icon) {
        width: 8px;
        @include svg-icon-stroke('path', $white);
        transition: transform 0.3s;

        path {
          stroke-width: 1.2px;
        }

        &.rotate-180 {
          transform: rotate(180deg);
        }
      }
    }
  }

  .settings-section-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .table-filter-options {
      padding-bottom: 24px;

      .search-filter-input {
        min-width: 260px;
        width: fit-content;

        @media (max-width: $breakpoint-xs-max) {
          min-width: 200px;
        }
      }
    }
  }
}
</style>
