<template>
  <div class="sequence-by-id-overview">
    <!-- Left -->
    <div class="left-section">
      <!-- Cards grid -->
      <div class="cards-grid">
        <CampaignOverview />

        <CampaignConfiguration />
      </div>

      <!-- Recent Activity -->
      <SequenceByIdRecentActivity />
    </div>

    <!-- Right -->
    <div class="right-section">
      <SendingProgress />
      <ContactCoverageSummary />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import CampaignOverview from 'components/CampaignById/CampaignOverview.vue';
import CampaignConfiguration from 'components/CampaignById/CampaignConfiguration.vue';
import SequenceByIdRecentActivity from 'components/CampaignById/RecentActivity.vue';

import SendingProgress from 'components/CampaignById/SendingProgress.vue';
import ContactCoverageSummary from 'components/CampaignById/ContactCoverageSummary.vue';

export default defineComponent({
  name: 'SequenceByIdOverview',

  components: {
    CampaignOverview,
    CampaignConfiguration,
    SequenceByIdRecentActivity,

    SendingProgress,
    ContactCoverageSummary,
  },
});
</script>

<style lang="scss" scoped>
.sequence-by-id-overview {
  width: 100%;

  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  padding: 32px 20px;

  overflow-y: auto;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    grid-template-columns: auto;
    padding: 32px 12px;
  }

  .left-section {
    width: 100%;
    display: flex;
    gap: 32px;
    flex-direction: column;

    .cards-grid {
      width: 100%;
      display: flex;
      gap: 32px;

      // md max
      @media (max-width: $breakpoint-md-max) {
        flex-direction: column;
      }
    }
  }

  .right-section {
    width: 100%;
    max-width: 280px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      max-width: 100%;
    }
  }
}
</style>
