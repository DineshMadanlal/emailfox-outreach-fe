<template lang="">
  <q-card flat class="app-modal-card delete-profile-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Delete Suppression
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
        Are you sure you want to delete the suppression?
        <br />
        <br />
        <br />
        This action cannot be undone.
      </p>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        label="Delete"
        color="negative"

        :loading="isApiLoading"

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

// constants
import { TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';

export default defineComponent({
  name: 'DeleteSuppression',

  emits: ['deleteSuccess'],

  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
    selectedData: {
      type: Array,
      default: () => [],
    },
    multiSelectOptionJson: {
      type: Object,
      default: () => ({}),
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
    const onConfirmDelete = async () => {
      try {
        state.isApiLoading = true;

        const payload = {};

        // filters
        if (props.filters.searchText) {
          payload.search_text = props.filters.searchText;
        }

        //
        if (props.multiSelectOptionJson?.selectedOption
          === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
          payload.select_all = true;
        } else {
          // pass ids of selected data
          payload.ids = props.selectedData.map((data) => data.id);
        }

        await deleteApiCall({
          includeWorkspace: true,
          endpoint: '/global-suppressions/bulk-delete',
          payload,
        });

        appContext.config.globalProperties.$toast({
          message: 'Suppression deleted successfully',
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

    .permanent-delete-text {
      color: $negative;
    }
  }
}
</style>
