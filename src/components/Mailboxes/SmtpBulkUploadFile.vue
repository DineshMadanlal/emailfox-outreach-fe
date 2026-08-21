<template>
  <div class="smtp-bulk-upload-file">
    <!-- Hidden file input -->
    <input
      ref="csvFileInputRef"
      id="smtp-bulk-csv-upload"
      class="hidden"
      type="file"
      accept=".csv"
      @change="handleFileUpload"
    >

    <div class="upload-content">
      <!--  -->
      <div>
        <!-- Header -->
          <h5 class="upload-header-text">
            Select File to Upload
          </h5>
          <p class="upload-desc-text">
            Import multiple SMTP mailboxes from CSV
          </p>
      </div>

      <!-- Dropzone (no file yet) -->
      <q-card
        v-if="!fileName"
        flat
        class="dropzone-card"

        @dragover="onDragover"
        @dragleave="onDragleave"
        @drop="onDrop"
      >
        <label
          for="smtp-bulk-csv-upload"
          class="dropzone-inner"
          v-ripple:primary
        >
          <LocalSvgIcon image="upload" />

          <p class="drag-drop-text">
            Drag & drop your file to upload or <span class="browse-link">Browse File</span>
          </p>

          <p class="supported-text">
            Supported file types: CSV
          </p>
        </label>
      </q-card>

      <!-- File uploaded — show card + mapping -->
      <template v-else>
        <!-- File card -->
        <q-card flat class="uploaded-file-card">
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

                <p class="file-meta-text">{{ prettyMemoryBytes(fileSize) }}</p>
              </div>
            </div>
          </div>

          <q-space />

          <!-- Re-upload / Delete -->
          <div class="flex no-wrap items-center">
            <q-btn
              flat dense no-caps
              color="primary"
              label="Re-upload"
              class="btn-font-weight-500 q-mr-sm"
              @click="onReupload"
            />
            <q-btn
              flat dense no-caps
              color="primary"
              label="Delete"
              class="btn-font-weight-500"
              @click="onDeleteFile"
            />
          </div>
        </q-card>

        <!-- Hide / Show Fields Mapped toggle -->
        <div class="fields-toggle-row">
          <q-btn
            flat no-caps dense
            color="primary"
            class="btn-font-weight-500"
            @click="showMapping = !showMapping"
          >
            <span class="text-weight-medium">
              {{ showMapping ? 'Hide' : 'Show' }} Fields Mapped
            </span>

            <LocalSvgIcon
              image="plain-down-arrow"
              :class="`toggle-arrow-icon ${showMapping ? 'rotated' : ''}`"
            />
          </q-btn>
        </div>

        <!-- Field Mapping Table -->
        <div v-if="showMapping" class="mapping-table">
          <!-- Table header -->
          <div class="mapping-row mapping-header-row">
            <p class="mapping-col-text mapping-label-col">
              CSV Column
            </p>

            <LocalSvgIcon
              image="right-line-arrow"
              classes="arrow-icon"
            />

            <p class="mapping-col-text mapping-field-col">
              Map Fields
            </p>
          </div>

          <template
            v-for="(fieldDef, index) in smtpFieldDefinitions"
            :key="`smtp-field-${index}`"
          >
            <!-- Group header -->
            <div
              v-if="fieldDef.group
                && (index === 0 || smtpFieldDefinitions[index - 1].group !== fieldDef.group)"
              class="mapping-group-header"
            >
              {{ fieldDef.group.toUpperCase() }}
            </div>

            <!-- Mapping row -->
            <div class="mapping-row">
              <!-- System field label (left) -->
              <p class="mapping-col-text mapping-label-col" :title="fieldDef.label">
                {{ fieldDef.label }}

                <span v-if="fieldDef.required" class="required-star">*</span>
              </p>

              <LocalSvgIcon
                image="right-line-arrow"
                classes="arrow-icon"
              />

              <!-- CSV column dropdown (right) -->
              <q-select
                dense
                borderless
                emit-value
                map-options
                options-dense

                v-model="fieldMapping[fieldDef.key]"

                :options="csvColumnOptions"

                option-label="label"
                option-value="value"
                dropdown-icon="keyboard_arrow_down"

                class="mapping-field-col mapping-select"
                placeholder="Select Field"
              >
              </q-select>
            </div>
          </template>
        </div>
      </template>

      <!-- Template download link -->
      <p class="template-download-text">
        If you prefer, you can
        <span class="template-link" @click="downloadSmtpCsvTemplate">
          download
        </span>
        our CSV template to fill it.
      </p>
    </div>

    <!-- Footer -->
    <div class="smtp-footer-actions">
      <q-btn
        flat no-caps unelevated
        label="Back"
        color="primary"
        class="light-primary-btn"
        @click="$emit('goBack')"
      />

      <q-btn
        no-caps unelevated
        color="primary"
        label="Save & Continue"
        :disable="!fileName"
        :loading="isSaving"
        @click="onSaveAndContinue"
      />
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed,
} from 'vue';

