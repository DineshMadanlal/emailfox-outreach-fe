<template>
  <div class="bulk-import-logs-table-container">
    <!-- Tabs -->
    <q-tabs
      dense
      narrow-indicator
      :breakpoint="0"
      align="left"
      class="app-tabs bulk-import-tabs"
      active-color="primary"
      indicator-color="primary"
      v-model="selectedTab"
      @update:model-value="onTabChange"
    >
      <q-tab
        no-caps
        name="all"
      >
        <p class="tab-label-text">
          All Mailboxes ({{ getNumeralAmount(totalCount) }})
        </p>
      </q-tab>

      <q-tab
        no-caps
        name="imported"
      >
        <p class="tab-label-text">
          Imported ({{ getNumeralAmount(successCount) }})
        </p>
      </q-tab>

      <q-tab
        no-caps
        name="failed"
      >
        <p class="tab-label-text">
          Failed ({{ getNumeralAmount(failedCount) }})
        </p>
      </q-tab>
    </q-tabs>

    <!-- Table -->
    <q-table
      separator="cell"
      class="app-table all-logs-table app-paginated-table"

      v-model:pagination="pagination"

      :loading="loading"
      :rows="filteredLogs"
      :columns="tableColumns"
      :row-key="row => row.row_number || row.email"
    >
      <!-- Email column -->
      <template v-slot:body-cell-email="props">
        <q-td :props="props">
          <div class="email-text ellipsis" :title="props.row.email">
            {{ props.row.email || '-' }}
          </div>
        </q-td>
      </template>

      <!-- Status column -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <div
            class="status-text"
            :class="getLogStatusInfo(props.row).classes"
          >
            {{ getLogStatusInfo(props.row).label }}
          </div>
        </q-td>
      </template>

      <!-- Remark column -->
      <template v-slot:body-cell-remark="props">
        <q-td :props="props">
          <div class="remark-text ellipsis" :title="getLogStatusInfo(props.row).remark">
            {{ getLogStatusInfo(props.row).remark }}
          </div>
        </q-td>
      </template>

      <!-- Bottom pagination slot -->
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
          No records found.
        </div>
      </template>
    </q-table>
  </div>
</template>

<script>
// vue
import {
  defineComponent, ref, computed,
} from 'vue';

// constants
import { BULK_IMPORT_LOG_STATUS } from 'boot/mailbox-constants';

// utils
import { getNumeralAmount } from 'src/utils/numbers';

export default defineComponent({
  name: 'BulkImportLogsTable',

  props: {
    logs: {
      type: Array,
      default: () => [],
    },
    summary: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // state
    const selectedTab = ref('all');

    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      sortBy: null,
      descending: false,
    });

    const tableColumns = [
      {
        name: 'email',
        label: 'Email',
        field: 'email',
        align: 'left',
      },
      {
        name: 'status',
        label: 'Status',
        field: 'status',
        align: 'left',
      },
      {
        name: 'remark',
        label: 'Remark',
        field: 'error_message',
        align: 'left',
      },
    ];

    // counts computed
    const totalCount = computed(() => (
      props.summary?.total_records ?? props.logs?.length ?? 0
    ));

    const successCount = computed(() => {
      if (typeof props.summary?.successful_records === 'number') {
        return props.summary.successful_records;
      }
      return (props.logs || []).filter(
        (log) => log.status === BULK_IMPORT_LOG_STATUS.SUCCESS,
      ).length;
    });

    const failedCount = computed(() => {
      if (typeof props.summary?.failed_records === 'number') {
        return props.summary.failed_records;
      }
      return (props.logs || []).filter(
        (log) => log.status === BULK_IMPORT_LOG_STATUS.FAILED,
      ).length;
    });

    // filtered logs computed
    const filteredLogs = computed(() => {
      const allLogs = props.logs || [];

      if (selectedTab.value === 'imported') {
        return allLogs.filter(
          (log) => log.status === BULK_IMPORT_LOG_STATUS.SUCCESS,
        );
      }
      if (selectedTab.value === 'failed') {
        return allLogs.filter(
          (log) => log.status === BULK_IMPORT_LOG_STATUS.FAILED,
        );
      }
      return allLogs;
    });

    const tablePaginationLabel = computed(() => {
      const { page = 1, rowsPerPage = 10 } = pagination.value;
      const total = filteredLogs.value.length;
      if (!total) return '0 of 0';
      const start = (page - 1) * rowsPerPage + 1;
      const end = Math.min(page * rowsPerPage, total);
      return `${start} to ${end} of ${getNumeralAmount(total)}`;
    });

    const getLogStatusInfo = (row) => {
      const status = (row.status || '').toLowerCase();

      if (status === BULK_IMPORT_LOG_STATUS.SUCCESS) {
        return {
          label: 'Imported',
          classes: 'status-imported',
          remark: row.error_message || 'Successfully imported into the app.',
        };
      }

      if (status === BULK_IMPORT_LOG_STATUS.FAILED) {
        return {
          label: 'Failed',
          classes: 'status-failed',
          remark: row.error_message || 'Failed to import mailbox.',
        };
      }

      return {
        label: 'Yet to import',
        classes: 'status-pending',
        remark: '-',
      };
    };

    const onTabChange = () => {
      pagination.value.page = 1;
    };

    return {
      // state
      selectedTab,
      pagination,
      tableColumns,

      // computed
      totalCount,
      successCount,
      failedCount,
      filteredLogs,
      tablePaginationLabel,

      // methods
      onTabChange,
      getLogStatusInfo,

      // utils
      getNumeralAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
.bulk-import-logs-table-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .bulk-import-tabs {
    :deep(.q-tab) {
      padding: 0 16px;
      min-height: 40px;
    }

    .tab-label-text {
      color: $grey;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
    }

    :deep(.q-tab--active) {
      .tab-label-text {
        color: $primary;
        font-weight: 500;
      }

      .q-tab__indicator {
        bottom: 0;
        left: 50%;
        transform: translateX(-50%) !important;
        height: 3px;
        width: 100%;
        border-radius: 10px 10px 0px 0px;
      }
    }
  }

  :deep(.all-logs-table) {
    color: $black;
    max-height: 600px;
    overflow: auto;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      max-height: calc(100vh - 250px);
    }

    thead tr th {
      background: $grey-50;
      color: $grey;
      font-size: 13px;
      font-weight: 500;
    }

    .email-text {
      color: $black;
      font-size: 13px;
      font-weight: 400;
      max-width: 260px;
    }

    .status-text {
      font-size: 13px;
      font-weight: 500;
      line-height: 16px;

      &.status-imported {
        color: $positive;
      }

      &.status-failed {
        color: $negative;
      }

      &.status-importing {
        color: $primary;
      }

      &.status-pending {
        color: $grey;
      }
    }

    .remark-text {
      color: $grey;
      font-size: 13px;
      font-weight: 400;
      max-width: 460px;
    }
  }
}
</style>
