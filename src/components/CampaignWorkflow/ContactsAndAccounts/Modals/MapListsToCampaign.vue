<template>
  <q-card
    flat
    class="map-lists-accounts-card app-modal-card custom-scrollbar"
  >
    <!-- Dialog -->
    <q-dialog
      v-model="modals.showImportListPreferencesModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ImportListPreferences
        @onSave="onSubmitForm"
      />
    </q-dialog>

    <!-- modal header -->
    <div class="app-modal-header">
      <!-- header text -->
      <h4 class="modal-header-text">
        Map Lists to Campaign
      </h4>

      <q-space />

      <!-- Close -->
      <q-btn
        flat
        round
        dense
        v-close-popup

        color="negative"
        class="app-negative-button"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <div class="app-modal-content">
      <!-- linkedin filters -->
      <div
        class="lists-filters-content"
      >
        <p class="add-lists-desc-text">
          Choose which lists to add to this campaign.
          Only lists that aren't already part of this campaign are shown.
        </p>

        <!-- search input -->
        <AppSearchInput
          :debounce="500"
          v-model="filters.searchText"

          class="lists-filter-input"
          moreClasses="dead-small"
          placeholder="Search list"

          @update:modelValue="onSearchInput"
        />
      </div>

      <!--  -->
      <q-table
        virtual-scroll
        v-model:pagination="pagination"

        separator="cell"
        selection="multiple"
        class="app-table select-lists-table app-paginated-table sticky-first-col"

        :rows="tableData"
        :columns="tableColumns"

        :loading="loaders.isFetchApi"

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
                v-model="pagination.rowsPerPage"

                @update:model-value="onFetchAccounts"

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
          <q-td
            :props="props"
          >
            <div class="lists-name-text">
              {{ props.row.name }}
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Save -->
      <q-btn
        no-caps
        unelevated

        label="Save"
        color="primary"
        @click="modals.showImportListPreferencesModal = true"

        :loading="loaders.isSaveApi"
        :disable="!selectedData.length"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  toRefs, reactive, defineComponent, computed, getCurrentInstance, onMounted,
} from 'vue';

// Components
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import TableMultiSelect from 'components/Menu/TableMultiSelect.vue';
import ImportListPreferences from 'components/CampaignWorkflow/ContactsAndAccounts/Modals/ImportListPreferences.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { getNumeralAmount } from 'src/utils/numbers';
import { getApiCall, postApiCall } from 'src/utils/apiRequests';

// constants

import { DEFAULT_TABLE_PAGINATION, TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';

// hardcoded
const filtersJson = {
  searchText: '',
};

export default defineComponent({
  name: 'MapListsToCampaign',

  emits: ['onListImported'],

  components: {
    AppSearchInput,
    TableMultiSelect,
    ImportListPreferences,
  },

  props: {
    campaignId: {
      type: [String, Number],
      required: true,
    },
  },

  setup(props, { emit }) {
    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      tableData: [],
      selectedData: [],

      loaders: {
        isFetchApi: false,
        isSaveApi: false,
      },

      modals: {
        showImportListPreferencesModal: false,
      },

      filters: {
        ...filtersJson,
      },

      // pagination
      pagination: {
        ...DEFAULT_TABLE_PAGINATION,
      },

      multiSelectOptionJson: {},
      showTableMultiSelectMenu: false,
    });

    // computed
    const tableColumns = computed(() => {
      const columns = [
        // name
        {
          name: 'name',
          label: 'Name',
          align: 'left',
        },
      ];

      return columns;
    });

    const tablePaginationLabel = computed(() => {
      const { page, perPage, rowsNumber } = state.pagination;

      const start = (page - 1) * perPage + 1;
      const end = page * perPage;

      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    // methods
    // API Calls
    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.loaders.isFetchApi = true;

        const params = {
          offset: (page - 1) * perPage,
          limit: perPage,
          seq_id_ne: props.campaignId,
        };

        // filters
        const {
          searchText,
        } = state.filters || {};

        // search text
        if (searchText) {
          params.search_text = searchText;
        }

        const response = await getApiCall({
          params,
          endpoint: '/lists',
          includeWorkspace: true,
        });

        const { data, count } = response;

        // table data
        state.tableData = [...data];

        state.selectedData = [];
        state.multiSelectOptionJson = {};

        state.pagination.rowsNumber = count;
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occured. Unable to fetch lists.',
        });
      } finally {
        state.loaders.isFetchApi = false;
      }
    };

    const onRequest = async (params) => {
      state.loaders.isFetchApi = true;

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

    const onFetchAccounts = () => {
      onRequest({
        pagination: state.pagination,
      });
    };

    const onTableRowSelect = () => {
      if (state.tableData.length === state.selectedData.length) {
        state.multiSelectOptionJson = {
          limit: state.tableData.length,
          selectedOption: TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST,
        };
      } else {
        state.multiSelectOptionJson = {};
      }
    };

    const resetTableMultiSelect = () => {
      state.multiSelectOptionJson = {};

      state.selectedData = [];
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

    const onSearchInput = async () => {
      // trim white spaces
      state.filters.searchText = state.filters.searchText?.trim();

      onFetchAccounts();
    };

    const onSubmitForm = async (preferences) => {
      try {
        // close the modal
        state.modals.showImportListPreferencesModal = false;

        state.loaders.isSaveApi = true;

        // account IDs
        const listIds = state.selectedData.map((account) => account.id);

        await postApiCall({
          payload: {
            list_ids: listIds,
            preferences,
          },
          includeWorkspace: true,
          endpoint: `sequences/${props.campaignId}/lists`,
        });

        emit('onListImported');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isSaveApi = false;
      }
    };

    // lifecycle hook
    onMounted(() => {
      onFetchAccounts();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      tableColumns,
      isMobileDevice,
      tablePaginationLabel,

      // methods
      onSubmitForm,
      onRequest,
      onSearchInput,
      updateMultiSelect,
      onTableRowSelect,
      resetTableMultiSelect,
      onFetchAccounts,
    };
  },
});
</script>

<style lang="scss" scoped>
.map-lists-accounts-card {
  position: relative;
  max-width: 600px;
  $modalHeaderHeight: 68px;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 600px;
    min-height: 100%;

    display: flex;
    flex-direction: column;
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  @media (min-width: 601px) and (max-width: 632px) {
    // For medium screens, we can set a specific width or use a percentage
    width: calc(100vw - 32px);
  }

  .app-modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 0px;

    .lists-filters-content {
      width: 100%;
      padding: 20px;

      display: flex;
      flex-direction: column;
      gap: 12px;

      .add-lists-desc-text {
        color: $grey;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;

        max-width: 520px;
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 20px 12px;
      }
    }

    .select-lists-table {
      .lists-name-text {
        color: $black;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}
</style>
