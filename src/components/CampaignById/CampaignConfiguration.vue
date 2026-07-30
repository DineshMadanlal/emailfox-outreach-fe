<template>
  <q-card flat class="campaign-configuration">
    <!-- header -->
    <div class="configuration-header">
      <h6 class="configuration-title-text">
        Campaign Configuration
      </h6>

      <q-space />

      <!-- Manage -->
      <q-btn
        flat
        dense
        no-caps
        unelevated

        color="primary"
        label="Manage"

        class="action-btn"
      />
    </div>

    <!-- content -->
    <div class="configuration-content">
      <div
        class="each-configuration-detail"
        v-for="(detail, index) in configurationDetails"
        :key="`seq-configuration-detail-${index}`"
      >
        <p class="configuration-type-text">
          {{ detail }}
        </p>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'CampaignConfiguration',

  setup() {
    // computed
    const configurationDetails = computed(() => {
      const details = [
        'Stop Messaging the Same Company',
        'Auto-Match ESP',
      ];

      return details;
    });

    return {
      // computed
      configurationDetails,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-configuration {
  width: 100%;
  border-radius: 6px;
  border: 1px solid $grey-50;

  // header
  .configuration-header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid $grey-50;

    padding: 16px 20px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }

    .configuration-title-text {
      color: $black;
      font-family: Inter;
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
    }

    .action-btn {
      padding: 3px 12px;
      border-radius: 36px;
      border: 1px solid $blue-grey;
    }
  }

  // content
  .configuration-content {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 20px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }

    .each-configuration-detail {
      padding: 3px 12px;
      border-radius: 38px;
      border: 1px solid $grey-50;
      background: rgba($color: var(--grey-50-rgb), $alpha: 0.7);

      .configuration-type-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px; /* 114.286% */
      }
    }
  }
}
</style>
