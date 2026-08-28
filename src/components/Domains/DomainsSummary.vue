<template>
  <div class="domains-summary-container">
    <ApiLoader
      v-if="domainsStat.connected_count === 0 && isApiLoading"
      show
    />

    <div class="domains-summary">
      <div
        v-for="stat in deliveryStats"
        :key="`each-domain-summary-${stat.key}`"

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
  defineComponent, computed, reactive, getCurrentInstance, onMounted, toRefs,
} from 'vue';

// components
import ApiLoader from 'components/General/ApiLoader.vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers.js';
import { getDomainsOverallStatus } from 'src/utils/domainMailboxesApi.js';

// Store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

export default defineComponent({
  name: 'DomainsSummary',

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
      isApiLoading: false,

      domainsStat: {
        connected_count: 0,
        authentication_error_count: 0,
      },
    });

    // computed
    const storedOverallStatus = computed(() => userStore.allDomainsState.overallStatus || {});

    const deliveryStats = computed(() => {
      if (!state.domainsStat) return [];

      const {
        connected_count = 0,
        authentication_error_count = 0,
      } = state.domainsStat;

      return [
        {
          key: 'connected',
          label: 'Domains',
          value: connected_count,
          icon: 'connected',
          color: 'positive',
        },
        {
          key: 'authenticationError',
          label: 'Authentication Error',
          value: authentication_error_count,
          icon: 'seq-bounced',
          color: 'negative',
        },
      ];
    });

    // methods
    const makeApiCallOnMounted = async () => {
      try {
        state.isApiLoading = true;

        // make api call
        const response = await getDomainsOverallStatus();

        if (response) {
          state.domainsStat = response;
        }

        // store
        userStore.setMultipleFields({
          allDomainsState: {
            ...userStore.allDomainsState,
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
        state.domainsStat = storedOverallStatus.value;
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
.domains-summary-container {
  width: 100%;
  padding: 0px 20px;
  position: relative;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 0 12px;
  }

  .domains-summary {
    width: 100%;

    border-radius: 8px;
    background: rgba($color: var(--grey-50-rgb), $alpha: 0.3);

    display: flex;
    align-items: center;

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
