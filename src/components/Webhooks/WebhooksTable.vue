<template>
  <div class="webhooks-table-wrapper">
    <!-- Edit Webhook -->
    <q-dialog
      v-model="modals.showSaveWebhookModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveWebhook
        :editWebhookJson="editWebhookJson"
        @existingWebhookUpdated="onExistingWebhookUpdated"
      />
    </q-dialog>

    <!-- Delete Webhook -->
    <q-dialog
      v-model="modals.showDeleteWebhookModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteWebhook
        :editWebhookJson="editWebhookJson"
        @onSuccessfulDelete="onSuccessfulWebhookDelete"
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
      class="webhooks-table-container"
    >
      <!-- Show loader when the API is processing -->
      <ApiLoader
        :show="showApiLoader"

        v-if="!showWebhookIllustration"
      />

      <!-- Illustration -->
      <WebhooksIllustration
        v-if="showWebhookIllustration"

        @onAddNewWebhook="$emit('onCreateNewWebhook')"
      />

      <!-- Filters -->
      <div
        v-else
        class="webhooks-table-filters-section"
      >
        <!-- search input -->
        <AppSearchInput
          :debounce="500"
          v-model="tableState.filters.searchText"

          class="search-filter-input"
          moreClasses="dead-small"
          placeholder="Search webhook by name"

          @update:modelValue="onSearchText"
        />
      </div>

      <!-- Table -->
      <q-table
        virtual-scroll

        v-if="!showWebhookIllustration"
        v-model:pagination="tableState.pagination"

        separator="cell"
        class="app-table all-webhooks-table app-table-rows-fixed app-paginated-table"

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

                @update:model-value="onFetchWebhookRecords"

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
              >
                <!-- more -->
                <LocalSvgIcon
                  image="more"
                  classes="more-menu-icon"
                />

                <WebhookMoreOptions
                  :tableRow="props.row"
                  @editWebhook="onEditWebhook"
                  @deleteWebhook="onDeleteWebhook"
                  @updateWebhookStatus="onUpdateWebhookStatus"
                />
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- event_types -->
        <template v-slot:body-cell-event_types="props">
          <q-td :props="props">
            <div
              :title="props.row.event_types.join(', ')"
            >
              {{ props.row.event_types?.length }}
            </div>
          </q-td>
        </template>

        <!-- last_delivery_at -->
        <template v-slot:body-cell-last_delivery_at="props">
          <q-td :props="props">
            <div v-if="props.row.last_delivery_at">
              {{ formatDateWithTime(props.row.last_delivery_at) }}
            </div>

            <div v-else>
              -
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
import SaveWebhook from 'components/Webhooks/Modals/SaveWebhook.vue';
import WebhookMoreOptions from 'components/Menu/WebhookMoreOptions.vue';
import DeleteWebhook from 'components/Webhooks/Modals/DeleteWebhook.vue';
import WebhooksIllustration from 'components/Illustrations/AllWebhooks.vue';

import AppSearchInput from 'components/Input/AppSearchInput.vue';

// Import the pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Utils
import { getNumeralAmount } from 'src/utils/numbers';
import { formatDateWithTime } from 'src/utils/dates';
import { getApiCall, patchApiCall } from 'src/utils/apiRequests.js';

// constants
import { DEFAULT_TABLE_PAGINATION } from 'src/boot/constants';

// hardcoded
const webhookFilters = {
  searchText: '',
};

