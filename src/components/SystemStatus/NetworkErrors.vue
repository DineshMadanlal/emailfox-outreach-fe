<template>
  <q-card flat class="network-errors">
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
  name: 'NetworkErrors',

  components: {
    AreaChart,
    StatusOverview,
  },

  props: {
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
      getBrandColorByName('negative'),
    ]);

    const yAxisOptions = computed(() => ({
      title: {
        text: 'Errors per second',
      },
    }));

    // hardcoded
    const statusOverview = {
      header: 'Network Connection Errors',
      tooltip: 'This graph shows any problems with the network connection, like data not being sent or received correctly. Spikes in this graph can indicate issues with connectivity or network reliability.',
      description: 'Highlights network connection issues and errors over time, indicating reliability.',
    };

    // methods
    const setChartData = () => {
      if (isEmpty(props.chartDataArray)) {
        return;
      }

      const txBytesSeries = [];
      const rxBytesSeries = [];
      const xAxisCategories = [];

      forEach(props.chartDataArray, (eachData) => {
        txBytesSeries.push(Number(eachData.y_tx_errors));
        rxBytesSeries.push(Number(eachData.y_rx_errors));
        xAxisCategories.push(formatDateWithTime(eachData.x));
      });

      state.dataSeries = [{
        name: 'Tx Errors',
        data: txBytesSeries,
      }, {
        name: 'Rx Errors',
        data: rxBytesSeries,
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
.network-errors {
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
