<template>
  <q-card flat class="bounce-rate-breakdown-card">
    <!-- header -->
    <div class="bounce-rate-header-details">
      <p class="breakdown-header-text">
        Bounce Rate Breakdown
      </p>

      <div class="bounce-breakdown-details">
        <!-- Bounce Icon -->
        <div class="bounced-icon-block">
          <LocalSvgIcon
            image="seq-bounced"
            classes="seq-bounced-icon"
          />
        </div>

        <p class="bounced-rate-text">
          {{ bouncedRate }}%
        </p>

        <p class="bounced-count-text">
          {{ bouncedCountInUi }} Bounced
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="bounce-rate-content-details">
      <!-- Hard bounce -->
      <div class="each-bounce-type-block">
        <p class="bounce-type-header-text">
          Hard Bounce
        </p>

        <!-- Rate -->
        <div class="flex no-wrap items-center vertical-split">
          <p class="each-bounce-label-text">
            Rate:
          </p>

          <p class="each-bounce-value-text">
            {{ hardBounceRate }}%

            <span>
              {{ hardBounceCount }}
            </span>
          </p>
        </div>

        <!-- Status -->
        <div class="flex no-wrap items-center vertical-split">
          <p class="each-bounce-label-text">
            Status:
          </p>

          <p
            :class="`bounce-status-text ${hardBounceJson.color}`"
          >
            {{ hardBounceJson.label }}
          </p>
        </div>

        <p class="bounce-reason-text">
          Permanent failure (invalid or non-existent email)
        </p>
      </div>

      <!-- soft bounce -->
      <div class="each-bounce-type-block soft-bounce-block">
        <p class="bounce-type-header-text">
          Soft Bounce
        </p>

        <!-- Rate -->
        <div class="flex no-wrap items-center vertical-split">
          <p class="each-bounce-label-text">
            Rate:
          </p>

          <p class="each-bounce-value-text">
            {{ softBounceRate }}%

            <span>
              {{ softBounceCount }}
            </span>
          </p>
        </div>

        <!-- Status -->
        <div class="flex no-wrap items-center vertical-split">
          <p class="each-bounce-label-text">
            Status:
          </p>

          <p
            :class="`bounce-status-text ${softBounceJson.color}`"
          >
            {{ softBounceJson.label }}
          </p>
        </div>

        <p class="bounce-reason-text">
          Temporary issue (server, quota, greylisting)
        </p>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// utils
import { findPercentage, getNumeralAmount } from 'src/utils/numbers';
import { getBouncedRateJson, getSoftBounceRateJson } from 'src/utils/helperFunctions';

export default defineComponent({
  name: 'BounceRateBreakdown',

  setup() {
    // computed
    const totalBounceCount = computed(() => Math.floor(Math.random() * 100) + 10);

    const totalContacts = computed(() => 12000);

    const bouncedRate = computed(() => findPercentage({
      part: totalBounceCount.value,
      whole: totalContacts.value,
    }));

    const bouncedCountInUi = computed(() => getNumeralAmount(totalBounceCount.value));

    const hardBounceCount = computed(() => Math.floor(Math.random() * 20) + 10);
    const softBounceCount = computed(() => Math.floor(Math.random() * 20) + 10);

    const hardBounceRate = computed(() => findPercentage({
      part: hardBounceCount.value,
      whole: totalBounceCount.value,
    }));

    const hardBounceJson = computed(() => getBouncedRateJson(Math.floor(hardBounceRate.value)));

    const softBounceRate = computed(() => findPercentage({
      part: softBounceCount.value,
      whole: totalBounceCount.value,
    }));

    const softBounceJson = computed(() => getSoftBounceRateJson(Math.floor(softBounceRate.value)));

    return {
      // computed
      bouncedRate,
      bouncedCountInUi,

      hardBounceCount,
      hardBounceRate,
      hardBounceJson,

      softBounceCount,
      softBounceRate,
      softBounceJson,
    };
  },
});
</script>

<style lang="scss" scoped>
.bounce-rate-breakdown-card {
  width: 100%;
  border: 1px solid $grey-50;
  border-radius: 6px;

  display: flex;
  flex-direction: column;

  // top header details
  .bounce-rate-header-details {
    border-bottom: 1px solid $grey-50;

    padding: 20px;
    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }

    .breakdown-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;

      margin-bottom: 20px;
    }

    .bounce-breakdown-details {
      display: flex;
      align-items: center;

      .bounced-rate-text {
        color: $black;
        font-size: 22px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;

        margin-right: 8px;
        margin-left: 16px;
      }

      .bounced-count-text {
        color: $grey;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px; /* 114.286% */
      }

      .bounced-icon-block {
        min-width: 32px;
        min-height: 32px;
        max-width: 32px;
        max-height: 32px;

        border-radius: 50%;
        background-color: rgba($color: var(--warning-rgb), $alpha: 0.1);

        display: flex;
        align-items: center;
        justify-content: center;

        .seq-bounced-icon {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  // content
  .bounce-rate-content-details {
    flex: 1;
    display: flex;

    .each-bounce-type-block {
      flex: 1;
      padding: 24px 20px;

      &.soft-bounce-block {
        border-left: 1px solid rgba($color: var(--grey-50-rgb), $alpha: 0.5);
      }

      .bounce-reason-text {
        color: $grey;
        font-size: 12px;
        font-style: italic;
        font-weight: 400;
        line-height: 16px; /* 133.333% */
      }

      .bounce-type-header-text {
        color: $black;
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;

        margin-bottom: 16px;
      }

      .each-bounce-label-text {
        color: $grey;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px; /* 114.286% */

        min-width: 80px;
      }

      .each-bounce-value-text {
        color: $black;
        font-size: 14px;
        font-weight: 500;
        line-height: 16px; /* 114.286% */

        span {
          color: $grey;
          font-size: 14px;
          font-weight: 400;
          line-height: 16px; /* 114.286% */

          margin-left: 3px;
        }
      }

      .bounce-status-text {
        font-size: 13px;
        font-weight: 500;
        line-height: 14px;

        padding: 4px 6px;

        border-radius: 4px;

        &.positive {
          color: $positive;
          background-color: rgba($color: var(--positive-rgb), $alpha: 0.1);
          border: 1px solid rgba($color: var(--positive-rgb), $alpha: 0.2);
        }

        &.primary {
          color: $primary;
          background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
          border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.2);
        }

        &.warning {
          color: $warning;
          background-color: rgba($color: var(--warning-rgb), $alpha: 0.1);
          border: 1px solid rgba($color: var(--warning-rgb), $alpha: 0.2);
        }

        &.negative {
          color: $negative;
          background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);
          border: 1px solid rgba($color: var(--negative-rgb), $alpha: 0.2);
        }

      }

      .vertical-split {
        margin-bottom: 16px;
      }
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-direction: column;

      .each-bounce-type-block {
        &.soft-bounce-block {
          border-left: 0px;
          border-top: 1px solid rgba($color: var(--grey-50-rgb), $alpha: 0.5);
        }
      }
    }

  }
}
</style>
