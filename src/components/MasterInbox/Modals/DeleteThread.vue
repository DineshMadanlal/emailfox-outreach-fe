<template>
  <q-card flat class="app-modal-card delete-thread-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Delete Email
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

    <!-- content -->
    <div class="app-modal-content">
      <p class="delete-warning-text">
        Are you sure you want to delete the email?
      </p>
    </div>

    <!-- footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        label="Delete"
        color="negative"

        :loading="isApiLoading"

        @click="onDeleteThread"
      />

      <!-- Cancel -->
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

// utils
import { deleteApiCall } from 'src/utils/apiRequests.js';

export default defineComponent({
  name: 'DeleteThread',

  emits: ['onSuccessfulDeleteThread'],

  props: {
    threadId: {
      type: Number,
      required: true,
      default: null,
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,
    });

    // methods
    const onDeleteThread = async () => {
      try {
        state.isApiLoading = true;

        await deleteApiCall({
          endpoint: `skybox/threads/${props.threadId}`,
        });

        emit('onSuccessfulDeleteThread');

        // show success toast
        appContext.config.globalProperties.$toast({
          message: 'Email deleted successfully',
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

      // methods
      onDeleteThread,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-thread-card {
  max-width: 440px;

  // content
  .app-modal-content {
    .delete-warning-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
    }
  }

  // footer
  .app-modal-footer {
    column-gap: 16px;
  }
}
</style>
