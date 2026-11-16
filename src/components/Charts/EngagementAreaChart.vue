<template>
  <apex-chart
    ref="apexChartRef"
    :height="height"
    :series="normalizedSeries"
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
  name: 'EngagementAreaChart',

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
      secondary: getBrandColorByName('secondary'),
      yellow: getBrandColorByName('yellow'),
    }));

    const computedSeriesColors = computed(() => {
      const paletteList = [
        colorPaletteMap.value.primary,
        colorPaletteMap.value.tertiary,
        colorPaletteMap.value.positive,
        colorPaletteMap.value.negative,
        colorPaletteMap.value.warning,
        colorPaletteMap.value.information,
        colorPaletteMap.value.secondary,
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

    // Ensure all series render as smooth area curves
    const normalizedSeries = computed(() => props.dataSeries.map((s) => ({
      name: s.name,
      type: 'area',
      data: s.data || [],
    })));

    // Check if a series has non-zero activity across the period
    const isSeriesActive = (series) => {
      if (!series || !Array.isArray(series.data) || series.data.length === 0) return false;
      return series.data.some((val) => Number(val) > 0);
    };

    // Hide stroke for all-zero series so flat lines don't clutter the baseline
    const strokeWidths = computed(() => props.dataSeries.map((s) => (
      isSeriesActive(s) ? 2.2 : 0
    )));

    const chartOptions = computed(() => ({
      chart: {
        type: 'area',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 600,
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
        lineCap: 'round',
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 0.32,
          opacityTo: 0.02,
          stops: [0, 85, 100],
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
        strokeWidth: 2,
        hover: {
          size: 5,
          sizeOffset: 1,
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
        padding: {
          top: 10,
          right: 16,
          bottom: 0,
          left: 12,
        },
      },
      xaxis: {
        categories: props.xAxisCategories,
        labels: {
          hideOverlappingLabels: true,
          style: {
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: 400,
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
        min: 0,
        forceNiceScale: true,
        labels: {
          formatter: (val) => {
            if (val >= 1000) {
              return `${(val / 1000).toFixed(1).replace(/\.0$/, '')}k`;
            }
            return Math.round(val);
          },
          style: {
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: 400,
            colors: $q.dark.isActive ? '#94A3B8' : '#64748B',
          },
        },
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '13px',
        fontFamily: 'inherit',
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
        theme: $q.dark.isActive ? 'dark' : 'light',
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
      normalizedSeries,
      chartOptions,
    };
  },
});
</script>
