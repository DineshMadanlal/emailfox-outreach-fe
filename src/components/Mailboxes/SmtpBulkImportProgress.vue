<template>
  <div class="smtp-bulk-import-progress">
    <!-- Progress content -->
    <div class="progress-content">

      <q-card flat class="import-history-card">
        <!-- File card -->
        <div class="file-card">
          <div class="flex no-wrap items-center">
            <LocalSvgIcon image="csv" />

            <div class="file-details">
              <p class="file-name-text ellipsis">
                {{ fileName }}
              </p>

              <div class="file-meta">
                <p class="file-meta-text">CSV</p>

                <LocalSvgIcon
                  image="circle-dot"
                  classes="dot-icon"
                />

                <p class="file-meta-text">
                  {{ prettyMemoryBytes(fileSize) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress section -->
        <div class="progress-section">
          <h5 class="progress-title">
            {{ isDone ? 'Import Complete' : 'Uploading is in progress' }}
          </h5>

          <p class="progress-desc">
            You can close this window and track the progress from the list view.
          </p>

          <!-- Progress bar -->
          <q-linear-progress
            rounded
            size="8px"
            :value="progressValue"
            color="primary"
            track-color="grey-200"
            class="progress-bar"
          />

          <!-- Stats -->
          <p class="progress-stats-text">
            {{ progressPercent }}% Completed
            <span class="stats-dot">·</span>
            {{ jobData.successful_records }} imported
            <span class="stats-dot">·</span>
            {{ jobData.failed_records }} failed
            <span class="stats-dot">·</span>
            {{ remainingRecords }} remaining
          </p>
        </div>
      </q-card>
    </div>

    <!-- Footer -->
    <div class="smtp-footer-actions">
      <q-space />

      <!--  -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Continue in Background"

        @click="onContinueInBackground"
      />
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, onUnmounted,
} from 'vue';

// vue router
import { useRouter } from 'vue-router';

// utils
import { prettyMemoryBytes } from 'src/utils/numbers';
import { getSmtpBulkImportJob } from 'src/utils/domainMailboxesApi.js';

// constants
import {
  BULK_IMPORT_JOB_STATUS,
  BULK_IMPORT_LOG_STATUS,
} from 'boot/mailbox-constants';

const POLL_INTERVAL_MS = 5000;

export default defineComponent({
  name: 'SmtpBulkImportProgress',

  props: {
    jobId: {
      type: [Number, String],
      required: true,
    },
    fileName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
  },

  setup(props) {
    // router
    const $router = useRouter();

    // state
    const state = reactive({
      pollTimer: null,

      jobData: {
        total_records: 0,
        successful_records: 0,
        failed_records: 0,
        status: BULK_IMPORT_JOB_STATUS.PENDING,
      },
    });

    // computed
    const processedRecords = computed(
      () => state.jobData.successful_records + state.jobData.failed_records,
    );

    const progressValue = computed(() => {
      if (!state.jobData.total_records) return 0;
      return processedRecords.value / state.jobData.total_records;
    });

    const progressPercent = computed(() => Math.round(progressValue.value * 100));

    const remainingRecords = computed(
      () => Math.max(0, state.jobData.total_records - processedRecords.value),
    );

    const isDone = computed(
      () => state.jobData.status === BULK_IMPORT_JOB_STATUS.COMPLETED,
    );

    // methods
    const fetchJobStatus = async () => {
      try {
        const response = await getSmtpBulkImportJob(props.jobId);

        const logs = response?.logs || [];
        const successfulFromLogs = logs.filter(
          (log) => log.status === BULK_IMPORT_LOG_STATUS.SUCCESS,
        ).length;
        const failedFromLogs = logs.filter(
          (log) => log.status === BULK_IMPORT_LOG_STATUS.FAILED,
        ).length;

        state.jobData = {
          total_records: response?.total_records ?? logs.length,
          successful_records: Math.max(response?.successful_records ?? 0, successfulFromLogs),
          failed_records: Math.max(response?.failed_records ?? 0, failedFromLogs),
          status: response?.status || BULK_IMPORT_JOB_STATUS.PENDING,
        };

        // Stop polling when job is done
        if (isDone.value) {
          clearInterval(state.pollTimer);
          state.pollTimer = null;
        }
      } catch (_) {
        // silently ignore poll errors — keep polling
      }
    };

    const startPolling = () => {
      // Fetch immediately then every 5 seconds
      fetchJobStatus();

      state.pollTimer = setInterval(() => {
        fetchJobStatus();
      }, POLL_INTERVAL_MS);
    };

    const onContinueInBackground = () => {
      $router.push(`/outreach/mailboxes?jobId=${props.jobId}`);
    };

    onMounted(() => {
      if (props.jobId) {
        startPolling();
      }
    });

    onUnmounted(() => {
      if (state.pollTimer) {
        clearInterval(state.pollTimer);
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isDone,
      progressValue,
      progressPercent,
      remainingRecords,

      // utils
      prettyMemoryBytes,

      // methods
      onContinueInBackground,
    };
  },
});
</script>

<style lang="scss" scoped>
.smtp-bulk-import-progress {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;

  .progress-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;

    padding: 20px;

    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }

    .import-history-card {
      width: 100%;
      max-width: 610px;
      border-radius: 6px;
      background: $white;
      border: 1px solid $grey-50;

      // File card
      .file-card {
        padding: 24px 20px;
        background: rgba($color: var(--primary-rgb), $alpha: 0.05);

        display: flex;
        align-items: center;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          padding: 16px 12px;
        }

        .file-details {
          margin: 0 14px;

          .file-name-text {
            color: $black;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 6px;
            max-width: 280px;

            @media (max-width: $breakpoint-xs-max) {
              max-width: 60vw;
            }
          }

          .file-meta {
            display: flex;
            align-items: center;

            :deep(.dot-icon) {
              max-height: 3px;
              max-width: 3px;
              margin: 0 3px;

              circle {
                fill: $grey-400;
                stroke-width: 2px;
              }
            }

            .file-meta-text {
              color: $grey-400;
              font-size: 12px;
              font-weight: 500;
              letter-spacing: 0.84px;
            }
          }
        }
      }

      // Progress section
      .progress-section {
        display: flex;
        flex-direction: column;

        padding: 24px 20px;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          padding: 16px 12px;
        }

        .progress-title {
          color: $black;
          font-size: 16px;
          font-weight: 600;
        }

        .progress-desc {
          color: rgba($color: var(--black-rgb), $alpha: 0.8);
          font-size: 14px;
          font-weight: 400;
          margin-top: 6px;
          margin-bottom: 24px;
        }

        .progress-bar {
          max-width: 358px;
          border-radius: 2px;

          :deep(.q-linear-progress__track) {
            opacity: 1;
            background: rgba($color: var(--primary-rgb), $alpha: 0.1);
          }
        }

        .progress-stats-text {
          color: rgba($color: var(--black-rgb), $alpha: 0.8);
          font-size: 14px;
          font-weight: 400;
          margin-top: 16px;

          .stats-dot {
            margin: 0 5px;
            color: $grey;
          }
        }
      }
    }
  }
}
</style>
