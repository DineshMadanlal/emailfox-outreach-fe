<template>
  <div
    class="card-top-banner cursor-pointer"
    @click="$emit('toggle-collapse')"
  >
    <!-- Left: Status Indicator -->
    <div class="banner-status-info">
      <!-- Inbound Status -->
      <template v-if="isReceived">
        <LocalSvgIcon
          :image="receivedIcon"
          class="banner-icon icon-received"
        />
        <span class="status-label text-received">
          {{ receivedLabelText }}
        </span>
      </template>

      <!-- Outbound Sent Status -->
      <template v-else>
        <LocalSvgIcon
          :image="sentIcon"
          class="banner-icon icon-sent"
        />
        <span class="status-label text-sent">
          {{ sentLabelText }}
        </span>
      </template>
    </div>

    <!-- Right: Date Timestamp -->
    <div class="banner-timestamp-text">
      {{ formattedTimestamp }}
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// constants
import { UNIBOX_CHANNEL_TYPE } from 'boot/unibox-constants';

export default defineComponent({
  name: 'MessageCardBanner',

  emits: ['toggle-collapse'],

  props: {
    isReceived: {
      type: Boolean,
      default: false,
    },
    formattedTimestamp: {
      type: String,
      default: '',
    },
    channelType: {
      type: String,
      default: UNIBOX_CHANNEL_TYPE.EMAIL,
    },
    receivedLabel: {
      type: String,
      default: '',
    },
    sentLabel: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    const isLinkedIn = computed(() => props.channelType === UNIBOX_CHANNEL_TYPE.LINKEDIN);

    const receivedIcon = computed(() => (
      isLinkedIn.value ? 'linkedin-1' : 'email-reply'
    ));

    const sentIcon = computed(() => (
      isLinkedIn.value ? 'linkedin-1' : 'mail'
    ));

    const receivedLabelText = computed(() => {
      if (props.receivedLabel) return props.receivedLabel;
      return isLinkedIn.value ? 'LinkedIn Message Received' : 'Email Reply Received';
    });

    const sentLabelText = computed(() => {
      if (props.sentLabel) return props.sentLabel;
      return isLinkedIn.value ? 'LinkedIn Message Sent' : 'Email Sent - Delivered';
    });

    return {
      receivedIcon,
      sentIcon,
      receivedLabelText,
      sentLabelText,
    };
  },
});
</script>

<style lang="scss" scoped>
.card-top-banner {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .banner-status-info {
    display: flex;
    align-items: center;
    gap: 6px;

    :deep(.banner-icon) {
      width: 15px;
      height: 15px;

      &.icon-received {
        @include svg-icon-stroke('path, circle, rect', $positive);
      }

      &.icon-sent {
        @include svg-icon-stroke('path, circle, rect', $warning);
      }
    }

    .status-label {
      font-size: 14px;
      font-weight: 600;
      color: $black;
    }
  }

  .banner-timestamp-text {
    font-size: 12px;
    color: $black;
  }
}
</style>
