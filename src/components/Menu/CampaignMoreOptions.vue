<template>
  <!-- LIST -->
  <q-menu
    auto-close
    self="top right"
    anchor="bottom left"
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <q-list
      style="min-width: 196px"
      class="more-action-list"
    >
      <q-item
        clickable
        :class="`${action.class || ''} more-action-item`"

        v-for="action in moreActions"
        :key="`each-more-action-${action.emitValue}`"

        @click="$emit(action.emitValue)"
      >
        <div class="more-action-text">
          {{ action.label }}
        </div>
      </q-item>
    </q-list>
  </q-menu>
</template>
<script>
// vue
import { defineComponent, computed } from 'vue';

// constants
import { CAMPAIGN_STATUS } from 'boot/campaign-constants';

export default defineComponent({
  name: 'CampaignMoreOptions',

  emits: [
    'pauseCampaign',
    'resumeCampaign',
    'cloneCampaign',
    'renameCampaign',
    'archiveCampaign',
  ],

  props: {
    campaignStatus: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    // computed
    const canPauseCampaign = computed(
      () => props.campaignStatus === CAMPAIGN_STATUS.ACTIVE.value,
    );

    const canResumeCampaign = computed(
      () => props.campaignStatus === CAMPAIGN_STATUS.PAUSED.value
      || props.campaignStatus === CAMPAIGN_STATUS.AUTO_PAUSED.value,
    );

    const moreActions = computed(() => {
      const actions = [
      ];

      // Pause campaign
      if (canPauseCampaign.value) {
        actions.push({
          label: 'Pause Campaign',
          emitValue: 'pauseCampaign',
        });
      }

      // Resume campaign
      if (canResumeCampaign.value) {
        actions.push({
          label: 'Resume Campaign',
          emitValue: 'resumeCampaign',
        });
      }

      // Clone & Rename Campaign
      actions.push({
        label: 'Clone Campaign',
        emitValue: 'cloneCampaign',
      }, {
        label: 'Rename Campaign',
        emitValue: 'renameCampaign',
      });

      // Delete Campaign
      actions.push({
        label: 'Archive Campaign',
        class: 'negative-action',
        emitValue: 'archiveCampaign',
      });

      return actions;
    });

    return {
      moreActions,
    };
  },
});
</script>

<style lang="scss" scoped>
.more-action-list {
  display: flex;
  flex-direction: column;
  gap: 0.5px;

  border-radius: 6px;

  .more-action-item {
    padding: 8px 12px;
    min-height: unset !important;

    .more-action-text {
      font-size: 14px;
      color: $black;
    }

    &:hover {
      background: rgba(var(--primary-rgb), 0.1);
    }

    &.negative-action {
      .more-action-text {
        color: $negative;
      }

      &:hover {
        background: rgba(var(--negative-rgb), 0.1);
      }
    }
  }
}
</style>
