<template>
  <q-card
    flat
    class="warmup-details-card"
    :class="uiContentColor"
  >
    <!-- LEFT -->
    <div class="warmup-card__content">
      <!-- heading -->
      <div class="warmup-card__heading">
        <!-- title -->
        <p class="title-text">
          {{ uiContent.title }}
        </p>

        <!-- badge -->
        <p class="badge-text">
          {{ uiContent.badge }}
        </p>
      </div>

      <!-- description -->
      <p class="warmup-card__description">
        {{ uiContent.description }}
      </p>

      <!-- started -->
      <p class="warmup-card__started">
        Started on {{ formattedStartedAt }}
      </p>
    </div>

    <!-- RIGHT -->
    <div class="warmup-card__progress">
      <apex-chart
        type="radialBar"
        height="160"
        :options="radialOptions"
        :series="radialOptions.series"

        class="radial-bar-chart"
      />

      <!-- Text -->
      <div class="progress-label-block">
        <p class="progress-header-text">
          {{ pendingWarmupDays > 0 ? pendingWarmupDays : '14+' }}
        </p>

        <p
          class="progress-subheader-text"
        >
          {{ pendingWarmupDays > 0 ? `of ${MIN_WARMUP_DAYS} days` : 'days' }}
        </p>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent, computed, defineAsyncComponent } from 'vue';

// quasar
import { colors } from 'quasar';

// utils
import { getBrandColorByName } from 'src/utils/quasarHelpers';

// constants
import { WARMUP_STATUS_CONTENT, MIN_WARMUP_DAYS } from 'src/boot/warmup-constants';

