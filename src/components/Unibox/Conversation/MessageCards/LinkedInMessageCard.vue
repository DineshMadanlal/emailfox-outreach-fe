<template>
  <div
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

            @reply="$emit('reply', messageJson)"
          />

          <!-- Plain Text Message Body -->
          <div
            v-if="hasBodyContent"
            class="linkedin-message-content"
          >
            <div class="linkedin-message-body">
              {{ messageText }}
            </div>
          </div>
        </div>

        <!-- 3. Bottom Footer Action (Reply) -->
        <LinkedInCardFooter
          v-if="hasBodyContent"
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

// utils
import { formatMessageDateTime } from 'src/utils/dates';

// constants
import { WORKFLOW_STEP_TYPES } from 'boot/campaign-constants';
import {
  UNIBOX_EMAIL_TYPE,
  AVATAR_COLOR_PALETTES,
} from 'boot/unibox-constants';

export default defineComponent({
  name: 'LinkedInMessageCard',

  components: {
    LinkedInCardBanner,
    LinkedInCardHeader,
    LinkedInCardFooter,
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
    const isReceived = computed(() => (
      props.messageJson?.type === UNIBOX_EMAIL_TYPE.RECEIVED
    ));

    const isSent = computed(() => !isReceived.value);

    const stepType = computed(() => (
      props.messageJson?.step_type || WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE
    ));

    const formattedTimestamp = computed(() => (
      formatMessageDateTime(props.messageJson?.date || props.messageJson?.created_at)
    ));

    const messageText = computed(() => (
      props.messageJson?.message
      || props.messageJson?.message_preview
      || props.messageJson?.body
      || ''
    ));

    const hasBodyContent = computed(() => !!messageText.value.trim());

    // Display names
    const senderDisplayName = computed(() => {
      if (isReceived.value) {
        const first = props.contactData?.first_name?.trim() || '';
        const last = props.contactData?.last_name?.trim() || '';
        const fullName = `${first} ${last}`.trim();
        if (fullName) return fullName;
        return props.messageJson?.sender || 'Lead';
      }
      return `You (${props.messageJson?.sender})`;
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
      senderDisplayName,
      recipientDisplayName,
      senderInitial,
      avatarPaletteStyle,
    };
  },
});
</script>

<style lang="scss" scoped>
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
