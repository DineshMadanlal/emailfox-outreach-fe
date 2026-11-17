<template>
  <div class="warmup-growth-placement-container">
    <!-- Warmup Growth Timeline -->
    <q-card
      v-if="false"
      flat class="growth-placement-card"
    >
      <!-- Loader -->
      <ApiLoader
        show
        v-if="isApiLoading"
      />

      <h6 class="growth-header-text">
        Warmup Growth Timeline
      </h6>

      <!-- Chart -->
      <apex-chart
        v-if="isMounted"
        height="340"
        type="area"
        :series="warmupSeries"
        :options="warmupChartOptions"
      />
    </q-card>

    <!-- Inbox Placement Rate -->
    <q-card flat class="growth-placement-card">
      <!-- Loader -->
      <ApiLoader
        show
        v-if="isApiLoading"
      />

      <h6 class="growth-header-text">
        Inbox Placement Rate
      </h6>

      <!-- Chart -->
      <apex-chart
        v-if="isMounted"

        height="340"
        type="bar"
        :series="placementSeries"
        :options="placementChartOptions"
      />
    </q-card>
  </div>
</template>

<script>
// vue
import {
  defineComponent, onMounted, reactive, toRefs, getCurrentInstance, computed, defineAsyncComponent,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';

// utils
import { formatDate1 } from 'src/utils/dates';
import { getBrandColorByName } from 'src/utils/quasarHelpers';
import { getMailboxWarmupDailyStats } from 'src/utils/warmupApi';

export default defineComponent({
  name: 'WarmupGrowthPlacement',

  components: {
    ApiLoader,
    ApexChart: defineAsyncComponent(() => import('vue3-apexcharts')),
  },

  props: {
    mailboxId: {
      type: Number,
      default: null,
    },
  },

  setup(props) {
    //
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,

      backendResponse: {},

      isMounted: false,
    });

    // computed
    const labels = computed(() => {
      const timeline = state.backendResponse?.inbox_vs_spam_placement_timeline
        || state.backendResponse?.warmup_growth_timeline;

      if (timeline && Array.isArray(timeline)) {
        return timeline.map((item) => formatDate1(item.date));
      }

      return [];
    });

    // Series
    const warmupSeries = computed(() => {
      if (state.backendResponse?.warmup_growth_timeline) {
        return [
          {
            name: 'Emails Sent',
            data: state.backendResponse?.warmup_growth_timeline.map((i) => i.sent),
          },
          {
            name: 'Replies',
            data: state.backendResponse?.warmup_growth_timeline.map((i) => i.received),
          },
        ];
      }
      return [];
    });

    const placementSeries = computed(() => {
      if (state.backendResponse?.inbox_vs_spam_placement_timeline) {
        return [
          {
            name: 'Inbox',
            data: state.backendResponse?.inbox_vs_spam_placement_timeline.map(
              (i) => Number(i.inbox || 0),
            ),
          },
          {
            name: 'Spam',
            data: state.backendResponse?.inbox_vs_spam_placement_timeline.map(
              (i) => Number(i.spam || 0),
            ),
          },
        ];
      }

      return [];
    });

    const commonOptions = computed(() => {
      const grey50Color = getBrandColorByName('grey-50');
      const greyColor = getBrandColorByName('grey');

      const options = {
        chart: {
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

          fontFamily: 'Inter, sans-serif',
        },

        dataLabels: {
          enabled: false,
        },

        stroke: {
          curve: 'smooth',
          width: 2.2,
        },

        grid: {
          borderColor: grey50Color,
          strokeDashArray: 4,
          padding: {
            top: 10,
            right: 16,
            bottom: 0,
            left: 12,
          },
        },

        xaxis: {
          categories: labels.value,

          axisBorder: {
            show: false,
          },

          axisTicks: {
            show: false,
          },

          labels: {
            hideOverlappingLabels: true,
            style: {
              colors: greyColor,
              fontSize: '12px',
            },
          },
        },

        yaxis: {
          labels: {
            style: {
              colors: greyColor,
              fontSize: '12px',
            },
          },
        },

        tooltip: {
          shared: true,
          intersect: false,
          theme: 'light',
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
            colors: greyColor,
          },
        },
      };

      return options;
    });

    const warmupChartOptions = computed(() => {
      const colors = [
        getBrandColorByName('primary'),
        getBrandColorByName('positive'),
      ];

      return {
        ...commonOptions.value,

        chart: {
          ...commonOptions.value.chart,
          type: 'area',
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 600,
          },
        },

        stroke: {
          curve: 'smooth',
          width: 2.2,
          lineCap: 'round',
        },

        markers: {
          size: 0,
          strokeWidth: 2,
          hover: {
            size: 5,
          },
        },

        colors,

        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.28,
            opacityTo: 0.02,
            stops: [0, 90, 100],
          },
        },
      };
    });

    const placementChartOptions = computed(() => {
      const colors = [
        getBrandColorByName('primary'),
        getBrandColorByName('negative'),
      ];

      return {
        ...commonOptions.value,

        chart: {
          ...commonOptions.value.chart,
          type: 'bar',
          stacked: true,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 600,
          },
        },

        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '35%',
            borderRadius: 3,
            dataLabels: {
              total: {
                enabled: false,
              },
            },
          },
        },

        stroke: {
          show: true,
          width: 1,
          colors: ['transparent'],
        },

        fill: {
          opacity: 1,
        },

        colors,

        tooltip: {
          shared: true,
          intersect: false,
          theme: 'light',
          y: {
            formatter: (val) => (val !== undefined && val !== null ? val : 0),
          },
        },

        yaxis: {
          min: 0,
          forceNiceScale: true,

          labels: {
            formatter: (val) => (Number.isInteger(val) ? val : Math.round(val)),

            style: {
              colors: '#94a3b8',
              fontSize: '12px',
            },
          },
        },

        noData: {
          text: 'No warmup data available',
          align: 'center',
          verticalAlign: 'middle',
          style: {
            color: '#94a3b8',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
        },
      };
    });

    // methods
    const makeApiCallOnMounted = async () => {
      try {
        state.isApiLoading = true;

        const response = await getMailboxWarmupDailyStats({
          mailboxId: props.mailboxId,
        });

        // state.backendResponse = response;
        state.backendResponse = response;
      } catch (error) {
        if (error.message.includes('No warmup')) {
          state.backendResponse = {};

          return;
        }
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    // lifecycle hook
    onMounted(() => {
      makeApiCallOnMounted();

      state.isMounted = true;
    });

    return {
      // state
      ...toRefs(state),

      // computed
      warmupSeries,
      placementSeries,

      warmupChartOptions,
      placementChartOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-growth-placement-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  grid-gap: 24px;

  .growth-placement-card {
    width: 100%;
    border-radius: 6px;
    background: $white;
    border: 1px solid $grey-50;

    padding: 20px;
    position: relative;

    .growth-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
      line-height: 16px;

      margin-bottom: 24px;
    }
  }
}
</style>
