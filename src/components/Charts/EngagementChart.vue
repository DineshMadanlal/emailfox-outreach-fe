<template>
  <apex-chart
    ref="apexChartRef"
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

// pinia
import { useUserPreferencesStore } from 'src/stores/userPreferences.js';

export default defineComponent({
  name: 'EngagementChart',

  props: {
    height: {
      type: [String, Number],
      default: '320',
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
    const $q = useQuasar();
    const userStore = useUserPreferencesStore();

    const state = reactive({
      isMounted: false,
      apexChartRef: null,
    });

    const colorPaletteMap = computed(() => ({
      primary: getBrandColorByName('primary'),
      positive: getBrandColorByName('positive'),
      negative: getBrandColorByName('negative'),
      warning: getBrandColorByName('warning'),
      information: getBrandColorByName('information'),
      tertiary: getBrandColorByName('tertiary'),
      yellow: getBrandColorByName('yellow'),
    }));

    const computedSeriesColors = computed(() => {
      const paletteList = [
        colorPaletteMap.value.primary,
        colorPaletteMap.value.positive,
        colorPaletteMap.value.negative,
        colorPaletteMap.value.warning,
        colorPaletteMap.value.information,
        colorPaletteMap.value.tertiary,
        colorPaletteMap.value.yellow,
      ];

      return props.dataSeries.map((s, index) => {
        if (s.colorName && colorPaletteMap.value[s.colorName]) {
          return colorPaletteMap.value[s.colorName];
        }
        if (s.color) {
          return s.color;
        }
        return paletteList[index % paletteList.length];
      });
    });

    const strokeDashArray = computed(() => props.dataSeries.map(
      (s) => (s.dashArray !== undefined ? s.dashArray : 0),
    ));

    const strokeWidths = computed(() => props.dataSeries.map((s) => {
      if (s.type === 'column' || s.type === 'bar') return 0;
      return s.strokeWidth || 2;
    }));

    const chartOptions = computed(() => ({
      chart: {
        type: 'line',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        events: {
          mounted: (chart) => {
            chart.windowResizeHandler();
          },
        },
      },
      colors: computedSeriesColors.value,
      stroke: {
        curve: 'smooth',
        width: strokeWidths.value,
        dashArray: strokeDashArray.value,
      },
      plotOptions: {
        bar: {
          borderRadius: 3,
          columnWidth: '24%',
          horizontal: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: props.dataSeries.map((s) => (s.type === 'line' ? 3.5 : 0)),
        strokeWidth: 2,
        hover: {
          size: 6,
        },
      },
      grid: {
        borderColor: $q.dark.isActive ? '#333' : '#F1F5F9',
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        categories: props.xAxisCategories,
        labels: {
          hideOverlappingLabels: true,
          style: {
            fontSize: '12px',
            colors: $q.dark.isActive ? '#94A3B8' : '#64748B',
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          formatter: (val) => {
            if (val >= 1000) {
              return `${(val / 1000).toFixed(1).replace(/\.0$/, '')}k`;
            }
            return Math.round(val);
          },
          style: {
            fontSize: '12px',
            colors: $q.dark.isActive ? '#94A3B8' : '#64748B',
          },
        },
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '13px',
        fontWeight: 500,
        markers: {
          width: 8,
          height: 8,
          radius: 12,
        },
        itemMargin: {
          horizontal: 14,
          vertical: 10,
        },
        labels: {
          colors: $q.dark.isActive ? '#E2E8F0' : '#1E293B',
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val) => getNumeralAmount(val || 0),
        },
      },
      theme: {
        mode: $q.dark.isActive ? 'dark' : 'light',
      },
    }));

    onMounted(() => {
      state.isMounted = true;
    });

    watch(() => userStore.getDrawerMiniState, () => {
      state.apexChartRef?.chart?.windowResizeHandler();
    });

    return {
      ...toRefs(state),
      chartOptions,
    };
  },
});
</script>
