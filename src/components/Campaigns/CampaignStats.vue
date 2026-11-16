<template>
  <div
    class="campaign-metric-cell"
    :class="statClass || 'default-stat'"
  >
    <!-- Metric Icon near value -->
    <LocalSvgIcon
      v-if="icon"
      :image="icon"
      class="metric-icon"
    />

    <!-- Metric Value -->
    <span class="metric-value-text">
      {{ displayValue }}
    </span>

    <!-- Subtext percentage (e.g. (44.7%)), inline when count and rate > 0 -->
    <span
      v-if="hasSubtext"
      class="metric-subtext"
    >
      ({{ formattedSubValue }})
    </span>

    <!-- Sparkline (Only shown inline when there is real non-zero data) -->
    <SparklineTrend
      v-if="hasTrendData"
      :data="trendData"
      :color="trendColor"
      :width="44"
      :height="16"
      class="metric-sparkline"
    />
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import SparklineTrend from 'components/Charts/SparklineTrend.vue';

export default defineComponent({
  name: 'CampaignStats',

  components: {
    SparklineTrend,
  },

  props: {
    icon: {
      type: String,
      default: '',
    },
    statClass: {
      type: String,
      default: '',
    },
    value: {
      type: [String, Number],
      default: 0,
    },
    subValue: {
      type: [String, Number],
      default: '',
    },
    showSparkline: {
      type: Boolean,
      default: false,
    },
    trendData: {
      type: Array,
      default: () => [],
    },
    trendColor: {
      type: String,
      default: 'primary',
    },
    isDrafted: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const displayValue = computed(() => {
      if (props.isDrafted) return '0';
      if (props.value === null || props.value === undefined) return '0';
      return props.value;
    });

    const hasTrendData = computed(() => {
      if (props.isDrafted || !props.showSparkline) return false;
      if (!props.trendData || !Array.isArray(props.trendData) || props.trendData.length < 2) {
        return false;
      }
      return props.trendData.some((v) => Number(v) > 0);
    });

    const hasSubtext = computed(() => {
      if (props.isDrafted) return false;
      // Do not show percentage if the count itself is 0
      if (Number(props.value) === 0) return false;
      if (props.subValue === null || props.subValue === undefined || props.subValue === '') {
        return false;
      }
      const num = Number(String(props.subValue).replace(/[%()]/g, ''));
      if (Number.isNaN(num) || num <= 0) return false;
      return true;
    });

    const formattedSubValue = computed(() => {
      if (props.subValue === null || props.subValue === undefined || props.subValue === '') {
        return '';
      }
      const str = String(props.subValue).trim();
      const clean = str.replace(/[()%]/g, '').trim();
      if (!clean) return '';
      return `${clean}%`;
    });

    return {
      displayValue,
      hasTrendData,
      hasSubtext,
      formattedSubValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-metric-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  .metric-icon {
    width: 14px;
    height: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .metric-value-text {
    color: $black;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
  }

  .metric-subtext {
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
    color: $grey;
  }

  .metric-sparkline {
    margin-left: 2px;
  }

  &.default-stat {
    :deep(.metric-icon) {
      @include svg-icon-stroke('path', $grey);
    }

    .metric-value-text {
      font-weight: 400;
    }
  }

  &.replied-stat {
    :deep(.metric-icon) {
      @include svg-icon-stroke('path', $grey);
    }
  }

  &.positive-reply-stat {
    :deep(.metric-icon) {
      @include svg-icon-stroke('path', $positive);
    }

    .metric-value-text {
      color: $positive;
      font-weight: 600;
    }
  }

  &.bounced-stat {
    :deep(.metric-icon) {
      @include svg-icon-fill('path', $grey);

      circle {
        &:first-child {
          stroke: $grey;
        }

        &:last-child {
          fill: $grey;
        }
      }
    }
  }
}
</style>
