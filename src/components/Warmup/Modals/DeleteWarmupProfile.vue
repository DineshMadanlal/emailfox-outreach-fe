<template lang="">
  <q-card flat class="app-modal-card delete-profile-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Delete Profile
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
      <p class="delete-warning-text">
        Are you sure you want to delete this profile? This action cannot be undone.
        Warmup will be disabled for all mailboxes currently using this profile.
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToDelete"

        color="primary"
        label="I understand the consequences of deleting the profile"
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="negative"
        label="Delete Profile"

        :loading="isApiLoading"
        :disabled="!agreeToDelete"

        @click="onConfirmDelete"
      />

      <!-- Delete -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        :loading="isApiLoading"

        color="negative"
        label="Cancel"

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
  name: 'DeleteWarmupProfile',

  emits: ['deleteSuccess'],

  props: {
    selectedTableDataJson: {
      type: Object,
      default: () => ({}),
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
    const onConfirmDelete = async () => {
      try {
        state.isApiLoading = true;

        await deleteApiCall({
          includeWorkspace: true,
          endpoint: `/warmup/profiles/${props.selectedTableDataJson.id}`,
        });

        appContext.config.globalProperties.$toast({
          message: 'Profile deleted successfully',
        });

        emit('deleteSuccess');
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
      onConfirmDelete,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-profile-card {
  max-width: 540px;

  .light-negative-btn {
    margin-left: 12px;
  }

  .delete-warning-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;

    margin-bottom: 20px;

    .permanent-delete-text {
      color: $negative;
    }
  }
}
</style>
