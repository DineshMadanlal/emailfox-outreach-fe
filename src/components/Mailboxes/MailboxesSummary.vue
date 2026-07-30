<template>
  <div class="mailboxes-summary-container">
    <ApiLoader
      v-if="mailboxesStats.connected_count === 0 && isApiLoading"
      show
    />

    <div class="mailboxes-summary">
      <div
        v-for="stat in deliveryStats"
        :key="`each-mailbox-summary-${stat.key}`"

        class="each-delivery-stat-block"
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

// utils
import { getNumeralAmount } from 'src/utils/numbers.js';
import { getMailboxesOverallStatus } from 'src/utils/domainMailboxesApi.js';

// Store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

export default defineComponent({
  name: 'MailboxesSummary',

  components: {
    ApiLoader,
  },

  setup() {
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

      isApiLoading: false,
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
          key: 'connected',
          label: 'Connected Mailbox',
          value: connected_count,
          icon: 'connected',
          color: 'positive',
        },
        {
          key: 'warmupError',
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
          key: 'disconnected',
          label: 'Disconnected',
          value: disconnected_count,
          icon: 'disconnected',
        },
      ];
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

      // method
      getNumeralAmount,
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

    display: flex;
    align-items: center;
    justify-content: space-between;

    flex-wrap: nowrap;
    overflow-x: auto;

    gap: 32px;

    padding: 24px 20px;

    // include custom scrollbar
    @include custom-scrollbar;

    // xs max
    @media (max-width: $breakpoint-sm-max) {
      gap: 16px;
      padding: 16px 12px;
    }

    .each-delivery-stat-block {
      display: flex;
      gap: 8px;
      min-width: 168px;

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
}
</style>
