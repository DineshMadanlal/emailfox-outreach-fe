<template>
  <!-- Lightweight Activity Card for Background Actions -->
  <div
    v-if="isActivityStep"
    class="unibox-linkedin-activity-card"
  >
    <div class="activity-card-inner">
      <div class="activity-left-section">
        <div class="activity-icon-container">
          <LocalSvgIcon
            :image="activityIcon"
            class="activity-icon"
          />
        </div>
        <div class="activity-content-info">
          <div class="activity-main-line">
            <span class="activity-title">{{ activityTitle }}</span>
            <span
              v-if="activityTargetText"
              class="activity-target"
            >
              {{ activityTargetText }}
            </span>
          </div>
        </div>
      </div>

      <div class="activity-timestamp">
        {{ formattedTimestamp }}
      </div>
    </div>
  </div>

  <!-- Full Conversational Message Card -->
  <div
    v-else
    class="unibox-linkedin-message-card"
    :class="{
      'is-sent': isSent,
      'is-received': isReceived,
    }"
  >
    <div class="expanded-card-wrapper">
      <!-- 1. Top Status Banner -->
      <LinkedInCardBanner
        :step-type="stepType"
        :is-received="isReceived"
        :formatted-timestamp="formattedTimestamp"
      />

      <!-- 2. Main Card Body Content -->
      <div class="linkedin-body-content">
        <div class="card-body-section">
          <!-- Header: Avatar with [in] badge, From, and To -->
          <LinkedInCardHeader
            :is-received="isReceived"
            :avatar-initial="senderInitial"
            :sender-display-name="senderDisplayName"
            :recipient-display-name="recipientDisplayName"
            :avatar-palette-style="avatarPaletteStyle"
            :can-reply="canReply"

            @reply="$emit('reply', messageJson)"
          />

          <!-- InMail Subject Section (if present) -->
          <div
            v-if="inMailSubject"
            class="linkedin-subject-section"
          >
            <span class="subject-label">Subject: </span>
            <span class="subject-text">{{ inMailSubject }}</span>
          </div>

          <!-- Plain Text Message Body -->
          <div
            v-if="hasBodyContent"
            class="linkedin-message-content"
          >
            <div class="linkedin-message-body">
              {{ messageText }}
            </div>
          </div>

          <!-- Attachments Section -->
          <MessageCardAttachments
            v-if="cardAttachments?.length"
            :attachments="cardAttachments"
          />
        </div>

        <!-- 3. Bottom Footer Action (Reply) -->
        <LinkedInCardFooter
          v-if="canReply && hasBodyContent"
          @reply="$emit('reply', messageJson)"
        />
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed,
} from 'vue';

// components
import LinkedInCardBanner from 'components/Unibox/Conversation/MessageCards/LinkedInCardBanner.vue';
import LinkedInCardHeader from 'components/Unibox/Conversation/MessageCards/LinkedInCardHeader.vue';
import LinkedInCardFooter from 'components/Unibox/Conversation/MessageCards/LinkedInCardFooter.vue';
import MessageCardAttachments from
  'components/Unibox/Conversation/MessageCards/MessageCardAttachments.vue';

// utils
import { formatMessageDateTime } from 'src/utils/dates';

// constants
import {
  WORKFLOW_STEP_TYPES,
  WORKFLOW_CONDITION_TYPES,
} from 'boot/campaign-constants';
import {
  UNIBOX_EMAIL_TYPE,
  AVATAR_COLOR_PALETTES,
  UNIBOX_LINKEDIN_ACTIVITY_STEP_TYPES,
} from 'boot/unibox-constants';

