<template>
  <div
    class="workflow-image"
    :class="[{
      'remove-background': removeBackground
    }, theme]"
  >
    <LocalSvgIcon
      :image="icon"
      class="workflow-step-icon"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WorkflowStepIcon',

  props: {
    icon: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      default: '',
    },
    removeBackground: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.workflow-image {
  min-height: 32px;
  min-width: 32px;

  max-width: 32px;
  max-height: 32px;

  border-radius: 4px;

  display: flex;
  align-items: center;
  justify-content: center;

  .workflow-step-icon {
    width: 18px;
    height: 18px;
  }

  &.warning {
    border: 1px solid rgba(var(--warning-rgb), 0.25);
    background: rgba(var(--warning-rgb), 0.1);

    :deep(.workflow-step-icon) {
      @include svg-icon-stroke('rect, path', $warning);
    }
  }

  &.primary {
    border: 1px solid rgba(var(--primary-rgb), 0.25);
    background: rgba(var(--primary-rgb), 0.1);

    :deep(.workflow-step-icon) {
      path {
        fill: inherit;
      }
      @include svg-icon-stroke('circle, rect, path', $primary);
    }
  }

  &.tertiary {
    border: 1px solid rgba(var(--tertiary-rgb), 0.25);
    background: rgba(var(--tertiary-rgb), 0.1);

    :deep(.workflow-step-icon) {
      path {
        fill: inherit;
      }
      @include svg-icon-stroke('circle, rect, path', $tertiary);
    }
  }

  &.remove-background {
    background: transparent;
    border: none;

    min-height: 18px;
    min-width: 18px;

    max-width: 18px;
    max-height: 18px;
  }
}
</style>
