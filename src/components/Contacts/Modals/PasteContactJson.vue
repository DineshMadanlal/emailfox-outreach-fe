<template>
  <q-card flat class="app-modal-card paste-json-card">
    <!-- Modal Header -->
    <div class="app-modal-header">
      <div>
        <h4 class="modal-header-text">
          Import Contact via JSON
        </h4>
        <p class="modal-subtitle-text">
          Paste AI-generated or custom contact payload to automatically parse fields.
        </p>
      </div>

      <q-space />

      <!--  -->

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
    <div class="app-modal-content">
      <!-- Sub-header info & action row -->
      <div class="flex items-center justify-end full-width q-mb-sm">
        <q-btn
          flat
          no-caps
          dense
          color="primary"
          class="text-weight-medium copy-sample-btn"
          @click="onCopySampleJson"
        >
          <q-icon name="content_copy" size="14px" class="q-mr-xs" />
          <span>Copy Sample JSON</span>
        </q-btn>
      </div>

      <!-- JSON Editor Window Box -->
      <div class="json-editor-container">
        <!-- Window Control Header -->
        <div class="editor-header flex items-center justify-between">
          <div class="flex items-center gap-xs">
            <span class="mac-dot mac-dot-red" />
            <span class="mac-dot mac-dot-yellow" />
            <span class="mac-dot mac-dot-green" />
            <span class="editor-title text-caption text-weight-bold q-ml-xs">
              JSON SCHEMA
            </span>
          </div>

          <div class="flex items-center gap-xs">
            <q-btn
              flat
              dense
              no-caps
              class="editor-action-btn"
              @click="onFormatJson"
            >
              <q-icon name="auto_fix_high" size="14px" class="q-mr-xs" />
              <span>Format</span>
            </q-btn>
          </div>
        </div>

        <!-- LineNumberTextarea Component -->
        <div class="editor-body">
          <LineNumberTextarea
            v-model="jsonText"
            placeholder="Paste JSON content here..."
            class="json-line-textarea"

            :outlined="false"
            borderless
          />
        </div>

        <!-- Editor Footer Status Bar -->
        <div class="editor-status-bar flex items-center justify-between">

          <div class="status-left flex items-center gap-xs">
            <template v-if="jsonText.trim() && isValid">
              <span class="status-icon success-icon">✓</span>
              <span class="status-text text-positive text-weight-medium">
                Valid JSON format detected
              </span>
            </template>

            <template v-else-if="jsonText.trim() && !isValid">
              <span class="status-icon text-grey-6">●</span>
              <span class="status-text text-grey-7">
                JSON format invalid
              </span>
            </template>

            <template v-else>
              <span class="status-text text-grey-6">
                Paste JSON content above
              </span>
            </template>
          </div>

          <div class="status-right flex items-center">
            <span
              v-if="jsonText.trim() && isValid"
              class="status-badge-info text-caption text-grey-7"
            >
              UTF-8 · {{ detectedKeysCount }} keys detected
            </span>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal Footer -->
    <div class="app-modal-footer">
      <q-space />

      <q-btn
        flat
        no-caps
        v-close-popup

        label="Cancel"
        color="primary"
        class="light-primary-btn q-mr-md"
      />

      <q-btn
        no-caps
        unelevated
        label="Apply & Fill Form"
        color="primary"
        class="apply-btn"
        :disabled="!isValid || !jsonText.trim()"
        @click="onApplyJson"
      />
    </div>
  </q-card>
</template>

<script>
import {
  defineComponent, reactive, toRefs, watch, getCurrentInstance,
} from 'vue';
import { copyToClipboard } from 'quasar';
import LineNumberTextarea from 'components/Input/LineNumberTextarea.vue';

