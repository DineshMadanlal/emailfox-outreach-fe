<template>
  <div class="campaign-analytics-page custom-scrollbar">
    <!-- Tabs: only shown for multi-channel campaigns -->
    <AnalyticsRouteHeader
      v-if="isMultiChannelOutreachCampaign"
      :campaignId="campaignId"
    />

    <!-- router view -->
    <router-view
      :campaignByIdJson="campaignByIdJson"
    />
  </div>
</template>

<script>
// vue
import {
  defineComponent, inject, onMounted, computed,
} from 'vue';

// router
import { useRoute, useRouter } from 'vue-router';

// components
import AnalyticsRouteHeader from 'src/components/CampaignById/Analytics/RouteHeader.vue';

export default defineComponent({
  name: 'CampaignAnalyticsIndex',

  components: {
    AnalyticsRouteHeader,
  },

  props: {
    campaignByIdJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    // router
    const $route = useRoute();
    const $router = useRouter();

    // inject campaign context from CampaignById/Index.vue
    const {
      isEmailOutreachCampaign,
      isLinkedInOutreachCampaign,
      isMultiChannelOutreachCampaign,
    } = inject('editCampaignContext');

    // computed
    const campaignId = computed(() => $route.params.campaignId);

    // lifecycle hooks
    onMounted(() => {
      if (isEmailOutreachCampaign.value) {
        $router.replace(`/outreach/campaigns/${campaignId.value}/analytics/email`);
      } else if (isLinkedInOutreachCampaign.value) {
        $router.replace(`/outreach/campaigns/${campaignId.value}/analytics/linkedin`);
      } else if (isMultiChannelOutreachCampaign.value) {
        $router.replace(`/outreach/campaigns/${campaignId.value}/analytics/overview`);
      }
    });

    return {
      // computed
      campaignId,

      // campaign context
      isEmailOutreachCampaign,
      isLinkedInOutreachCampaign,
      isMultiChannelOutreachCampaign,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-analytics-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
  flex: 1;
}
</style>
