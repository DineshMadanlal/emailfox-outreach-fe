<template>
  <div class="analytics-email">
    <CampaignEngagement
      view="email"
      :campaignByIdJson="campaignByIdJson"
    />

    <SequenceEngagement
      view="email"
      :campaignId="campaignByIdJson.id"
    />

    <SequencePerformance
      view="email"
      :campaignId="campaignByIdJson.id"
    />

    <div class="two-cards-grid">
      <EspBreakdown
        :showLoader="loaders.espMetrics"
        :espPerformanceMetrics="results.espMetrics"

        class="less-width-card"
      />
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, getCurrentInstance, reactive, toRefs, onMounted,
} from 'vue';

// components
import EspBreakdown from 'components/DomainById/EspBreakdown.vue';
import CampaignEngagement from 'components/CampaignById/Analytics/CampaignEngagement.vue';
import SequencePerformance from 'components/CampaignById/Analytics/SequencePerformance.vue';
import SequenceEngagement from 'components/CampaignById/Analytics/SequenceEngagement.vue';

// utils
import { getSequenceEspStats } from 'src/utils/campaignApi.js';

export default defineComponent({
  name: 'CampaignAnalyticsEmail',

  components: {
    CampaignEngagement,
    SequenceEngagement,
    SequencePerformance,
    EspBreakdown,
  },

  props: {
    campaignByIdJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      loaders: {
        espMetrics: false,
      },

      results: {
        espMetrics: {},
      },
    });

    const fetchEspPerformanceMetrics = async () => {
      try {
        state.loaders.espMetrics = true;

        const response = await getSequenceEspStats(props.campaignByIdJson?.id);

        state.results.espMetrics = response;
      } catch (error) {
        // show error warning
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.espMetrics = false;
      }
    };

    // lifecycle hooks
    onMounted(() => {
      // fetch esp performance metrics
      fetchEspPerformanceMetrics();
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.analytics-email {
  display: flex;
  flex-direction: column;
  gap: 32px;

  width: 100%;

  padding: 32px 20px;
  overflow: auto;

  @media (max-width: $breakpoint-xs-max) {
    padding: 32px 12px;
  }

  .two-cards-grid {
    display: flex;
    gap: 32px;

    .less-width-card {
      max-width: 45%;
    }

    // md max
    @media (max-width: $breakpoint-md-max) {
      flex-direction: column;

      .less-width-card {
        max-width: 100%;
      }
    }
  }
}
</style>
