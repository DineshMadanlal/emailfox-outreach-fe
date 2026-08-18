<template>
  <div class="analytics-email">
    <CampaignEngagement
      view="email"
      :campaignId="campaignByIdJson.id"
    />

    <SequenceEngagement
      view="email"
      :campaignId="campaignByIdJson.id"
    />

    <SequencePerformance
      view="email"
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
  name: 'CampaignAnalyticsEmail',

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
}
</style>
