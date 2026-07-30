<template>
  <div
    class="pass-fail-badge"
    :class="[
      'pass-fail-badge', isConnected ? 'passed' : 'failed',
    ]"
  >
    <LocalSvgIcon
      :image="isConnected ? 'circle-tick' : 'circle-close'"
      classes="passed-failed-icon"
    />

    <div class="status-text">
      {{ isConnected ? 'Pass' : 'Fail' }}
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PassFailBadge',

  props: {
    isConnected: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.pass-fail-badge {
  width: fit-content;
  padding: 3px 6px;
  border-radius: 4px;

  display: flex;
  align-items: center;
  gap: 4px;

  .passed-failed-icon {
    width: 14px;
    height: 14px;
  }

  .status-text {
    font-size: 12px;
    font-weight: 500;
    line-height: 14px; /* 116.667% */
  }

  &.passed {
    border: 1px solid rgba($color: var(--positive-rgb), $alpha: 0.05);
    background: rgba($color: var(--positive-rgb), $alpha: 0.1);

    .status-text {
      color: $positive;
    }

    :deep(.passed-failed-icon) {
      path {
        stroke: $positive;
      }
      circle {
        stroke: $positive;
      }
    }
  }

  &.failed {
    border: 1px solid rgba($color: var(--negative-rgb), $alpha: 0.05);
    background: rgba($color: var(--negative-rgb), $alpha: 0.1);

    :deep(.passed-failed-icon) {
      path {
        stroke: $negative;
      }
      circle {
        fill: inherit;
        stroke: $negative;
        stroke-width: 1.2px;
        stroke-linecap: round;
      }
    }

    .status-text {
      color: $negative;
    }
  }
}
</style>
