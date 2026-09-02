<template>
  <q-card flat class="app-modal-card import-history-card">
    <!-- header -->
    <div class="app-modal-header">
      <!-- header text -->
      <h4 class="modal-header-text">
        Import History
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

    <!-- Content -->
    <div class="app-modal-content custom-scrollbar">
      <!-- Filters -->
      <div
        class="import-history-filters-section"
      >
        <AppSearchInput
          :debounce="500"
          v-model="tableState.filters.searchText"
          class="dead-small history-search-input"
          placeholder="Search CSV file"
          @update:modelValue="onSearchInput"
        />
      </div>

      <!-- Table Container -->
      <div class="table-wrapper">
        <ApiLoader
          :show="true"
          v-if="showApiLoader"
        />

        <q-table
          v-else
          virtual-scroll
          v-model:pagination="tableState.pagination"
          separator="cell"
          class="app-table import-history-table app-paginated-table app-table-rows-fixed"
          :rows="tableState.data"
          :columns="tableColumns"
          :loading="loaders.isFetchApi"
          @request="onRequest"
        >
          <!-- CSV File Column -->
          <template v-slot:body-cell-csv_file="props">
            <q-td :props="props">
              <div class="flex no-wrap items-center file-cell-content">
                <LocalSvgIcon
                  image="csv"
                  classes="csv-file-icon"
                />

                <div class="file-text-details">
                  <div class="file-name-text ellipsis">
                    {{ props.row.source_file_name || 'contacts.csv' }}
                  </div>

                  <div class="file-subtitle-text ellipsis">
                    {{ getFileSubtitle(props.row) }}
                  </div>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Status Column -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <div class="flex no-wrap items-center status-cell-container">
                <div
                  class="status-badge-pill"
                  :class="`status-${(props.row.status || '').toLowerCase()}`"
                >
                  {{ getStatusLabel(props.row.status) }}
                </div>

                <!-- Sync button for pending status -->
                <q-btn
                  v-if="(props.row.status || '').toLowerCase() === 'pending'"
                  flat
                  round
                  dense
                  class="sync-btn"
                  :disable="loaders.syncingJobId === props.row.id"
                  :class="{ 'is-syncing': loaders.syncingJobId === props.row.id }"
                  @click.stop="onSyncJobStatus(props.row)"
                >
                  <LocalSvgIcon
                    image="sync"
                    classes="sync-icon"
                  />

                  <AppTooltip
                    content="Sync Status"
                  />
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- Total Contacts Column -->
          <template v-slot:body-cell-total_records="props">
            <q-td :props="props">
              <div class="flex no-wrap items-center count-cell-content">
                <LocalSvgIcon
                  image="people"
                  class="metric-icon total-icon"
                />

                <span class="count-value">
                  {{ getNumeralAmount(props.row.total_rows) }}
                </span>
              </div>
            </q-td>
          </template>

          <!-- Imported Column -->
          <template v-slot:body-cell-successful_records="props">
            <q-td :props="props">
              <div class="flex no-wrap items-center count-cell-content">
                <LocalSvgIcon
                  image="circle-tick"
                  class="metric-icon imported-icon"
                />

                <span class="count-value">
                  {{ getNumeralAmount(props.row.valid_count) }}
                </span>
              </div>
            </q-td>
          </template>

          <!-- Failed Column -->
          <template v-slot:body-cell-failed_records="props">
            <q-td :props="props">
              <div class="flex no-wrap items-center count-cell-content">
                <template v-if="getFailedCount(props.row) > 0">
                  <LocalSvgIcon
                    image="seq-bounced"
                    class="metric-icon failed-icon"
                  />

                  <span class="count-value">
                    {{ getNumeralAmount(getFailedCount(props.row)) }}
                  </span>

                  <InfoTooltip
                    iconName="info-circle"
                    :tooltipText="getFailedTooltipContent(props.row)"
                    class="failed-info-tooltip"
                  />
                </template>

                <span v-else class="count-value muted-text">
                  -
                </span>
              </div>
            </q-td>
          </template>

          <!-- bottom pagination slot -->
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
                  @update:model-value="onFetchData"
                  class="records-per-page-select"
                />

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
                  <LocalSvgIcon
                    image="plain-down-arrow"
                    classes="pagination-icon left-arrow"
                  />
                </q-btn>

                <!-- pagination label -->
                <p class="pagination-label-text">
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
                  <LocalSvgIcon
                    image="plain-down-arrow"
                    classes="pagination-icon right-arrow"
                  />
                </q-btn>
              </div>
            </div>
          </template>

          <!-- no data -->
          <template v-slot:no-data>
            <div class="full-width flex flex-center q-pa-lg text-grey">
              No import history found
            </div>
          </template>
        </q-table>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, getCurrentInstance,
} from 'vue';

