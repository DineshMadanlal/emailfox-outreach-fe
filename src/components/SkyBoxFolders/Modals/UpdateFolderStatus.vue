<template>
  <q-card flat class="app-modal-card folder-status-update-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Mark Folder as <span>{{ newStatus }}</span>
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
      <p
        class="status-warning-text"
        v-if="newStatus === FOLDER_STATUS.INACTIVE"
      >
        You are about to mark this folder as
        <span class="text-negative">inactive</span>.
        <br /><br />
        All new emails will be automatically moved to another folder
        that matches the rules of this folder, or to the inbox if no matching folder is found.
      </p>

      <p
        v-else
        class="status-warning-text"
      >
        Are you sure you want to mark this folder as
        <span class="text-primary">active</span>?
        <br /><br />
        New incoming emails that match this folder's
        rules will start getting moved here automatically.
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToUpdate"

        color="primary"
        label="I agree to proceed with this change."
      >
      </q-checkbox>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Update"

        :loading="isApiLoading"
        :disabled="!agreeToUpdate"

        @click="onUpdateStatus"
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
// lodash
import capitalize from 'lodash/capitalize';

// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance, computed,
} from 'vue';

// Utils
import { postApiCall } from 'src/utils/apiRequests';

// constants
import { FOLDER_STATUS } from 'src/boot/constants';

export default defineComponent({
  name: 'UpdateFolderStatus',

  emits: ['successFolderUpdate'],

  props: {
    folderJson: {
      type: Object,
      required: true,
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      agreeToUpdate: false,

      isApiLoading: false,
    });

    // computed
    const newStatus = computed(() => (props.folderJson.status === FOLDER_STATUS.ACTIVE
      ? FOLDER_STATUS.INACTIVE : FOLDER_STATUS.ACTIVE));

    // methods
    const onUpdateStatus = async () => {
      try {
        state.isApiLoading = true;

        await postApiCall({
          endpoint: `skybox/mail-folders/${props.folderJson.id}/status`,
          payload: {
            status: newStatus.value,
          },
        });

        appContext.config.globalProperties.$toast({
          message: `The folder has been successfully marked as ${capitalize(newStatus.value)}.`,
        });

        emit('successFolderUpdate', {
          ...props.folderJson,
          status: newStatus,
        });
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

      // computed
      newStatus,

      // methods
      onUpdateStatus,

      // constants
      FOLDER_STATUS,
    };
  },
});
</script>

<style lang="scss" scoped>
.folder-status-update-card {
  max-width: 600px;

  .modal-header-text {
    span {
      font-weight: bold;
      text-transform: capitalize;
    }
  }

  .light-primary-btn {
    margin-left: 12px;
  }

  .status-warning-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;

    margin-bottom: 20px;

  }
}
</style>
