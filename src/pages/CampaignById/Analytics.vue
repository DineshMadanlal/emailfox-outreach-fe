<template>
  <div class="sequence-by-id-analytics">
    <CampaignEngagement />

    <SequenceEmailEngagement />

    <SequencePerformance />

    <VariantsTestingResults />

    <div class="two-cards-grid">
      <BounceRateBreakdown />

      <EspBreakdown
        :showLoader="isLoadingEspMetrics"
        :espPerformanceMetrics="espPerformanceMetrics"

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
import { defineComponent, reactive, toRefs } from 'vue';

// Components
import CampaignEngagement from 'components/CampaignById/CampaignEngagement.vue';
import SequenceEmailEngagement from 'src/components/CampaignById/SequenceEmailEngagement.vue';
import SequencePerformance from 'components/CampaignById/SequencePerformance.vue';
import EspBreakdown from 'components/DomainById/EspBreakdown.vue';
import BounceRateBreakdown from 'components/CampaignById/BounceRateBreakdown.vue';

import ContactsLifecycle from 'components/CampaignById/ContactsLifecycle.vue';
import VariantsTestingResults from 'components/CampaignById/VariantsTestingResults.vue';

export default defineComponent({
  name: 'SequenceByIdAnalytics',

  components: {
    EspBreakdown,
    CampaignEngagement,
    SequenceEmailEngagement,
    BounceRateBreakdown,
    ContactsLifecycle,
    SequencePerformance,
    VariantsTestingResults,
  },

  setup() {
    // state
    const state = reactive({
      isLoadingEspMetrics: false,
      espPerformanceMetrics: {},
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