// utils
import { getListImportJobs, getListImportJobById } from 'src/utils/listsApi';
import { formatDate1 } from 'src/utils/dates';
import { getNumeralAmount } from 'src/utils/numbers';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import AppTooltip from 'components/General/AppTooltip.vue';
import InfoTooltip from 'components/General/InfoTooltip.vue';
import AppSearchInput from 'src/components/Input/AppSearchInput.vue';

// constants
const DEFAULT_TABLE_PAGINATION = {
  page: 1,
  sortBy: null,
  descending: false,
  rowsPerPage: 20,
  rowsNumber: 0,
};

const tableFilters = {
  searchText: '',
};

export default defineComponent({
  name: 'ContactImportHistory',

  components: {
    ApiLoader,
    AppTooltip,
    InfoTooltip,
    AppSearchInput,
  },

  props: {
    listId: {
      type: [Number, String],
      required: true,
    },
  },

  setup(props) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      loaders: {
        isFetchApi: false,
        syncingJobId: null,
      },

      tableState: {
        data: [],
        filters: { ...tableFilters },
        pagination: { ...DEFAULT_TABLE_PAGINATION },
        areResultsFetchedOnce: false,
      },
    });

    const showApiLoader = computed(() => {
      if (state.tableState.areResultsFetchedOnce) {
        return false;
      }
      return state.loaders.isFetchApi;
    });

    const tableColumns = [
      {
        name: 'csv_file',
        label: 'CSV File',
        align: 'left',
        field: 'source_file_name',
      },
      {
        name: 'status',
        label: 'Status',
        align: 'left',
        field: 'status',
      },
      {
        name: 'total_records',
        label: 'Total Contacts',
        align: 'left',
        field: 'total_rows',
      },
      {
        name: 'successful_records',
        label: 'Imported',
        align: 'left',
        field: 'valid_count',
      },
      {
        name: 'failed_records',
        label: 'Failed',
        align: 'left',
        field: 'failed_records',
      },
    ];

    const tablePaginationLabel = computed(() => {
      const { page, rowsPerPage, rowsNumber } = state.tableState.pagination;
      if (!rowsNumber) return '0 of 0';

      const start = (page - 1) * rowsPerPage + 1;
      const end = Math.min(page * rowsPerPage, rowsNumber);
      return `${start} to ${end} of ${rowsNumber}`;
    });

    // methods
    const onFetchData = async () => {
      try {
        state.loaders.isFetchApi = true;

        const { page, rowsPerPage } = state.tableState.pagination;
        const offset = (page - 1) * rowsPerPage;

        const params = {
          limit: rowsPerPage,
          offset,
          ...(state.tableState.filters.searchText
            ? { search_text: state.tableState.filters.searchText }
            : {}),
        };

        const response = await getListImportJobs(props.listId, params);

        const data = response?.data || [];
        const count = response?.count || 0;

        state.tableState.data = data;
        state.tableState.pagination.rowsNumber = count;
        state.tableState.areResultsFetchedOnce = true;
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to fetch import history.',
        });
      } finally {
        state.loaders.isFetchApi = false;
      }
    };

    const onRequest = (propsData) => {
      const { pagination } = propsData;
      state.tableState.pagination.page = pagination.page;
      state.tableState.pagination.rowsPerPage = pagination.rowsPerPage;
      onFetchData();
    };

    const onSearchInput = () => {
      state.tableState.pagination.page = 1;
      onFetchData();
    };

    const getFileSubtitle = (row = {}) => {
      const dateToFormat = row.started_at || row.created_at || row.completed_at;
      if (!dateToFormat) return '';
      return formatDate1(dateToFormat);
    };

    const getStatusLabel = (status = '') => {
      if (!status) return '-';
      const lower = status.toLowerCase();
      if (lower === 'pending') return 'Pending';
      if (lower === 'completed') return 'Completed';
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const getFailedCount = (row = {}) => (row.invalid_count || 0)
      + (row.bounced_count || 0)
      + (row.blocked_count || 0)
      + (row.duplicate_count || 0)
      + (row.unsubscribed_count || 0)
      + (row.already_existing_count || 0);

    const getFailedTooltipContent = (row = {}) => {
      const items = [];
      if (row.invalid_count) {
        items.push(`<div>Invalid: <b>${getNumeralAmount(row.invalid_count)}</b></div>`);
      }
      if (row.duplicate_count) {
        items.push(`<div>Duplicate: <b>${getNumeralAmount(row.duplicate_count)}</b></div>`);
      }
      if (row.bounced_count) {
        items.push(`<div>Bounced: <b>${getNumeralAmount(row.bounced_count)}</b></div>`);
      }
      if (row.blocked_count) {
        items.push(`<div>Blocked: <b>${getNumeralAmount(row.blocked_count)}</b></div>`);
      }
      if (row.unsubscribed_count) {
        items.push(`<div>Unsubscribed: <b>${getNumeralAmount(row.unsubscribed_count)}</b></div>`);
      }
      if (row.already_existing_count) {
        items.push(`<div>Already Existing: <b>${getNumeralAmount(row.already_existing_count)}</b></div>`);
      }

      if (!items.length) return 'No failure details available';
      return `<div style="text-align: left; line-height: 1.6;">${items.join('')}</div>`;
    };

    const onSyncJobStatus = async (row) => {
      try {
        state.loaders.syncingJobId = row.id;

        const response = await getListImportJobById(props.listId, row.id);

        if (response) {
          const index = state.tableState.data.findIndex((item) => item.id === row.id);
          if (index !== -1) {
            state.tableState.data[index] = {
              ...state.tableState.data[index],
              ...response,
            };
          }
          appContext.config.globalProperties.$toast({
            success: true,
            message: 'Status updated successfully.',
          });
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unable to sync job status.',
        });
      } finally {
        state.loaders.syncingJobId = null;
      }
    };

    // lifecycle hook
    onMounted(() => {
      onFetchData();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      showApiLoader,
      tableColumns,
      tablePaginationLabel,

      // methods
      onRequest,
      onFetchData,
      onSearchInput,
      getStatusLabel,
      getFailedCount,
      getFailedTooltipContent,
      onSyncJobStatus,
      getFileSubtitle,
      getNumeralAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
.import-history-card {
  position: relative;
  max-width: 740px;
  display: flex;
  flex-direction: column;
  flex: 1;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 740px;
    min-height: 100%;

    display: flex;
    flex-direction: column;
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  @media (min-width: 601px) and (max-width: 745px) {
    width: calc(100vw - 32px);
  }

  .app-modal-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;

    .import-history-filters-section {
      padding: 16px 20px;

      .history-search-input {
        max-width: 280px;
      }
    }
  }

  .table-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: auto;

    :deep(.import-history-table) {
      .col-csv_file {
        min-width: 180px;
      }

      .col-status {
        width: 130px;
      }

      .col-total_records {
        width: 130px;
      }

      .col-successful_records {
        width: 120px;
      }

      .col-failed_records {
        width: 120px;
      }

      .file-cell-content {
        gap: 12px;

        .csv-file-icon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
        }

        .file-text-details {
          display: flex;
          flex-direction: column;
          min-width: 0;

          .file-name-text {
            color: $black;
            font-size: 13px;
            font-weight: 500;
          }

          .file-subtitle-text {
            color: $grey-400;
            font-size: 12px;
            font-weight: 400;
            line-height: 16px;

            margin-top: 4px;
          }
        }
      }

      .count-cell-content {
        gap: 8px;

        .metric-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;

          &.total-icon {
            @include svg-icon-stroke('path, circle', $grey);
          }

          &.imported-icon {
            @include svg-icon-stroke('path, circle', $positive);
          }

          &.failed-icon {
            @include svg-icon-fill('path', $negative);

            circle {
              &:first-child {
                stroke: $negative;
              }

              &:last-child {
                fill: $negative;
              }
            }
          }
        }

        .count-value {
          color: $black;
          font-size: 14px;

          &.muted-text {
            color: $grey-400;
          }
        }
      }

      .status-cell-container {
        gap: 8px;

        .status-badge-pill {
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 500;
          display: inline-flex;
          width: fit-content;
          align-items: center;
          justify-content: center;
          line-height: 16px;

          &.status-pending {
            background: rgba(var(--warning-rgb), 0.12);
            color: $warning;
          }

          &.status-completed {
            background: rgba(var(--positive-rgb), 0.12);
            color: $positive;
          }
        }

        .sync-btn {
          width: 26px;
          height: 26px;
          border: 1px solid $blue-grey;
          border-radius: 6px;

          :deep(.sync-icon) {
            width: 13px;
            height: 13px;

            @include svg-icon-stroke('path, circle', $grey);
          }

          &.is-syncing {
            :deep(.sync-icon) {
              animation: rotateForever 1s linear infinite;
            }
          }
        }
      }
    }
  }
}
</style>