export default defineComponent({
  name: 'WarmupDetails',

  props: {
    mailboxByJson: {
      type: Object,
      default: () => ({}),
    },
    mailboxWarmupDetails: {
      type: Object,
      default: () => ({}),
    },
  },

  components: {
    ApexChart: defineAsyncComponent(() => import('vue3-apexcharts')),
  },

  setup(props) {
    // warmup days
    const warmupDays = computed(() => {
      const startedAt = props.mailboxWarmupDetails?.first_started_at;

      if (!startedAt) {
        return 0;
      }

      return Math.floor(
        (Date.now() - new Date(startedAt).getTime())
        / (1000 * 60 * 60 * 24),
      ) + 1;
    });

    const pendingWarmupDays = computed(() => Math.max(MIN_WARMUP_DAYS - warmupDays.value, 0));

    /** progress % */
    const warmupProgress = computed(() => Math.min(
      Math.round((warmupDays.value / MIN_WARMUP_DAYS) * 100),
      100,
    ));

    /** ui state */
    const uiState = computed(() => {
      const healthScore = props.mailboxByJson?.health_score || 0;

      const spamCount = props.mailboxWarmupDetails?.spam_count || 0;

      const bounceCount = props.mailboxWarmupDetails?.bounce_count || 0;

      const warmupEnabled = props.mailboxByJson?.warmup_enabled;

      if (!warmupEnabled) {
        return WARMUP_STATUS_CONTENT.STOPPED.value;
      }

      if (
        healthScore < 40
        || spamCount > 10
        || bounceCount > 5
      ) {
        return WARMUP_STATUS_CONTENT.AT_RISK.value;
      }

      if (warmupDays.value < MIN_WARMUP_DAYS) {
        return WARMUP_STATUS_CONTENT.IN_PROGRESS.value;
      }

      return WARMUP_STATUS_CONTENT.ACTIVE.value;
    });

    const uiContentColor = computed(() => {
      switch (uiState.value) {
        case WARMUP_STATUS_CONTENT.AT_RISK.value:
          return 'warning';
        case WARMUP_STATUS_CONTENT.IN_PROGRESS.value:
          return 'positive';
        case WARMUP_STATUS_CONTENT.ACTIVE.value:
          return 'positive';
        case WARMUP_STATUS_CONTENT.STOPPED.value:
          return 'grey';
        default:
          return 'positive';
      }
    });

    const uiContent = computed(() => WARMUP_STATUS_CONTENT[uiState.value]);

    /** formatted started at */
    const formattedStartedAt = computed(() => {
      const startedAt = props.mailboxWarmupDetails?.first_started_at;

      if (!startedAt) {
        return '-';
      }

      return new Date(startedAt).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    });

    const radialOptions = computed(() => {
      const radialColor = getBrandColorByName(uiContentColor.value);
      const hexToRgbColor = colors.hexToRgb(radialColor);

      const options = {
        series: [warmupProgress.value],

        chart: {
          type: 'radialBar',
          height: 320,

          sparkline: {
            enabled: true,
          },
        },

        colors: [radialColor],

        plotOptions: {
          radialBar: {
            startAngle: -140,
            endAngle: 140,

            hollow: {
              size: '58%',
            },

            track: {
              background: `rgba(${hexToRgbColor.r}, ${hexToRgbColor.g}, ${hexToRgbColor.b}, 0.4)`,
              strokeWidth: '100px',
            },

            dataLabels: {
              show: false,
            },
          },
        },

        stroke: {
          lineCap: 'round',
        },

        labels: ['Warmup'],
      };

      return options;
    });

    return {
      // computed
      uiState,
      uiContent,
      warmupDays,
      radialOptions,
      uiContentColor,
      formattedStartedAt,
      pendingWarmupDays,

      // hardcoded
      MIN_WARMUP_DAYS,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-details-card {
  width: 100%;
  max-width: 790px;
  border-radius: 6px;
  border: 1px solid $grey-50;

  padding: 20px;

  display: flex;
  gap: 24px;

  .warmup-card__content {
    flex: 1;

    // heading
    .warmup-card__heading {
      display: flex;
      align-items: center;
      gap: 5px;

      .title-text {
        font-size: 16px;
        font-weight: 600;
        color: $black;
      }

      .badge-text {
        font-size: 14px;
        font-weight: 600;
        padding: 4px 6px;
        border-radius: 4px;
      }
    }

    // description
    .warmup-card__description {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-top: 8px;
      margin-bottom: 16px;
    }

    // date
    .warmup-card__started {
      color: $grey;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;

      margin-bottom: 24px;
    }
  }

  .warmup-card__progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    height: 100px;
    width: 122px;

    .radial-bar-chart {
      position: absolute;
      z-index: 1;
      top: -18px;
      right: -89px;
    }

    .progress-label-block {
      position: absolute;
      z-index: 2;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;

      .progress-header-text {
        font-size: 32px;
        font-weight: 600;
        color: $grey;
      }

      .progress-subheader-text {
        font-size: 12px;
        font-weight: 400;
        line-height: 14px;
        color: $grey-800;
      }
    }
  }

  &.positive {
    background: linear-gradient(
      180deg,
      rgba(var(--positive-rgb), 0.1) 0%,
      var(--white-color) 54.6%);

    .warmup-card__content {
      .warmup-card__heading {
        .badge-text {
          background-color: rgba(var(--positive-rgb), 0.1);
          color: $positive;
        }
      }
    }
  }

  &.warning {
    background: linear-gradient(
      180deg,
      rgba(var(--warning-rgb), 0.1) 0%,
      var(--white-color) 54.6%);

    .warmup-card__content {
      .warmup-card__heading {
        .badge-text {
          background-color: rgba(var(--warning-rgb), 0.1);
          color: $warning;
        }
      }
    }
  }

  &.grey {
    background: linear-gradient(
      180deg,
      rgba(var(--grey-rgb), 0.1) 0%,
      var(--white-color) 54.6%);

    .warmup-card__content {
      .warmup-card__heading {
        .badge-text {
          background-color: rgba(var(--grey-rgb), 0.1);
          color: $grey;
        }
      }
    }
  }

  // xs max
  @media (max-width: $breakpoint-sm-max) {
    padding: 16px 12px;
    max-width: 100%;
    flex-direction: column;
  }
}
</style>
