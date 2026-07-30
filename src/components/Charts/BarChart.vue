<template>
  <apex-chart
    ref="apexBarChartRef"
    :height="height"

    :series="dataSeries"
    :options="chartOptions"

    v-if="isMounted"
  />
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, onMounted,
  toRefs, watch, defineAsyncComponent,
} from 'vue';

// quasar
import { useQuasar } from 'quasar';

// utils
import { getNumeralAmount } from 'src/utils/numbers';
import { getBrandColorByName } from 'src/utils/quasarHelpers';

// Import the Pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences.js';

export default defineComponent({
  name: 'BarChart',

  props: {
    height: {
      type: String,
      default: '300',
    },
    dataSeries: {
      type: Array,
      required: true,
      default: () => [],
    },
    xAxisCategories: {
      type: Array,
      required: true,
      default: () => [],
    },
  },

  components: {
    ApexChart: defineAsyncComponent(() => import('vue3-apexcharts')),
  },

  setup(props) {
    // quasar
    const $q = useQuasar();

    // Access the user store
    const userStore = useUserPreferencesStore();

    // state
    const state = reactive({
      isMounted: false,
      apexBarChartRef: null,
    });

    const chartColors = computed(() => [
      getBrandColorByName('primary'),
      getBrandColorByName('positive'),
      getBrandColorByName('negative'),
      getBrandColorByName('warning'),
    ]);

    // chart options
    const chartOptions = computed(() => ({
      chart: {
        type: 'bar',

        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        /** If evenr removed, then the screen will horizontal scroll */
        events: {
          mounted: (chart) => {
            chart.windowResizeHandler();
          },
        },
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 5,
          },
          dataLabels: {
            offsetY: -12,
            style: {
              fontSize: '8px',
              colors: chartColors.value,
            },
          },
          plotOptions: {
            bar: {
              horizontal: false,
              borderRadius: 2,
            },
          },
          xaxis: {
            labels: {
              rotate: 0,
              style: {
                // Reduce font size for smaller screens
                fontSize: '8px',
              },
            },
            tickAmount: 4,
          },
        },
      }],
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          borderRadiusApplication: 'end', // 'around', 'end'
          borderRadiusWhenStacked: 'last', // 'all', 'last'

          dataLabels: {
            position: 'top', // top, center, bottom
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter(val) {
          if (val) {
            return getNumeralAmount(val);
          }

          return '';
        },
        offsetY: -20,
        style: {
          fontSize: '10px',
          colors: chartColors.value,
        },
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: props.xAxisCategories,
        labels: {
          // hides overlapping labels automatically
          hideOverlappingLabels: true,
        },
        tickAmount: 5,
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
      colors: chartColors.value,
      theme: {
        mode: $q.dark.isActive ? 'dark' : 'light',
      },
    }));

    onMounted(() => {
      state.isMounted = true;
    });

    watch(() => userStore.getDrawerMiniState, () => {
      // resize the chart on drawer mini state change
      state.apexBarChartRef?.chart?.windowResizeHandler();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      chartOptions,
    };
  },
});
</script>
