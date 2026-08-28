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
      <div class="import-history-filters-section">
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
          <!-- Header Slots -->
          <template #header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :class="`col-${col.name}`"
              >
                <div class="flex no-wrap items-center">
                  {{ col.label }}
                </div>
              </q-th>
            </q-tr>
          </template>

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
                    {{ props.row.csv_filename || 'mailboxes.csv' }}
                  </div>

                  <div class="file-subtitle-text ellipsis">
                    {{ getFileSubtitle(props.row) }}
                  </div>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Total Mailboxes Column -->
          <template v-slot:body-cell-total_records="props">
            <q-td :props="props">
              <div class="flex no-wrap items-center count-cell-content">
                <LocalSvgIcon
                  image="mail"
                  classes="metric-icon mail-icon"
                />

                <span class="count-value">
                  {{ getNumeralAmount(props.row.total_records) }}
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
                  classes="metric-icon imported-icon"
                />

                <span class="count-value">
                  {{ getNumeralAmount(props.row.successful_records) }}
                </span>
              </div>
            </q-td>
          </template>

          <!-- Failed Column -->
          <template v-slot:body-cell-failed_records="props">
            <q-td :props="props">
              <div class="flex no-wrap items-center justify-between failed-cell-container">
                <div class="flex no-wrap items-center count-cell-content">
                  <LocalSvgIcon
                    image="seq-bounced"
                    classes="metric-icon failed-icon"

                    v-if="props.row.failed_records"
                  />

                  <span class="count-value">
                    {{ props.row.failed_records ?
                      getNumeralAmount(props.row.failed_records) : '-' }}
                  </span>
                </div>

                <!-- Download Failed button -->
                <q-btn
                  v-if="props.row.failed_records > 0"

                  flat
                  round
                  dense
                  class="download-failed-btn"
                  :loading="loaders.downloadingJobId === props.row.id"
                  @click.stop="downloadFailedRecords(props.row)"
                >
                  <LocalSvgIcon
                    image="download"
                    classes="download-icon"
                  />

                  <AppTooltip
                    content="Download Failed Mailboxes"
                  />
                </q-btn>
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

          <!-- No Data slot -->
          <template v-slot:no-data>
            <div class="full-width text-center q-pa-lg text-grey">
              No bulk import history found.
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

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import AppTooltip from 'components/General/AppTooltip.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// api
import { getBulkImportJobs, getSmtpBulkImportJob } from 'src/utils/domainMailboxesApi.js';

// utils
import { formatDate1 } from 'src/utils/dates';
import { getNumeralAmount } from 'src/utils/numbers';
import { exportFailedMailboxesCsv } from 'src/utils/csvHelpers';

// constants
import { DEFAULT_TABLE_PAGINATION } from 'boot/constants';

// constant
const tableFilters = {
  searchText: '',
};