export default defineComponent({
  name: 'LinkedInMessageCard',

  components: {
    LinkedInCardBanner,
    LinkedInCardHeader,
    LinkedInCardFooter,
    MessageCardAttachments,
  },

  emits: ['reply'],

  props: {
    messageJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    contactData: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const isConnectionAccepted = computed(() => (
      props.messageJson?.type === 'LINKEDIN_CONNECTION_ACCEPTED'
      || props.messageJson?.type === WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED
      || props.messageJson?.subject === 'LinkedIn Connection Accepted'
    ));

    const isThreadReply = computed(() => (
      props.messageJson?.type === UNIBOX_EMAIL_TYPE.THREAD_REPLY
    ));

    const isReceived = computed(() => {
      if (isThreadReply.value || isConnectionAccepted.value) return false;
      return props.messageJson?.type === UNIBOX_EMAIL_TYPE.RECEIVED;
    });

    const isSent = computed(() => !isReceived.value);

    const stepType = computed(() => {
      if (isConnectionAccepted.value) {
        return WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED;
      }
      return props.messageJson?.step_type
        || props.messageJson?.type
        || WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE;
    });

    const formattedTimestamp = computed(() => (
      formatMessageDateTime(props.messageJson?.date || props.messageJson?.created_at)
    ));

    // Suppress raw backend execution strings / debug logs
    const sanitizeMessageContent = (rawText) => {
      if (!rawText || typeof rawText !== 'string') return '';
      const trimmed = rawText.trim();
      if (!trimmed) return '';

      // Ignore backend debug/execution logs
      if (
        /^(LINKEDIN_[A-Z_]+\s+executed)$/i.test(trimmed)
        || /^(LinkedIn\s+Connection\s+Request\s+Accepted)$/i.test(trimmed)
        || /^(LinkedIn\s+[A-Za-z\s]+\s+executed)$/i.test(trimmed)
      ) {
        return '';
      }

      return trimmed;
    };

    const messageText = computed(() => {
      const raw = props.messageJson?.message
        || props.messageJson?.message_preview
        || props.messageJson?.body
        || '';
      return sanitizeMessageContent(raw);
    });

    const hasBodyContent = computed(() => !!messageText.value.trim());

    const inMailSubject = computed(() => {
      if (stepType.value === WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL) {
        return props.messageJson?.subject?.trim() || '';
      }
      return '';
    });

    // Detect if this item should be rendered as a lightweight activity item
    const isActivityStep = computed(() => {
      if (isReceived.value) return false;

      const currentStep = stepType.value;

      // Pure automated background activities
      if (UNIBOX_LINKEDIN_ACTIVITY_STEP_TYPES.includes(currentStep)) {
        return true;
      }

      // Connection request sent without an explicit note
      if (currentStep === WORKFLOW_STEP_TYPES.LINKEDIN_CONNECTION_REQUEST) {
        return !hasBodyContent.value;
      }

      return false;
    });

    // Activity Title
    const activityTitle = computed(() => {
      switch (stepType.value) {
        case WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE:
          return 'Visited LinkedIn Profile';

        case WORKFLOW_STEP_TYPES.LINKEDIN_FOLLOW_PROFILE:
          return 'Followed LinkedIn Profile';

        case WORKFLOW_STEP_TYPES.LINKEDIN_LIKE_POST:
          return 'Liked Recent LinkedIn Post';

        case WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED:
        case 'LINKEDIN_CONNECTION_ACCEPTED':
          return 'LinkedIn Connection Accepted';

        case WORKFLOW_STEP_TYPES.LINKEDIN_CONNECTION_REQUEST:
          return 'LinkedIn Connection Request Sent';

        default:
          return 'LinkedIn Activity';
      }
    });

    // Activity Icon
    const activityIcon = computed(() => {
      switch (stepType.value) {
        case WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE:
          return 'show';

        case WORKFLOW_STEP_TYPES.LINKEDIN_FOLLOW_PROFILE:
          return 'profile';

        case WORKFLOW_STEP_TYPES.LINKEDIN_LIKE_POST:
          return 'heart';

        case WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED:
        case 'LINKEDIN_CONNECTION_ACCEPTED':
          return 'badge-tick';

        case WORKFLOW_STEP_TYPES.LINKEDIN_CONNECTION_REQUEST:
          return 'people';

        default:
          return 'linkedin';
      }
    });

    // Display names
    const senderDisplayName = computed(() => {
      if (isThreadReply.value) {
        return 'You';
      }
      if (isReceived.value) {
        const first = props.contactData?.first_name?.trim() || '';
        const last = props.contactData?.last_name?.trim() || '';
        const fullName = `${first} ${last}`.trim();
        if (fullName) return fullName;
        return props.messageJson?.sender || 'Lead';
      }
      return props.messageJson?.sender ? `You (${props.messageJson.sender})` : 'You';
    });

    const recipientDisplayName = computed(() => {
      if (isSent.value) {
        const first = props.contactData?.first_name?.trim() || '';
        const last = props.contactData?.last_name?.trim() || '';
        const fullName = `${first} ${last}`.trim();
        if (fullName) return fullName;
      }

      return props.messageJson?.recipient || '';
    });

    // Optional target text for activity line
    const activityTargetText = computed(() => {
      if (isConnectionAccepted.value && props.messageJson?.sender) {
        return `• by ${props.messageJson.sender}`;
      }
      const first = props.contactData?.first_name?.trim() || '';
      const last = props.contactData?.last_name?.trim() || '';
      const fullName = `${first} ${last}`.trim();
      if (fullName) {
        return `• ${fullName}`;
      }
      return '';
    });

    // Check if reply action should be allowed
    const canReply = computed(() => {
      if (isActivityStep.value) return false;
      return (
        isReceived.value
        || stepType.value === WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE
        || stepType.value === WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL
      );
    });

    const cardAttachments = computed(() => (
      props.messageJson?.attachments || []
    ));

    // Sender avatar initial
    const senderInitial = computed(() => {
      const name = senderDisplayName.value.trim();
      return name ? name.charAt(0).toUpperCase() : 'U';
    });

    // Deterministic avatar palette style
    const avatarPaletteStyle = computed(() => {
      const str = senderDisplayName.value || 'L';
      let sum = 0;
      for (let i = 0; i < str.length; i += 1) {
        sum += str.charCodeAt(i);
      }
      const palette = AVATAR_COLOR_PALETTES[sum % AVATAR_COLOR_PALETTES.length];
      return {
        backgroundColor: palette.bg,
        color: palette.color,
      };
    });

    return {
      // computed
      isReceived,
      isSent,
      stepType,
      formattedTimestamp,
      messageText,
      hasBodyContent,
      inMailSubject,
      isActivityStep,
      activityTitle,
      activityIcon,
      activityTargetText,
      canReply,
      cardAttachments,
      senderDisplayName,
      recipientDisplayName,
      senderInitial,
      avatarPaletteStyle,
    };
  },
});
</script>

