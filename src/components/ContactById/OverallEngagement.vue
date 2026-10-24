<template>
  <div class="overall-engagement-summary">
    <h6 class="summary-title">
      Overall Engagement Summary
    </h6>

    <!-- Metrics Grid -->
    <div
      class="engagement-metrics-grid"
      :style="{ '--metrics-count': metricsList.length }"
    >
      <div
        v-for="metric in metricsList"
        :key="`overall-engagement-metric-${metric.id}`"
        class="engagement-metric-card"
      >
        <!-- Icon Circle -->
        <div
          class="metric-icon-circle"
          :class="`metric-color--${metric.color}`"
        >
          <LocalSvgIcon
            :image="metric.icon"
            classes="metric-icon"
          />
        </div>

        <!-- Metric Details -->
        <div class="metric-text-col">
          <p class="metric-label">
            {{ metric.label }}
          </p>
          <h5 class="metric-value">
            {{ metric.value }}
          </h5>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers';

export default defineComponent({
  name: 'OverallEngagement',

  props: {
    overallEngagementJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const statsData = computed(() => {
      const data = props.overallEngagementJson || {};

      return {
        email_sent: data.email_sent ?? 0,
        linkedin_activities: data.linkedin_activities ?? 0,
        total_replies: data.total_replies ?? 0,
        positive_replies: data.positive_replies ?? 0,
      };
    });

    const metricsList = computed(() => {
      const list = [
        {
          id: 'email_sent',
          label: 'Email Sent',
          value: getNumeralAmount(statsData.value.email_sent),
          icon: 'mail',
          color: 'primary',
        },
      ];

      if (Number(statsData.value.linkedin_activities) > 0) {
        list.push({
          id: 'linkedin_activities',
          label: 'LinkedIn Activities',
          value: getNumeralAmount(statsData.value.linkedin_activities),
          icon: 'linkedin',
          color: 'information',
        });
      }

      list.push(
        {
          id: 'total_replies',
          label: 'Total Replies',
          value: getNumeralAmount(statsData.value.total_replies),
          icon: 'seq-replied',
          color: 'tertiary',
        },
        {
          id: 'positive_replies',
          label: 'Positive Replies',
          value: getNumeralAmount(statsData.value.positive_replies),
          icon: 'positive-reply',
          color: 'positive',
        },
      );

      return list;
    });

    return {
      metricsList,
    };
  },
});
</script>

<style lang="scss" scoped>
.overall-engagement-summary {
  width: 100%;

  .summary-title {
    color: $black;
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    margin: 0 0 16px 0;
  }

  .engagement-metrics-grid {
    display: grid;
    grid-template-columns: repeat(var(--metrics-count, 4), 1fr);
    gap: 16px;
    width: 100%;

    @media (max-width: $breakpoint-md-max) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: $breakpoint-xs-max) {
      grid-template-columns: 1fr;
    }

    .engagement-metric-card {
      background-color: $white;
      border: 1px solid $grey-50;
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;

      .metric-icon-circle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .metric-icon {
          width: 18px;
          height: 18px;
        }

        &.metric-color--primary {
          background-color: rgba(var(--primary-rgb), 0.1);

          :deep(.metric-icon) {
            @include svg-icon-stroke('path, circle, rect', $primary);
          }
        }

        &.metric-color--information {
          background-color: rgba(var(--information-rgb), 0.1);
        }

        &.metric-color--tertiary {
          background-color: rgba(var(--tertiary-rgb), 0.1);

          :deep(.metric-icon) {
            @include svg-icon-stroke('path, circle, rect', $tertiary);
          }
        }

        &.metric-color--positive {
          background-color: rgba(var(--positive-rgb), 0.1);

          :deep(.metric-icon) {
            @include svg-icon-stroke('path, circle, rect', $positive);
          }
        }
      }

      .metric-text-col {
        display: flex;
        flex-direction: column;
        min-width: 0;

        .metric-label {
          color: $grey;
          font-size: 13px;
          font-weight: 400;
          line-height: 16px;
          margin: 0 0 4px 0;
          white-space: nowrap;
        }

        .metric-value {
          color: $black;
          font-size: 22px;
          font-weight: 700;
          line-height: 26px;
          margin: 0;
        }
      }
    }
  }
}
</style>
