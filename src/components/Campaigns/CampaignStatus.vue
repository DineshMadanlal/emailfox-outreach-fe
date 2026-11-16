<template>
  <div
    class="campaign-status"
    :style="{
      '--s-status-color': campaignStatusColor,
    }"
  >
    <span class="status-dot"></span>
    <span class="status-label-text">
      {{ campaignStatusJson.label }}
    </span>

    <span
      v-if="!isCampaignStatusDrafted"
      class="status-subtext"
    >
      ({{ campaignProgress }}%)
    </span>

    <!-- Tooltip for Auto Paused details -->
    <q-tooltip
      v-if="tableRowJson.last_status_details"
      anchor="top middle"
      self="bottom middle"
      class="bg-dark text-white"
    >
      {{ tableRowJson.last_status_details }}
    </q-tooltip>
  </div>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// constants
import { CAMPAIGN_STATUS } from 'boot/campaign-constants';

export default defineComponent({
  name: 'CampaignStatus',

  props: {
    tableRowJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const campaignStatusJson = computed(() => {
      const { status } = props.tableRowJson;
      return CAMPAIGN_STATUS[status] || CAMPAIGN_STATUS.DRAFTED;
    });

    const isCampaignStatusDrafted = computed(
      () => props.tableRowJson.status === CAMPAIGN_STATUS.DRAFTED.value,
    );

    const campaignStatusColor = computed(() => {
      const { status } = props.tableRowJson;
      if (status === CAMPAIGN_STATUS.ACTIVE.value) return 'var(--positive-color)';
      if (status === CAMPAIGN_STATUS.COMPLETED.value) return 'var(--primary-color)';
      if (status === CAMPAIGN_STATUS.PAUSED.value || status === CAMPAIGN_STATUS.AUTO_PAUSED.value) return 'var(--warning-color)';
      if (status === 'STOPPED' || status === CAMPAIGN_STATUS.PAUSED_SUB_FAILED.value) return 'var(--negative-color)';
      return 'var(--grey-color)';
    });

    const campaignProgress = computed(() => {
      if (isCampaignStatusDrafted.value) {
        return 0;
      }

      return props.tableRowJson?.progress_percentage
        ?? props.tableRowJson?.contact_stats?.progress_percentage
        ?? 0;
    });

    return {
      campaignProgress,
      campaignStatusJson,
      campaignStatusColor,
      isCampaignStatusDrafted,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--s-status-color);
    flex-shrink: 0;
  }

  .status-label-text {
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: var(--s-status-color);
  }

  .status-subtext {
    font-size: 13px;
    font-weight: 400;
    line-height: 18px;
    color: $grey;
  }
}
</style>
