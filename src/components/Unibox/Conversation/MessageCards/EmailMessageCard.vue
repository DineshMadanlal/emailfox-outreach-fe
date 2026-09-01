<template>
  <div
    class="unibox-email-message-card"
    :class="{
      'is-reply': messageJson.is_reply || messageJson.message_type === 'REPLY',
      'is-sent': messageJson.is_sent || messageJson.message_type === 'SENT',
    }"
  >
    <!-- Card Header Banner -->
    <div class="message-card-header flex items-center justify-between">
      <div class="header-left flex items-center no-wrap">
        <LocalSvgIcon
          :image="headerIcon"
          class="header-type-icon q-mr-xs"
        />
        <span class="header-title-text ellipsis">
          {{ headerTitle }}
        </span>
      </div>

      <span class="header-timestamp-text">
        {{ formattedDate }}
      </span>
    </div>

    <!-- Card Body Container -->
    <div class="message-card-body">
      <!-- Sender & Recipient Information Row -->
      <div class="sender-recipient-section flex items-start no-wrap">
        <!-- Sender Avatar -->
        <div
          class="sender-avatar-box"
          :style="avatarPaletteStyle"
        >
          <q-img
            v-if="profilePicUrl"
            no-spinner
            :src="profilePicUrl"
            class="avatar-image"
          >
            <template v-slot:error>
              <span class="avatar-initial">{{ senderInitial }}</span>
            </template>
          </q-img>
          <span
            v-else
            class="avatar-initial"
          >
            {{ senderInitial }}
          </span>

          <!-- Channel badge overlay -->
          <div class="avatar-channel-badge email-badge">
            <LocalSvgIcon
              image="mail"
              class="badge-icon"
            />
          </div>
        </div>

        <!-- Sender details -->
        <div class="sender-info-column flex-1 min-w-0">
          <div class="sender-name-line flex items-center no-wrap">
            <span class="from-label text-grey q-mr-xs">From:</span>
            <span class="sender-name font-medium text-black ellipsis">
              {{ senderDisplayName }}
            </span>
          </div>

          <div
            v-if="recipientDisplayName"
            class="recipient-name-line flex items-center no-wrap q-mt-xs"
          >
            <span class="to-label text-grey q-mr-xs">To:</span>
            <span class="recipient-name text-primary ellipsis">
              {{ recipientDisplayName }}
            </span>
          </div>
        </div>
      </div>

      <!-- Subject Line (if available) -->
      <div
        v-if="messageJson.subject"
        class="email-subject-line"
      >
        <span class="subject-label text-grey q-mr-xs">Subject:</span>
        <span class="subject-text text-black font-medium">{{ messageJson.subject }}</span>
      </div>

      <!-- Message Content / Body -->
      <div class="email-message-content">
        <!-- Render HTML if present, else plain text -->
        <div
          v-if="messageJson.body_html || messageJson.html"
          class="message-html-body"
          v-html="messageJson.body_html || messageJson.html"
        />
        <div
          v-else
          class="message-plain-body"
        >
          {{ messageJson.body_text || messageJson.body || messageJson.text || '' }}
        </div>
      </div>

      <!-- Attachments List (if present) -->
      <div
        v-if="attachments.length > 0"
        class="message-attachments-row flex items-center q-gutter-sm q-mt-sm"
      >
        <div
          v-for="(attachment, idx) in attachments"
          :key="`email-attachment-${idx}`"
          class="attachment-pill flex items-center"
        >
          <LocalSvgIcon
            image="attachment"
            class="attachment-icon q-mr-xs"
          />
          <span class="attachment-name ellipsis">{{ attachment.name || attachment.filename }}</span>
          <span
            v-if="attachment.size"
            class="attachment-size text-grey q-ml-xs"
          >({{ attachment.size }})</span>
        </div>
      </div>

      <!-- Card Action Footer (Reply trigger) -->
      <div class="message-card-footer flex items-center">
        <q-btn
          flat
          no-caps
          dense
          class="reply-trigger-btn flex items-center"
          @click="$emit('reply', messageJson)"
        >
          <LocalSvgIcon
            image="reply"
            class="reply-icon q-mr-xs"
          />
          <span class="reply-text">Reply</span>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// utils
import { getGravatarUrl } from 'src/utils/skyboxApi';

const AVATAR_COLOR_PALETTES = [
  { bg: '#EBF5FF', color: '#2563EB' },
  { bg: '#FFF4E6', color: '#D97706' },
  { bg: '#E8F8F0', color: '#059669' },
  { bg: '#F3E8FF', color: '#7C3AED' },
  { bg: '#FFE4E6', color: '#E11D48' },
];

