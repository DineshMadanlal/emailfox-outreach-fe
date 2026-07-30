<template>
  <q-card flat class="app-modal-card delete-script-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Delete Script
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
        Are you sure you want to delete this script?
      </p>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="negative"
        label="Delete"

        :loading="isApiLoading"

        @click="onDeleteScript"
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
  name: 'DeleteScript',

  emits: ['successDelete'],

  props: {
    scriptJson: {
      type: Object,
      required: true,
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
    const onDeleteScript = async () => {
      try {
        state.isApiLoading = true;

        await deleteApiCall({
          endpoint: `custom-scripts/${props.scriptJson.id}`,
        });

        appContext.config.globalProperties.$toast({
          message: 'Script deleted successfully',
        });

        emit('successDelete', props.scriptJson);
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
      onDeleteScript,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-script-card {
  max-width: 600px;

  .light-negative-btn {
    margin-left: 12px;
  }

  .delete-warning-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
  }
}
</style>
