<template>
  <q-card flat class="sending-progress-card">
    <!-- header -->
    <h6 class="sending-progress-header-text">
      Sending Progress
    </h6>

    <!-- content -->
    <div class="sending-progress-content">
      <div class="sending-progress-details">
        <div
          v-for="detail in sendingProgressDetails"
          :key="`sending-progress-detail-${detail.label}`"

          class="each-sending-progress-detail"
        >
          <div class="progress-icon-block">
            <LocalSvgIcon
              image="seq-sent"
              classes="progress-icon"
            />
          </div>

          <div>
            <p class="progress-label-text">
              {{ detail.label }}
            </p>

            <p class="progress-value-text">
              {{ detail.value }}
            </p>

            <p class="progress-desc-text">
              {{ detail.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// numbers
import { getNumeralAmount } from 'src/utils/numbers';

export default defineComponent({
  name: 'SendingProgress',

  setup() {
    // computed
    const sendingProgressDetails = computed(() => {
      const details = [
        {
          label: 'Sent Today',
          value: getNumeralAmount(3400),
          desc: 'emails',
        },
        {
          label: 'Remaining Today',
          value: getNumeralAmount(1200),
          desc: 'emails',
        },
        {
          label: 'Scheduled Tomorrow',
          value: getNumeralAmount(800),
          desc: 'emails',
        },
        {
          label: 'Avg Per Account',
          value: getNumeralAmount(18),
          desc: 'emails/day',
        },
      ];

      return details;
    });

    return {
      // computed
      sendingProgressDetails,
    };
  },
});
</script>

<style lang="scss" scoped>
.sending-progress-card {
  width: 100%;
  border-radius: 6px;
  border: 1px solid $grey-50;
  background: rgba($color: var(--primary-rgb), $alpha: 0.01);

  border-radius: 6px 6px 0px 0px;

  padding: 20px;
  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 16px 12px;
  }

  .sending-progress-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;
  }

  .sending-progress-content {
    width: 100%;
    margin-top: 27px;

    .sending-progress-details {
      display: flex;
      flex-direction: column;
      gap: 32px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .each-sending-progress-detail {
        flex: 1 1 calc(25% - 12px);
        display: flex;
        gap: 16px;

        .progress-label-text {
          color: $black;
        }

        .progress-value-text {
          color: $black;
          font-size: 18px;
          font-weight: 600;

          margin-top: 4px;
          margin-bottom: 6px;
        }

        .progress-desc-text {
          color: $grey;
        }

        .progress-icon-block {
          min-width: 32px;
          min-height: 32px;
          max-width: 32px;
          max-height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;
          background: rgba($color: var(--primary-rgb), $alpha: 0.1);

          :deep(.progress-icon) {
            min-width: 16px;
            min-height: 12px;
            max-width: 16px;
            max-height: 12px;

            @include svg-icon-stroke('path, circle, rect', $primary);
          }
        }
      }
    }
  }
}
</style>
