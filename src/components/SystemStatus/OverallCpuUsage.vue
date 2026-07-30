<template>
  <q-card flat class="overall-cpu-usage">
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

// utils
import { getBrandColorByName } from 'src/utils/quasarHelpers';
import { formatDateWithTime } from 'src/utils/dates';

export default defineComponent({
  name: 'OverallCpuUsage',

  components: {
    AreaChart,
    StatusOverview,
  },

  props: {
    numberOfCores: {
      type: Number,
      default: 0,
    },
    chartDataArray: {
      type: Array,
      default: () => [],
    },
  },

  setup(props) {
    // state
    const state = reactive({
      dataSeries: [],
      xAxisCategories: [],
    });

    // computed
    const chartColors = computed(() => [
      getBrandColorByName('primary'),
    ]);

    const yAxisOptions = computed(() => ({
      title: {
        text: 'Cores',
      },
    }));

    // hardcoded
    const statusOverview = {
      header: 'Overall CPU Usage',
      tooltip: 'This graph shows how much of the computer\'s processing power (CPU) is being used over time. Higher values mean more of the computer’s power is being used, which can indicate if the system is working hard.',
      description: `Tracks total CPU power used over time, indicating system load. Allowed cores 0 to ${props.numberOfCores || 1}.`,
    };

    // methods
    const setChartData = () => {
      if (isEmpty(props.chartDataArray)) {
        return;
      }

      const dataSeries = [];
      const xAxisCategories = [];

      forEach(props.chartDataArray, (eachData) => {
        dataSeries.push(Number(eachData.y));
        xAxisCategories.push(formatDateWithTime(eachData.x));
      });

      state.dataSeries = [{
        name: 'Total',
        data: dataSeries,
      }];
      state.xAxisCategories = xAxisCategories;
    };

    onMounted(() => {
      setChartData();
    });

    watch(() => props.chartDataArray, () => {
      setChartData();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      chartColors,
      yAxisOptions,

      // hardcoded
      statusOverview,
    };
  },
});
</script>

<style lang="scss" scoped>
.overall-cpu-usage {
  border-radius: 6px;
  background: $white;
  border: 1px solid $grey-50;

  padding: 20px;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;
  }
}
</style>
