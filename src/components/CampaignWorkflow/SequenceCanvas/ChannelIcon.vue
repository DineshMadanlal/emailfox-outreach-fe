<template>
  <div
    class="channel-icon"
    :class="`${theme}`"
  >
    <!-- Icon -->
    <LocalSvgIcon
      :image="icon"
      class="channel-icon__icon"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ChannelIcon',

  props: {
    icon: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      default: '',
    },
  },
});
</script>

<style lang="scss" scoped>
.channel-icon {
  height: 26px;
  width: 26px;
  border-radius: 4px;
  padding: 4px;
  border: 1px solid transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  .channel-icon__icon {
    height: 100%;
    width: 100%;
  }

  &.warning {
    background: rgba(var(--warning-rgb), 0.1);
    border-color: rgba(var(--warning-rgb), 0.3);

    :deep(.channel-icon__icon) {
      @include svg-icon-stroke('path, rect', $warning);
    }
  }

  &.primary {
    background: rgba(var(--primary-rgb), 0.1);
    border-color: rgba(var(--primary-rgb), 0.3);

    :deep(.channel-icon__icon) {
      @include svg-icon-stroke('path, rect, circle', $primary);
    }
  }

  &.tertiary {
    background: rgba(var(--tertiary-rgb), 0.1);
    border-color: rgba(var(--tertiary-rgb), 0.3);

    :deep(.channel-icon__icon) {
      @include svg-icon-stroke('path, ellipse', $tertiary);
    }
  }
}
</style>
