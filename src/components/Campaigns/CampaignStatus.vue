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

      return props.tableRowJson?.contact_stats?.progress_percentage || 0;
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
