<template>
  <div
    class="unibox-email-message-card"
    :class="{
      'is-sent': isSent,
      'is-received': isReceived,
      'is-expanded': isExpanded,
    }"
  >
    <div class="expanded-card-wrapper">
      <!-- 1. Top Status Banner & Timestamp -->
      <MessageCardBanner
        :is-received="isReceived"
        :is-forwarded="isForwarded"
        :isThreadReply="isThreadReply"
        :formatted-timestamp="formattedTimestamp"
        :channel-type="UNIBOX_CHANNEL_TYPE.EMAIL"
        @toggle-collapse="toggleExpand"
      />

      <!-- 2. Main Card Body -->
      <div class="email-body-content">
        <div class="card-body-section">
          <!-- Subject, Avatar, Sender Info & Quick Actions -->
          <MessageCardHeader
            :subject="subjectLine"
            :sender-email="senderEmail"
            :sender-display-name="senderDisplayName"
            :recipient-display-name="recipientDisplayName"
            :recipient-email="recipientEmail"
            :cc="ccAddresses"
            :bcc="bccAddresses"
            :avatar-initial="senderInitial"
            :avatar-palette-style="avatarPaletteStyle"
            :channel-type="UNIBOX_CHANNEL_TYPE.EMAIL"
            :is-expanded="isExpanded"
            :show-actions="!isUntrackedEmail"
            @reply="$emit('reply', messageJson)"
            @forward="$emit('forward', messageJson)"
          />

          <!-- Body Content (Expanded vs Collapsed) & Quoted Toggle -->
          <EmailCardBody
            :is-expanded="isExpanded"
            :clean-preview="cleanPreview"
            :preview-quoted-text="previewQuotedText"
            :parsed-result="parsedResult"
            :is-fetching-parsed="isFetchingParsed"
            :has-quoted-text="hasQuotedText"
            :show-quoted-text="showQuotedText"
            @toggle-quoted="toggleQuotedText"
            @toggle-expand="toggleExpand"
          />

          <!-- Attachments Section (when expanded & available) -->
          <MessageCardAttachments
            v-if="isExpanded && emailAttachments?.length"
            :attachments="emailAttachments"
          />
        </div>

        <!-- 3. Bottom Footer Action Bar -->
        <MessageCardFooter
          v-if="isExpanded && !isUntrackedEmail"
          @reply="handleEmailReply"
          @forward="handleEmailForward"
        />
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, watch, onMounted,
} from 'vue';

// components
import MessageCardBanner from 'components/Unibox/Conversation/MessageCards/MessageCardBanner.vue';
import MessageCardHeader from 'components/Unibox/Conversation/MessageCards/MessageCardHeader.vue';
import EmailCardBody from 'components/Unibox/Conversation/MessageCards/EmailCardBody.vue';
import MessageCardAttachments from 'components/Unibox/Conversation/MessageCards/MessageCardAttachments.vue';
import MessageCardFooter from 'components/Unibox/Conversation/MessageCards/MessageCardFooter.vue';

// utils
import { formatMessageDateTime, formatDate2 } from 'src/utils/dates';
import { fetchUniboxParsedMessage } from 'src/utils/unibox';
import { getFromAndEmailJson } from 'src/utils/skyboxApi';
import {
  splitEmailQuotedText,
  parseEmailContentWithQuotes,
} from 'src/utils/emailParser';

// constants
import {
  UNIBOX_EMAIL_TYPE,
  UNIBOX_CHANNEL_TYPE,
  AVATAR_COLOR_PALETTES,
} from 'boot/unibox-constants';

