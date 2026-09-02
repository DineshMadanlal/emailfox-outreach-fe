<template>
  <div class="upload-file">
    <!-- Teleport -->
    <Teleport
      v-if="isContactUpload"
      to="#importContactsFooter"
    >
      <!-- Save and continue button -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Save and Continue"

        @click="onSaveAndContinue"
      />
    </Teleport>

    <!-- header -->
    <h5 class="upload-file-header-text">
      Select File to Upload
    </h5>

    <!-- desc -->
    <p class="upload-file-desc-text">
      Choose a CSV file from your device to import your contacts.
    </p>

    <!-- Hidden Input for CSV upload -->
    <input
      ref="importCsvFileInputRef"
      id="import-csv-file-upload"
      class="hidden"
      type="file"
      accept=".csv"
      @change="handleFileUpload"
    >

    <!-- if csv uploaded -->
    <div
      v-if="fileName"
      class="uploaded-csv-file-form"
    >
      <!-- csv file details -->
      <q-card
        flat
        class="uploaded-csv-file-details-card"
      >
        <div class="flex no-wrap items-center">
          <LocalSvgIcon image="csv" />

          <div class="file-details-container">
            <p class="file-name-text ellipsis">
              {{ fileName }}
            </p>

            <!-- KB -->
            <div class="file-size-details">
              <p class="file-size-label-text">
                CSV
              </p>

              <!-- Dot -->
              <LocalSvgIcon
                image="circle-dot"
                classes="dot-icon"
              />

              <p class="file-size-label-text">
                {{ prettyMemoryBytes(fileSize) }}
              </p>
            </div>
          </div>
        </div>

        <q-space />

        <!-- Reupload and Delete button -->
        <div class="flex no-wrap items-center">
          <!-- Reupload -->
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            label="Reupload"
            class="btn-font-weight-500 q-mr-sm"

            @click="onReuploadCsvFile"
          />

          <!-- Delete -->
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            label="Delete"
            class="btn-font-weight-500"

            @click="onDeleteCsvFile"
          />
        </div>
      </q-card>

      <!-- List mapping and contacts merge/skip -->
      <div
        v-if="showListMapping"
        class="import-contacts-list-mapping"
      >
        <!-- List Mapping -->
        <div
          class="full-width"
        >
          <!-- Select a list -->
          <h6 class="upload-file-header-text">
            Select a List
          </h6>

          <p class="upload-file-desc-text">
            Select/Create a list to import all these contacts to group together in single place.
          </p>

          <SelectList
            v-model="listDetailsJson"
            canCreateList

            class="upload-select-dd"

            ref="selectListRef"
            lazy-rules="ondemand"
            :rules="[value => !!value?.id || 'List is required']"

            @update:model-value="onListChange"
          />
        </div>

        <!-- Contacts merge/skip -->
        <div
          class="full-width"
        >
          <h6 class="upload-file-header-text">
            If a lead already exists
          </h6>

          <p class="upload-file-desc-text">
            You can choose to either skip the lead or merge
            the new information with the existing lead.
            Leads are matched based on their email address.
          </p>

          <SelectContactConflictAction
            v-model="mergeStrategy"
            class="upload-select-dd"
          />
        </div>
      </div>
    </div>

    <!-- upload new csv file -->
    <q-card
      v-else
      flat
      class="upload-csv-file-card"

      @dragover="dragover"
      @dragleave="dragleave"
      @drop="onDropCsvFile"
    >
      <label
        for="import-csv-file-upload"
        class="import-csv-container"

        v-ripple:primary
      >
        <LocalSvgIcon
          image="upload"
        />

        <p class="drag-drop-text">
          Drag & drop your file to upload or <span>Browser File</span>
        </p>

        <p class="supported-file-types-text">
          Supported file types: CSV
        </p>
      </label>
    </q-card>
  </div>
</template>

<script>
// lodash
import get from 'lodash/get';
import size from 'lodash/size';

// quasar
import { useQuasar } from 'quasar';

// vue router
import { useRoute } from 'vue-router';

// vue
import {
  defineComponent, onMounted, reactive, toRefs, nextTick,
} from 'vue';

// npm
import Papa from 'papaparse';

// Components
import SelectList from 'components/Dropdown/SelectList.vue';
import SelectContactConflictAction from 'components/Dropdown/SelectContactConflictAction.vue';

// utils
import { prettyMemoryBytes } from 'src/utils/numbers';

// constants
import { CONTACT_IMPORT_CONFLICT_ACTION } from 'boot/campaign-constants';

