<template lang="">
  <div
    class="flex no-wrap items-center performance-metric-item"
    :class="`${metricDataJson.color}-metric`"
  >
    <LocalSvgIcon
      v-if=metricDataJson.icon
      :image="metricDataJson.icon"
      :classes="`${metricDataJson.icon}-icon`"
    />

    <div
      class="q-ml-xs"
      :class="`text-${metricDataJson.color}`"
    >
      {{ metricRate }}%
    </div>
  </div>
</template>
<script>

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PerformanceMetricItem',

  props: {
    metricDataJson: {
      type: Object,
      default: () => {},
    },
    metricRate: {
      type: [Number, String],
      default: null,
    },
  },
});
</script>