export default defineComponent({
  name: 'UniboxEmailMessageCard',

  emits: ['reply'],

  props: {
    messageJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup(props) {
    const isReply = computed(() => (
      props.messageJson.is_reply
      || props.messageJson.message_type === 'REPLY'
      || props.messageJson.direction === 'INBOUND'
    ));

    const headerTitle = computed(() => {
      if (isReply.value) {
        return 'Email Reply Received';
      }
      return 'Email Sent - Delivered';
    });

    const headerIcon = computed(() => (isReply.value ? 'reply' : 'mail'));

    const senderDisplayName = computed(() => {
      const m = props.messageJson;
      return m.from_name || m.sender_name || m.from_email || m.sender_email || m.from || 'Unknown Sender';
    });

    const recipientDisplayName = computed(() => {
      const m = props.messageJson;
      return m.to_name || m.recipient_name || m.to_email || m.recipient_email || m.to || '';
    });

    const senderInitial = computed(() => {
      const str = senderDisplayName.value.trim();
      return str ? str.charAt(0).toUpperCase() : 'U';
    });

    const avatarPaletteStyle = computed(() => {
      const str = senderDisplayName.value || 'A';
      let charCodeSum = 0;
      for (let i = 0; i < str.length; i += 1) {
        charCodeSum += str.charCodeAt(i);
      }
      const palette = AVATAR_COLOR_PALETTES[charCodeSum % AVATAR_COLOR_PALETTES.length];
      return {
        backgroundColor: palette.bg,
        color: palette.color,
      };
    });

    const profilePicUrl = computed(() => {
      const m = props.messageJson;
      const email = m.from_email || m.sender_email || (typeof m.from === 'string' && m.from.includes('@') ? m.from : null);
      if (email) {
        return getGravatarUrl(email);
      }
      return null;
    });

    const formattedDate = computed(() => {
      const m = props.messageJson;
      const raw = m.sent_at || m.time || m.created_at || m.timestamp || m.latest_time;
      if (!raw) return '';
      const date = new Date(raw);

      const day = date.getDate();
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();

      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;

      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    });

    const attachments = computed(() => props.messageJson.attachments || []);

    return {
      isReply,
      headerTitle,
      headerIcon,
      senderDisplayName,
      recipientDisplayName,
      senderInitial,
      avatarPaletteStyle,
      profilePicUrl,
      formattedDate,
      attachments,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-email-message-card {
  width: 100%;
  border-radius: 8px;
  background-color: $white;
  border: 1px solid $grey-100;
  margin-bottom: 16px;
  overflow: hidden;

  &.is-reply {
    border-color: rgba($color: var(--positive-rgb), $alpha: 0.4);

    .message-card-header {
      background-color: rgba($color: var(--positive-rgb), $alpha: 0.08);
      color: $positive;

      :deep(.header-type-icon) {
        @include svg-icon-stroke('path, circle, rect', $positive);
      }
    }
  }

  &.is-sent {
    border-color: rgba($color: var(--primary-rgb), $alpha: 0.3);

    .message-card-header {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.05);
      color: $primary;

      :deep(.header-type-icon) {
        @include svg-icon-stroke('path, circle, rect', $primary);
      }
    }
  }

  .message-card-header {
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .header-type-icon {
      width: 14px;
      height: 14px;
    }

    .header-timestamp-text {
      font-size: 12px;
      font-weight: 400;
      color: grey;
    }
  }

  .message-card-body {
    padding: 16px;

    .sender-recipient-section {
      margin-bottom: 12px;
      gap: 12px;
    }

    .sender-avatar-box {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .avatar-image {
        width: 100%;
        height: 100%;
        border-radius: 6px;
        object-fit: cover;
      }

      .avatar-initial {
        font-size: 14px;
        font-weight: 600;
      }

      .avatar-channel-badge {
        position: absolute;
        bottom: -3px;
        right: -3px;
        width: 14px;
        height: 14px;
        border-radius: 3px;
        background-color: #EA580C;
        display: flex;
        align-items: center;
        justify-content: center;

        .badge-icon {
          width: 10px;
          height: 10px;
          @include svg-icon-stroke('path, circle, rect', $white);
        }
      }
    }

    .sender-name-line,
    .recipient-name-line {
      font-size: 13px;
    }

    .email-subject-line {
      font-size: 13px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px dashed $grey-100;
    }

    .email-message-content {
      font-size: 14px;
      line-height: 22px;
      color: $grey;
      white-space: pre-wrap;
      word-break: break-word;

      .message-html-body {
        max-width: 100%;
        overflow-x: auto;
      }
    }

    .attachment-pill {
      padding: 4px 10px;
      border-radius: 6px;
      background-color: $grey-50;
      border: 1px solid $grey-100;
      font-size: 12px;
      color: $grey-800;

      .attachment-icon {
        width: 12px;
        height: 12px;
      }
    }

    .message-card-footer {
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid $grey-50;

      .reply-trigger-btn {
        color: $primary;
        padding: 4px 8px;
        border-radius: 4px;

        .reply-icon {
          width: 14px;
          height: 14px;
          @include svg-icon-stroke('path, circle, rect', $primary);
        }

        .reply-text {
          font-size: 13px;
          font-weight: 500;
        }

        &:hover {
          background-color: rgba($color: var(--primary-rgb), $alpha: 0.08);
        }
      }
    }
  }
}
</style>
