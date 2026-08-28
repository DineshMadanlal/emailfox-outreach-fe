<template>
  <div class="all-mailboxes-page">
    <!-- dialog -->
    <q-dialog
      v-model="modals.importHistory"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <BulkImportHistory />
    </q-dialog>

    <!-- Teleport Import Button -->
    <Teleport
      to="#mailboxImporting"
      v-if="showImportMailboxButton && jobData"
    >
      <q-btn
        no-caps
        unelevated

        class="import-job-status-btn"

        :class="isJobCompleted ? 'btn-completed' : 'btn-importing'"
        @click="modals.importHistory = true"
      >
        <div class="flex no-wrap items-center button-inner-content">
          <LocalSvgIcon
            v-if="isJobCompleted"
            image="circle-tick"
            classes="status-icon completed-icon"
          />

          <LocalSvgIcon
            v-else
            image="sync"
            classes="status-icon importing-icon is-spinning"
          />

          <div class="btn-text">
            {{ isJobCompleted ? 'Import Completed' : 'Importing Mailboxes' }}
          </div>
        </div>
      </q-btn>
    </Teleport>

    <!-- table -->
    <MailboxesTable
      fromAllMailboxesPage

      @importHistory="modals.importHistory = true"
    />
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, onUnmounted,
} from 'vue';

// router
import { useRoute } from 'vue-router';

// quasar
import { useMeta } from 'quasar';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Utils
import { convertStringToNumber } from 'src/utils/numbers.js';

// api
import { getSmtpBulkImportJob } from 'src/utils/domainMailboxesApi.js';

// Components
import MailboxesTable from 'components/Mailboxes/MailboxesTable.vue';
import BulkImportHistory from 'src/components/Mailboxes/Modals/BulkImportHistory.vue';

export default defineComponent({
  name: 'AllMailboxes',

  components: {
    MailboxesTable,
    BulkImportHistory,
  },

  setup() {
    // route
    const $route = useRoute();

    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('All Mailboxes'));

    // state
    const state = reactive({
      pollInterval: null,
      jobData: null,

      modals: {
        importHistory: false,
      },

      showImportMailboxButton: false,
    });

    const isJobCompleted = computed(
      () => (state.jobData?.status || '').toLowerCase() === 'completed',
    );

    const stopPolling = () => {
      if (state.pollInterval) {
        clearInterval(state.pollInterval);
        state.pollInterval = null;
      }
    };

    const startPolling = (jobId) => {
      stopPolling();

      state.pollInterval = setInterval(async () => {
        try {
          const response = await getSmtpBulkImportJob(jobId);
          if (response && response.id) {
            state.jobData = response;
            if (response.status?.toLowerCase() !== 'pending') {
              stopPolling();
            }
          }
        } catch {
          stopPolling();
        }
      }, 30000);
    };

    const fetchJobDetails = async () => {
      const jobId = convertStringToNumber($route.query.jobId);

      if (!jobId) {
        state.showImportMailboxButton = false;
        state.jobData = null;
        return;
      }

      try {
        const response = await getSmtpBulkImportJob(jobId);

        if (response && response.id) {
          state.jobData = response;
          state.showImportMailboxButton = true;

          if (response.status?.toLowerCase() === 'pending') {
            startPolling(jobId);
          }
        } else {
          state.showImportMailboxButton = false;
          state.jobData = null;
        }
      } catch {
        state.showImportMailboxButton = false;
        state.jobData = null;
      }
    };

    // lifecycle hooks
    onMounted(() => {
      fetchJobDetails();
    });

    onUnmounted(() => {
      stopPolling();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      isJobCompleted,
    };
  },
});
</script>

<style lang="scss" scoped>
.all-mailboxes-page {
  width: 100%;
  display: flex;
  min-height: 0;
  flex-direction: column;
}

.import-job-status-btn {
  border-radius: 6px;
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 500;

  .button-inner-content {
    gap: 8px;

    .status-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .btn-text {
      white-space: nowrap;
    }
  }

  &.btn-completed {
    border: 1px solid #1FAE79;
    background: linear-gradient(90deg, #32BB72 0%, #089D82 100%);
    color: $white;

    :deep(.completed-icon) {
      @include svg-icon-stroke('path, circle', $white);
    }
  }

  &.btn-importing {
    color: $white;
    border-radius: 6px;
    border: 1px solid #A0C0FF;
    background: linear-gradient(90deg, #3252BB 0%, #08849D 100%);

    :deep(.importing-icon) {
      @include svg-icon-stroke('path, circle', $white);

      &.is-spinning {
        animation: rotateForever 1.5s linear infinite;
      }
    }
  }
}
</style>
