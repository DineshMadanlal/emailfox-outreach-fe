<template>
  <div class="email-attachments-wrapper">
    <!-- Header with download -->
    <div class="email-attachments-header">
      <h6 class="attachments-header-text">
        Attachments ({{ emailAttachments.length }})
      </h6>

      <LocalSvgIcon image="circle-dot" classes="circle-dot-icon" />

      <q-btn
        flat
        no-caps
        rounded
        unelevated
        :loading="isApiLoading"

        color="grey"
        class="download-all-button"

        @click="downloadAllEmailAttachments"
      >
        <LocalSvgIcon image="download" classes="download-icon" />

        <p class="download-all-text">
          Download All
        </p>
      </q-btn>
    </div>

    <!-- Content -->
    <div class="email-attachments-content">
      <!-- Attachment Cards -->
      <q-item
        v-for="(attachment, index) in emailAttachments"
        :key="`each-email-attachment-${index}`"

        clickable
        :disable="isApiLoading"
        class="email-attachment-item"
        @click="downloadEmailAttachment(attachment)"
      >
        <div class="email-attachment-details">
          <LocalSvgIcon image="zip" classes="attachment-icon" />

          <div>
            <p class="file-name-text">
              {{ attachment.filename }}
            </p>

            <p class="file-size-text">
              {{ prettyMemoryBytes(attachment.size) }}
            </p>
          </div>
        </div>
      </q-item>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, getCurrentInstance, reactive, toRefs,
} from 'vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';
import { prettyMemoryBytes } from 'src/utils/numbers';
import { trimMessageId } from 'src/utils/helperFunctions';

export default defineComponent({
  name: 'EmailAttachments',

  props: {
    emailAttachments: {
      type: Array,
      required: true,
    },
    eachThreadJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,
    });

    const downloadAttachmentAsBlob = async ({ response, attachment }) => {
      try {
        // Create a link element
        const link = document.createElement('a');

        // Create a Blob object from the binary data received
        const blob = new Blob([response], { type: attachment.content_type });

        const url = window.URL.createObjectURL(blob);

        link.href = url;
        link.download = attachment.filename;
        document.body.appendChild(link);
        link.click();

        // Remove the link from the document
        document.body.removeChild(link);
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      }
    };

    // methods
    const downloadEmailAttachment = async (attachment) => {
      try {
        state.isApiLoading = true;
        const response = await postApiCall({
          endpoint: 'skybox/messages/download-attachment',
          payload: {
            email: props.eachThreadJson.email,
            domain_id: props.eachThreadJson.domain_id,
            message_id: trimMessageId(props.eachThreadJson.message_id),
            type: attachment.content_type,
            filename: attachment.filename,
          },
          otherParams: {
            responseType: 'blob', // Ensure the response is treated as a Blob
          },
        });

        downloadAttachmentAsBlob({
          response,
          attachment,
        });
      } catch (error) {
        throw new Error(`Failed to download attachment: ${error.message}`);
      } finally {
        state.isApiLoading = false;
      }
    };

    const downloadAllEmailAttachments = async () => {
      try {
        state.isApiLoading = true;

        // Download each attachment
        // Loop through each attachment and download
        // eslint-disable-next-line no-restricted-syntax
        for (const attachment of props.emailAttachments) {
          // eslint-disable-next-line no-await-in-loop
          await downloadEmailAttachment(attachment);
        }
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // methods
      prettyMemoryBytes,
      downloadEmailAttachment,
      downloadAllEmailAttachments,
    };
  },
});
</script>

<style lang="scss" scoped>
.email-attachments-wrapper {
  width: 100%;
  padding-left: 8px;

  .email-attachments-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .attachments-header-text {
      color: $black;
      font-size: 14px;
      font-weight: 600;
    }

    :deep(.circle-dot-icon) {
      width: 3px;
      height: 3px;
      margin-left: 8px;
      margin-right: 4px;

      @include svg-icon-fill('circle', $grey-300);
    }

    .download-all-button {
      padding: 4px;

      .download-all-text {
        font-size: 13px;
        font-weight: 500;
        color: $grey-400;
        margin-left: 8px;
      }
    }
  }

  .email-attachments-content {
    display: flex;
    flex-wrap: wrap;

    row-gap: 12px;
    column-gap: 16px;
    margin-bottom: 24px;

    .email-attachment-item {
      min-height: unset;
      padding: 10px 8px;

      border-radius: 6px;
      background: $white;
      border: 1px solid $grey-50;

      .email-attachment-details {
        display: flex;

        .attachment-icon {
          margin-right: 10px;
        }

        .file-name-text {
          color: $black;
          font-size: 13px;
          font-weight: 500;

          margin-bottom: 1px;
        }

        .file-size-text {
          color: $grey-400;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.48px;
        }
      }
    }
  }
}
</style>
