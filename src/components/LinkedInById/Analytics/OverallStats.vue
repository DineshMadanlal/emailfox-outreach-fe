<template>
  <div class="linkedin-overall-stats-section">
    <!-- Header -->
    <div class="stats-header-row">
      <h6 class="stats-header-title">
        Analytics
      </h6>
    </div>

    <!-- 5 KPI Cards Grid -->
    <div class="stats-cards-grid">
      <!-- Card 1: Invites sent -->
      <q-card
        flat
        class="stat-kpi-card"
      >
        <ApiLoader :show="isLoading" />

        <div class="stat-card-inner">
          <div class="stat-icon-wrapper stat-icon-wrapper--primary">
            <LocalSvgIcon
              image="people"
              class="linkedin-stat-icon"
            />
          </div>

          <div class="stat-content">
            <span class="stat-label">Invites sent</span>
            <h4 class="stat-value">
              {{ getNumeralAmount(statsData.li_connections_sent || 0) }}
            </h4>
            <span class="stat-subtext">
              {{ getNumeralAmount(statsData.li_connections_accepted || 0) }} accepted
            </span>
          </div>
        </div>
      </q-card>

      <!-- Card 2: Acceptance rate -->
      <q-card flat class="stat-kpi-card">
        <ApiLoader :show="isLoading" />

        <div class="stat-card-inner">
          <div class="stat-icon-wrapper stat-icon-wrapper--information">
            <LocalSvgIcon
              image="sequences"
              class="linkedin-stat-icon"
            />
          </div>

          <div class="stat-content">
            <span class="stat-label">Acceptance rate</span>
            <h4 class="stat-value">
              {{ acceptanceRate }}%
            </h4>
          </div>
        </div>
      </q-card>

      <!-- Card 3: Messages sent -->
      <q-card flat class="stat-kpi-card">
        <ApiLoader :show="isLoading" />

        <div class="stat-card-inner">
          <div class="stat-icon-wrapper stat-icon-wrapper--warning">
            <LocalSvgIcon
              image="chat"
              class="linkedin-stat-icon"
            />
          </div>

          <div class="stat-content">
            <span class="stat-label">Messages sent</span>
            <h4 class="stat-value">
              {{ getNumeralAmount(totalMessagesSent) }}
            </h4>
            <span class="stat-subtext">
              {{ getNumeralAmount(statsData.li_replies || 0) }} replies
            </span>
          </div>
        </div>
      </q-card>

      <!-- Card 4: Reply rate -->
      <q-card flat class="stat-kpi-card">
        <ApiLoader :show="isLoading" />

        <div class="stat-card-inner">
          <div class="stat-icon-wrapper stat-icon-wrapper--tertiary">
            <LocalSvgIcon
              image="seq-replied"
              class="linkedin-stat-icon"
            />
          </div>

          <div class="stat-content">
            <span class="stat-label">Reply rate</span>
            <h4 class="stat-value">
              {{ replyRate }}%
            </h4>
          </div>
        </div>
      </q-card>

      <!-- Card 5: Profile visits -->
      <q-card flat class="stat-kpi-card">
        <ApiLoader :show="isLoading" />

        <div class="stat-card-inner">
          <div class="stat-icon-wrapper stat-icon-wrapper--information">
            <LocalSvgIcon
              image="show"
              class="linkedin-stat-icon"
            />
          </div>

          <div class="stat-content">
            <span class="stat-label">Profile visits</span>
            <h4 class="stat-value">
              {{ getNumeralAmount(statsData.li_view_profile || 0) }}
            </h4>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, toRefs, onMounted, watch, getCurrentInstance,
} from 'vue';

// Components
import ApiLoader from 'src/components/General/ApiLoader.vue';

// Utils
import { fetchLinkedInOverallStats } from 'src/utils/connectedAccountsApi';
import { findPercentage, getNumeralAmount } from 'src/utils/numbers';

export default defineComponent({
  name: 'LinkedInOverallStats',

  components: {
    ApiLoader,
  },

  props: {
    accountId: {
      type: [Number, String],
      required: true,
    },
  },

  setup(props) {
    //
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      statsData: {},
      isLoading: false,
    });

    const onFetchOverallStats = async () => {
      if (!props.accountId) return;

      try {
        state.isLoading = true;

        // api call
        const response = await fetchLinkedInOverallStats(props.accountId);

        // response
        state.statsData = response || {};
      } catch (error) {
        const status = error?.status || error?.response?.status;
        if (status !== 404) {
          appContext?.config?.globalProperties?.$toast?.({
            warning: true,
            message: error.message || 'Failed to fetch overall stats',
          });
        }
      } finally {
        state.isLoading = false;
      }
    };

    //
    const acceptanceRate = computed(() => findPercentage({
      part: state.statsData?.li_connections_accepted || 0,
      whole: state.statsData?.li_connections_sent || 0,
    }));

    //
    const totalMessagesSent = computed(() => {
      const messages = state.statsData?.li_messages_sent || 0;
      const inmails = state.statsData?.li_inmails_sent || 0;
      return messages + inmails;
    });

    //
    const replyRate = computed(() => findPercentage({
      part: state.statsData?.li_replies || 0,
      whole: totalMessagesSent.value,
    }));

    //
    watch(
      () => props.accountId,
      (newId) => {
        if (newId) onFetchOverallStats();
      },
    );

    //
    onMounted(() => {
      onFetchOverallStats();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      replyRate,
      acceptanceRate,
      totalMessagesSent,

      // methods
      getNumeralAmount,
      onFetchOverallStats,
    };
  },
});
</script>

<style lang="scss" scoped>
.linkedin-overall-stats-section {
  width: 100%;
  display: flex;
  flex-direction: column;

  //
  .stats-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .stats-header-title {
      font-size: 16px;
      font-weight: 600;
      color: $black;
    }
  }

  //
  .stats-cards-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;

    @media (max-width: $breakpoint-md-max) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: $breakpoint-sm-max) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: $breakpoint-xs-max) {
      grid-template-columns: 1fr;
    }

    .stat-kpi-card {
      border-radius: 6px;
      background: $white;
      border: 1px solid $grey-50;
      box-shadow: none;
      transition: all 0.2s ease;
      padding: 20px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 16px;
      }

      .stat-card-inner {
        display: flex;
        align-items: flex-start;
        gap: 16px;

        .stat-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;

          &--primary {
            color: $primary;
            background: rgba(var(--primary-rgb), 0.1);

            :deep(.linkedin-stat-icon) {
              @include svg-icon-stroke('path, circle', $primary);
            }
          }

          &--information {
            color: $information;
            background: rgba(var(--information-rgb), 0.1);

            :deep(.linkedin-stat-icon) {
              @include svg-icon-stroke('path, circle, rect', $information);
            }
          }

          &--tertiary {
            color: $tertiary;
            background: rgba(var(--tertiary-rgb), 0.1);

            :deep(.linkedin-stat-icon) {
              @include svg-icon-stroke('path, circle, rect', $tertiary);
            }
          }

          &--warning {
            color:$warning;
            background: rgba(var(--warning-rgb), 0.1);

            :deep(.linkedin-stat-icon) {
              @include svg-icon-stroke('path, circle, rect', $warning);
            }
          }
        }

        .stat-content {
          display: flex;
          gap: 4px;
          min-width: 0;
          flex-direction: column;

          .stat-label {
            font-size: 14px;
            color: $black;
            line-height: 16px;
          }

          .stat-value {
            font-size: 22px;
            font-weight: 600;
            color: $black;
          }

          .stat-subtext {
            font-size: 14px;
            color: $grey;
          }
        }
      }
    }
  }
}
</style>
