<template>
  <div
    class="status-badge"
    :class="`status-badge--${color}`"
  >
    <LocalSvgIcon
      :image="icon"
      class="status-icon"
    />

    <div class="status-text">
      {{ status }}
    </div>
  </div>
</template>
<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'StatusBadge',

  props: {
    icon: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: false,
      default: 'primary',
    },
  },
});
</script>

<style lang="scss" scoped>
.status-badge {
  width: fit-content;

  display: flex;
  align-items: center;
  gap: 4px;

  padding: 4px 6px;
  border-radius: 4px;

  .status-icon {
    min-width: 14px;
    min-height: 14px;

    max-width: 14px;
    max-height: 14px;
  }

  .status-text {
    font-size: 13px;
    font-style: normal;
    font-weight: 500;
    line-height: 14px; /* 107.692% */
  }

  &.status-badge--positive {
    border: 1px solid rgba($color: var(--positive-rgb), $alpha: 0.1);
    background: rgba($color: var(--positive-rgb), $alpha: 0.05);

    :deep(.status-icon) {
      @include svg-icon-stroke('path, circle', $positive);
    }

    .status-text {
      color: $positive;
    }
  }

  &.status-badge--information {
    border: 1px solid rgba($color: var(--information-rgb), $alpha: 0.1);
    background: rgba($color: var(--information-rgb), $alpha: 0.05);

    :deep(.status-icon) {
      @include svg-icon-stroke('path, circle', $information);
    }

    .status-text {
      color: $information;
    }
  }

  &.status-badge--warning {
    border: 1px solid rgba($color: var(--warning-rgb), $alpha: 0.1);
    background: rgba($color: var(--warning-rgb), $alpha: 0.05);

    :deep(.status-icon) {
      @include svg-icon-fill('path', $warning);

      circle {
        &:first-child {
          stroke: $warning;
        }

        &:last-child {
          fill: $warning;
        }
      }
    }

    .status-text {
      color: $warning;
    }
  }

  &.status-badge--negative {
    border: 1px solid rgba($color: var(--negative-rgb), $alpha: 0.1);
    background: rgba($color: var(--negative-rgb), $alpha: 0.05);

    :deep(.status-icon) {
      @include svg-icon-fill('path', $negative);

      circle {
        &:first-child {
          stroke: $negative;
        }

        &:last-child {
          fill: $negative;
        }
      }
    }

    .status-text {
      color: $negative;
    }
  }
}
</style>
