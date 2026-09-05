<template>
  <div class="campaign-engagement">
    <!--  -->
    <h6 class="engagement-header-text">
      {{ headerText }}
    </h6>

    <!--  -->
    <div
      class="engagement-metrics-grid"
      :style="{ '--cols': engagementMetrics.length }"
    >
      <!--  -->
      <q-card
        flat
        class="each-engagement-metric-card"
        v-for="(metric, index) in engagementMetrics"
        :key="`engagement-metric-${index}`"
      >
        <div :class="`engagement-metric-icon-block metric-color--${metric.color}`">
          <LocalSvgIcon
            :image="metric.icon"
            classes="engagement-metric-icon"
          />
        </div>

        <div class="metric-details">
          <!-- label -->
          <p class="metric-label-text">{{ metric.label }}</p>

          <!-- value -->
          <p class="metric-value-text">{{ metric.value }}</p>

          <!-- description -->
          <p v-if="metric.desc" class="metric-desc-text">{{ metric.desc }}</p>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
// vue
import {
  computed, defineComponent,
} from 'vue';

// utils
import { findPercentage, getNumeralAmount } from 'src/utils/numbers';

export default defineComponent({
  name: 'CampaignEngagement',

  props: {
    campaignByIdJson: {
      type: Object,
      default: () => ({}),
    },
    view: {
      type: String,
      default: 'email', // 'overview' | 'email' | 'linkedin'
    },
  },

  setup(props) {
    // --- Metric helpers ---
    const getOverviewMetrics = (stats) => {
      const outreachActions = (stats.email_sent || 0)
        + (stats.li_view_profile || 0)
        + (stats.li_connections_sent || 0)
        + (stats.li_messages_sent || 0)
        + (stats.li_inmails_sent || 0);

      const totalReplies = (stats.email_replies || 0) + (stats.li_replies || 0);
      const positiveReplies = (stats.email_positive_replies
        || 0) + (stats.li_positive_replies || 0);

      const replyRate = findPercentage({ part: totalReplies, whole: outreachActions });
      const positiveRate = findPercentage({ part: positiveReplies, whole: totalReplies });

      return [
        {
          label: 'Total Contacts',
          value: getNumeralAmount(props.campaignByIdJson?.total_no_contacts || 0),
          desc: `across ${props.campaignByIdJson?.total_no_of_seq || 0} sequences`,
          icon: 'contacts',
          color: 'primary',
        },
        {
          label: 'Outreach Actions',
          value: getNumeralAmount(outreachActions),
          desc: '',
          icon: 'sequences',
          color: 'information',
        },
        {
          label: 'Total Replies',
          value: getNumeralAmount(totalReplies),
          desc: `${replyRate}% reply rate`,
          icon: 'seq-replied',
          color: 'tertiary',
        },
        {
          label: 'Positive Replies',
          value: getNumeralAmount(positiveReplies),
          desc: `${positiveRate}% of replies`,
          icon: 'positive-reply',
          color: 'positive',
        },
      ];
    };

    const getEmailMetrics = (stats) => {
      const emailSent = stats.email_sent || 0;
      const emailBounces = stats.email_bounces || 0;
      const emailOpens = stats.email_opens || 0;
      const emailReplies = stats.email_replies || 0;
      const emailPositiveReplies = stats.email_positive_replies || 0;

      const delivered = Math.max(0, emailSent - emailBounces);

      const deliveredRate = findPercentage({ part: delivered, whole: emailSent });
      const openedRate = findPercentage({ part: emailOpens, whole: emailSent });
      const repliedRate = findPercentage({ part: emailReplies, whole: emailSent });
      const positiveRate = findPercentage({ part: emailPositiveReplies, whole: emailSent });
      const bouncedRate = findPercentage({ part: emailBounces, whole: emailSent });

      const metrics = [
        {
          label: 'Total Emails Sent',
          value: getNumeralAmount(emailSent),
          desc: 'across all sequences',
          icon: 'mail',
          color: 'primary',
        },
        {
          label: 'Delivered',
          value: `${deliveredRate}%`,
          desc: getNumeralAmount(delivered),
          icon: 'seq-delivered',
          color: 'information',
        },
      ];

      if (emailOpens > 0) {
        metrics.push({
          label: 'Opened',
          value: `${openedRate}%`,
          desc: `${getNumeralAmount(emailOpens)} opens`,
          icon: 'seq-opened',
          color: 'warning',
        });
      }

      metrics.push(
        {
          label: 'Replied',
          value: `${repliedRate}%`,
          desc: `${getNumeralAmount(emailReplies)} replies`,
          icon: 'seq-replied',
          color: 'tertiary',
        },
        {
          label: 'Positive Replies',
          value: `${positiveRate}%`,
          desc: `${getNumeralAmount(emailPositiveReplies)} conversions`,
          icon: 'positive-reply',
          color: 'positive',
        },
        {
          label: 'Bounced',
          value: `${bouncedRate}%`,
          desc: `${getNumeralAmount(emailBounces)} bounced`,
          icon: 'seq-bounced',
          color: 'negative',
        },
      );

      return metrics;
    };

    const getLinkedInMetrics = (stats) => [
      {
        label: 'Profile Visits',
        value: getNumeralAmount(stats.li_view_profile || 0),
        desc: '',
        icon: 'show',
        color: 'primary',
      },
      {
        label: 'Connection Requests',
        value: getNumeralAmount(stats.li_connections_sent || 0),
        desc: '',
        icon: 'people',
        color: 'information',
      },
      {
        label: 'Messages Sent',
        value: getNumeralAmount(stats.li_messages_sent || 0),
        desc: '',
        icon: 'send',
        color: 'warning',
      },
      {
        label: 'Replies',
        value: getNumeralAmount(stats.li_replies || 0),
        desc: '',
        icon: 'seq-replied',
        color: 'tertiary',
      },
      {
        label: 'Positive Replies',
        value: getNumeralAmount(stats.li_positive_replies || 0),
        desc: '',
        icon: 'positive-reply',
        color: 'positive',
      },
    ];

    // computed
    const headerText = computed(() => {
      if (props.view === 'email') return 'Campaign Engagement';
      return 'Overall Engagement Summary';
    });

    const engagementMetrics = computed(() => {
      const stats = props.campaignByIdJson?.stats || {};

      if (props.view === 'email') return getEmailMetrics(stats);
      if (props.view === 'linkedin') return getLinkedInMetrics(stats);

      return getOverviewMetrics(stats);
    });

    return {
      // computed
      headerText,
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
    grid-template-columns: repeat(var(--cols, 5), minmax(0, 1fr));
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

        &.metric-color--tertiary {
          background-color: rgba($color: var(--tertiary-rgb), $alpha: 0.1);

          :deep(.engagement-metric-icon) {
            @include svg-icon-stroke('path, circle, rect', $tertiary);
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
