<template>
  <div class="performance-overall-container">
    <div class="performance-overall-item">
      <OverallEngagement
        :engagementMetrics="overallEngagementMetrics"
        :showLoader="showLoader"
      />

      <PerformanceMetrics
        :performanceMetrics="performanceMetrics"
        :showLoader="showLoader"
      />
    </div>

    <div class="esp-performance-wrapper">
      <EspBreakdown
        v-if="showEspBreakdown"

        :showLoader="isLoadingEspPerformanceMetrics"
        :espPerformanceMetrics="espPerformanceMetrics"
      />
    </div>
  </div>
</template>
<script>
// vue
import { computed, defineComponent } from 'vue';

// Components
import EspBreakdown from 'components/DomainById/EspBreakdown.vue';
import OverallEngagement from 'components/DomainById/OverallEngagement.vue';
import PerformanceMetrics from 'components/DomainById/PerformanceMetrics.vue';

// utils
import { findPercentage } from 'src/utils/numbers';

export default defineComponent({
  name: 'TotalEngagement',

  components: {
    EspBreakdown,
    OverallEngagement,
    PerformanceMetrics,
  },

  props: {
    showLoader: {
      type: Boolean,
      default: false,
    },
    overallEngagementMetrics: {
      type: Object,
      default: () => {},
    },

    espPerformanceMetrics: {
      type: Object,
      default: () => {},
    },
    isLoadingEspPerformanceMetrics: {
      type: Boolean,
      default: false,
    },

    showEspBreakdown: {
      type: Boolean,
      default: true,
    },
  },

  setup(props) {
    const performanceMetrics = computed(() => ({
      deliverabilityRate: findPercentage({
        part: props.overallEngagementMetrics.sent_count
          - props.overallEngagementMetrics.hard_bounce_count,
        whole: props.overallEngagementMetrics.sent_count,
      }),
      bouncedRate: findPercentage({
        part: props.overallEngagementMetrics.hard_bounce_count,
        whole: props.overallEngagementMetrics.sent_count,
      }),
    }));

    return {
      // computed
      performanceMetrics,
    };
  },
});
</script>

<style lang="scss" scoped>
.performance-overall-container {
  width: 100%;

  display: flex;

  row-gap: 32px;
  column-gap: 32px;

  // md max
  @media (max-width: $breakpoint-md-max) {
    flex-direction: column;
  }

  .performance-overall-item {
    width: 100%;

    // md max
    @media (min-width: $breakpoint-md-min) {
      .overall-engagement-card {
        height: 50%;
      }
      .performance-metrics-card {
        height: 50%;
      }
    }
  }

  .esp-performance-wrapper {
    width: 100%;
    max-width: 40%;

    @media (max-width: $breakpoint-md-max) {
      max-width: 100%;
    }
  }
}
</style>
