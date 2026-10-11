<template>
  <div class="tag-preview-chip-container">
    <div
      class="tag-preview-chip"
      :style="{
        backgroundColor: getTagRgbaColor(tagColor, 0.12),
        color: tagColor || '#2563EB',
        borderColor: getTagRgbaColor(tagColor, 0.25),
      }"
    >
      {{ tagName }}
    </div>
  </div>
</template>

<script>
// quasar
import { colors } from 'quasar';

// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'PreviewTag',

  props: {
    name: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    // computed
    const tagName = computed(() => props.name?.trim());
    const tagColor = computed(() => props.color);

    // methods
    const getTagRgbaColor = (hexColor, alpha = 0.12) => {
      if (!hexColor) return `rgba(37, 99, 235, ${alpha})`;
      const rgb = colors.hexToRgb(hexColor);
      if (!rgb) return `rgba(37, 99, 235, ${alpha})`;
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    };

    return {
      // computed
      tagName,
      tagColor,

      // methods
      getTagRgbaColor,
    };
  },
});
</script>

<style lang="scss" scoped>
.tag-preview-chip-container {
  display: inline-flex;

  .tag-preview-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
    border: 1px solid transparent;
    transition: all 0.2s ease;
  }
}
</style>
