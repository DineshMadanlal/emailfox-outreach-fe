<template>
  <div class="spam-guage-wrapper">

    <svg width="160" height="80" viewBox="0 0 160 80" class="overflow-visible">

      <path
        d="M 6 80 A 74 74 0 0 1 154 80"
        fill="none"
        stroke-width="12"
        stroke-linecap="round"
        class="guage-bg"
      />

      <path
        d="M 6 80 A 74 74 0 0 1 154 80"
        fill="none"
        :stroke="spamLevelColor"
        stroke-width="12"
        stroke-linecap="round"
        class="transition-all duration-500 ease-out"
        :style="gaugeStyle"
      />
    </svg>

    <div class="spam-analytics-side">
      <div class="spam-words-text">
        Spam Words
      </div>

      <div
        class="spam-count-text"
        :style="{ color: spamLevelColor }"
      >
        {{ spamWordCount }}
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent } from 'vue';

// hardcoded length of the arc
const ARC_LENGTH = 232.5;

export default defineComponent({
  name: 'SpamGuage',

  props: {
    spamScore: {
      type: Number,
      default: 0,
    },
    spamWordCount: {
      type: Number,
      default: 0,
    },
    spamLevelColor: {
      type: String,
      default: 'var(--primary-color)',
    },
  },

  setup(props) {
    const gaugeStyle = computed(() => {
      // Convert score (0-100) to a fraction (0-1)
      // Clamp it between 0 and 1 to prevent breaking
      const percent = Math.min(Math.max(props.spamScore / 100, 0), 1);

      // Calculate how much to "offset" (hide)
      // If percent is 1 (100%), offset is 0 (show all).
      // If percent is 0 (0%), offset is 232.5 (hide all).
      const offset = ARC_LENGTH * (1 - percent);

      return {
        strokeDasharray: `${ARC_LENGTH}`,
        strokeDashoffset: `${offset}`,
      };
    });

    return {
      // computed
      gaugeStyle,
    };
  },
});
</script>

<style lang="scss" scoped>
.spam-guage-wrapper {
  position: relative;
  height: fit-content;

  .guage-bg {
    stroke: $grey-50;
  }

  .spam-analytics-side {
    position: absolute;
    bottom: 5px;
    left: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .spam-words-text {
      color: $grey;
      text-align: center;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      margin-bottom: 5px;
    }

    .spam-count-text {
      text-align: center;
      font-size: 24px;
      font-weight: 400;
      line-height: 20px; /* 83.333% */
    }
  }
}
</style>