// quasar
import { useQuasar } from 'quasar';

// npm
import Papa from 'papaparse';

// lodash
import get from 'lodash/get';

// utils
import { prettyMemoryBytes } from 'src/utils/numbers';
import { downloadSmtpCsvTemplate } from 'src/utils/csvHelpers';

// constants
import { SMTP_BULK_FIELD_DEFINITIONS } from 'boot/mailbox-constants';

export default defineComponent({
  name: 'SmtpBulkUploadFile',

  emits: ['onCompleteStep', 'goBack'],

  props: {
    isSaving: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // quasar
    const $q = useQuasar();

    // state
    const state = reactive({
      csvFileInputRef: null,

      fileName: '',
      fileSize: 0,
      csvData: [],
      csvHeaders: [],

      // { [fieldKey]: csvColumnName } — one entry per SMTP field definition
      fieldMapping: {},

      showMapping: false,
    });

    // computed
    const smtpFieldDefinitions = computed(() => SMTP_BULK_FIELD_DEFINITIONS);

    // Dropdown options for the right column: CSV column headers + empty option
    const csvColumnOptions = computed(() => [
      { label: 'Select Field', value: null },
      ...state.csvHeaders.map((h) => ({ label: h, value: h })),
    ]);

    // methods
    const autoMapFields = () => {
      const mapping = {};

      SMTP_BULK_FIELD_DEFINITIONS.forEach((fieldDef) => {
        const normalizedAliases = fieldDef.aliases.map((a) => a.toLowerCase());

        const match = state.csvHeaders.find((header) => {
          const normalizedHeader = header.trim().toLowerCase();
          return normalizedAliases.some(
            (alias) => normalizedHeader === alias
              || normalizedHeader.includes(alias) || alias.includes(normalizedHeader),
          );
        });

        mapping[fieldDef.key] = match || null;
      });

      state.fieldMapping = mapping;
    };

    const validateFile = (file) => {
      if (file.type === 'text/csv' || file.name?.endsWith('.csv')) {
        return true;
      }

      $q.dialog({
        title: 'Invalid File Format',
        message: 'Please upload a valid CSV file.',
        ok: { label: 'OK', color: 'primary' },
      });

      return false;
    };

    const parseFile = (file) => {
      state.fileName = file.name;
      state.fileSize = file.size;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          state.csvData = results.data;
          state.csvHeaders = results.meta.fields?.filter((f) => !!f) || [];

          autoMapFields();
        },
      });
    };

    const handleFileUpload = (event) => {
      const files = event.target.files || event.dataTransfer?.files;
      if (!files?.length) return;

      const file = get(files, '[0]');
      if (!validateFile(file)) return;

      parseFile(file);

      // Allow re-uploading the same file
      event.target.value = null;
    };

    const onDragover = (event) => { event.preventDefault(); };
    const onDragleave = () => {};
    const onDrop = (event) => {
      event.preventDefault();
      handleFileUpload(event);
    };

    const onReupload = () => { state.csvFileInputRef?.click(); };

    const onDeleteFile = () => {
      state.fileName = '';
      state.fileSize = 0;
      state.csvData = [];
      state.csvHeaders = [];
      state.fieldMapping = {};
    };

    // Parse a boolean-ish value from CSV to a JS boolean
    const parseSecure = (value) => {
      if (value === undefined || value === null || value === '') return true;
      return String(value).trim().toLowerCase() !== 'false'
        && String(value).trim().toLowerCase() !== '0'
        && String(value).trim().toLowerCase() !== 'none';
    };

    const buildMailboxes = () => {
      const { fieldMapping, csvData } = state;

      return csvData.map((row) => {
        const get_ = (key) => {
          const col = fieldMapping[key];
          return col ? (row[col] ?? '') : '';
        };

        const email = String(get_('email')).trim();
        const password = String(get_('password')).trim();

        return {
          name: String(get_('name')).trim(),
          email,
          smtp_host: String(get_('smtp_host')).trim(),
          smtp_port: Number(get_('smtp_port')) || 465,
          smtp_secure: parseSecure(get_('smtp_secure')),
          smtp_username: email,
          smtp_password: password,
          imap_host: String(get_('imap_host')).trim(),
          imap_port: Number(get_('imap_port')) || 993,
          imap_secure: parseSecure(get_('imap_secure')),
          imap_username: email,
          imap_password: password,
          bcc_to_crm: '',
          signature: '',
          sending_limit_per_day: Number(get_('sending_limit_per_day')) || 20,
          minimum_time_gap_mins: Number(get_('minimum_time_gap_mins')) || 5,
        };
      });
    };

    const onSaveAndContinue = () => {
      if (!state.fileName) {
        $q.dialog({
          title: 'No File Uploaded',
          message: 'Please upload a CSV file to continue.',
        });
        return;
      }

      // Validate required fields are mapped
      const requiredFields = SMTP_BULK_FIELD_DEFINITIONS.filter((f) => f.required);
      const unmapped = requiredFields.filter((f) => !state.fieldMapping[f.key]);

      if (unmapped.length > 0) {
        $q.dialog({
          title: 'Required Fields Not Mapped',
          message: `Please map the following required fields: ${unmapped.map((f) => f.label).join(', ')}`,
          ok: { label: 'OK', color: 'primary' },
        });
        return;
      }

      const mailboxes = buildMailboxes();

      if (mailboxes.length === 0) {
        $q.dialog({
          title: 'Empty File',
          message: 'The uploaded CSV has no data rows.',
        });
        return;
      }

      emit('onCompleteStep', {
        mailboxes,
        fileName: state.fileName,
        fileSize: state.fileSize,
      });
    };

    return {
      // state
      ...toRefs(state),

      // computed
      smtpFieldDefinitions,
      csvColumnOptions,

      // utils
      prettyMemoryBytes,
      downloadSmtpCsvTemplate,

      // methods
      handleFileUpload,
      onDragover,
      onDragleave,
      onDrop,
      onReupload,
      onDeleteFile,
      onSaveAndContinue,
    };
  },
});
</script>

