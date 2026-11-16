<template>
  <div
    v-if="hasData"
    class="sparkline-trend-container"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <svg
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      class="sparkline-svg"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Straight line if all non-zero values are identical -->
      <line
        v-if="isFlat"
        :x1="padding"
        :y1="height / 2"
        :x2="width - padding"
        :y2="height / 2"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />

      <!-- Smooth Bézier curve for varying trends -->
      <path
        v-else
        :d="smoothPath"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';

const THEME_COLORS = {
  primary: 'var(--primary-color)',
  secondary: 'var(--secondary-color)',
  tertiary: 'var(--tertiary-color)',
  positive: 'var(--positive-color)',
  warning: 'var(--warning-color)',
  negative: 'var(--negative-color)',
  information: 'var(--information-color)',
  grey: 'var(--grey-color)',
};

export default defineComponent({
  name: 'SparklineTrend',

  props: {
    data: {
      type: Array,
      default: () => [],
    },
    color: {
      type: String,
      default: 'primary',
    },
    width: {
      type: Number,
      default: 48,
    },
    height: {
      type: Number,
      default: 18,
    },
    strokeWidth: {
      type: Number,
      default: 2,
    },
    padding: {
      type: Number,
      default: 2,
    },
  },

  setup(props) {
    const strokeColor = computed(() => THEME_COLORS[props.color] || props.color || 'var(--primary-color)');

    // Only show sparkline if there is real non-zero data
    const hasData = computed(() => {
      if (!props.data || !Array.isArray(props.data) || props.data.length < 2) return false;
      return props.data.some((v) => Number(v) > 0);
    });

    const isFlat = computed(() => {
      if (!hasData.value) return true;
      const values = props.data.map((v) => Number(v) || 0);
      return values.every((v) => v === values[0]);
    });

    const points = computed(() => {
      if (!hasData.value) return [];
      const values = props.data.map((v) => Number(v) || 0);

      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const range = maxVal - minVal || 1;

      const innerWidth = props.width - props.padding * 2;
      const innerHeight = props.height - props.padding * 2;

      return values.map((val, idx) => {
        const x = props.padding + (idx / (values.length - 1)) * innerWidth;
        const y = props.padding + innerHeight - ((val - minVal) / range) * innerHeight;
        return { x, y };
      });
    });

    // Generate smooth cubic bezier SVG path from points
    const smoothPath = computed(() => {
      const pts = points.value;
      if (pts.length < 2) return '';

      let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;

      for (let i = 0; i < pts.length - 1; i += 1) {
        const p0 = pts[i === 0 ? 0 : i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2 < pts.length ? i + 2 : pts.length - 1];

        // Gentle curve tension
        const tension = 0.2;
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;

        d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
      }

      return d;
    });

    return {
      hasData,
      isFlat,
      strokeColor,
      smoothPath,
    };
  },
});
</script>

<style lang="scss" scoped>
.sparkline-trend-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .sparkline-svg {
    display: block;
    overflow: visible;
  }
}
</style>
