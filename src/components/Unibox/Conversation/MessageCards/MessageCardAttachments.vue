<template>
  <div
    v-if="attachments?.length"
    class="message-card-attachments"
  >
    <!-- Header Row -->
    <div class="attachments-header-row">
      <span class="attachments-title">
        Attachments ({{ attachments.length }})
      </span>

      <span class="dot-separator">•</span>

      <q-btn
        flat
        dense
        no-caps
        :loading="isDownloadingAll"
        class="download-all-btn"
        @click="downloadAllAttachments"
      >
        <LocalSvgIcon
          image="download"
          class="download-icon q-mr-xs"
        />
        <span class="btn-text">Download All</span>
      </q-btn>
    </div>

    <!-- Attachment Cards Grid -->
    <div class="attachments-grid">
      <div
        v-for="(attachment, index) in attachments"
        :key="`att-${index}-${attachment.file_name}`"
        class="attachment-card"
        @click="downloadAttachment(attachment)"
      >
        <!-- Left: Icon box -->
        <div class="attachment-icon-box">
          <LocalSvgIcon
            :image="getAttachmentIcon(attachment.file_name)"
            class="attachment-icon"
          />
        </div>

        <!-- Right: Details -->
        <div class="attachment-info ellipsis">
          <div
            class="file-name ellipsis"
            :title="attachment.file_name"
          >
            {{ attachment.file_name }}
          </div>
          <div class="file-meta">
            {{ formatFileMeta(attachment) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// utils
import { prettyMemoryBytes } from 'src/utils/numbers';

export default defineComponent({
  name: 'MessageCardAttachments',

  props: {
    attachments: {
      type: Array,
      default: () => [],
    },
  },

  setup(props) {
    const { appContext } = getCurrentInstance();

    const state = reactive({
      isDownloading: false,
      isDownloadingAll: false,
    });

    const getAttachmentIcon = (filename = '') => {
      const ext = filename.split('.').pop().toLowerCase();
      if (ext === 'pdf') return 'pdf';
      if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') return 'csv';
      if (ext === 'zip' || ext === 'rar' || ext === 'tar' || ext === 'gz') return 'zip';
      return 'zip';
    };

    const formatFileMeta = (attachment) => {
      const ext = (attachment.file_name?.split('.').pop() || 'FILE').toUpperCase();
      const size = attachment.file_size ? prettyMemoryBytes(attachment.file_size) : '';
      return size ? `${ext} • ${size}` : ext;
    };

    const downloadAttachment = async (attachment) => {
      const fileUrl = attachment.file_url;
      const fileName = attachment.file_name || 'attachment';

      if (!fileUrl) {
        appContext.config.globalProperties.$toast?.({
          warning: true,
          message: 'Attachment file URL not found',
        });
        return;
      }

      try {
        state.isDownloading = true;
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error('Failed to fetch file from S3');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        // Fallback to new tab if direct fetch is blocked by CORS
        window.open(fileUrl, '_blank');
      } finally {
        state.isDownloading = false;
      }
    };

    const downloadAllAttachments = async () => {
      if (!props.attachments?.length) return;
      state.isDownloadingAll = true;
      try {
        for (let i = 0; i < props.attachments.length; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await downloadAttachment(props.attachments[i]);
        }
      } catch (err) {
        // Handled in downloadAttachment
      } finally {
        state.isDownloadingAll = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // methods
      getAttachmentIcon,
      formatFileMeta,
      downloadAttachment,
      downloadAllAttachments,
    };
  },
});
</script>

<style lang="scss" scoped>
.message-card-attachments {
  width: 100%;
  padding: 12px 16px;

  .attachments-header-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;

    .attachments-title {
      font-size: 14px;
      font-weight: 600;
      color: $black;
    }

    .dot-separator {
      color: $grey;
    }

    .download-all-btn {
      color: $grey;
      font-size: 13px;
      font-weight: 500;
      padding: 0 4px;

      :deep(.download-icon) {
        width: 14px;
        height: 14px;
        @include svg-icon-stroke('path, circle, rect', $grey);
      }

      &:hover {
        color: $black;

        :deep(.download-icon) {
          @include svg-icon-stroke('path, circle, rect', $black);
        }
      }
    }
  }

  .attachments-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .attachment-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      background-color: $white;
      border: 1px solid $grey-50;
      cursor: pointer;
      max-width: 220px;
      min-width: 160px;
      transition: all 0.15s ease;

      &:hover {
        border-color: rgba($color: var(--primary-rgb), $alpha: 0.3);
        background-color: rgba($color: var(--primary-rgb), $alpha: 0.02);
      }

      .attachment-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        :deep(.attachment-icon) {
          width: 20px;
          height: 20px;
        }
      }

      .attachment-info {
        flex: 1;
        min-width: 0;

        .file-name {
          font-size: 13px;
          font-weight: 500;
          color: $black;
          line-height: 16px;
        }

        .file-meta {
          font-size: 11px;
          color: $grey;
          line-height: 14px;
          margin-top: 2px;
          text-transform: uppercase;
        }
      }
    }
  }
}
</style>
