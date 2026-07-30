<template>
  <q-card flat class="app-modal-card leave-workspace-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Leave Workspace
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
      <p class="leave-warning-text">
        Leaving the workspace will
        <span class="permanent-leave-text">
          remove your access
        </span>
        to it's associated data,
        including mailboxes, sequences, contacts and lists.
        <br />
        <br />
        You can only regain access if a workspace admin invites you again.
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToLeave"

        color="primary"
        label="I understand the consequences of leaving the workspace"
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="negative"
        label="Leave Workspace"

        :loading="isApiLoading"
        :disabled="!agreeToLeave"

        @click="onLeaveWorkspace"
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
import { postApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'LeaveWorkspace',

  setup() {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      agreeToLeave: false,

      isApiLoading: false,
    });

    // methods
    const onLeaveWorkspace = async () => {
      try {
        state.isApiLoading = true;

        await postApiCall({
          endpoint: '/leave',
        });

        appContext.config.globalProperties.$toast({
          message: 'Workspace left successfully',
        });

        // redirect to workspace choose page
        window.location.href = 'https://app.emailfox.ai/workspace/choose';
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
      onLeaveWorkspace,
    };
  },
});
</script>

<style lang="scss" scoped>
.leave-workspace-card {
  max-width: 600px;

  .light-negative-btn {
    margin-left: 12px;
  }

  .leave-warning-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;

    margin-bottom: 20px;

    .permanent-leave-text {
      color: $negative;
    }
  }
}
</style>
