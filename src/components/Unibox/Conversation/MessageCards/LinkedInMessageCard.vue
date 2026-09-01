<template>
  <div
    class="unibox-linkedin-message-card"
    :class="{
      'is-reply': isReply,
      'is-sent': isSent,
      'is-event': isEvent,
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
        <!-- Sender Avatar with LinkedIn Badge -->
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

          <!-- Channel badge overlay (LinkedIn) -->
          <div class="avatar-channel-badge linkedin-badge">
            <LocalSvgIcon
              image="linkedin"
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
            <span
              v-if="senderHandle"
              class="sender-handle text-grey q-ml-xs ellipsis"
            >
              ({{ senderHandle }})
            </span>
          </div>

          <div
            v-if="senderHeadline"
            class="sender-headline-line text-grey text-caption ellipsis"
          >
            {{ senderHeadline }}
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

      <!-- Message Content / Body (for messages/replies) -->
      <div
        v-if="messageJson.body_text || messageJson.body || messageJson.text"
        class="linkedin-message-content"
      >
        <p class="message-text">
          {{ messageJson.body_text || messageJson.body || messageJson.text }}
        </p>
      </div>

      <!-- Card Action Footer (Reply trigger) -->
      <div
        v-if="!isEvent"
        class="message-card-footer flex items-center"
      >
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
  name: 'UniboxLinkedInMessageCard',

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

    const isSent = computed(() => (
      props.messageJson.is_sent
      || props.messageJson.message_type === 'SENT'
      || props.messageJson.direction === 'OUTBOUND'
    ));

    const isEvent = computed(() => (
      props.messageJson.is_event
      || props.messageJson.message_type === 'EVENT'
      || props.messageJson.event_type === 'CONNECTION_ACCEPTED'
    ));

    const headerTitle = computed(() => {
      if (isReply.value) {
        return 'Replied to your LinkedIn Message (Sequence paused automatically)';
      }
      if (isEvent.value) {
        return props.messageJson.event_title || 'LinkedIn Connection Accepted';
      }
      return 'LinkedIn Message Sent';
    });

    const headerIcon = computed(() => {
      if (isReply.value) return 'reply';
      return 'linkedin';
    });

    const senderDisplayName = computed(() => {
      const m = props.messageJson;
      return m.from_name || m.sender_name || m.sender_username || m.from || 'Ethan Smith';
    });

    const senderHandle = computed(() => {
      const m = props.messageJson;
      const h = m.ln_provider_username || m.username || m.handle || '';
      if (!h) return '';
      return h.startsWith('@') ? h : `@${h}`;
    });

    const senderHeadline = computed(() => {
      const m = props.messageJson;
      return m.headline || m.title || m.designation || '';
    });

    const recipientDisplayName = computed(() => {
      const m = props.messageJson;
      return m.to_name || m.recipient_name || m.to || '';
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
      return m.profile_picture || m.avatar_url || (m.email ? getGravatarUrl(m.email) : null);
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

    return {
      isReply,
      isSent,
      isEvent,
      headerTitle,
      headerIcon,
      senderDisplayName,
      senderHandle,
      senderHeadline,
      recipientDisplayName,
      senderInitial,
      avatarPaletteStyle,
      profilePicUrl,
      formattedDate,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-linkedin-message-card {
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

  &.is-sent,
  &.is-event {
    border-color: rgba($color: var(--primary-rgb), $alpha: 0.3);

    .message-card-header {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.05);
      color: $primary;

      :deep(.header-type-icon) {
        @include svg-icon-fill('path', #0A66C2);
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
        background-color: #0A66C2;
        display: flex;
        align-items: center;
        justify-content: center;

        .badge-icon {
          width: 10px;
          height: 10px;
          @include svg-icon-fill('path', $white);
        }
      }
    }

    .sender-name-line {
      font-size: 13px;
    }

    .sender-headline-line {
      line-height: 16px;
      margin-top: 2px;
    }

    .recipient-name-line {
      font-size: 13px;
    }

    .linkedin-message-content {
      font-size: 14px;
      line-height: 22px;
      color: $grey;
      white-space: pre-wrap;
      word-break: break-word;

      .message-text {
        margin: 0;
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
