<template>
  <div
    v-if="isCampaignDrafted"
    class="campaign-stats items-center full-height"
  >
    <div
      v-if="showDraftedMessage"
      class="drafted-label-text"
    >
      This campaign is yet to start to show the analytics
    </div>
  </div>

  <div
    v-else
    :class="[`${statsJson.class} campaign-stats`,{
      paused: isCampaignPaused,
    }]"
  >
    <LocalSvgIcon
      :image="statsJson.icon"
      classes="seq-type-icon"

      v-if="statsJson.icon"
    />

    <div>
      <div class="stat-value-text">
        {{ statsJson.value }}
      </div>
      <div class="stat-label-text">
        {{ statsJson.label }}
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// constants
import { CAMPAIGN_STATUS } from 'boot/campaign-constants';

export default defineComponent({
  name: 'CampaignStats',

  props: {
    statsJson: {
      type: Object,
      required: true,
    },
    showDraftedMessage: {
      type: Boolean,
      default: false,
    },
    campaignStatus: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    // computed
    const isCampaignDrafted = computed(
      () => props.campaignStatus === CAMPAIGN_STATUS.DRAFTED.value,
    );

    const isCampaignPaused = computed(() => {
      const { campaignStatus } = props;

      // paused statuses
      if (campaignStatus === CAMPAIGN_STATUS.PAUSED.value
        || campaignStatus === CAMPAIGN_STATUS.AUTO_PAUSED.value
        || campaignStatus === CAMPAIGN_STATUS.PAUSED_SUB_FAILED.value
      ) {
        return true;
      }

      return false;
    });

    return {
      // computed
      isCampaignDrafted,
      isCampaignPaused,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-stats {
  display: flex;
  gap: 8px;

  &.information {
    :deep(.seq-type-icon) {
      @include svg-icon-stroke('path', $information);
    }
  }

  .drafted-label-text {
    color: $grey;
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;

    width: 30px;
    white-space: nowrap;
  }

  .stat-value-text {
    color: $black;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;

    margin-bottom: 8px;
  }

  .stat-label-text {
    color: $grey;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px; /* 123.077% */
  }
}
</style>
