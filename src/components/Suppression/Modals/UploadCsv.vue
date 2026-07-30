<template>
  <q-card flat class="app-modal-card upload-csv-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Upload CSV
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

    <!-- Content -->
    <div class="app-modal-content">
      <UploadFile
        :csvDataJson="csvDataJson"

        class="upload-file-component"

        v-model:formChanged="formChanged"

        @onCompleteStep="onCompleteUploadFileStep"
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Upload -->
      <q-btn
        no-caps
        unelevated

        label="Upload"
        color="primary"

        :disabled="!formChanged"
        :loading="isApiProcessing"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// components
import UploadFile from 'components/ContactsManager/UploadFile.vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';
import { detectSuppressionColumns } from 'src/utils/csvHelpers';

// constants
import { SUPPRESSION_TYPE } from 'boot/campaign-constants';

export default defineComponent({
  name: 'UploadCsv',

  emits: ['onSuccessfulAdd'],

  components: {
    UploadFile,
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      csvDataJson: null,

      formChanged: false,

      isApiProcessing: false,
    });

    // computed
    const isCsvUploaded = computed(() => {
      if (state.csvDataJson?.fileName) {
        return true;
      }

      return false;
    });

    // methods
    const bulkAddSuppression = async (selected) => {
      try {
        state.isApiProcessing = true;

        const payload = {
          values: selected.values,
          reason: 'Blocked by user',
          suppression_type: SUPPRESSION_TYPE.MANUAL_BLOCK.value,
        };

        await postApiCall({
          includeWorkspace: true,
          endpoint: '/global-suppressions/bulk-import',
          payload,
        });

        state.formChanged = false;

        emit('onSuccessfulAdd');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    const onCompleteUploadFileStep = (inputJson) => {
      state.formChanged = true;
      state.csvDataJson = { ...inputJson };

      const candidates = detectSuppressionColumns(state.csvDataJson);

      if (candidates.length > 0) {
        // pick up the first one...
        const selected = candidates[0];

        bulkAddSuppression(selected);
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isCsvUploaded,

      // methods
      onCompleteUploadFileStep,
    };
  },
});
</script>

<style lang="scss" scoped>
.upload-csv-card {
  max-width: 738px;
  position: relative;

  // sm min
  @media (min-width: $breakpoint-md-min) {
    width: 738px;
    min-height: 100%;
    border-radius: unset !important;

    display: flex;
    flex-direction: column;
  }

  .app-modal-content {
    @media (min-width: $breakpoint-md-min) {
      flex: 1;
    }

    .upload-file-component {
      padding: 0px;
    }
  }
}
</style>
