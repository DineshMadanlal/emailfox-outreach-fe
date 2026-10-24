<template>
  <div
    class="engagement-score-card"
    :class="cardBgClass"
  >
    <h6 class="card-title">
      Engagement Score
    </h6>

    <!-- Score Display -->
    <div class="score-display-row">
      <span class="current-score">
        {{ currentScore }}
      </span>
      <span class="max-score">
        /{{ maxScore }}
      </span>
    </div>

    <!-- Trend & Status Row -->
    <div class="score-footer-row">
      <!-- 30-day Score Trend -->
      <div
        class="score-trend-wrapper"
        :class="trendColorClass"
      >
        <!-- Upward trend arrow -->
        <svg
          v-if="scoreChange >= 0"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          class="trend-arrow-svg"
        >
          <path
            d="M14 4.5L8.5 10L5.5 7L1 11.5M14 4.5H9.5M14 4.5V9"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <!-- Downward trend arrow -->
        <svg
          v-else
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          class="trend-arrow-svg"
        >
          <path
            d="M14 11.5L8.5 6L5.5 9L1 4.5M14 11.5H9.5M14 11.5V7"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <span class="trend-text">
          Score {{ scoreChangeText }} in the last 30 days
        </span>
      </div>

      <!-- Engagement Status Tag -->
      <div
        v-if="statusLabel"
        class="score-status-tag"
        :class="statusColorClass"
      >
        {{ statusLabel }}
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// constants
import { ENGAGEMENT_SCORE_STATUS } from 'boot/workspace-constants';

export default defineComponent({
  name: 'EngagementScore',

  props: {
    engagementScoreJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const scoreData = computed(() => {
      const data = props.engagementScoreJson || {};
      return {
        current_score: data.current_score ?? 0,
        max_score: data.max_score ?? 100,
        score_change_30d: data.score_change_30d ?? 0,
        status: data.status || '',
      };
    });

    const currentScore = computed(() => scoreData.value.current_score);
    const maxScore = computed(() => scoreData.value.max_score);
    const scoreChange = computed(() => Number(scoreData.value.score_change_30d) || 0);

    const scoreChangeText = computed(() => {
      const val = scoreChange.value;
      return val > 0 ? `${val}` : `${Math.abs(val)}`;
    });

    const statusData = computed(() => {
      const status = (scoreData.value.status || '').toUpperCase();
      return ENGAGEMENT_SCORE_STATUS[status] || null;
    });

    const statusLabel = computed(() => {
      if (statusData.value) {
        return statusData.value.label.toUpperCase();
      }
      return scoreData.value.status ? String(scoreData.value.status).toUpperCase() : '';
    });

    const statusColor = computed(() => {
      if (statusData.value) {
        return statusData.value.color;
      }

      // Fallback based on score threshold
      const score = Number(currentScore.value) || 0;
      if (score >= 70) return 'positive';
      if (score >= 40) return 'warning';
      if (score > 0) return 'information';
      return 'grey';
    });

    const statusColorClass = computed(() => `status-${statusColor.value}`);

    // Determines trend color
    const trendColorClass = computed(() => {
      if (scoreChange.value > 0) return 'trend-positive';
      if (scoreChange.value < 0) return 'trend-negative';
      return 'trend-neutral';
    });

    // Determines gradient background based on score / status
    const cardBgClass = computed(() => {
      if (!scoreData.value.status) return '';
      return `bg-${statusColor.value}-gradient`;
    });

    return {
      currentScore,
      maxScore,
      scoreChange,
      scoreChangeText,
      statusLabel,
      statusColorClass,
      trendColorClass,
      cardBgClass,
    };
  },
});
</script>

<style lang="scss" scoped>
.engagement-score-card {
  width: 100%;
  background-color: $white;
  border: 1px solid $grey-50;
  border-radius: 8px;
  padding: 16px 20px 20px 20px;

  &.bg-warning-gradient {
    background: linear-gradient(
      265deg, rgba(var(--warning-rgb), 0.15) -17.59%, var(--white-color) 45.76%);
  }

  &.bg-positive-gradient {
    background: linear-gradient(
      265deg, rgba(var(--positive-rgb), 0.15) -17.59%, var(--white-color) 45.76%);
  }

  &.bg-information-gradient {
    background: linear-gradient(
      265deg, rgba(var(--information-rgb), 0.15) -17.59%, var(--white-color) 45.76%);
  }

  &.bg-grey-gradient {
    background: linear-gradient(
      265deg, rgba(var(--grey-rgb), 0.1) -17.59%, var(--white-color) 45.76%);
  }

  &.bg-negative-gradient {
    background: linear-gradient(
      265deg, rgba(var(--negative-rgb), 0.15) -17.59%, var(--white-color) 45.76%);
  }

  .card-title {
    color: $black;
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    margin: 0 0 12px 0;
  }

  .score-display-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 14px;

    .current-score {
      color: $black;
      font-size: 32px;
      font-weight: 700;
      line-height: 38px;
    }

    .max-score {
      color: $grey;
      font-size: 20px;
      font-weight: 500;
      line-height: 24px;
      margin-left: 2px;
    }
  }

  .score-footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .score-trend-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 6px;

      .trend-arrow-svg {
        flex-shrink: 0;
      }

      .trend-text {
        color: $grey;
        font-size: 13px;
        font-weight: 400;
        line-height: 16px;
      }

      &.trend-positive {
        .trend-arrow-svg {
          color: $positive;
        }
      }

      &.trend-warning {
        .trend-arrow-svg {
          color: $warning;
        }
      }

      &.trend-negative {
        .trend-arrow-svg {
          color: $negative;
        }
      }

      &.trend-neutral {
        .trend-arrow-svg {
          color: $grey;
        }
      }
    }

    .score-status-tag {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      line-height: 16px;

      &.status-positive {
        color: $positive;
      }

      &.status-warning {
        color: $warning;
      }

      &.status-information {
        color: $information;
      }

      &.status-grey {
        color: $grey;
      }

      &.status-negative {
        color: $negative;
      }
    }
  }
}
</style>
