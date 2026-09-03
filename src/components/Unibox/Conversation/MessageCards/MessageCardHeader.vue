<template>
  <div class="card-body-top-section">
    <!-- Email Subject Line -->
    <div
      v-if="subject"
      class="email-subject-title"
    >
      {{ subject }}
    </div>

    <!-- Sender Info Row -->
    <div class="sender-info-row">
      <div class="sender-details-wrapper">
        <!-- Avatar with channel badge -->
        <div class="avatar-container">
          <div
            class="avatar-box"
            :style="avatarPaletteStyle"
          >
            <span class="avatar-initial">
              {{ avatarInitial }}
            </span>
          </div>

          <!-- Outreach channel sub-badge -->
          <div class="channel-sub-badge">
            <LocalSvgIcon
              :image="channelBadgeIcon"
              class="badge-icon"
            />
          </div>
        </div>

        <!-- Sender & Recipient Text -->
        <div class="sender-text-column">
          <div class="sender-name-line">
            <span class="sender-name">
              {{ senderDisplayName }}
            </span>
            <span
              v-if="senderEmail"
              class="sender-email"
            >
              ({{ senderEmail }})
            </span>
          </div>

          <div class="recipient-line">
            to {{ recipientEmail || recipientDisplayName }}
          </div>
        </div>
      </div>

      <!-- Quick Actions on Top-Right (visible when expanded) -->
      <div
        class="card-quick-actions"
        v-if="isExpanded"
      >
        <q-btn
          flat
          round
          dense
          size="sm"
          class="quick-action-btn"
          @click.stop="$emit('reply')"
        >
          <LocalSvgIcon
            image="email-reply"
            class="quick-icon"
          />
          <AppTooltip content="Reply" />
        </q-btn>

        <q-btn
          flat
          round
          dense
          size="sm"
          class="quick-action-btn"
          @click.stop="$emit('forward')"
        >
          <LocalSvgIcon
            image="email-reply"
            class="quick-icon forward-icon"
          />
          <AppTooltip content="Forward" />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

// constants
import { UNIBOX_CHANNEL_TYPE } from 'boot/unibox-constants';

export default defineComponent({
  name: 'MessageCardHeader',

  components: {
    AppTooltip,
  },

  emits: ['reply', 'forward'],

  props: {
    subject: {
      type: String,
      default: '',
    },
    senderDisplayName: {
      type: String,
      default: '',
    },
    senderEmail: {
      type: String,
      default: '',
    },
    recipientDisplayName: {
      type: String,
      default: '',
    },
    recipientEmail: {
      type: String,
      default: '',
    },
    avatarInitial: {
      type: String,
      default: 'U',
    },
    avatarPaletteStyle: {
      type: Object,
      default: () => ({}),
    },
    channelType: {
      type: String,
      default: UNIBOX_CHANNEL_TYPE.EMAIL,
    },
    isExpanded: {
      type: Boolean,
      default: true,
    },
  },

  setup(props) {
    const isLinkedIn = computed(() => props.channelType === UNIBOX_CHANNEL_TYPE.LINKEDIN);

    const channelBadgeIcon = computed(() => (
      isLinkedIn.value ? 'linkedin-1' : 'mail'
    ));

    return {
      channelBadgeIcon,
    };
  },
});
</script>

<style lang="scss" scoped>
.card-body-top-section {
  width: 100%;
  padding: 16px;
  border-bottom: 1px solid $grey-50;

  .email-subject-title {
    font-size: 15px;
    font-weight: 600;
    color: $black;
    margin-bottom: 14px;
    line-height: 20px;
  }

  .sender-info-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .sender-details-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar-container {
        position: relative;
        width: 36px;
        height: 36px;

        .avatar-box {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;

          .avatar-initial {
            font-size: 14px;
            font-weight: 600;
          }
        }

        .channel-sub-badge {
          position: absolute;
          bottom: -3px;
          right: -3px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          z-index: 2;
          background: white;

          :deep(.badge-icon) {
            @include svg-icon-stroke('path, circle, rect', $warning);
          }
        }
      }

      .sender-text-column {
        display: flex;
        flex-direction: column;

        .sender-name-line {
          font-size: 13px;
          line-height: 18px;

          .sender-name {
            font-weight: 600;
            color: $black;
          }

          .sender-email {
            color: $grey;
            margin-left: 4px;
          }
        }

        .recipient-line {
          font-size: 12px;
          color: $grey;
          line-height: 16px;
        }
      }
    }

    .card-quick-actions {
      display: flex;
      align-items: center;
      gap: 2px;

      .quick-action-btn {
        color: $grey;
        width: 28px;
        height: 28px;

        :deep(.quick-icon) {
          width: 16px;
          height: 16px;
          @include svg-icon-stroke('path, circle, rect', $grey);
        }

        :deep(.forward-icon) {
          transform: rotateY(180deg);
        }

        &:hover {
          background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.5);
        }
      }
    }
  }
}
</style>
