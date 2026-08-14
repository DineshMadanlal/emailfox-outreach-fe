<template>
  <div
    :class="`linkedin-status ${statusJson.color}`"
  >
    <div class="status-text">
      {{ statusJson.label }}
    </div>
  </div>
</template>
<script>
// vue
import { defineComponent, computed } from 'vue';

// constants
import { CONNECTED_ACCOUNT_STATUS } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'ConnectionStatus',

  props: {
    status: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    // computed
    const statusJson = computed(() => CONNECTED_ACCOUNT_STATUS[props.status] || {});

    return {
      statusJson,
    };
  },
});
</script>

<style lang="scss" scoped>
.linkedin-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  .status-text {
    font-size: 14px;
    font-weight: 500;
    padding: 4px 6px;
    border-radius: 4px;
  }

  // positive
  &.positive {
    .status-text {
      color: $positive;
      background-color: rgba(var(--positive-rgb), 0.05);
      border: 1px solid rgba(var(--positive-rgb), 0.1);
    }
  }

  // negative
  &.negative {
    .status-text {
      color: $negative;
      background-color: rgba(var(--negative-rgb), 0.05);
      border: 1px solid rgba(var(--negative-rgb), 0.1);
    }
  }

  // warning
  &.warning {
    .status-text {
      color: $warning;
      background-color: rgba(var(--warning-rgb), 0.05);
      border: 1px solid rgba(var(--warning-rgb), 0.1);
    }
  }

  // primary
  &.primary {
    .status-text {
      color: $primary;
      background-color: rgba(var(--primary-rgb), 0.05);
      border: 1px solid rgba(var(--primary-rgb), 0.1);
    }
  }
}
</style>
