<template>
  <q-card flat class="mailbox-overview">
    <p class="overview-header-text">
      Overview
    </p>

    <div class="overview-display-grid">
      <!-- Connection Status -->
      <div class="each-overview-block">
        <ConnectionStatus
          :isConnected="isConnected"
        />

        <p class="overview-status-text">
          Status
        </p>
      </div>

      <!-- Provider -->
      <div class="each-overview-block">
        <EspProvider
          :provider="provider"
        />

        <p class="overview-status-text">
          Provider
        </p>
      </div>

      <!-- Last Synced -->
      <div
        class="each-overview-block"
        v-if="lastSyncAt"
      >
        <p>
          {{ lastSyncedAt }}
        </p>

        <p class="overview-status-text">
          Last Synced
        </p>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// Components
import EspProvider from 'components/Mailboxes/EspProvider.vue';
import ConnectionStatus from 'components/Mailboxes/ConnectionStatus.vue';

// utils
import { formatDateTimeWithYear } from 'src/utils/dates';

export default defineComponent({
  name: 'MailboxOverview',

  components: {
    EspProvider,
    ConnectionStatus,
  },

  props: {
    provider: {
      type: String,
      default: '',
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    lastSyncAt: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    // computed
    const lastSyncedAt = computed(() => formatDateTimeWithYear(new Date(props.lastSyncAt)));

    return {
      // computed
      lastSyncedAt,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailbox-overview {
  width: 100%;
  padding: 16px 20px;

  border-radius: 6px;
  background: $white;
  border: 1px solid $grey-50;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 16px 12px;
  }

  .overview-header-text {
    color: $black;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;

    margin-bottom: 28px;
  }

  .overview-display-grid {
    display: flex;
    margin-top: 28px;
    gap: 60px;

    @media (max-width: $breakpoint-sm-max) {
      gap: 40px;
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-direction: column;
      row-gap: 16px;
    }

    .each-overview-block {
      &:not(:first-child) {
        padding-left: 20px;
        border-left: 1px solid $grey-50;

        @media (max-width: $breakpoint-xs-max) {
          border-left: 0;
          padding-left: 0;

          border-top: 1px solid $grey-50;
          padding-top: 16px;
        }
      }

      .overview-status-text {
        color: $grey-800;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 16px; /* 114.286% */

        margin-top: 10px;
      }
    }
  }
}
</style>
