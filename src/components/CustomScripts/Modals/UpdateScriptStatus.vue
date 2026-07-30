<template>
  <q-card flat class="app-modal-card script-status-update-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Mark Script as <span>{{ newStatus }}</span>
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
        v-if="newStatus === SCRIPT_STATUS.INACTIVE"
      >
        You are about to mark this script as
        <span class="text-negative">inactive</span>.
        <br /><br />
        The script will no longer load in your application,
        and any associated functionality will be disabled.
      </p>

      <p
        v-else
        class="status-warning-text"
      >
        Are you sure you want to mark this script as
        <span class="text-primary">active</span>?
        <br /><br />
        The script will start loading in your application,
        and any associated functionality will be enabled.
      </p>
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

        @click="onUpdateStatus"
      />

      <!-- Cancel -->
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
import { SCRIPT_STATUS } from 'src/boot/constants';

export default defineComponent({
  name: 'UpdateScriptStatus',

  emits: ['successStatusUpdate'],

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

    // computed
    const newStatus = computed(() => (props.scriptJson.status === SCRIPT_STATUS.ACTIVE
      ? SCRIPT_STATUS.INACTIVE : SCRIPT_STATUS.ACTIVE));

    // methods
    const onUpdateStatus = async () => {
      try {
        state.isApiLoading = true;

        const payload = {
          ...props.scriptJson,
          status: newStatus.value,
        };

        await postApiCall({
          endpoint: 'partners/custom-scripts',
          payload,
        });

        appContext.config.globalProperties.$toast({
          message: `The script has been successfully marked as ${capitalize(newStatus.value)}.`,
        });

        emit('successStatusUpdate', payload);
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
      SCRIPT_STATUS,
    };
  },
});
</script>

<style lang="scss" scoped>
.script-status-update-card {
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
  }
}
</style>
