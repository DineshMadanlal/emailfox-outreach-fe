<template>
  <div class="campaign-engagement">
    <h6 class="engagement-header-text">
      Campaign Engagement
    </h6>

    <div class="engagement-metrics-grid">
      <q-card
        flat
        class="each-engagement-metric-card"
        v-for="(metric, index) in engagementMetrics"
        :key="`engagement-metric-${index}`"
      >
        <div
          :class="`engagement-metric-icon-block metric-color--${metric.color}`"
        >
          <LocalSvgIcon
            :image="metric.icon"
            classes="engagement-metric-icon"
          />
        </div>

        <div class="metric-details">
          <p class="metric-label-text">
            {{ metric.label }}
          </p>

          <p class="metric-value-text">
            {{ metric.value }}
          </p>

          <p class="metric-desc-text">
            {{ metric.desc }}
          </p>

        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
// vue
import { getNumeralAmount } from 'src/utils/numbers';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'CampaignEngagement',

  setup() {
    // computed
    const engagementMetrics = computed(() => {
      const metrics = [
        {
          label: 'Total Email Sent',
          desc: 'across all sequences',
          value: getNumeralAmount(12400),
          icon: 'seq-sent',
          color: 'primary',
        },
        {
          label: 'Delivered',
          desc: getNumeralAmount(12000),
          value: '96.5%',
          icon: 'seq-delivered',
          color: 'information',
        },
        // opened
        {
          label: 'Opened',
          desc: getNumeralAmount(8500),
          value: '68.5%',
          icon: 'seq-opened',
          color: 'warning',
        },
        // replied
        {
          label: 'Replied',
          desc: getNumeralAmount(2400),
          value: '19.3%',
          icon: 'seq-replied',
          color: 'positive',
        },
        // bounced
        {
          label: 'Bounced',
          desc: getNumeralAmount(400),
          value: '3.2%',
          icon: 'seq-bounced',
          color: 'negative',
        },
      ];

      return metrics;
    });

    return {
      // computed
      engagementMetrics,

    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-engagement {
  width: 100%;

  .engagement-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;

    margin-bottom: 12px;
  }

  .engagement-metrics-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 24px;
    width: 100%;

    @media (max-width: $breakpoint-xs-max) {
      grid-template-columns: 1fr;
    }

    @media (max-width: $breakpoint-sm-max) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 1350px) {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .each-engagement-metric-card {
      width: 100%;
      border-radius: 6px;
      border: 1px solid $grey-50;

      display: flex;
      gap: 16px;

      padding: 20px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 16px 12px;
        max-width: 100%;
      }

      .engagement-metric-icon-block {
        min-height: 32px;
        min-width: 32px;
        max-height: 32px;
        max-width: 32px;
        border-radius: 50%;

        display: flex;
        align-items: center;
        justify-content: center;

        &.metric-color--primary {
          background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);

          :deep(.engagement-metric-icon) {
            @include svg-icon-stroke('path, circle, rect', $primary);
          }
        }

        &.metric-color--information {
          background-color: rgba($color: var(--information-rgb), $alpha: 0.1);

          :deep(.engagement-metric-icon) {
            @include svg-icon-stroke('path, circle, rect', $information);
          }
        }

        &.metric-color--warning {
          background-color: rgba($color: var(--warning-rgb), $alpha: 0.1);

          :deep(.engagement-metric-icon) {
            @include svg-icon-stroke('path, circle, rect', $warning);
          }
        }

        &.metric-color--positive {
          background-color: rgba($color: var(--positive-rgb), $alpha: 0.1);

          :deep(.engagement-metric-icon) {
            @include svg-icon-stroke('path, circle, rect', $positive);
          }
        }

        &.metric-color--negative {
          background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);

          :deep(.engagement-metric-icon) {
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
      }

      .metric-details {
        .metric-label-text {
          color: $black;
        }
        .metric-value-text {
          color: $black;
          font-size: 22px;
          font-weight: 600;

          margin-top: 4px;
          margin-bottom: 6px;
        }
        .metric-desc-text {
          color: $grey;
        }
      }
    }
  }
}
</style>
