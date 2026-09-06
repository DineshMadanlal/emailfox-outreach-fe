<template>
  <div class="editor-attachments-container">
    <!-- Header with total count -->
    <p class="attachments-header-text">
      {{ attachments.length }} {{ $pluralize('Attachment', attachments.length) }}
    </p>

    <!-- Attachments Card Grid -->
    <div class="attachments-grid">
      <q-card
        flat
        v-for="(attachment, index) in attachments"
        :key="`editor-attachment-${index}`"
        class="each-attachment-card"
      >
        <LocalSvgIcon
          image="zip"
          classes="attachment-icon"
        />

        <p class="file-name-text ellipsis">
          {{ attachment.file_name }}
          <q-tooltip>
            {{ attachment.file_name }}
          </q-tooltip>
        </p>

        <p class="file-size-text">
          • {{ prettyMemoryBytes(attachment.file_size || 0) }}
        </p>

        <q-space />

        <!-- Delete Attachment Button -->
        <q-btn
          flat
          dense
          no-caps
          round
          color="negative"
          class="delete-attachment-btn"
          @click="$emit('deleteAttachmentByIndex', index)"
        >
          <LocalSvgIcon
            image="close"
            classes="delete-icon"
          />
        </q-btn>
      </q-card>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// utils
import { prettyMemoryBytes } from 'src/utils/numbers';

export default defineComponent({
  name: 'EditorAttachments',

  emits: ['deleteAttachmentByIndex'],

  props: {
    // Array of attachment objects { file_name, file_url, file_size, content_type }
    attachments: {
      type: Array,
      default: () => [],
    },
  },

  setup() {
    return {
      prettyMemoryBytes,
    };
  },
});
</script>

<style lang="scss" scoped>
.editor-attachments-container {
  width: 100%;
  padding: 8px 16px;
  background-color: $white;
  border-top: 1px solid $grey-50;

  .attachments-header-text {
    font-size: 13px;
    font-weight: 500;
    color: $grey;
    margin-bottom: 8px;
  }

  .attachments-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .each-attachment-card {
      border-radius: 6px;
      border: 1px solid $grey-50;
      background: $grey-50;
      padding: 4px 8px;

      display: flex;
      align-items: center;
      gap: 6px;

      :deep(.attachment-icon) {
        width: 14px;
        height: 14px;
      }

      .file-name-text {
        color: $black;
        font-size: 13px;
        font-weight: 500;
        max-width: 200px;
      }

      .file-size-text {
        font-size: 12px;
        font-weight: 400;
        color: $grey;
      }

      .delete-attachment-btn {
        padding: 2px;
        min-height: unset;
        min-width: unset;

        :deep(.delete-icon) {
          width: 10px;
          height: 10px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
