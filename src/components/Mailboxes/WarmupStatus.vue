<template>
  <div class="warmup-status-cell">
    <!-- Day & Health text -->
    <div class="warmup-metric-text">
      <span class="day-text">{{ dayText }}</span>
      <template v-if="healthScore !== null && healthScore !== undefined">
        <span class="separator-dot">•</span>
        <span
          class="health-text"
          :class="healthClass"
        >
          {{ healthScore }}% Health
        </span>
      </template>
    </div>

    <!-- 7 Segmented Tick Bars Chart (always shown if warmup is active) -->
    <WarmupTickBars
      :data="dailyStats"
      :alwaysShow="isWarmupEnabled"
      :barCount="7"
      :height="16"
      :barWidth="4"
      :gap="3"
    />

    <!-- Warmup State Dot & Label / Start Warmup action -->
    <div
      v-if="isWarmupBlocked"
      class="warmup-state-indicator state-blocked"
    >
      <span class="state-dot"></span>
      <span class="state-label">Blocked</span>
    </div>

    <div
      v-else-if="isWarmupEnabled"
      class="warmup-state-indicator state-active"
    >
      <span class="state-dot"></span>
      <span class="state-label">Running</span>
    </div>

    <div
      v-else-if="hasWarmupHistory"
      class="warmup-state-indicator state-stopped"
    >
      <span class="state-dot"></span>
      <span class="state-label">Stopped</span>
    </div>

    <!-- Start Warmup for never-started mailboxes -->
    <div
      v-else
      class="start-warmup-btn"
      :class="{ 'cursor-not-allowed is-disabled': isReadOnly }"
      @click.prevent.stop="!isReadOnly && $emit('onEnableWarmup')"
    >
      Start Warmup
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// composables
import { usePermissions } from 'src/composables/usePermissions';

// utils
import { getWarmupStatus } from 'src/utils/warmupApi.js';

// constants
import { MIN_WARMUP_DAYS, WARMUP_STATUS } from 'src/boot/warmup-constants.js';

// components
import WarmupTickBars from 'components/Charts/WarmupTickBars.vue';

export default defineComponent({
  name: 'WarmupStatus',

  emits: ['onEnableWarmup'],

  components: {
    WarmupTickBars,
  },

  props: {
    mailboxJson: {
      type: Object,
      default: () => ({}),
    },
    dailyStats: {
      type: [Object, Array],
      default: () => null,
    },
  },

  setup(props) {
    // composables
    const { isReadOnly } = usePermissions();

    // computed
    const isWarmupBlocked = computed(
      () => props.mailboxJson?.warmup_status === WARMUP_STATUS.BLOCKED,
    );

    const isWarmupEnabled = computed(() => Boolean(props.mailboxJson?.warmup_enabled));

    const hasWarmupHistory = computed(() => Boolean(
      props.mailboxJson?.warmup_first_started_at || props.mailboxJson?.warmup_started_at,
    ));

    const warmupStatusJson = computed(() => getWarmupStatus(
      props.mailboxJson?.warmup_first_started_at || props.mailboxJson?.warmup_started_at,
    ));

    const dayText = computed(() => {
      const days = warmupStatusJson.value?.days || 0;
      return `Day ${days}/${MIN_WARMUP_DAYS}`;
    });

    const healthScore = computed(() => {
      if (props.mailboxJson?.health_score
        !== undefined && props.mailboxJson?.health_score !== null) {
        return Math.round(Number(props.mailboxJson.health_score));
      }
      return null;
    });

    const healthClass = computed(() => {
      const score = healthScore.value;
      if (score === null || score === undefined) return '';
      if (score >= 85) return 'text-positive';
      if (score >= 60) return 'text-warning';
      return 'text-negative';
    });

    return {
      // computed
      dayText,
      isReadOnly,
      healthScore,
      healthClass,
      isWarmupBlocked,
      isWarmupEnabled,
      hasWarmupHistory,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-status-cell {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  white-space: nowrap;
  font-size: 13px;
  line-height: 16px;

  .warmup-metric-text {
    display: inline-flex;
    align-items: center;
    gap: 5px;

    .day-text {
      color: $black;
      font-weight: 500;
    }

    .separator-dot {
      color: $grey;
      font-size: 11px;
    }

    .health-text {
      font-weight: 500;
    }
  }

  .warmup-state-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;

    .state-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    &.state-active {
      color: $positive;
      .state-dot {
        background-color: $positive;
      }
    }

    &.state-stopped,
    &.state-blocked {
      color: $negative;
      .state-dot {
        background-color: $negative;
      }
    }
  }

  .start-warmup-btn {
    color: $primary;
    cursor: pointer;
    font-weight: 500;
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }

    &.is-disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
}
</style>
