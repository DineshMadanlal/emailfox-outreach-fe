<template>
  <div class="deliverability-score">
    <!-- Segments -->
    <div class="segments-progress">
      <div
        v-for="(fill, index) in segmentFills"
        :key="`segment-fill-${index}`"
        class="each-segment"
      >
        <div
          v-if="fill > 0"
          class="fill-segment"
          :style="{
            width: fill + '%',
            backgroundColor: `var(--${barColorAndLabel.barColor}-color)`
          }"
        />
      </div>
    </div>
    <!--  -->
    <div class="score-label-text">
      {{ deliverabilityScore }}% - {{ barColorAndLabel.label }}
    </div>
  </div>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

const SEGMENT_SIZE = 100 / 3;

export default defineComponent({
  name: 'DeliverabilityScore',

  props: {
    score: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    // deliverability score
    const deliverabilityScore = computed(() => props.score);

    const barColorAndLabel = computed(() => {
      if (deliverabilityScore.value >= 90) {
        return {
          score: deliverabilityScore.value,
          label: 'Good',
          barColor: 'positive',
        };
      } if (deliverabilityScore.value >= 70) {
        return {
          score: deliverabilityScore.value,
          label: 'Fair',
          barColor: 'warning',
        };
      }

      return {
        score: deliverabilityScore.value,
        label: 'Poor',
        barColor: 'negative',
      };
    });

    const clamp = (value) => Math.max(0, Math.min(value, 1));

    const segmentFills = computed(() => [0, 1, 2].map((i) => {
      const raw = (deliverabilityScore.value - SEGMENT_SIZE * i) / SEGMENT_SIZE;
      return Math.round(clamp(raw) * 100);
    }));

    return {
      // computed
      segmentFills,
      barColorAndLabel,
      deliverabilityScore,
    };
  },
});
</script>

<style lang="scss" scoped>
.deliverability-score {
  display: flex;
  flex-direction: column;

  gap: 10px;

  .segments-progress {
    display: flex;
    gap: 1px;

    .each-segment {
      height: 4px;
      border-radius: 2px;
      width: 35px;
      position: relative;
      background: $grey-50;

      .fill-segment {
        height: 100%;
        position: absolute;
      }
    }
  }

  .score-label-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
  }
}
</style>
