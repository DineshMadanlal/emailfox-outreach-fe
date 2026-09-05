<template>
  <div class="card-body-top-section">
    <div class="sender-info-row">
      <div class="sender-details-wrapper">
        <!-- Avatar with LinkedIn channel badge -->
        <div class="avatar-container">
          <div
            class="avatar-box"
            :style="avatarPaletteStyle"
          >
            <span class="avatar-initial">
              {{ avatarInitial }}
            </span>
          </div>

          <!-- LinkedIn channel sub-badge -->
          <div class="channel-sub-badge">
            <LocalSvgIcon
              image="linkedin"
              class="badge-icon"
            />
          </div>
        </div>

        <!-- Sender & Recipient Text -->
        <div class="sender-text-column">
          <!-- From line -->
          <div class="sender-name-line">
            <span class="prefix-label">From: </span>
            <span class="sender-name">{{ senderDisplayName }}</span>
          </div>

          <!-- To line (visible on Outbound Sent messages) -->
          <div
            v-if="recipientDisplayName"
            class="recipient-line"
          >
            <span class="prefix-label">To: </span>
            <span class="recipient-name">
              {{ recipientDisplayName }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Action: Reply on Top-Right -->
      <div class="card-quick-actions">
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
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'LinkedInCardHeader',

  components: {
    AppTooltip,
  },

  emits: ['reply'],

  props: {
    senderDisplayName: {
      type: String,
      default: '',
    },
    recipientDisplayName: {
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
    isReceived: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.card-body-top-section {
  width: 100%;
  padding: 16px;
  border-bottom: 1px solid $grey-50;

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
            width: 14px;
            height: 14px;
          }
        }
      }

      .sender-text-column {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .sender-name-line {
          font-size: 13px;
          line-height: 18px;

          .prefix-label {
            color: $grey;
            font-weight: 500;
          }

          .sender-name {
            font-weight: 600;
            color: $black;
          }
        }

        .recipient-line {
          font-size: 13px;
          line-height: 18px;

          display: flex;
          align-items: center;
          gap: 6px;

          .prefix-label {
            color: $grey;
            font-weight: 500;
          }

          .recipient-name {
            font-weight: 500;
            color: $primary;
          }
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

        &:hover {
          background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.5);
        }
      }
    }
  }
}
</style>
