<template>
  <div class="unibox-connected-account-reply-composer">
    <!-- Header: Channel Indicator & Recipient -->
    <div class="composer-header flex items-center justify-between">
      <div class="channel-recipient-info flex items-center no-wrap">
        <!-- Channel Icon (LinkedIn default) -->
        <div
          class="channel-badge flex items-center justify-center q-mr-sm"
          :class="channelClass"
        >
          <LocalSvgIcon
            :image="channelIcon"
            class="badge-icon"
          />
        </div>

        <span class="to-label text-grey q-mr-xs">To:</span>
        <span class="recipient-name font-medium text-black ellipsis">
          {{ recipientName || recipientHandle || 'Contact' }}
        </span>

        <span
          v-if="recipientHandle"
          class="recipient-handle text-grey q-ml-xs ellipsis"
        >
          ({{ recipientHandle }})
        </span>
      </div>

      <span class="channel-label text-caption text-grey">
        {{ channelTitle }}
      </span>
    </div>

    <!-- Message Body Area -->
    <div class="composer-body">
      <q-input
        v-model="replyBody"
        type="textarea"
        borderless
        autogrow
        rows="3"
        class="composer-textarea"
        :placeholder="`Write your ${channelTitle} reply here...`"
      />
    </div>

    <!-- Toolbar / Footer -->
    <div class="composer-footer flex items-center justify-between">
      <!-- Left: Attachments / Templates / Emojis -->
      <div class="footer-tools flex items-center q-gutter-xs">
        <q-btn
          flat
          round
          dense
          size="sm"
          class="tool-btn"
          @click="$emit('insert-template')"
        >
          <LocalSvgIcon
            image="templates"
            class="tool-icon"
          />
          <AppTooltip content="Insert template" />
        </q-btn>
      </div>

      <!-- Right: Cancel & Send Buttons -->
      <div class="footer-actions flex items-center q-gutter-sm">
        <q-btn
          flat
          no-caps
          label="Cancel"
          color="grey-7"
          class="cancel-btn"
          @click="$emit('cancel')"
        />

        <q-btn
          unelevated
          no-caps
          color="primary"
          class="send-btn"
          :loading="isSending"
          :disable="!replyBody.trim()"
          @click="onSendReply"
        >
          <span class="q-mr-xs">Send on {{ channelTitle }}</span>
          <LocalSvgIcon
            image="send"
            class="send-icon"
          />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
} from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

// constants
import { UNIBOX_CHANNEL_TYPE } from 'boot/unibox-constants';

export default defineComponent({
  name: 'UniboxConnectedAccountReply',

  components: {
    AppTooltip,
  },

  emits: ['send', 'cancel', 'insert-template'],

  props: {
    channel: {
      type: String,
      default: UNIBOX_CHANNEL_TYPE.LINKEDIN,
    },
    recipientName: {
      type: String,
      default: '',
    },
    recipientHandle: {
      type: String,
      default: '',
    },
    isSending: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    const state = reactive({
      replyBody: '',
    });

    const channelIcon = computed(() => {
      if (props.channel === 'WHATSAPP') return 'whatsapp';
      return 'linkedin';
    });

    const channelClass = computed(() => {
      if (props.channel === 'WHATSAPP') return 'whatsapp-badge';
      return 'linkedin-badge';
    });

    const channelTitle = computed(() => {
      if (props.channel === 'WHATSAPP') return 'WhatsApp';
      return 'LinkedIn';
    });

    const onSendReply = () => {
      emit('send', {
        channel: props.channel,
        recipient: props.recipientName || props.recipientHandle,
        body: state.replyBody,
      });
    };

    return {
      ...toRefs(state),
      channelIcon,
      channelClass,
      channelTitle,
      onSendReply,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-connected-account-reply-composer {
  width: 100%;
  border-radius: 8px;
  background-color: $white;
  border: 1px solid $grey-100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 16px;
  overflow: hidden;

  .composer-header {
    padding: 12px 16px;
    border-bottom: 1px solid $grey-50;

    .channel-badge {
      width: 20px;
      height: 20px;
      border-radius: 4px;

      &.linkedin-badge {
        background-color: #0A66C2;
        :deep(.badge-icon) {
          width: 12px;
          height: 12px;
          @include svg-icon-fill('path', $white);
        }
      }

      &.whatsapp-badge {
        background-color: #25D366;
        :deep(.badge-icon) {
          width: 12px;
          height: 12px;
          @include svg-icon-fill('path', $white);
        }
      }
    }

    .to-label {
      font-size: 13px;
    }

    .recipient-name {
      font-size: 13px;
    }
  }

  .composer-body {
    padding: 12px 16px;

    .composer-textarea {
      font-size: 14px;
      line-height: 20px;
    }
  }

  .composer-footer {
    padding: 10px 16px;
    border-top: 1px solid $grey-50;
    background-color: #FAFAFA;

    .tool-btn {
      color: grey;

      .tool-icon {
        width: 14px;
        height: 14px;
        @include svg-icon-stroke('path, circle, rect', grey);
      }

      &:hover {
        background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.5);
      }
    }

    .send-btn {
      padding: 6px 16px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 13px;

      .send-icon {
        width: 12px;
        height: 12px;
        @include svg-icon-stroke('path, circle, rect', $white);
      }
    }
  }
}
</style>
