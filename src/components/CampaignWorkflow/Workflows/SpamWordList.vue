<template>
  <div class="spam-word-details">
    <p v-if="spamWordDetails?.length === 0">
      No spam words detected.
    </p>
    <div
      v-for="(wordDetail, index) in spamWordDetails"
      :key="`spam-word-${index}`"
      class="each-spam-word-detail"
    >
      <div
        :class="`spam-score-icon-wrapper ${wordDetail.severity?.color}`"
      >
        <LocalSvgIcon
          image="spam-score"
          classes="spam-score-icon"
        />
      </div>

      <div>
        <p class="severity-label-text">
          {{ wordDetail.severity?.label }}
        </p>

        <div class="spam-word-detailed-wrapper">
          <div class="spam-word-text">
            {{ wordDetail.word }}
          </div>

          <LocalSvgIcon
            image="right-line-arrow"
            classes="right-arrow-icon"
          />

          <div class="spam-alternate-text">
            {{ wordDetail.alternatives?.join(', ') }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SpamWordList',

  props: {
    spamWordDetails: {
      type: Array,
      default: () => [],
    },
  },
});
</script>

<style lang="scss" scoped>
.spam-word-details {
  width: 100%;
  margin-top: 18px;

  display: flex;
  flex-direction: column;

  gap: 24px;

  .each-spam-word-detail {
    display: flex;
    gap: 12px;

    .spam-score-icon-wrapper {
      height: 32px;
      width: 32px;
      border-radius: 50%;

      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.spam-score-icon) {
        height: 14px;
        width: 14px;

        @include svg-icon-fill('rect', $grey-100);
      }

      &.positive {
        background: rgba($color: var(--positive-rgb), $alpha: 0.1);

        :deep(.spam-score-icon) {
          rect {
            &:first-child {
              fill: $positive;
            }
          }
        }
      }

      &.warning {
        background: rgba($color: var(--warning-rgb), $alpha: 0.1);
        :deep(.spam-score-icon) {
          rect {
            &:first-child {
              fill: $warning;
            }

            &:nth-child(2) {
              fill: $warning;
            }
          }
        }
      }

      &.negative {
        background: rgba($color: var(--negative-rgb), $alpha: 0.1);

        :deep(.spam-score-icon) {
          @include svg-icon-fill('rect', $negative);
        }
      }

    }

    .severity-label-text {
      color: $grey;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      margin-bottom: 2px;
    }

    .spam-word-detailed-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;

      .spam-word-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
      }

      :deep(.right-arrow-icon) {
        width: 12px;

        @include svg-icon-stroke('path', $black);
      }

      .spam-alternate-text {
        color: $primary;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}
</style>
