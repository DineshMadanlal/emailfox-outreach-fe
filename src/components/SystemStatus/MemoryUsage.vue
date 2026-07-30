<template>
  <q-card flat class="memory-usage-card">
    <!--  -->
    <div class="memory-usage-graph-container">
      <StatusOverview
        :header="statusOverview.header"
        :tooltip="statusOverview.tooltip"
        :description="statusOverview.description"
      />

      <AreaChart
        :dataSeries="dataSeries"
        :chartColors="chartColors"
        :yAxisOptions="yAxisOptions"
        :xAxisCategories="xAxisCategories"
      />
    </div>

    <!-- Pie Chart -->
    <div class="memory-usage-graph-container memory-donut-graph">
      <!--  -->
      <h6 class="usage-breakdown-text">
        Usage Breakdown
      </h6>

      <!--  -->
      <div class="memory-donut-chart">
        <div class="memory-donut-chart-container">
          <MemoryUsageDonutChart
            :dataSeries="donutSeries"
          />

          <p
            v-if="donutSeries[0]"
            class="memory-used-text"
          >
            {{ donutSeries[0] }}%
          </p>
        </div>
      </div>

      <!--  -->
      <div class="memory-overview-grid">
        <div
          v-for="each in memoryOverview"
          :key="`memory-overview-${each.label}`"

          class="memory-overview-item"
          :class="{ 'bordered-top': each.isTotal }"
        >
          <p class="memory-label-text">
            {{ each.label }}
          </p>

          <q-space />

          <p class="memory-label-text">
            {{ each.value }} {{ each.unit }}
          </p>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';

// vue
import {
  defineComponent, computed, onMounted, reactive, toRefs, watch,
} from 'vue';

// Components
import AreaChart from 'src/components/Charts/AreaChart.vue';
import StatusOverview from 'components/SystemStatus/StatusOverview.vue';
import MemoryUsageDonutChart from 'src/components/Charts/MemoryUsageDonutChart.vue';

// utils
import { formatDateWithTime } from 'src/utils/dates';
import { getBrandColorByName } from 'src/utils/quasarHelpers';

export default defineComponent({
  name: 'MemoryUsage',

  components: {
    AreaChart,
    StatusOverview,
    MemoryUsageDonutChart,
  },

  props: {
    chartDataArray: {
      type: Array,
      default: () => [],
    },
    memoryUsedInGB: {
      type: Number,
      default: 0,
    },
    memoryLimitInGB: {
      type: Number,
      default: 0,
    },
  },

  setup(props) {
    // state
    const state = reactive({
      dataSeries: [],
      donutSeries: [0, 0],
      xAxisCategories: [],
    });

    // computed
    const chartColors = computed(() => [
      getBrandColorByName('primary'),
      getBrandColorByName('negative'),
    ]);

    const yAxisOptions = computed(() => ({
      title: {
        text: 'Megabytes',
      },
    }));

    const memoryOverview = computed(() => {
      if (props.memoryLimitInGB) {
        return [
          {
            label: 'Usage so far',
            value: props.memoryUsedInGB.toFixed(2),
            unit: 'GB',
          },
          {
            label: 'Remaining Memory',
            value: (props.memoryLimitInGB - props.memoryUsedInGB).toFixed(2),
            unit: 'GB',
          },
          {
            label: 'Total Memory',
            value: (props.memoryLimitInGB).toFixed(2),
            unit: 'GB',
            isTotal: true,
          },
        ];
      }

      return [];
    });

    // hardcoded
    const statusOverview = {
      header: 'Memory Usage Over Time',
      tooltip: 'This graph shows how much of the computer’s memory (RAM) is being used compared to the maximum available. When it’s close to full, performance can slow down. This graph helps us see if the system might be running low on memory.',
      description: 'Monitors RAM usage relative to maximum capacity, flagging potential memory shortages.',
    };

    // methods
    const setChartData = () => {
      if (isEmpty(props.chartDataArray)) {
        return;
      }

      const mbUsedSeries = [];
      const mbHotSeries = [];
      const xAxisCategories = [];

      forEach(props.chartDataArray, (eachData) => {
        mbUsedSeries.push(Number(eachData.y_mb));
        mbHotSeries.push(Number(eachData.y_hot_mb));
        xAxisCategories.push(formatDateWithTime(eachData.x));
      });

      state.dataSeries = [{
        name: 'MB Total',
        data: mbUsedSeries,
      }, {
        name: 'MB Hot',
        data: mbHotSeries,
      }];

      state.xAxisCategories = xAxisCategories;
    };

    const calculateMemoryUsage = () => {
      const usedPercentage = props.memoryLimitInGB
        ? (props.memoryUsedInGB / props.memoryLimitInGB) * 100
        : 0;

      const availablePercentage = 100 - usedPercentage;

      state.donutSeries = [
        Number(usedPercentage.toFixed(2)),
        Number(availablePercentage.toFixed(2)),
      ];
    };

    onMounted(() => {
      setChartData();
      calculateMemoryUsage();
    });

    watch(() => props.chartDataArray, () => {
      setChartData();
      calculateMemoryUsage();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      chartColors,
      memoryOverview,
      yAxisOptions,

      // hardcoded
      statusOverview,
    };
  },
});
</script>

<style lang="scss" scoped>
.memory-usage-card {
  display: flex;
  width: 100%;

  border-radius: 6px;
  background: $white;
  border: 1px solid $grey-50;

  .memory-donut-graph {
    max-width: 347px;

    background: rgba($color: var(--grey-50-rgb), $alpha: 0.2);

    .usage-breakdown-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;

      margin-bottom: 26px;
    }

    .memory-donut-chart {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 36px;

      .memory-donut-chart-container {
        position: relative;
        max-width: 172px;
        display: flex;
        justify-content: center;
      }

      .memory-used-text {
        top: 42%;
        right: 30%;
        position: absolute;

        color: $black;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .memory-overview-grid {
      display: grid;
      grid-row-gap: 16px;

      .memory-overview-item {
        display: flex;
        align-items: center;

        &.bordered-top {
          padding-top: 16px;
          border-top: 1px solid $grey-50;
        }

        .memory-label-text {
          color: $black;
          font-size: 16px;
        }
      }
    }
  }

  // sm max
  @media (max-width: $breakpoint-sm-max) {
    flex-direction: column;

    .memory-donut-graph {
      max-width: 100%;
    }
  }

  .memory-usage-graph-container {
    width: 100%;
    padding: 20px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }
  }
}
</style>
