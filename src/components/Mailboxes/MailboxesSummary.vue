<template>
  <div class="mailboxes-summary-container">
    <!-- Bulk Reconnect Modal -->
    <q-dialog
      v-model="modals.showBulkReconnectMailboxes"
      class="app-modal-dialog"
    >
      <BulkReconnectMailboxes
        @onSuccess="onSuccessfulBulkReconnect"
      />
    </q-dialog>

    <ApiLoader
      v-if="showApiLoader"
      show
    />

    <div class="mailboxes-summary">
      <div
        v-for="stat in deliveryStats"
        :key="`each-mailbox-summary-${stat.key}`"

        class="each-delivery-stat-block"

        @click="onFilterStat(stat.key)"
      >
        <LocalSvgIcon
          :image="stat.icon"
          :class="`each-stat-icon ${stat.color}`"
        />

        <div class="stat-text">
          <div class="stat-label">
            {{ stat.label }}
          </div>

          <div class="stat-value">
            {{ getNumeralAmount(stat.value) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Disconnected Banner -->
    <div
      v-if="mailboxesStats.disconnected_count > 0"
      class="disconnected-mailboxes-banner"
      :class="{ 'in-progress': isReconnectingInProgress }"
    >
      <div
        v-if="isReconnectingInProgress"
        class="banner-text"
      >
        <span class="font-weight-bold">
          {{ getNumeralAmount(reconnectResponse?.queue_count
            || mailboxesStats.disconnected_count) }}
          mailboxes are reconnecting in the background.
        </span>
        <span>Reconnection may take a few minutes. Check back soon. </span>

        <span
          class="reconnect-action-link refresh-link"
          @click="makeApiCallOnMounted"
        >
          <span>Refresh Status</span>
        </span>
      </div>

      <div
        v-else
        class="banner-text"
      >
        <span class="font-weight-bold">
          {{ getNumeralAmount(mailboxesStats.disconnected_count) }} mailboxes disconnected.
        </span>
        <span>Bulk reconnect all mailboxes with one click. </span>
        <span
          class="reconnect-action-link"
          @click="modals.showBulkReconnectMailboxes = true"
        >
          <span>Reconnect Mailboxes</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, onMounted, getCurrentInstance,
  toRefs,
} from 'vue';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import BulkReconnectMailboxes from 'components/Mailboxes/Modals/BulkReconnectMailboxes.vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers.js';
import { getMailboxesOverallStatus } from 'src/utils/domainMailboxesApi.js';

// Store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// file constant
const STAT_KEYS = {
  CONNECTED: 'connected',
  WARMUP_ERROR: 'warmupError',
  DISCONNECTED: 'disconnected',
};

export default defineComponent({
  name: 'MailboxesSummary',

  emits: ['filter-connected', 'filter-warmup-error', 'filter-disconnected'],

  components: {
    ApiLoader,
    BulkReconnectMailboxes,
  },

  setup(props, { emit }) {
    // appContext
    const { appContext } = getCurrentInstance();

    // store
    const userStore = useUserPreferencesStore();

    // state
    const state = reactive({
      mailboxesStats: {
        connected_count: 0,
        warmup_error_count: 0,
        disconnected_count: 0,
      },

      modals: {
        showBulkReconnectMailboxes: false,
      },

      reconnectResponse: null,
      isApiLoading: false,
      isReconnectingInProgress: false,
    });

    // computed
    const storedOverallStatus = computed(() => userStore.allMailboxesState.overallStatus || {});

    const deliveryStats = computed(() => {
      if (!state.mailboxesStats) return [];

      const {
        connected_count = 0,
        warmup_error_count = 0,
        disconnected_count = 0,
      } = state.mailboxesStats;

      return [
        {
          key: STAT_KEYS.CONNECTED,
          label: 'Connected Mailbox',
          value: connected_count,
          icon: 'connected',
          color: 'positive',
        },
        {
          key: STAT_KEYS.WARMUP_ERROR,
          label: 'Warmup Error',
          value: warmup_error_count,
          icon: 'seq-bounced',
        },
        // {
        //   key: 'authenticationError',
        //   label: 'Authentication Error',
        //   value: authenticationError,
        //   icon: 'seq-bounced',
        //   color: 'negative',
        // },
        {
          key: STAT_KEYS.DISCONNECTED,
          label: 'Disconnected',
          value: disconnected_count,
          icon: 'disconnected',
        },
      ];
    });

    // computed
    const showApiLoader = computed(() => {
      if (state.isReconnectingInProgress) {
        return state.isApiLoading;
      }
      return state.mailboxesStats.connected_count === 0 && state.isApiLoading;
    });

    // methods
    const makeApiCallOnMounted = async () => {
      try {
        state.isApiLoading = true;

        // make api call
        const response = await getMailboxesOverallStatus();

        if (response) {
          state.mailboxesStats = response;
        }

        // store
        userStore.setMultipleFields({
          allMailboxesState: {
            ...userStore.allMailboxesState,
            overallStatus: response,
          },
        });
      } catch (error) {
        // show error warning
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const onFilterStat = (key) => {
      if (key === STAT_KEYS.CONNECTED) {
        emit('filter-connected');
      } else if (key === STAT_KEYS.WARMUP_ERROR) {
        emit('filter-warmup-error');
      } else if (key === STAT_KEYS.DISCONNECTED) {
        emit('filter-disconnected');
      }
    };

    const onSuccessfulBulkReconnect = (response) => {
      state.reconnectResponse = response;
      state.modals.showBulkReconnectMailboxes = false;
      state.isReconnectingInProgress = true;
    };

    // lifecylce
    onMounted(() => {
      if (storedOverallStatus.value?.connected_count) {
        state.mailboxesStats = storedOverallStatus.value;
      }

      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      deliveryStats,
      showApiLoader,

      // method
      onFilterStat,
      getNumeralAmount,
      makeApiCallOnMounted,
      onSuccessfulBulkReconnect,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailboxes-summary-container {
  width: 100%;
  padding: 0px 20px;
  position: relative;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 0 12px;
  }

  .mailboxes-summary {
    width: 100%;

    border-radius: 8px;
    background: rgba($color: var(--grey-50-rgb), $alpha: 0.3);
    border: 1px solid rgba($color: var(--grey-100-rgb), $alpha: 0.2);
    backdrop-filter: blur(10px);

    display: flex;
    align-items: center;
    justify-content: space-between;

    flex-wrap: nowrap;
    overflow-x: auto;

    gap: 32px;

    padding: 24px 20px;

    z-index: 1;
    position: relative;

    // include custom scrollbar
    @include custom-scrollbar;

    // xs max
    @media (max-width: $breakpoint-sm-max) {
      gap: 16px;
      padding: 16px 12px;
    }

    .each-delivery-stat-block {
      gap: 8px;
      display: flex;
      min-width: 168px;
      cursor: pointer;

      &:not(:first-child) {
        padding-left: 12px;
        border-left: 1px solid $grey-50;
      }

      &:last-child {
        padding-right: 72px;

        // md max
        @media (max-width: $breakpoint-md-max) {
          padding-right: 32px;
        }
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        border-left: 0px !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
      }

      :deep(.each-stat-icon) {
        &.positive {
          @include svg-icon-stroke('path, circle, rect', $positive);
        }

        &.warning {
          @include svg-icon-stroke('circle, path, rect', $warning);
        }

        &.negative {
          @include svg-icon-fill('path', $negative);

          circle {
            &:first-child {
              stroke: $negative;
            }

            &:last-child {
              fill: $negative;
            }
          }
        }
      }

      .stat-text {
        .stat-label {
          color: $grey-800;
          font-size: 14px;
          line-height: 16px;
        }

        .stat-value {
          color: $black;
          font-size: 18px;
          font-weight: 500;

          margin-top: 6px;
        }
      }
    }
  }

  .disconnected-mailboxes-banner {
    width: 100%;

    border-radius: 0 0 8px 8px;
    background: rgba(var(--negative-rgb), 0.05);

    border: 1px solid rgba(var(--negative-rgb), 0.1);
    border-top: 0;

    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    bottom: 6px;

    padding: 20px 20px 14px 20px;

    @media (max-width: $breakpoint-xs-max) {
      padding: 18px 12px 14px 12px;
    }

    &.in-progress {
      background: rgba(var(--primary-rgb), 0.05);
      border-color: rgba(var(--primary-rgb), 0.15);

      .reconnect-action-link.refresh-link {
        color: $primary;
      }
    }

    .banner-text {
      color: $grey-800;
      font-size: 14px;
      line-height: 20px;

      .font-weight-bold {
        font-weight: 600;
        color: $black;
      }

      .reconnect-action-link {
        color: $negative;
        cursor: pointer;
        margin-left: 4px;

        display: inline-flex;
        align-items: center;
        gap: 6px;

        text-decoration-line: underline;
        text-decoration-style: solid;
        text-decoration-skip-ink: none;
        text-decoration-thickness: auto;
        text-underline-offset: auto;
        text-underline-position: from-font;

        &.is-disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }

        .reconnect-spinner {
          color: $negative;
        }

        &:hover:not(.is-disabled) {
          opacity: 0.85;
        }
      }
    }
  }
}
</style>
