<template>
  <div class="linkedin-by-id-overview custom-scrollbar">
    <div
      v-if="accountByJson.id"
      class="linkedin-by-id-overview-content"
    >
      <!-- Overall Analytics KPIs -->
      <OverallStats
        :accountId="accountByJson.id"
      />

      <!-- Daily Activity Chart with Date Range -->
      <DailyActivity
        :accountId="accountByJson.id"
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import OverallStats from 'components/LinkedInById/Analytics/OverallStats.vue';
import DailyActivity from 'components/LinkedInById/Analytics/DailyActivity.vue';

export default defineComponent({
  name: 'LinkedInByIdOverview',

  emits: ['updateAccountByIdJson'],

  components: {
    OverallStats,
    DailyActivity,
  },

  props: {
    accountByJson: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.linkedin-by-id-overview {
  width: 100%;
  position: relative;
  min-height: 0;
  display: flex;
  flex: 1;

  .linkedin-by-id-overview-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 28px;
    padding: 24px 20px 40px 20px;
    overflow-y: auto;

    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px 32px 12px;
      row-gap: 20px;
    }
  }
}
</style>
