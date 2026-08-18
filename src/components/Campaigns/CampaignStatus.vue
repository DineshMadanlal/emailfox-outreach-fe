<template>
  <div
    class="campaign-status"

    :style="{
      '--s-progress-color': campaignStatusJson.color,
    }"
  >
    <!-- linear progress -->
    <q-linear-progress
      rounded
      :value="campaignProgress / 100"

      class="status-usage-progress"
    >
    </q-linear-progress>

    <div class="status-data-flex">
      <div class="status-label-text">
        {{ campaignStatusJson.label }}
      </div>

      <!-- dot -->
      <LocalSvgIcon
        image="circle-dot"
        classes="circle-dot-icon"
      />

      <!--  -->

      <div class="progress-text">
        {{ isCampaignStatusDrafted ? '-' : campaignProgress + '%' }}
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// Utils
import { findPercentage } from 'src/utils/numbers';

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
    // computed
    const campaignStatusJson = computed(() => {
      const { status } = props.tableRowJson;

      return CAMPAIGN_STATUS[status] || CAMPAIGN_STATUS.DRAFTED;
    });

    const isCampaignStatusDrafted = computed(
      () => props.tableRowJson.status === CAMPAIGN_STATUS.DRAFTED.value,
    );

    const campaignProgress = computed(() => {
      if (isCampaignStatusDrafted.value) {
        return 0;
      }
      const { status, contact_stats: contactStats } = props.tableRowJson;
      if (status === CAMPAIGN_STATUS.COMPLETED.value) {
        return 100;
      }
      if (!contactStats || !contactStats.total_contacts) {
        return 0;
      }
      const total = contactStats.total_contacts || 0;

      const finished = (contactStats.completed_count || 0)
        // + (contactStats.replied_count || 0)
        // + (contactStats.bounced_count || 0)
        // + (contactStats.unsubscribed_count || 0)
        // + (contactStats.stopped_count || 0)
        + (contactStats.failed_count || 0);

      return findPercentage({
        part: finished,
        whole: total,
        roundOutput: true,
      });
    });

    return {
      // computed
      campaignProgress,
      campaignStatusJson,
      isCampaignStatusDrafted,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-status {
  display: flex;
  flex-direction: column;
  gap: 12px;

  :deep(.status-usage-progress) {
    height: 6px;

    .q-linear-progress__track {
      background: $grey-50;
    }

    .q-linear-progress__model {
      background: rgba(var(--s-progress-color), 1);
    }
  }

  .status-data-flex {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-label-text {
      font-size: 14px;
      font-weight: 500;
      color: rgba(var(--s-progress-color), 1);
    }

    :deep(.circle-dot-icon) {
      width: 4px;
      height: 4px;

      @include svg-icon-fill('circle', $grey-300);
    }

    .progress-text {
      font-size: 14px;
      color: $black;
    }
  }
}
</style>