export default defineComponent({
  name: 'UploadFile',

  emits: ['onCompleteStep', 'update:formChanged'],

  components: {
    SelectList,
    SelectContactConflictAction,
  },

  props: {
    formChanged: {
      type: Boolean,
      required: true,
    },
    csvDataJson: {
      type: Object,
      default: () => ({}),
    },
    showListMapping: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // quasar
    const $q = useQuasar();

    // route
    const $route = useRoute();

    // state
    const state = reactive({
      isContactUpload: false,

      listDetailsJson: {},

      fileName: '',
      fileSize: 0,
      csvData: null,
      csvHeaders: [],

      mergeStrategy: CONTACT_IMPORT_CONFLICT_ACTION.SKIP.value,

      selectListRef: null,
      importCsvFileInputRef: null,
    });

    // methods
    const dragover = (event) => {
      /** file drag over */
      event.preventDefault();
    };

    const dragleave = async () => {
      /** set to false once left */
      await nextTick();
    };

    const onSaveAndContinue = async () => {
      // make sure the CSV file is uploaded
      if (!state.fileName) {
        $q.dialog({
          title: 'No File Uploaded',
          message: 'Please upload a CSV file to continue.',
        });
        return;
      }

      const emitJson = {
        csvData: state.csvData,
        csvHeaders: state.csvHeaders,
        fileName: state.fileName,
        fileSize: state.fileSize,
      };

      // validate the select list dropdown
      if (!props.showListMapping) {
        emit('onCompleteStep', emitJson);
        return;
      }

      const isValid = await state.selectListRef.validate();

      if (isValid) {
        emit('onCompleteStep', {
          listId: state.listDetailsJson.id,
          mergeStrategy: state.mergeStrategy,
          ...emitJson,
        });
      } else {
        // scroll to the ref
        state.selectListRef.$el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const confirmTheFileFormat = (file) => {
      if (file.type === 'text/csv') {
        return true;
      }

      // show popup for invalid file format
      $q.dialog({
        title: 'Invalid File Format',
        message: 'Please upload a valid CSV file.',
        ok: {
          label: 'OK',
          color: 'primary',
        },
      });
      return false;
    };

    const handleFileUpload = (event) => {
      // read file
      const files = event.target.files || event.dataTransfer.files;

      // validate file
      if (!files) return;

      // update file name
      const file = get(files, '[0]') || {};

      // confirm if only the CSV file is uploaded
      const isConfirmed = confirmTheFileFormat(file);

      if (!isConfirmed) return;

      // set the file name
      state.fileName = file.name;
      state.fileSize = file.size;

      // parse CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          state.csvData = results.data;
          state.csvHeaders = results.meta.fields?.filter((field) => !!field);

          if (!props.showListMapping) {
            onSaveAndContinue();
          }
        },
      });

      // reset the input value to allow re-uploading the same file if needed
      event.target.value = null;
      state.importCsvFileInputRef = null;
    };

    const onDropCsvFile = (event) => {
      /** handle file drop */
      event.preventDefault();

      handleFileUpload(event);
    };

    const onReuploadCsvFile = () => {
      /** reupload csv file */
      state.importCsvFileInputRef.click();
    };

    const onDeleteCsvFile = () => {
      /** delete the uploaded csv file */
      state.fileName = '';
      state.fileSize = 0;
      state.csvData = null;
      state.csvHeaders = [];

      // form changed emit
      emit('update:formChanged', false);
    };

    const onListChange = () => {
      state.selectListRef.resetValidation();
    };

    // lifecycle hooks
    onMounted(() => {
      state.isContactUpload = props.showListMapping;

      if (size(props.csvDataJson) > 0) {
        // prefill data from props
        state.listDetailsJson = {
          id: get(props.csvDataJson, 'listId', null),
        };
        state.fileName = get(props.csvDataJson, 'fileName', '');
        state.fileSize = get(props.csvDataJson, 'fileSize', 0);
        state.csvData = get(props.csvDataJson, 'csvData', null);
        state.csvHeaders = get(props.csvDataJson, 'csvHeaders', []);
      }

      if ($route.params.listId) {
        state.listDetailsJson.id = Number($route.params.listId);
      }
    });

    return {
      // state
      ...toRefs(state),

      // methods
      dragover,
      dragleave,
      onDropCsvFile,
      handleFileUpload,
      prettyMemoryBytes,
      onReuploadCsvFile,
      onDeleteCsvFile,
      onSaveAndContinue,
      onListChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.upload-file {
  width: 100%;
  max-width: 550px;

  padding: 20px;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    width: 100%;
    padding: 16px 12px;
  }

  .upload-file-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;
  }

  .upload-file-desc-text {
    color: rgba($color: var(--black-rgb), $alpha: 0.8);
    font-size: 14px;
    font-weight: 400;
    margin-top: 6px;
    margin-bottom: 16px;
  }

  .upload-select-dd {
    width: 100%;
    max-width: 330px;
  }

  // uploaded csv file form
  .uploaded-csv-file-form {
    width: 100%;

    .uploaded-csv-file-details-card {
      padding: 24px;
      border-radius: 6px;
      border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.07);
      background: rgba($color: var(--primary-rgb), $alpha: 0.06);

      margin-bottom: 40px;

      display: flex;
      align-items: center;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 16px 12px;

        align-items: flex-start;

        flex-direction: column;
        gap: 8px;
      }

      .file-details-container {
        margin: 0px 16px;
      }

      .file-name-text {
        color: $black;
        font-size: 13px;
        font-weight: 500;

        margin-bottom: 6px;

        max-width: 180px;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          width: 60vw;

          max-width: 100%;
        }
      }

      .file-size-details {
        display: flex;
        align-items: center;

        :deep(.dot-icon) {
          max-height: 3px;
          max-width: 3px;

          margin: 0px 3px;

          circle {
            fill: $grey-300;
            stroke-width: 2px;
          }
        }

        .file-size-label-text {
          color: $grey-400;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.84px;
        }
      }
    }

    .import-contacts-list-mapping {
      display: flex;
      flex-direction: column;
      gap: 24px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        gap: 16px;
      }
    }
  }

  // upload new csv file
  .upload-csv-file-card {
    border-radius: 10px;
    background: rgba($color: var(--primary-rgb), $alpha: 0.05);
    border: 1px dashed rgba($color: var(--primary-rgb), $alpha: 0.3);

    .import-csv-container {
      cursor: pointer;

      width: 100%;
      padding: 62px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .drag-drop-text {
        color: rgba($color: var(--black-rgb), $alpha: 0.8);
        text-align: center;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px; /* 114.286% */

        margin: 12px 0px;
      }

      .supported-file-types-text {
        text-align: center;
        color: rgba($color: var(--grey-rgb), $alpha: 0.8);
        font-size: 14px;
        font-weight: 400;
      }
    }
  }
}
</style>
