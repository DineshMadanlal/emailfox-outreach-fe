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

  setup(props) {
    // computed
    const campaignStatusJson = computed(() => CAMPAIGN_STATUS[props.status]
      || CAMPAIGN_STATUS.DRAFTED);

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
