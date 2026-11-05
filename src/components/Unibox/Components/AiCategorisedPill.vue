<template>
  <div
    class="ai-categorised-pill flex items-center no-wrap"
    :style="{ height }"
  >
    <LocalSvgIcon
      image="stars"
      class="ai-stars-icon"
    />
    <span class="ai-text">
      {{ label }}
    </span>

    <AppTooltip
      v-if="tooltipContent"
      :content="tooltipContent"
    />
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'AiCategorisedPill',

  components: {
    AppTooltip,
  },

  props: {
    label: {
      type: String,
      default: 'AI Categorised',
    },
    tooltip: {
      type: [String, Boolean],
      default: 'Categorised automatically by AI',
    },
    height: {
      type: String,
      default: 'auto',
    },
  },

  setup(props) {
    const tooltipContent = computed(() => {
      if (typeof props.tooltip === 'string') {
        return props.tooltip;
      }
      if (props.tooltip === true) {
        return 'Categorised automatically by AI';
      }
      return '';
    });

    return {
      tooltipContent,
    };
  },
});
</script>

<style lang="scss" scoped>
.ai-categorised-pill {
  padding: 2px 8px;
  border-radius: 12px;
  background: linear-gradient(90deg, #DBE6FB -15.29%, #E1F1F7 47.71%, #F3E7FC 114.12%);

  gap: 4px;
  flex-shrink: 0;
  cursor: default;

  user-select: none;
  width: fit-content;
  line-height: 16px;

  :deep(.ai-stars-icon) {
    width: 14px;
    height: 14px;
    flex-shrink: 0;

    @include svg-icon-fill('path', rgba(var(--primary-rgb), 1));
  }

  .ai-text {
    font-size: 13px;
    color: $black;
    white-space: nowrap;
  }
}
</style>
