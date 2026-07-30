<template>
  <q-card flat class="app-modal-card archive-sequence-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Archive Campaign
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
      <p class="archive-warning-text">
        Archiving the campaign will
        <span class="permanent-archive-text">
          remove
        </span>
        all associated data from active view.
        <br />
        <br />
        This action cannot be undone. Are you sure you want to continue?
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToDelete"

        color="primary"
        label="I understand the consequences of archiving the campaign."
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="negative"
        label="Archive Campaign"

        :loading="isApiLoading"
        :disabled="!agreeToDelete"

        @click="onArchiveCampaign"
      />

      <!-- Delete -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        :loading="isApiLoading"

        label="Cancel"
        color="negative"

        class="light-negative-btn"
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
import { deleteApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'ArchiveCampaign',

  emits: ['onSuccess'],

  props: {
    selectedCampaignJson: {
      type: Object,
      required: true,
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      agreeToDelete: false,

      isApiLoading: false,
    });

    // methods
    const onArchiveCampaign = async () => {
      try {
        state.isApiLoading = true;

        await deleteApiCall({
          includeWorkspace: true,
          endpoint: `sequences/${props.selectedCampaignJson.id}`,
        });

        appContext.config.globalProperties.$toast({
          message: 'Campaign archived successfully',
        });

        emit('onSuccess');
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
      onArchiveCampaign,
    };
  },
});
</script>

<style lang="scss" scoped>
.archive-sequence-card {
  max-width: 600px;

  .light-negative-btn {
    margin-left: 12px;
  }

  .archive-warning-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;

    margin-bottom: 20px;

    .permanent-archive-text {
      color: $negative;
    }
  }
}
</style>
