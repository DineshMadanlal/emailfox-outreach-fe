<template>
  <div
    class="campaign-progress"
    :style="{
      '--progress-color': campaignStatusJson.color,
    }"
  >
    <LocalSvgIcon
      :image="campaignStatusJson.icon"
      :classes="`status-icon ${campaignStatusJson.value}`"
    />

    <div
      class="status-text"
    >
      {{ campaignStatusJson.label }}
    </div>
  </div>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// constants
import { CAMPAIGN_STATUS } from 'boot/campaign-constants';

export default defineComponent({
  name: 'CampaignProgress',

  props: {
    status: {
      type: String,
      default: CAMPAIGN_STATUS.DRAFTED.value,
    },
  },

  setup() {
    // computed
    const campaignStatusJson = computed(() => {
      const statuses = Object.values(CAMPAIGN_STATUS);

      const randomStatusValue = statuses[Math.floor(Math.random() * statuses.length)].value;
      switch (randomStatusValue) {
        case CAMPAIGN_STATUS.INPROGRESS.value:
          return CAMPAIGN_STATUS.INPROGRESS;
        case CAMPAIGN_STATUS.COMPLETED.value:
          return CAMPAIGN_STATUS.COMPLETED;
        case CAMPAIGN_STATUS.PAUSED.value:
          return CAMPAIGN_STATUS.PAUSED;
        case CAMPAIGN_STATUS.STOPPED.value:
          return CAMPAIGN_STATUS.STOPPED;
        case CAMPAIGN_STATUS.SCHEDULED.value:
          return CAMPAIGN_STATUS.SCHEDULED;
        default:
          return CAMPAIGN_STATUS.DRAFTED;
      }
    });

    return {
      // computed
      campaignStatusJson,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-progress {
  width: fit-content;
  height: fit-content;
  border-radius: 4px;

  display: flex;
  align-items: center;

  gap: 4px;
  padding: 4px 6px;

  background: rgba(var(--progress-color), 0.1);
  border: 1px solid rgba(var(--progress-color), 0.2);

  .status-text {
    font-size: 13px;
    font-weight: 500;
    line-height: 14px; /* 107.692% */

    color: rgba(var(--progress-color), 1);
  }
}
</style>
