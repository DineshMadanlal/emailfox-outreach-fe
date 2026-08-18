<template>
  <div class="analytics-overview">
    <CampaignEngagement
      view="overview"
      :campaignByIdJson="campaignByIdJson"
    />

    <SequenceEngagement
      view="overview"
      :campaignId="campaignByIdJson.id"
    />

    <SequencePerformance
      view="overview"
      :campaignId="campaignByIdJson.id"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import CampaignEngagement from 'components/CampaignById/Analytics/CampaignEngagement.vue';
import SequencePerformance from 'components/CampaignById/Analytics/SequencePerformance.vue';
import SequenceEngagement from 'components/CampaignById/Analytics/SequenceEngagement.vue';

export default defineComponent({
  name: 'CampaignAnalyticsOverview',

  components: {
    CampaignEngagement,
    SequenceEngagement,
    SequencePerformance,
  },

  props: {
    campaignByIdJson: {
      type: Object,
      default: () => ({}),
    },
  },
});
</script>

<style lang="scss" scoped>
.analytics-overview {
  display: flex;
  flex-direction: column;
  gap: 32px;

  width: 100%;

  padding: 32px 20px;
  overflow: auto;

  @media (max-width: $breakpoint-xs-max) {
    padding: 32px 12px;
  }
}
</style>
