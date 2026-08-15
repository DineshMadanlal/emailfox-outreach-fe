<template>
  <div class="reply-categories-table-wrapper">
    <!-- Edit Category -->
    <q-dialog
      v-model="modals.showSaveReplyCategoryModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveReplyCategory
        :editReplyCategoryJson="editReplyCategoryJson"
        @existingReplyCategoryUpdated="onExistingReplyCategoryUpdated"
      />
    </q-dialog>

    <!-- Delete Reply Category -->
    <q-dialog
      v-model="modals.showDeleteReplyCategoryModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteReplyCategory
        :editReplyCategoryJson="editReplyCategoryJson"
        @onSuccessfulDelete="onSuccessfulReplyCategoryDelete"
      />
    </q-dialog>

    <!-- Loader -->
    <ApiLoader
      :show="true"

      v-if="showApiLoader"
    />

    <!-- Table Container -->
    <div
      v-else
      class="reply-categories-table-container"
    >
      <!-- Show loader when the API is processing -->
      <ApiLoader
        :show="showApiLoader"
      />

      <!-- Filters -->
      <div
        class="reply-categories-table-filters-section"
      >
        <!-- search input -->
        <AppSearchInput
          :debounce="500"
          v-model="tableState.filters.searchText"

          class="search-filter-input"
          moreClasses="dead-small"
          placeholder="Search reply category"

          @update:modelValue="onSearchText"
        />
      </div>

      <!-- Table -->
      <q-table
        virtual-scroll
        v-model:pagination="tableState.pagination"

        separator="cell"
        class="app-table all-reply-categories-table app-table-rows-fixed app-paginated-table"

        :rows="tableState.data"
        :columns="tableColumns"
        :loading="loaders.isFetchApi"

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
                v-model="tableState.pagination.rowsPerPage"

                @update:model-value="onFetchReplyCategoryRecords"

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

        <!-- content -->
        <!-- name -->
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div class="name-and-action-cell">
              <div class="name-text">
                {{ props.row.name }}
              </div>

              <q-space />

              <q-btn
                dense
                outlined
                unelevated

                class="more-action-btn"

                v-if="props.row.workspace_id"
              >
                <!-- more -->
                <LocalSvgIcon
                  image="more"
                  classes="more-menu-icon"
                />

                <ReplyCategoryMoreOptions
                  :tableRow="props.row"

                  @editReplyCategory="onEditReplyCategory"
                  @deleteReplyCategory="onDeleteReplyCategory"
                  @updateReplyCategoryStatus="onUpdateReplyCategoryStatus"
                />
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- sentiment -->
        <template v-slot:body-cell-sentiment="props">
          <q-td :props="props">
            <div
              class="flex no-wrap items-center"
            >
              <div
                :style="{
                  minWidth: '12px', maxWidth: '12px',
                  minHeight: '12px', maxHeight: '12px',
                  borderRadius: '50%',
                  backgroundColor: `var(--${REPLY_SENTIMENT[
                    props.row.sentiment].color || 'positive'}-color)`,
                }"
              />

              <div class="q-ml-sm">
                {{ props.row.sentiment }}
              </div>
            </div>
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <div
              class="status-text"
              :class="props.row.is_active ? 'active-status' : 'inactive-status'"
            >
              {{ props.row.is_active ? 'Active' : 'Inactive' }}
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
// lodash
import { isEmpty } from 'lodash';

