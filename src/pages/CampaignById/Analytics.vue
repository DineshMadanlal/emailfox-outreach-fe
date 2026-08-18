<template>
  <div class="sequence-by-id-analytics">
    <SequencePerformance />

    <VariantsTestingResults />

    <div class="two-cards-grid">
      <BounceRateBreakdown />

      <EspBreakdown
        :showLoader="loaders.espMetrics"
        :espPerformanceMetrics="results.espMetrics"

        class="less-width-card"
      />
    </div>

    <ContactsLifecycle />

    <!-- <div class="two-cards-grid">
      <ContactsLifecycle
        class="less-width-card"
      />

      <div></div>
    </div> -->
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, onMounted, getCurrentInstance,
} from 'vue';

import SequencePerformance from 'components/CampaignById/SequencePerformance.vue';
import EspBreakdown from 'components/DomainById/EspBreakdown.vue';
import BounceRateBreakdown from 'components/CampaignById/BounceRateBreakdown.vue';

import ContactsLifecycle from 'components/CampaignById/ContactsLifecycle.vue';
import VariantsTestingResults from 'components/CampaignById/VariantsTestingResults.vue';

// utils
import { getSequenceEspStats } from 'src/utils/campaignApi.js';

export default defineComponent({
  name: 'SequenceByIdAnalytics',

  components: {
    EspBreakdown,
    BounceRateBreakdown,
    ContactsLifecycle,
    SequencePerformance,
    VariantsTestingResults,
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
.sequence-by-id-analytics {
  display: flex;
  flex-direction: column;
  gap: 32px;

  width: 100%;

  padding: 32px 20px;
  overflow: auto;

  // xs max
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
