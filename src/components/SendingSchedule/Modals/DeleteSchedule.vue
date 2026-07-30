<template lang="">
  <q-card flat class="app-modal-card delete-schedule-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Delete Sending Schedule
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
    <div
      v-if="isScheduleAssigned"
      class="app-modal-content"
    >
      <!-- Assigned to a campaign -->
      <p
        class="delete-warning-text"
      >
        This schedule is assigned to active campaigns. Select another schedule to
        keep those campaigns running.
      </p>
    </div>

    <!-- Content -->
    <div
      v-else
      class="app-modal-content"
    >
      <!-- Not assigned -->
      <p class="delete-warning-text">
        Are you sure you want to delete this schedule? This action cannot be undone.
      </p>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="negative"
        :label="isScheduleAssigned ? 'Delete & Re-assign' : 'Delete Schedule'"

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
  computed,
} from 'vue';

// Utils
import { deleteApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'DeleteSchedule',

  // emit
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
      isApiLoading: false,
    });

    // computed
    const isScheduleAssigned = computed(() => false);

    // methods
    const onConfirmDelete = async () => {
      try {
        state.isApiLoading = true;

        await deleteApiCall({
          includeWorkspace: true,
          endpoint: `/sending-schedules/${props.selectedTableDataJson.id}`,
        });

        appContext.config.globalProperties.$toast({
          message: 'Schedule deleted successfully',
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

      // computed
      isScheduleAssigned,

      // methods
      onConfirmDelete,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-schedule-card {
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