// vue
import {
  defineComponent, reactive, toRefs, onMounted, getCurrentInstance, computed,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import ReplyCategoryMoreOptions from 'components/Menu/ReplyCategoryMoreOptions.vue';
import SaveReplyCategory from 'components/ReplyCategorization/Modals/SaveReplyCategory.vue';
import DeleteReplyCategory from 'components/ReplyCategorization/Modals/DeleteReplyCategory.vue';

// Import the pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Utils
import { getNumeralAmount } from 'src/utils/numbers';
import { getApiCall, patchApiCall } from 'src/utils/apiRequests.js';

// constants
import { DEFAULT_TABLE_PAGINATION } from 'src/boot/constants';
import { REPLY_SENTIMENT } from 'src/boot/campaign-constants';

// hardcoded
const replyCategorizationFilters = {
  searchText: '',
};

export default defineComponent({
  name: 'ReplyCategoriesTable',

  components: {
    ApiLoader,
    AppSearchInput,
    SaveReplyCategory,
    DeleteReplyCategory,
    ReplyCategoryMoreOptions,
  },

  setup() {
    // Composables
    const { isMobileDevice } = useAppHelpersApi();

    // store
    const userStore = useUserPreferencesStore();

    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      modals: {
        showSaveReplyCategoryModal: false,
        showDeleteReplyCategoryModal: false,
      },

      loaders: {
        isFetchApi: false,
      },

      tableState: {
        data: [],
        filters: { ...replyCategorizationFilters },
        pagination: { ...DEFAULT_TABLE_PAGINATION },

        areResultsFetchedOnce: false,
      },

      editReplyCategoryJson: {},
    });

    // Computed
    const showApiLoader = computed(() => {
      if (state.tableState.areResultsFetchedOnce) {
        return false;
      }

      return state.loaders.isFetchApi;
    });

    const tablePaginationLabel = computed(() => {
      const { page, perPage, rowsNumber } = state.tableState.pagination;

      const start = (page - 1) * perPage + 1;
      const end = page * perPage;

      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    const tableColumns = computed(() => {
      const columns = [
        {
          name: 'name',
          label: 'Name',
          field: 'name',
          align: 'left',
        },
        {
          name: 'sentiment',
          label: 'Sentiment',
          field: 'sentiment',
          align: 'left',
        },
        // status
        {
          name: 'status',
          label: 'Status',
          align: 'left',
        },
      ];

      return columns;
    });

    // methods
    const updateDataToStore = (inputObject) => {
      userStore.setMultipleFields({
        replyCategorizationState: {
          ...userStore.replyCategorizationState,
          ...inputObject,
        },
      });
    };

    const onEditReplyCategory = (replyCategoryJson) => {
      state.editReplyCategoryJson = replyCategoryJson;
      state.modals.showSaveReplyCategoryModal = true;
    };

    const onDeleteReplyCategory = (replyCategoryJson) => {
      state.editReplyCategoryJson = replyCategoryJson;
      state.modals.showDeleteReplyCategoryModal = true;
    };

    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.loaders.isFetchApi = true;

        const params = {
          offset: (page - 1) * perPage,
          limit: perPage,
        };

        if (state.tableState.filters.searchText) {
          params.search_text = state.tableState.filters.searchText;
        }

        const response = await getApiCall({
          params,
          endpoint: '/reply-categories',
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

    const onSuccessfulReplyCategoryDelete = () => {
      state.modals.showDeleteReplyCategoryModal = false;

      // remove the deleted reply category from the table data
      const updatedTableData = state.tableState.data.filter(
        (replyCategory) => replyCategory.id !== state.editReplyCategoryJson.id,
      );
      state.tableState.data = [...updatedTableData];
      state.tableState.pagination.rowsNumber -= 1;

      // update the store
      updateDataToStore({
        tableData: updatedTableData,
        pagination: state.tableState.pagination,
      });
    };

    const onExistingReplyCategoryUpdated = (payload) => {
      state.modals.showSaveReplyCategoryModal = false;

      // update the table data with the updated reply category
      const updatedTableData = state.tableState.data.map((replyCategory) => {
        if (replyCategory.id === state.editReplyCategoryJson.id) {
          return {
            ...state.editReplyCategoryJson,
            ...payload,
          };
        }
        return replyCategory;
      }) || [];

      state.tableState.data = [...updatedTableData];

      // update the store
      updateDataToStore({
        tableData: updatedTableData,
      });
    };

    const onFetchReplyCategoryRecords = () => {
      onRequest({
        pagination: state.tableState.pagination,
      });
    };

    const onSearchText = (searchText) => {
      state.tableState.filters.searchText = searchText?.trim();

      onFetchReplyCategoryRecords();
    };

    const onUpdateReplyCategoryStatus = async (tableRow) => {
      try {
        //
        onExistingReplyCategoryUpdated({
          ...tableRow,
          is_active: !tableRow.is_active,
        });

        await patchApiCall({
          includeWorkspace: true,
          endpoint: `/reply-categories/${tableRow.id}/status`,
          payload: {
            is_active: !tableRow.is_active,
          },
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });

        // revert the change in the table data
        onExistingReplyCategoryUpdated({
          ...tableRow,
          is_active: tableRow.is_active,
        });
      }
    };

    const makeApiCallOnMounted = () => {
      const {
        tableData, filters, pagination,
      } = userStore.replyCategorizationState || {};

      state.tableState.data = tableData || [];
      state.tableState.filters = filters || { ...replyCategorizationFilters };
      state.tableState.pagination = pagination || DEFAULT_TABLE_PAGINATION;

      state.tableState.areResultsFetchedOnce = !isEmpty(tableData);

      onRequest({
        pagination: state.tableState.pagination,
      });
    };

    // lifecycle hook
    onMounted(() => {
      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      tableColumns,
      showApiLoader,
      tablePaginationLabel,

      // methods
      onRequest,
      onSearchText,
      onEditReplyCategory,
      onDeleteReplyCategory,
      onUpdateReplyCategoryStatus,
      onFetchReplyCategoryRecords,
      onExistingReplyCategoryUpdated,
      onSuccessfulReplyCategoryDelete,

      // hardcoded
      REPLY_SENTIMENT,
    };
  },
});
</script>

<style lang="scss" scoped>
.reply-categories-table-wrapper {
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;

  position: relative;

  .reply-categories-table-container {
    width: 100%;
    position: relative;
    min-height: 0;

    display: flex;
    flex-direction: column;

    .reply-categories-table-filters-section {
      gap: 12px;
      display: flex;
      align-items: center;

      flex-wrap: wrap;
      margin-bottom: 16px;

      .search-filter-input {
        min-width: 260px;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          min-width: 200px;
        }
      }
    }

    :deep(.all-reply-categories-table) {
      min-height: 0;
      color: $black;
      border: 0px;

      // sm min
      @media (min-width: $breakpoint-sm-min) {
        thead tr th, tbody tr td {
          border-right: 0;
        }
      }

      .name-and-action-cell {
        display: flex;
        gap: 16px;
        align-items: center;

        .more-action-btn {
          .more-menu-icon {
            transform: rotate(90deg);
          }
        }
      }

      .status-text {
        width: fit-content;
        border-radius: 4px;

        padding: 0px 6px;

        font-size: 12px;
        font-weight: 500;
        line-height: 14px;

        &.active-status {
          color: $positive;
          background-color: rgba($color: var(--positive-rgb), $alpha: 0.1);
        }

        &.inactive-status {
          color: $negative;
          background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);
        }
      }
    }
  }
}
</style>
