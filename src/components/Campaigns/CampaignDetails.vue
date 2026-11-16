<template>
  <div class="campaign-details">
    <div
      class="campaign-icon-container"
      :class="channelIconMeta.wrapperClass"
    >
      <LocalSvgIcon
        :image="channelIconMeta.image"
        classes="campaign-channel-icon"
      />
    </div>

    <div class="seq-name-text">
      {{ tableRowJson.name }}
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// constants
import { CAMPAIGN_TYPES } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'CampaignDetails',

  props: {
    tableRowJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const isEmailOnly = computed(
      () => props.tableRowJson.type === CAMPAIGN_TYPES.EMAIL.value,
    );

    const isLinkedInOnly = computed(
      () => props.tableRowJson.type === CAMPAIGN_TYPES.LINKEDIN.value,
    );

    const channelIconMeta = computed(() => {
      if (isEmailOnly.value) {
        return {
          image: 'mail',
          wrapperClass: 'channel-icon--email',
        };
      }
      if (isLinkedInOnly.value) {
        return {
          image: 'linkedin',
          wrapperClass: 'channel-icon--linkedin',
        };
      }
      return {
        image: 'channel',
        wrapperClass: 'channel-icon--multi',
      };
    });

    return {
      channelIconMeta,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-details {
  display: flex;
  align-items: center;
  gap: 12px;

  .campaign-icon-container {
    width: 28px;
    height: 28px;
    min-width: 28px;
    border-radius: 5px;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;

    :deep(.campaign-channel-icon) {
      width: 14px;
      height: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &.channel-icon--email {
      border: 1px solid rgba(var(--warning-rgb), 0.2);
    }

    &.channel-icon--linkedin {
      border: 1px solid rgba(var(--primary-rgb), 0.2);
    }

    &.channel-icon--multi {
      border: 1px solid rgba(var(--tertiary-rgb), 0.2);
    }
  }

  .seq-name-text {
    color: $black;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
}
</style>