const SAMPLE_CONTACT_JSON = {
  first_name: 'James',
  last_name: 'Bond',
  email: 'james.bond@example.com',
  phone: '+1 202 555 0123',
  job_title: 'Product Designer',
  company_name: 'spideywe.com',
  linkedin_url: 'www.linkedin.com/in/jamesbond',
  city: 'San Francisco',
  state: 'CA',
  country: 'USA',
  custom_fields: {
    personalised_line_1: 'Loved your latest article!',
  },
};

export default defineComponent({
  name: 'PasteContactJsonModal',

  components: {
    LineNumberTextarea,
  },

  emits: ['onApplyJson'],

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      jsonText: '',
      isValid: true,
      detectedKeysCount: 0,
    });

    // methods
    const validateJson = () => {
      const trimmed = state.jsonText.trim();
      if (!trimmed) {
        state.isValid = false;
        state.detectedKeysCount = 0;
        return;
      }

      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          state.isValid = false;
          state.detectedKeysCount = 0;
          return;
        }
        state.isValid = true;
        state.detectedKeysCount = Object.keys(parsed).length;
      } catch (err) {
        state.isValid = false;
        state.detectedKeysCount = 0;
      }
    };

    const onFormatJson = () => {
      try {
        const parsed = JSON.parse(state.jsonText.trim());
        state.jsonText = JSON.stringify(parsed, null, 2);
        appContext.config.globalProperties.$toast({
          message: 'JSON formatted successfully',
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: 'Cannot format invalid JSON',
        });
      }
    };

    const onCopySampleJson = async () => {
      try {
        const sampleString = JSON.stringify(SAMPLE_CONTACT_JSON, null, 2);
        await copyToClipboard(sampleString);
        appContext.config.globalProperties.$toast({
          message: 'Sample JSON copied to clipboard!',
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: 'Failed to copy sample JSON',
        });
      }
    };

    const onApplyJson = () => {
      if (!state.isValid || !state.jsonText.trim()) {
        return;
      }
      try {
        const parsed = JSON.parse(state.jsonText.trim());

        emit('onApplyJson', parsed);
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: 'Invalid JSON payload',
        });
      }
    };

    // lifecycle hooks
    watch(() => state.jsonText, () => {
      validateJson();
    }, { immediate: true });

    return {
      // state
      ...toRefs(state),

      // methods
      onApplyJson,
      onFormatJson,
      onCopySampleJson,
    };
  },
});
</script>

<style lang="scss" scoped>
.paste-json-card {
  max-width: 600px;

  .app-modal-header {
    .modal-subtitle-text {
      font-size: 13px;
      color: rgba(var(--black-rgb), 0.7);

      margin-top: 2px;
    }
  }

  .app-modal-content {
    // copy button
    .copy-sample-btn {
      font-size: 12px;
      color: $primary;
    }

    .json-editor-container {
      border: 1px solid $grey-50;
      border-radius: 8px;
      overflow: hidden;
      background: rgb(var(--primary-rgb), 0.05);

      // header
      .editor-header {
        padding: 8px 12px;

        .mac-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;

          &-red { background: #ef4444; }
          &-yellow { background: #f59e0b; }
          &-green { background: #10b981; }
        }

        .editor-title {
          font-size: 11px;
          letter-spacing: 0.5px;
          color: rgba(var(--black-rgb), 0.8);
          font-family: monospace;
        }

        .editor-action-btn {
          font-size: 12px;
          color: rgba(var(--black-rgb), 0.7);
          font-weight: 500;
          background: $white;

          border: 1px solid $grey-50;
          border-radius: 6px;
          padding: 2px 8px;
        }
      }

      // editor body
      .editor-body {
        background: $white;

        .json-line-textarea {
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, monospace;
        }
      }

      // status
      .editor-status-bar {
        background: $white;
        border-top: 1px solid $grey-50;
        padding: 8px 12px;
        min-height: 36px;

        .status-text {
          font-size: 12px;
        }

        .success-icon {
          color: $positive; font-weight: bold; margin-right: 4px;
        }

        .status-badge-info {
          font-size: 12px;
          color: $grey-400;
        }
      }
    }
  }
}
</style>