<style lang="scss" scoped>
/* Lightweight Activity Card */
.unibox-linkedin-activity-card {
  width: 100%;
  border-radius: 8px;
  background-color: $white;
  border: 1px solid $grey-50;
  padding: 10px 14px;
  transition: all 0.15s ease;

  .activity-card-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .activity-left-section {
      display: flex;
      align-items: center;
      gap: 10px;

      .activity-icon-container {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        background: rgba($color: #0A66C2, $alpha: 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        :deep(.activity-icon) {
          width: 15px;
          height: 15px;
          @include svg-icon-stroke('path, circle, rect', #0A66C2);
        }
      }

      .activity-content-info {
        display: flex;
        align-items: center;

        .activity-main-line {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          line-height: 18px;

          .activity-title {
            font-weight: 600;
            color: $black;
          }

          .activity-target {
            font-weight: 400;
            color: $grey;
          }
        }
      }
    }

    .activity-timestamp {
      font-size: 12px;
      color: $grey;
      flex-shrink: 0;
    }
  }
}

/* Full Conversational Message Card */
.unibox-linkedin-message-card {
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  background-color: $white;
  border: 1px solid $grey-50;
  transition: all 0.15s ease;

  &.is-received {
    background: rgba($color: var(--positive-rgb), $alpha: 0.04);
    border-color: rgba($color: var(--positive-rgb), $alpha: 0.1);
  }

  &.is-sent {
    background: rgba($color: #0A66C2, $alpha: 0.02);
    border-color: rgba($color: #0A66C2, $alpha: 0.1);
  }

  .expanded-card-wrapper {
    padding: 6px;
    background-color: inherit;

    .linkedin-body-content {
      border-radius: 8px;
      background-color: $white;

      .card-body-section {
        width: 100%;

        .linkedin-subject-section {
          padding: 10px 16px 0;
          font-size: 13px;
          line-height: 18px;

          .subject-label {
            font-weight: 600;
            color: $grey;
          }

          .subject-text {
            font-weight: 600;
            color: $black;
          }
        }

        .linkedin-message-content {
          padding: 16px;

          .linkedin-message-body {
            font-size: 14px;
            line-height: 22px;
            color: $black;
            white-space: pre-wrap;
            word-break: break-word;
          }
        }
      }
    }
  }
}
</style>
