<template>
  <q-card flat class="app-modal-card bulk-import-file-preview-card">
    <!-- Header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        File Preview
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

    <!-- Modal Content -->
    <div class="app-modal-content custom-scrollbar">
      <!-- File details & action bar -->
      <div class="file-header-bar">
        <div class="flex no-wrap items-center file-meta-left">
          <LocalSvgIcon
            image="csv"
            classes="csv-file-icon"
          />

          <div class="file-text-details">
            <div class="file-name-text ellipsis" :title="jobData?.csv_filename">
              {{ jobData?.csv_filename || 'mailboxes.csv' }}
            </div>

            <div class="file-subtitle-text ellipsis">
              {{ formattedSubtitle }}
            </div>
          </div>
        </div>

        <q-space />

        <!-- Download Failed Records Button -->
        <q-btn
          flat
          round
          dense
          class="download-btn"
          :loading="isDownloading"
          @click="onDownload"
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

      <!-- Reusable Table Component -->
      <BulkImportLogsTable
        :logs="jobData?.logs || []"
        :summary="jobData || {}"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, computed, ref,
} from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';
import BulkImportLogsTable from 'src/components/Mailboxes/BulkImportLogsTable.vue';

// utils
import { formatDate1 } from 'src/utils/dates';
import { exportFailedMailboxesCsv } from 'src/utils/csvHelpers';

export default defineComponent({
  name: 'BulkImportFilePreview',

  components: {
    AppTooltip,
    BulkImportLogsTable,
  },

  props: {
    jobData: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const isDownloading = ref(false);

    const formattedSubtitle = computed(() => {
      const dateFormatted = props.jobData?.created_at
        ? formatDate1(props.jobData.created_at)
        : '';
      return dateFormatted || '-';
    });

    const onDownload = () => {
      const logs = props.jobData?.logs || [];
      if (!logs.length) return;

      try {
        isDownloading.value = true;
        exportFailedMailboxesCsv({
          filename: props.jobData?.csv_filename || 'mailboxes.csv',
          logs,
        });
      } finally {
        isDownloading.value = false;
      }
    };

    return {
      isDownloading,
      formattedSubtitle,
      onDownload,
    };
  },
});
</script>

<style lang="scss" scoped>
.bulk-import-file-preview-card {
  position: relative;
  max-width: 1000px;

  .app-modal-content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .file-header-bar {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      flex-wrap: wrap;

      .file-meta-left {
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
            font-size: 14px;
            font-weight: 500;
            line-height: 18px;
          }

          .file-subtitle-text {
            color: $grey-400;
            font-size: 12px;
            font-weight: 400;
            line-height: 16px;
            margin-top: 2px;
          }
        }
      }

      .download-btn {
        width: 32px;
        height: 32px;
        min-height: unset;
        min-width: unset;
        border: 1px solid $blue-grey;
        border-radius: 6px;

        :deep(.download-icon) {
          width: 14px;
          height: 14px;
          @include svg-icon-stroke('path, circle', $grey);
        }
      }
    }
  }
}
</style>