<style lang="scss" scoped>
.smtp-bulk-upload-file {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;

  .upload-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;

    padding: 20px;
    max-width: 540px;

    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }

    .upload-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
    }

    .upload-desc-text {
      color: rgba($color: var(--black-rgb), $alpha: 0.8);
      font-size: 14px;
      font-weight: 400;
      margin-top: 6px;
    }

    // Dropzone
    .dropzone-card {
      border-radius: 10px;
      background: rgba($color: var(--primary-rgb), $alpha: 0.05);
      border: 1px dashed rgba($color: var(--primary-rgb), $alpha: 0.3);

      .dropzone-inner {
        cursor: pointer;
        width: 100%;
        padding: 48px 16px;
        min-height: 227px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;

        .drag-drop-text {
          color: rgba($color: var(--black-rgb), $alpha: 0.8);
          text-align: center;
          font-size: 14px;
          font-weight: 400;
          line-height: 16px;

          .browse-link {
            color: $primary;
            font-weight: 600;
          }
        }

        .supported-text {
          text-align: center;
          font-size: 14px;
          font-weight: 400;
          color: rgba($color: var(--grey-rgb), $alpha: 0.8);
        }
      }
    }

    // Uploaded file card
    .uploaded-file-card {
      padding: 24px;
      border-radius: 8px;
      border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.2);
      background: rgba($color: var(--primary-rgb), $alpha: 0.05);

      display: flex;
      align-items: center;

      @media (max-width: $breakpoint-xs-max) {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        padding: 24px 12px;
      }

      .file-details {
        margin: 0 16px;

        .file-name-text {
          color: $black;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 4px;
          max-width: 240px;

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

    // Hide/Show Fields Mapped toggle
    .fields-toggle-row {
      display: flex;
      align-items: center;

      :deep(.toggle-arrow-icon) {
        width: 12px;
        height: 12px;
        margin-left: 4px;
        transition: transform 0.2s ease;

        @include svg-icon-stroke('path, circle, rect', $primary);

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    // Mapping table
    .mapping-table {
      display: flex;
      flex-direction: column;
      border: 1px solid $grey-50;
      border-radius: 8px;
      overflow: hidden;

      .mapping-group-header {
        padding: 8px 16px;
        background: rgba($color: var(--grey-50-rgb), $alpha: 0.5);
        color: $grey;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.6px;
        border-top: 1px solid $grey-50;
      }

      .mapping-row {
        display: grid;
        grid-template-columns: 1fr 32px 1fr;
        padding: 4px 16px;
        align-items: center;
        border-top: 1px solid $grey-50;
        gap: 8px;

        &:last-child {
          border-bottom: none;
        }

        &.mapping-header-row {
          padding: 10px 16px;
          background: rgba($color: var(--grey-50-rgb), $alpha: 0.5);
        }

        .mapping-col-text {
          color: $black;
          font-size: 13px;
          font-weight: 400;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          &.mapping-header-row & {
            font-weight: 500;
            color: $grey;
            font-size: 13px;
          }

          .required-star {
            color: $negative;
            margin-left: 2px;
          }
        }

        :deep(.arrow-icon) {
          width: 16px;
          height: 16px;
          flex-shrink: 0;

          @include svg-icon-stroke('path, circle, rect', $grey-100);
        }

        .mapping-select {
          :deep(.q-field__native) {
            font-size: 13px;
            color: $black;
          }
        }
      }
    }

    // Template download link
    .template-download-text {
      color: rgba($color: var(--black-rgb), $alpha: 0.8);
      font-size: 14px;
      font-weight: 400;

      .template-link {
        cursor: pointer;
        text-decoration: underline;
      }
    }
  }
}
</style>
