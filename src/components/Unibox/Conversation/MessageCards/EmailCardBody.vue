<template>
  <!-- Expanded Message Body -->
  <div
    class="email-message-content"
    v-if="isExpanded"
  >
    <!-- 1. Main Fresh Reply Content -->
    <AppEditor
      v-if="parsedResult?.mainContent"
      :isEditable="false"
      :model-value="parsedResult.mainContent"
    />

    <div
      v-else-if="!isFetchingParsed"
      class="email-preview-body"
    >
      {{ cleanPreview }}
    </div>

    <!-- Loading indicator during initial on-demand fetch -->
    <div
      v-if="isFetchingParsed"
      class="parsed-loading-box flex items-center q-py-xs"
    >
      <q-spinner-dots
        color="primary"
        size="22px"
      />
    </div>

    <!-- 2. Quoted Text [...] Button (where user clicks) -->
    <div
      v-if="hasQuotedText"
      class="quoted-toggle-container q-mt-sm"
    >
      <q-btn
        flat
        no-caps
        unelevated
        size="xs"
        color="primary"
        class="quoted-toggle-btn"
        :title="showQuotedText ? 'Hide expanded content' : 'Show trimmed content'"
        @click.stop="$emit('toggle-quoted')"
      >
        <div class="toggle-text">
          ...
        </div>
      </q-btn>
    </div>

    <!-- 3. Quoted Content rendered BELOW the button -->
    <div
      v-if="showQuotedText && hasQuotedText"
      class="quoted-content-wrapper"
    >
      <!-- Parsed HTML version if available -->
      <AppEditor
        v-if="parsedResult?.quotedContent && parsedResult?.isHtml"
        :isEditable="false"
        :model-value="parsedResult.quotedContent"
      />

      <!-- Fallback Text version -->
      <div
        v-else-if="parsedResult?.quotedContent"
        class="email-preview-body quoted-text"
      >
        {{ parsedResult.quotedContent }}
      </div>

      <!-- Preview Text version before parsed data arrives -->
      <div
        v-else-if="previewQuotedText"
        class="email-preview-body quoted-text"
      >
        {{ previewQuotedText }}
      </div>
    </div>
  </div>

  <!-- Collapsed Single-Line Preview -->
  <div
    class="email-message-content cursor-pointer"
    v-else
    @click="$emit('toggle-expand')"
  >
    <div class="plain-text-container">
      <div class="collapsed-preview-snippet ellipsis">
        {{ cleanPreview }}
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import AppEditor from 'components/Editor/AppEditor.vue';

export default defineComponent({
  name: 'EmailCardBody',

  components: {
    AppEditor,
  },

  emits: ['toggle-quoted', 'toggle-expand'],

  props: {
    isExpanded: {
      type: Boolean,
      default: false,
    },
    cleanPreview: {
      type: String,
      default: '',
    },
    previewQuotedText: {
      type: String,
      default: '',
    },
    parsedResult: {
      type: Object,
      default: null,
    },
    isFetchingParsed: {
      type: Boolean,
      default: false,
    },
    hasQuotedText: {
      type: Boolean,
      default: false,
    },
    showQuotedText: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.email-message-content {
  font-size: 14px;
  line-height: 22px;
  padding: 16px;

  .plain-text-container {
    display: grid;
    grid-template-columns: auto;
    margin-top: 4px;

    .collapsed-preview-snippet {
      color: $grey;
      font-size: 14px;
      line-height: 20px;
      width: 100%;
      max-width: 100%;
    }
  }

  .email-preview-body {
    white-space: pre-wrap;
    word-break: break-word;
  }

  .email-html-body {
    word-break: break-word;

    :deep(p) {
      margin-bottom: 12px;
    }

    :deep(a) {
      color: $primary;
      text-decoration: underline;
    }
  }

  .quoted-toggle-container {
    display: flex;
    align-items: center;

    .quoted-toggle-btn {
      padding: 3px;
      border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.4);

      .toggle-text {
        font-size: 20px;
        line-height: 8px;
        position: relative;
        top: -6px;
      }

      &:hover {
        color: $black;
        background-color: rgba($color: var(--primary-rgb), $alpha: 0.05);
      }
    }
  }

  .quoted-content-wrapper {
    margin-top: 10px;
    padding-left: 12px;

    .quoted-html {
      color: inherit;
    }

    .quoted-text {
      color: inherit;
    }
  }
}
</style>
