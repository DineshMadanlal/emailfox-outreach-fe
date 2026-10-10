<template>
  <q-card flat class="app-modal-card delete-tag-card">
    <!-- Header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        Delete Tag
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
        Are you sure you want to delete the tag
        <strong v-if="tagJson?.name">"{{ tagJson.name }}"</strong>?
        <br />
        <br />
        This action cannot be undone.
      </p>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <q-btn
        no-caps
        unelevated
        color="negative"
        label="Delete Tag"
        :loading="isApiLoading"
        @click="onDeleteTag"
      />

      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        label="Cancel"
        color="negative"
        class="q-ml-sm light-negative-btn"
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
  name: 'DeleteTag',

  emits: ['onSuccessfulDelete'],

  props: {
    tagJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,
    });

    // methods
    const onDeleteTag = async () => {
      try {
        state.isApiLoading = true;

        // api call
        await deleteApiCall({
          includeWorkspace: true,
          endpoint: `/tags/${props.tagJson.id}`,
        });

        appContext.config.globalProperties.$toast({
          message: 'Tag deleted successfully',
        });

        //
        emit('onSuccessfulDelete', props.tagJson.id);
      } catch (error) {
        // error
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to delete tag',
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // methods
      onDeleteTag,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-tag-card {
  max-width: 560px;

  .delete-warning-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
  }
}
</style>
