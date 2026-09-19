<template>
  <div class="warmup-analytics-page">
    <WarmupBlockedBanner
      :mailboxByJson="mailboxByJson"
      :warmupDetails="mailboxWarmupDetails"

      @unblockWarmup="$emit('unblockWarmup')"
    />

    <WarmupDetails
      :mailboxByJson="mailboxByJson"
      :mailboxWarmupDetails="mailboxWarmupDetails"

      @reloadApiCalls="$emit('reloadApiCalls')"
    />
    <WarmupStats
      :mailboxByJson="mailboxByJson"
    />

    <WarmupGrowthPlacement
      :mailboxId="mailboxByJson.id"
    />

    <div class="mailbox-health-esp-container">
      <MailboxHealth
        v-if="false"
        :mailboxId="mailboxByJson.id"
        class="mailbox-health-analytics"
      />

      <WarmupEspBreakdown
        :mailboxId="mailboxByJson.id"
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import WarmupStats from 'components/Warmup/WarmupStats.vue';
import WarmupDetails from 'components/Warmup/WarmupDetails.vue';
import MailboxHealth from 'components/Warmup/MailboxHealth.vue';
import WarmupEspBreakdown from 'components/Warmup/WarmupEspBreakdown.vue';
import WarmupGrowthPlacement from 'components/Warmup/WarmupGrowthPlacement.vue';
import WarmupBlockedBanner from 'components/MailboxById/WarmupBlockedBanner.vue';

export default defineComponent({
  name: 'MailboxByIdWarmupAnalytics',

  emits: ['unblockWarmup', 'reloadApiCalls'],

  components: {
    WarmupDetails,
    WarmupStats,
    MailboxHealth,
    WarmupEspBreakdown,
    WarmupGrowthPlacement,
    WarmupBlockedBanner,
  },

  props: {
    mailboxByJson: {
      type: Object,
      default: () => ({}),
    },
    mailboxWarmupDetails: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.warmup-analytics-page {
  width: 100%;

  display: grid;
  grid-row-gap: 32px;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    gap: 16px;
  }

  .mailbox-health-esp-container {
    display: flex;
    gap: 32px;

    .mailbox-health-analytics {
      max-width: 492px;

      // lg min
      @media (min-width: $breakpoint-lg-min) {
        max-width: 40%;
      }
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-direction: column;
      gap: 16px;
    }
  }
}
</style>
