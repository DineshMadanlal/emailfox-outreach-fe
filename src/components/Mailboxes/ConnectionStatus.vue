<template>
  <div
    class="connection-status"
    :class="[
      'connection-status', isConnected ? 'connected' : 'disconnected',
    ]"
  >
    <LocalSvgIcon
      image="connected"
      classes="connected-icon"
    />

    <div class="status-text">
      {{ isConnected ? 'Connected' : 'Disconnected' }}
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ConnectionStatus',

  props: {
    isConnected: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.connection-status {
  width: fit-content;
  padding: 3px 6px;
  border-radius: 4px;

  display: flex;
  align-items: center;
  gap: 4px;

  .connected-icon {
    min-width: 16px;
  }

  .status-text {
    font-size: 12px;
    font-weight: 500;
    line-height: 14px; /* 116.667% */
  }

  &.connected {
    border: 1px solid rgba($color: var(--positive-rgb), $alpha: 0.05);
    background: rgba($color: var(--positive-rgb), $alpha: 0.1);

    .status-text {
      color: $positive;
    }

    :deep(.connected-icon) {
      path {
        stroke: $positive;
      }
    }
  }

  &.disconnected {
    border: 1px solid rgba($color: var(--negative-rgb), $alpha: 0.05);
    background: rgba($color: var(--negative-rgb), $alpha: 0.1);

    :deep(.connected-icon) {
      path {
        stroke: $negative;
      }
    }

    .status-text {
      color: $negative;
    }
  }
}
</style>