export default defineComponent({
  name: 'EmailMessageCard',

  components: {
    MessageCardBanner,
    MessageCardHeader,
    EmailCardBody,
    MessageCardAttachments,
    MessageCardFooter,
  },

  emits: ['reply', 'forward', 'toggle-expand'],

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
    defaultExpanded: {
      type: Boolean,
      default: false,
    },
    threadTypeConfig: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      isExpanded: props.defaultExpanded,
      parsedData: null,
      isFetchingParsed: false,
      showQuotedText: false,
    });

    // Address extraction helpers
    const extractEmail = (field) => {
      if (!field) return '';
      if (typeof field === 'string') {
        const parsed = getFromAndEmailJson(field);
        return parsed.email || field.trim();
      }
      if (Array.isArray(field.value) && field.value.length > 0) {
        return field.value.map((v) => v.address || v.email).filter(Boolean).join(', ');
      }
      if (field.text) {
        const parsed = getFromAndEmailJson(field.text);
        return parsed.email || field.text.trim();
      }
      return '';
    };

    const extractDisplayName = (field) => {
      if (!field) return '';
      if (typeof field === 'string') {
        const parsed = getFromAndEmailJson(field);
        return parsed.from || field.trim();
      }
      if (Array.isArray(field.value) && field.value.length > 0) {
        const first = field.value[0];
        return first.name?.trim() || first.address?.trim() || '';
      }
      if (field.text) {
        const parsed = getFromAndEmailJson(field.text);
        return parsed.from || field.text.trim();
      }
      return '';
    };

    // Direction flags
    const isUntrackedEmail = computed(() => (
      props.threadTypeConfig?.data?.isUntracked
      || (!props.contactData?.contact_mapping_id && !props.messageJson?.contact_mapping_id)
    ));

    const isThreadReply = computed(() => (
      props.messageJson?.type === UNIBOX_EMAIL_TYPE.THREAD_REPLY
    ));

    const isReceived = computed(() => {
      if (isUntrackedEmail.value) return true;
      if (isThreadReply.value) return true;
      return props.messageJson?.type === UNIBOX_EMAIL_TYPE.RECEIVED;
    });

    const isForwarded = computed(() => (
      props.messageJson?.type === UNIBOX_EMAIL_TYPE.FORWARD
    ));

    const isSent = computed(() => {
      if (isUntrackedEmail.value) return false;
      if (isForwarded.value) return true;
      return props.messageJson?.type === UNIBOX_EMAIL_TYPE.SENT;
    });

    // Email addresses
    const senderEmail = computed(() => {
      const msg = props.messageJson;
      const parsed = state.parsedData || msg?.parsedData;
      return msg?.sender
        || extractEmail(msg?.from)
        || extractEmail(parsed?.from)
        || extractEmail(props.contactData?.sender)
        || '';
    });

    const recipientEmail = computed(() => {
      const msg = props.messageJson;
      const parsed = state.parsedData || msg?.parsedData;
      return msg?.recipient
        || extractEmail(msg?.to)
        || extractEmail(parsed?.to)
        || props.contactData?.mailbox_email
        || '';
    });

    const ccAddresses = computed(() => {
      const msg = props.messageJson;
      const parsed = state.parsedData || msg?.parsedData;
      return msg?.cc || parsed?.cc || '';
    });

    const bccAddresses = computed(() => {
      const msg = props.messageJson;
      const parsed = state.parsedData || msg?.parsedData;
      return msg?.bcc || parsed?.bcc || '';
    });

    // Display names
    const senderDisplayName = computed(() => {
      if (isThreadReply.value) {
        return 'You';
      }

      if (isUntrackedEmail.value) {
        const msg = props.messageJson;
        const parsed = state.parsedData || msg?.parsedData;
        const fromName = extractDisplayName(msg?.from)
          || extractDisplayName(parsed?.from)
          || extractDisplayName(props.contactData?.sender);
        if (fromName) return fromName;
      }

      if (isReceived.value) {
        const first = props.contactData?.first_name?.trim() || '';
        const last = props.contactData?.last_name?.trim() || '';
        const fullName = `${first} ${last}`.trim();
        if (fullName) return fullName;

        const fromName = extractDisplayName(props.messageJson?.from);
        if (fromName) return fromName;
      }

      return 'You';
    });

    const recipientDisplayName = computed(() => {
      if (isSent.value) {
        const first = props.contactData?.first_name?.trim() || '';
        const last = props.contactData?.last_name?.trim() || '';
        const fullName = `${first} ${last}`.trim();
        if (fullName) return fullName;
      }

      if (isUntrackedEmail.value) {
        const msg = props.messageJson;
        const parsed = state.parsedData || msg?.parsedData;
        const toName = extractDisplayName(msg?.to)
          || extractDisplayName(parsed?.to);
        if (toName) return toName;
      }

      return recipientEmail.value || '';
    });

    // Sender avatar initial
    const senderInitial = computed(() => {
      const name = senderDisplayName.value !== 'You' ? senderDisplayName.value : (senderEmail.value || '');
      const trimmed = name.trim();
      return trimmed ? trimmed.charAt(0).toUpperCase() : 'U';
    });

    // Deterministic avatar palette style
    const avatarPaletteStyle = computed(() => {
      const str = senderEmail.value || 'A';
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

    // Formatted timestamp (e.g., 29 Jul 2026, 8:42 AM)
    const formattedTimestamp = computed(() => formatMessageDateTime(props.messageJson?.date));

    // Short date for collapsed header (e.g., 29 Jul 2026)
    const formattedShortDate = computed(() => formatDate2(props.messageJson?.date));

    // Subject line
    const subjectLine = computed(() => (
      props.messageJson?.subject?.trim()
      || props.contactData?.subject?.trim()
      || '(No subject)'
    ));

    // Split preview text into main reply and quoted history
    const previewSplit = computed(() => {
      const raw = props.messageJson?.message_preview
        || props.messageJson?.subject
        || '';
      return splitEmailQuotedText(raw);
    });

    const cleanPreview = computed(() => previewSplit.value.mainText || '');
    const previewQuotedText = computed(() => previewSplit.value.quotedText || '');

    // Parsed response with main and quoted content separated
    const parsedResult = computed(() => {
      if (!state.parsedData) return null;
      return parseEmailContentWithQuotes({
        html: state.parsedData.html || state.parsedData.text_as_html || '',
        text: state.parsedData.text || '',
      });
    });

    // Determines if there is quoted text to collapse/expand
    const hasQuotedText = computed(() => {
      if (parsedResult.value) {
        return parsedResult.value.hasQuoted;
      }
      return previewSplit.value.hasQuoted;
    });

    // Attachments list
    const emailAttachments = computed(() => (
      props.messageJson?.attachments || []
    ));

    // Fetch parsed message body on-demand
    const loadParsedContent = async () => {
      const msgId = props.messageJson?.message_id || props.messageJson?.id;
      if (!msgId || state.parsedData || state.isFetchingParsed) return;

      try {
        state.isFetchingParsed = true;

        let endpoint = `/unibox/messages/${msgId}/parsed`;

        if (isUntrackedEmail.value) {
          endpoint = `/unibox/untracked/${props.messageJson.id}/parsed`;
        }

        const response = await fetchUniboxParsedMessage({ endpoint });

        state.parsedData = response?.data || response || null;
      } catch (error) {
        // Fallback on error
        state.parsedData = null;
      } finally {
        state.isFetchingParsed = false;
      }
    };

    // Quoted text [...] button click handler (strictly local toggle, NO API calls)
    const toggleQuotedText = () => {
      state.showQuotedText = !state.showQuotedText;
    };

    // Expand the card (fetches parsed content)
    const expandCard = () => {
      state.isExpanded = true;
      loadParsedContent();
      emit('toggle-expand', true);
    };

    const toggleExpand = () => {
      state.isExpanded = !state.isExpanded;
      if (state.isExpanded) {
        loadParsedContent();
      }
      emit('toggle-expand', state.isExpanded);
    };

    // Collapse the card
    const collapseCard = () => {
      state.isExpanded = false;
      emit('toggle-expand', false);
    };

    const handleEmailReply = () => {
      emit('reply', {
        ...props.messageJson,
        ...(state.parsedData ? { parsedData: state.parsedData } : {}),
      });
    };

    const handleEmailForward = () => {
      emit('forward', {
        ...props.messageJson,
        ...(state.parsedData ? { parsedData: state.parsedData } : {}),
      });
    };

    // Watch defaultExpanded prop
    watch(
      () => props.defaultExpanded,
      (newVal) => {
        state.isExpanded = newVal;
        if (newVal) {
          loadParsedContent();
        }
      },
    );

    // Initial load if starting in expanded state
    onMounted(() => {
      if (state.isExpanded) {
        loadParsedContent();
      }
    });

    return {
      // state
      ...toRefs(state),

      // constants
      UNIBOX_CHANNEL_TYPE,

      // computed
      isSent,
      isForwarded,
      isThreadReply,
      isReceived,
      senderEmail,
      recipientEmail,
      ccAddresses,
      bccAddresses,
      senderDisplayName,
      recipientDisplayName,
      senderInitial,
      avatarPaletteStyle,
      formattedTimestamp,
      formattedShortDate,
      subjectLine,
      cleanPreview,
      previewQuotedText,
      parsedResult,
      hasQuotedText,
      emailAttachments,
      isUntrackedEmail,

      // methods
      expandCard,
      collapseCard,
      toggleExpand,
      loadParsedContent,
      toggleQuotedText,
      handleEmailReply,
      handleEmailForward,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-email-message-card {
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
    background: rgba($color: var(--primary-rgb), $alpha: 0.02);
    border-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
  }

  // Expanded Card Wrapper
  .expanded-card-wrapper {
    padding: 6px;
    background-color: inherit;

    // Email Body Content
    .email-body-content {
      border-radius: 8px;
      background-color: $white;

      // Card Body Section
      .card-body-section {
        width: 100%;
      }
    }
  }
}
</style>