export default defineComponent({
  name: 'BulkImportHistory',

  components: {
    ApiLoader,
    AppTooltip,
    AppSearchInput,
  },

  setup() {
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      loaders: {
        isFetchApi: false,
        downloadingJobId: null,
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
        field: 'csv_filename',
      },
      {
        name: 'status',
        label: 'Status',
        align: 'left',
        field: 'status',
      },
      {
        name: 'total_records',
        label: 'Total Mailboxes',
        align: 'left',
        field: 'total_records',
      },
      {
        name: 'successful_records',
        label: 'Imported',
        align: 'left',
        field: 'successful_records',
      },
      {
        name: 'failed_records',
        label: 'Failed',
        align: 'left',
        field: 'failed_records',
      },
    ];

    const tablePaginationLabel = computed(() => {
      const {
        page = 1, perPage = 20, rowsPerPage = 20, rowsNumber = 0,
      } = state.tableState.pagination;
      const currentPerPage = perPage || rowsPerPage || 20;
      if (!rowsNumber) return '0 of 0';
      const start = (page - 1) * currentPerPage + 1;
      const end = Math.min(page * currentPerPage, rowsNumber);
      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    const getFileSubtitle = (row) => {
      const dateFormatted = row.created_at ? formatDate1(row.created_at) : '';
      // const author = row.created_by || row.user_name || row.author || '';

      // if (author && dateFormatted) {
      //   return `By ${author} • ${dateFormatted}`;
      // }
      // if (author) {
      //   return `By ${author}`;
      // }
      return dateFormatted || '-';
    };

    // API calls
    const fetchData = async (page = 1, perPage = 20) => {
      try {
        state.loaders.isFetchApi = true;

        const params = {
          limit: perPage,
          offset: (page - 1) * perPage,
        };

        if (state.tableState.filters.searchText) {
          params.search_text = state.tableState.filters.searchText;
        }

        const response = await getBulkImportJobs(params);
        const { data, count } = response || {};

        state.tableState.data = [
          ...data,
        ];

        state.tableState.pagination.rowsNumber = count || 0;
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occurred. Unable to fetch bulk import history.',
        });
      } finally {
        state.loaders.isFetchApi = false;
      }
    };

    const onRequest = async (params) => {
      state.tableState.pagination.page = params.pagination.page;
      state.tableState.pagination.perPage = params.pagination.rowsPerPage;
      state.tableState.pagination.rowsPerPage = params.pagination.rowsPerPage;

      await fetchData(
        state.tableState.pagination.page,
        state.tableState.pagination.perPage,
      );

      if (!state.tableState.areResultsFetchedOnce) {
        state.tableState.areResultsFetchedOnce = true;
      }
    };

    const onFetchData = () => {
      onRequest({
        pagination: state.tableState.pagination,
      });
    };

    const onSearchInput = () => {
      state.tableState.filters.searchText = state.tableState.filters.searchText?.trim();
      state.tableState.pagination.page = 1;
      onFetchData();
    };

    const downloadFailedRecords = async (row) => {
      try {
        state.loaders.downloadingJobId = row.id;

        const response = await getSmtpBulkImportJob(row.id);
        const logs = response?.logs || [];

        if (!logs.length) {
          appContext.config.globalProperties.$toast({
            warning: true,
            message: 'No failed records log found for this import.',
          });
          return;
        }

        exportFailedMailboxesCsv({
          filename: row.csv_filename || 'mailboxes.csv',
          logs,
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unable to download failed mailboxes.',
        });
      } finally {
        state.loaders.downloadingJobId = null;
      }
    };

    const getStatusLabel = (status = '') => {
      if (!status) return '-';
      const lower = status.toLowerCase();
      if (lower === 'pending') return 'Pending';
      if (lower === 'completed') return 'Completed';
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const onSyncJobStatus = async (row) => {
      try {
        state.loaders.syncingJobId = row.id;

        const response = await getSmtpBulkImportJob(row.id);
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
            message: 'Sync status updated successfully.',
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
      onSyncJobStatus,
      getFileSubtitle,
      getNumeralAmount,
      downloadFailedRecords,
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

    .table-wrapper {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: auto;
    }

    .import-history-table {
      .file-cell-content {
        gap: 12px;

        .csv-file-icon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
        }

        .file-text-details {
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

        :deep(.metric-icon) {
          width: 16px;
          height: 16px;
          flex-shrink: 0;

          &.mail-icon {
            @include svg-icon-stroke('path, rect', $grey);
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
        }
      }

      .failed-cell-container {
        width: 100%;
        gap: 12px;

        .download-failed-btn {
          width: 28px;
          height: 28px;
          border: 1px solid $blue-grey;
          border-radius: 6px;

          :deep(.download-icon) {
            width: 14px;
            height: 14px;

            @include svg-icon-stroke('path, circle', $grey);
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
          min-width: 90px;

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
          min-height: unset;
          min-width: unset;
          height: 24px;
          width: 24px;
          border-radius: 6px;
          border: 1px solid $blue-grey;

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