export default defineComponent({
  name: 'WebhooksTable',

  emits: ['onCreateNewWebhook'],

  components: {
    ApiLoader,
    SaveWebhook,
    DeleteWebhook,
    AppSearchInput,
    WebhooksIllustration,
    WebhookMoreOptions,
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
        showSaveWebhookModal: false,
        showDeleteWebhookModal: false,
      },

      loaders: {
        isFetchApi: false,
      },

      tableState: {
        data: [],
        filters: { ...webhookFilters },
        pagination: { ...DEFAULT_TABLE_PAGINATION },

        areResultsFetchedOnce: false,
      },

      editWebhookJson: {},
    });

    // Computed
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

    const showWebhookIllustration = computed(() => {
      if (state.loaders.isFetchApi
        || !state.tableState.areResultsFetchedOnce || isFilterApplied.value) {
        return false;
      }

      return state.tableState.pagination.rowsNumber === 0;
    });

    const showWebhookFilters = computed(() => {
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

    const tableColumns = computed(() => {
      const columns = [
        {
          name: 'name',
          label: 'Name',
          field: 'name',
          align: 'left',
        },
        {
          name: 'url',
          label: 'URL',
          field: 'url',
          align: 'left',
        },
        {
          name: 'event_types',
          label: 'Event Types',
          align: 'left',
        },
        // last delivery at
        {
          name: 'last_delivery_at',
          label: 'Last Delivery At',
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
        allWebhooksState: {
          ...userStore.allWebhooksState,
          ...inputObject,
        },
      });
    };

    const onEditWebhook = (webhookJson) => {
      state.editWebhookJson = webhookJson;
      state.modals.showSaveWebhookModal = true;
    };

    const onDeleteWebhook = (webhookJson) => {
      state.editWebhookJson = webhookJson;
      state.modals.showDeleteWebhookModal = true;
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
          endpoint: '/webhooks',
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

    const onSuccessfulWebhookDelete = () => {
      state.modals.showDeleteWebhookModal = false;

      // remove the deleted webhook from the table data
      const updatedTableData = state.tableState.data.filter(
        (webhook) => webhook.id !== state.editWebhookJson.id,
      );
      state.tableState.data = [...updatedTableData];
      state.tableState.pagination.rowsNumber -= 1;

      // update the store
      updateDataToStore({
        tableData: updatedTableData,
        pagination: state.tableState.pagination,
      });
    };

    const onExistingWebhookUpdated = (payload) => {
      state.modals.showSaveWebhookModal = false;

      // update the table data with the updated webhook
      const updatedTableData = state.tableState.data.map((webhook) => {
        if (webhook.id === state.editWebhookJson.id) {
          return {
            ...state.editWebhookJson,
            ...payload,
          };
        }
        return webhook;
      }) || [];

      state.tableState.data = [...updatedTableData];

      // update the store
      updateDataToStore({
        tableData: updatedTableData,
      });
    };

    const onFetchWebhookRecords = () => {
      onRequest({
        pagination: state.tableState.pagination,
      });
    };

    const onSearchText = (searchText) => {
      state.tableState.filters.searchText = searchText?.trim();

      onFetchWebhookRecords();
    };

    const onUpdateWebhookStatus = async (tableRow) => {
      try {
        //
        onExistingWebhookUpdated({
          ...tableRow,
          is_active: !tableRow.is_active,
        });

        await patchApiCall({
          includeWorkspace: true,
          endpoint: `/webhooks/${tableRow.id}/status`,
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
        onExistingWebhookUpdated({
          ...tableRow,
          is_active: tableRow.is_active,
        });
      }
    };

    const makeApiCallOnMounted = () => {
      const {
        tableData, filters, pagination,
      } = userStore.allWebhooksState || {};

      state.tableState.data = tableData || [];
      state.tableState.filters = filters || { ...webhookFilters };
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
      showWebhookFilters,
      tablePaginationLabel,
      showWebhookIllustration,

      // methods
      onRequest,
      onSearchText,
      onEditWebhook,
      onDeleteWebhook,
      onUpdateWebhookStatus,
      onFetchWebhookRecords,
      onExistingWebhookUpdated,
      onSuccessfulWebhookDelete,

      formatDateWithTime,
    };
  },
});
</script>

<style lang="scss" scoped>
.webhooks-table-wrapper {
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;

  position: relative;

  .webhooks-table-container {
    width: 100%;
    position: relative;
    min-height: 0;

    display: flex;
    flex-direction: column;

    .webhooks-table-filters-section {
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

    :deep(.all-webhooks-table) {
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
