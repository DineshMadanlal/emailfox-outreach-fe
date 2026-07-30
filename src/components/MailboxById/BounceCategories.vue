<template>
  <q-card flat class="bounce-categories-card">
    <ApiLoader :show="showLoader" />

    <p class="bounced-header-text">
      Bounce Categories
    </p>

    <!-- Total Bounced Rate -->
    <div class="total-bounced-rate">
      <p>
        Total Bounce Rate
      </p>

      <q-space />

      <p class="total-value-text">
        {{ totalBouncedRate }}%
      </p>
    </div>

    <!--  -->
    <div class="bounce-percentage-bar">
      <div
        class="hard-bar"
        :style="{ width: `${hardBouncedPercentage}%` }"
      />

      <div
        class="soft-bar"
        :style="{ width: `${softBouncedPercentage}%` }"
      />
    </div>

    <!-- Hard Bounce Rate -->
    <div class="bounce-type-display hard">
      <div class="legend-div"></div>

      <p class="bounce-type-label-text">
        Hard Bounce Rate
      </p>

      <InfoTooltip
        iconName="circle-question"
        tooltipText="This usually means the address doesn’t exist, the domain
          is invalid or the mailbox is closed. A high hard bounce rate
          harms domain reputation and can trigger inbox providers to block your emails"
      />

      <q-space />

      <p class="bounce-type-value-text">
        {{ hardBouncedRate }}% <span>({{ hardBouncedPercentage }}%)</span>
      </p>
    </div>

    <!-- Soft Bounce Rate -->
    <div class="bounce-type-display soft">
      <div class="legend-div"></div>

      <p class="bounce-type-label-text">
        Soft Bounce Rate
      </p>

      <InfoTooltip
        iconName="circle-question"
        tooltipText="Common reasons include a full mailbox, the recipient server being down,
        size limits or temporary rate limits.
        Soft bounces don’t immediately hurt reputation but consistent
        spikes can impact deliverability."
      />

      <q-space />

      <p class="bounce-type-value-text">
        {{ softBouncedRate }}% <span>({{ softBouncedPercentage }}%)</span>
      </p>
    </div>
  </q-card>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// Components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import InfoTooltip from 'components/General/InfoTooltip.vue';

// utils
import { findPercentage } from 'src/utils/numbers';

export default defineComponent({
  name: 'BounceCategories',

  components: {
    ApiLoader,
    InfoTooltip,
  },

  props: {
    metrics: {
      type: Object,
      default: () => ({}),
    },

    showLoader: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // computed
    const totalBouncedRate = computed(() => props.metrics.bounce_count);

    const hardBouncedRate = computed(() => props.metrics.hard_bounce_count);
    const softBouncedRate = computed(() => totalBouncedRate.value - hardBouncedRate.value);

    const hardBouncedPercentage = computed(() => findPercentage({
      part: hardBouncedRate.value,
      whole: totalBouncedRate.value,
      roundOutput: true,
    }));

    const softBouncedPercentage = computed(() => findPercentage({
      part: softBouncedRate.value,
      whole: totalBouncedRate.value,
      roundOutput: true,
    }));

    return {
      // computed
      totalBouncedRate,
      hardBouncedPercentage,
      softBouncedPercentage,

      hardBouncedRate,
      softBouncedRate,
    };
  },
});
</script>

<style lang="scss" scoped>
.bounce-categories-card {
  width: 100%;
  padding: 16px 20px;

  border-radius: 6px;
  background: $white;
  border: 1px solid $grey-50;
  position: relative;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 16px 12px;
  }

  .bounced-header-text {
    color: $black;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;

    margin-bottom: 28px;
  }

  .total-bounced-rate {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    color: $black;
    font-size: 16px;
    font-weight: 500;

    .total-label-text {
      font-weight: 500;
    }
  }

  .bounce-percentage-bar {
    width: 100%;
    display: flex;
    align-items: center;
    height: 6px;
    gap: 4px;

    margin-bottom: 34px;

    .hard-bar {
      background: $warning;
      height: 100%;
      border-radius: 1px;
    }

    .soft-bar {
      background: $primary;
      height: 100%;
      border-radius: 1px;
    }
  }

  .bounce-type-display {
    display: flex;
    align-items: center;

    .legend-div {
      width: 8px;
      height: 6px;
      border-radius: 1px;
    }

    &.hard {
      .legend-div {
        background-color: $warning;
      }
    }

    &.soft {
      margin-top: 20px;

      .legend-div {
        background-color: $primary;
      }
    }

    .bounce-type-label-text {
      color: $grey-800;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-left: 8px;
      margin-right: 6px;
    }

    .bounce-type-value-text {
      color: $grey-800;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      span {
        font-size: 12px;
      }
    }
  }
}
</style>
