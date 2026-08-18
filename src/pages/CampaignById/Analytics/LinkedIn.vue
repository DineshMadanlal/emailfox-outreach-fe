<template>
  <div class="analytics-linkedin">
    <CampaignEngagement
      view="linkedin"
      :campaignId="campaignByIdJson.id"
    />

    <SequenceEngagement
      view="linkedin"
      :campaignId="campaignByIdJson.id"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import CampaignEngagement from 'components/CampaignById/Analytics/CampaignEngagement.vue';
import SequenceEngagement from 'components/CampaignById/Analytics/SequenceEngagement.vue';

export default defineComponent({
  name: 'CampaignAnalyticsLinkedIn',

  components: {
    CampaignEngagement,
    SequenceEngagement,
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
.analytics-linkedin {
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
