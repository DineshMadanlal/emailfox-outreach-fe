<template>
  <div
    v-if="hasSeg"
    class="contact-seg"
  >
    <img
      v-if="segInfo?.icon && !hasImageError"
      :src="segInfo.icon"
      :alt="segLabel"
      class="seg-icon"
      loading="lazy"
      @error="hasImageError = true"
    />

    <div class="seg-text">
      {{ segLabel }}
    </div>
  </div>

  <span
    v-else
    class="table-empty-cell"
  >
    -
  </span>
</template>

<script>
// vue
import {
  computed, defineComponent, ref, watch,
} from 'vue';

// constants
import { SEG_SIGNATURES } from 'boot/workspace-constants';

export default defineComponent({
  name: 'ContactSeg',

  props: {
    seg: {
      type: [String, Object],
      default: '',
    },
  },

  setup(props) {
    //
    const hasImageError = ref(false);

    // Reset error state if seg prop changes
    watch(
      () => props.seg,
      () => {
        hasImageError.value = false;
      },
    );

    const rawSegString = computed(() => {
      if (!props.seg) return '';
      if (typeof props.seg === 'object') {
        return props.seg.provider || props.seg.label || '';
      }
      return String(props.seg).trim();
    });

    const segInfo = computed(() => {
      if (!rawSegString.value) return null;
      const normalized = rawSegString.value.toUpperCase();
      return (
        SEG_SIGNATURES.find(
          (s) => s.provider.toUpperCase() === normalized
            || s.label.toUpperCase() === normalized
            || (s.patterns && s.patterns.some((p) => p.toUpperCase() === normalized)),
        ) || null
      );
    });

    const hasSeg = computed(() => {
      const val = rawSegString.value;
      return (
        !!val
        && val !== '-'
        && val.toLowerCase() !== 'none'
        && val.toLowerCase() !== 'null'
        && val.toLowerCase() !== 'undefined'
      );
    });

    const segLabel = computed(() => {
      if (segInfo.value) {
        return segInfo.value.label;
      }
      return rawSegString.value;
    });

    return {
      // computed
      hasSeg,
      segInfo,
      segLabel,
      hasImageError,
    };
  },
});
</script>

<style lang="scss" scoped>
.contact-seg {
  display: flex;
  align-items: center;

  .seg-icon {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .seg-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
    white-space: nowrap;

    margin-left: 8px;
  }
}
</style>
