<template>
  <div class="card-top-banner">
    <!-- Left: Status Indicator -->
    <div class="banner-status-info">
      <LocalSvgIcon
        :image="bannerIcon"
        :class="bannerIconClass"
      />
      <span
        class="status-label"
        :class="statusLabelClass"
      >
        {{ bannerLabel }}
      </span>
    </div>

    <!-- Right: Formatted Date Timestamp -->
    <div class="banner-timestamp-text">
      {{ formattedTimestamp }}
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// constants
import {
  WORKFLOW_STEP_TYPES,
  WORKFLOW_CONDITION_TYPES,
} from 'boot/campaign-constants';

export default defineComponent({
  name: 'LinkedInCardBanner',

  props: {
    stepType: {
      type: String,
      default: WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE,
    },
    isReceived: {
      type: Boolean,
      default: false,
    },
    formattedTimestamp: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    // Banner text label
    const bannerLabel = computed(() => {
      if (props.isReceived) {
        if (props.stepType === WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL) {
          return 'LinkedIn InMail Reply Received';
        }
        return 'LinkedIn Reply Received';
      }

      switch (props.stepType) {
        case WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE:
          return 'LinkedIn Message Sent';

        case WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL:
          return 'LinkedIn InMail Sent';

        case WORKFLOW_STEP_TYPES.LINKEDIN_CONNECTION_REQUEST:
          return 'LinkedIn Connection Request Sent';

        case WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED:
        case 'LINKEDIN_CONNECTION_ACCEPTED':
          return 'LinkedIn Connection Accepted';

        case WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE:
          return 'Visited LinkedIn Profile';

        case WORKFLOW_STEP_TYPES.LINKEDIN_FOLLOW_PROFILE:
          return 'Followed LinkedIn Profile';

        case WORKFLOW_STEP_TYPES.LINKEDIN_LIKE_POST:
          return 'Liked Recent LinkedIn Post';

        default:
          return 'LinkedIn Message Sent';
      }
    });

    // Icon image identifier
    const bannerIcon = computed(() => {
      if (props.isReceived) {
        return 'email-reply';
      }
      return 'linkedin';
    });

    // Icon class for styling colors
    const bannerIconClass = computed(() => {
      if (props.isReceived) {
        return 'banner-icon icon-received';
      }
      return 'banner-icon';
    });

    // Status label text class
    const statusLabelClass = computed(() => {
      if (props.isReceived) {
        return 'text-received';
      }
      return '';
    });

    return {
      bannerLabel,
      bannerIcon,
      bannerIconClass,
      statusLabelClass,
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
    }

    .status-label {
      font-size: 14px;
      font-weight: 600;
      color: $black;

      &.text-received {
        color: $positive;
      }
    }
  }

  .banner-timestamp-text {
    font-size: 12px;
    color: $black;
  }
}
</style>
