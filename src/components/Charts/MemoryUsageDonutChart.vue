<template>
  <apex-chart
    width="169"
    height="169"
    type="donut"

    :series="dataSeries"
    :options="chartOptions"
  />
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, defineAsyncComponent,
} from 'vue';

// utils
import { getBrandColorByName, hexToRgba } from 'src/utils/quasarHelpers';

export default defineComponent({
  name: 'MemoryUsagePieChart',

  props: {
    dataSeries: {
      type: Array,
      default: () => [],
    },
  },

  components: {
    ApexChart: defineAsyncComponent(() => import('vue3-apexcharts')),
  },

  setup() {
    const positiveColor = getBrandColorByName('positive');

    // state
    const state = reactive({

      chartOptions: {
        chart: {
          width: 169,
          type: 'donut',
        },
        labels: ['Used', 'Free'],
        colors: [
          positiveColor,
          hexToRgba(positiveColor, 0.1),
        ],
        // hide data labels
        dataLabels: {
          enabled: false,
        },
        // hide legend
        legend: {
          show: false,
        },
      },
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>
