<template>
  <q-card flat class="app-modal-card apply-to-existing-inbox-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Apply Filter to Existing Inbox
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
      <p class="apply-info-text">
        Emails matching the filter rules will be moved to this folder.
        This action will be applied to all existing emails in your
        inbox and may take some time depending on the volume.
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToMigrate"

        color="primary"
        label="I understand this will apply the filter to
        all existing emails and move matching ones to this folder."
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Apply Filter"

        :loading="isApiLoading"
        :disabled="!agreeToMigrate"

        @click="onApplyFilterToExistingInbox"
      />

      <!-- Delete -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        :loading="isApiLoading"

        label="Cancel"
        color="primary"

        class="light-primary-btn"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// Utils
import { postApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'ApplyToExistingInbox',

  emits: ['onClose'],

  props: {
    folderJson: {
      type: Object,
      required: true,
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();
    const pluralize = appContext.config.globalProperties.$pluralize;

    // state
    const state = reactive({
      agreeToMigrate: false,

      isApiLoading: false,
    });

    // methods
    const onApplyFilterToExistingInbox = async () => {
      try {
        state.isApiLoading = true;

        const response = await postApiCall({
          endpoint: `skybox/mail-folders/${props.folderJson.id}/apply-rules`,
        });

        const emailsCount = response.thread_count;

        const successText = emailsCount
          ? `${emailsCount} ${pluralize('Email', emailsCount)} moved successfully to the folder.`
          : 'Emails moved successfully to the folder.';

        appContext.config.globalProperties.$toast({
          message: successText,
        });

        emit('onClose');
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
      onApplyFilterToExistingInbox,
    };
  },
});
</script>

<style lang="scss" scoped>
.apply-to-existing-inbox-card {
  max-width: 600px;

  .light-primary-btn {
    margin-left: 12px;
  }

  .apply-info-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;

    margin-bottom: 20px;
  }
}
</style>
