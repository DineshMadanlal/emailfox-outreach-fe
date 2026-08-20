<template>
  <div class="smtp-bulk-import">
    <!-- Step 1: Upload File + Field Mapping -->
    <SmtpBulkUploadFile
      v-if="activeStep === 1"

      :isSaving="isApiLoading"

      @goBack="$emit('goBack')"
      @onCompleteStep="onUploadComplete"
    />

    <!-- Step 2: Import Progress -->
    <SmtpBulkImportProgress
      v-else-if="activeStep === 2"

      :jobId="jobId"
      :fileName="csvDataJson.fileName"
      :fileSize="csvDataJson.fileSize"
    />
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// components
import SmtpBulkUploadFile from 'components/Mailboxes/SmtpBulkUploadFile.vue';
import SmtpBulkImportProgress from 'components/Mailboxes/SmtpBulkImportProgress.vue';

// utils
import { connectSmtpBulkImport } from 'src/utils/domainMailboxesApi.js';

export default defineComponent({
  name: 'SmtpBulkImport',

  components: {
    SmtpBulkUploadFile,
    SmtpBulkImportProgress,
  },

  emits: ['goBack', 'bulkStepChanged'],

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      activeStep: 1,
      jobId: null,
      isApiLoading: false,

      csvDataJson: {
        fileName: '',
        fileSize: 0,
      },
    });

    // methods
    const goToStep = (step) => {
      state.activeStep = step;
      emit('bulkStepChanged', step);
    };

    const onUploadComplete = async ({ mailboxes, fileName, fileSize }) => {
      try {
        state.isApiLoading = true;

        // Store file meta for progress screen
        state.csvDataJson = { fileName, fileSize };

        const response = await connectSmtpBulkImport({
          mailboxes,
          csv_filename: fileName,
        });

        state.jobId = response?.job_id;

        goToStep(2);
      } catch (error) {
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
      onUploadComplete,
    };
  },
});
</script>

<style lang="scss" scoped>
.smtp-bulk-import {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
