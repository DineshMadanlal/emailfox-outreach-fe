<template>
  <apex-chart
    ref="apexRealtimeLineChartRef"
    :height="height"
    :series="dataSeries"
    :options="chartOptions"

    v-if="isMounted"
  />
</template>
<script>

// vue
import {
  defineComponent, onMounted, reactive, watch, toRefs, computed, defineAsyncComponent,
} from 'vue';

// quasar
import { useQuasar } from 'quasar';

// Import the Pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences.js';

export default defineComponent({
  name: 'AreaChart',

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
    chartColors: {
      type: Array,
      required: true,
      default: () => [],
    },
    yAxisOptions: {
      type: Object,
      default: () => ({}),
    },
  },

  components: {
    ApexChart: defineAsyncComponent(() => import('vue3-apexcharts')),
  },

  setup(props) {
    // quasar
    const $q = useQuasar();

    // state
    const state = reactive({
      isMounted: false,
      apexRealtimeLineChartRef: null,
    });

    // Access the user store
    const userStore = useUserPreferencesStore();

    // chart options
    const chartOptions = computed(() => ({
      chart: {
        type: 'area',

        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 1000,
          },
        },

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
              colors: props.chartColors,
            },
          },
          xaxis: {
            type: 'datetime',
            labels: {
              rotate: 0,
              style: {
                // Reduce font size for smaller screens
                fontSize: '8px',
              },
            },
            tickAmount: 2,
          },
        },
      }],

      dataLabels: {
        enabled: false,
        offsetY: -20,
        style: {
          fontSize: '10px',
          colors: props.chartColors,
        },
      },

      stroke: {
        curve: 'smooth',
        width: 1,
      },

      xaxis: {
        categories: props.xAxisCategories,
        labels: {
          rotate: 0,
          // hides overlapping labels automatically
          hideOverlappingLabels: true,

          style: {
            // Reduce font size for smaller screens
            fontSize: '10px',
          },

          formatter: (value) => {
            const date = new Date(value);

            if (value === props.xAxisCategories[0]) {
              // For the first label, show the full date and time
              return date.toLocaleString('en-US', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
            }

            // For other labels, show only the time
            return date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });
          },
        },
        tickAmount: 4,
      },

      yaxis: props.yAxisOptions,

      tooltip: {
        shared: true,
        intersect: false,

        x: {
          // Use a custom formatter instead of format
          formatter: (value) => props.xAxisCategories[value],
        },
      },
      colors: props.chartColors,
      theme: {
        mode: $q.dark.isActive ? 'dark' : 'light',
      },
    }));

    onMounted(() => {
      state.isMounted = true;
    });

    watch(() => userStore.getDrawerMiniState, () => {
      // resize the chart on drawer mini state change
      state.apexRealtimeLineChartRef?.chart?.windowResizeHandler();
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

<style lang="scss" scoped>

</style>
