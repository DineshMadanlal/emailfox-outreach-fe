<template>
  <q-card flat class="network-activity">
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
  name: 'NetworkActivity',

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
        text: 'Bytes per second',
      },
    }));

    // hardcoded
    const statusOverview = {
      header: 'Network Data Sent and Received',
      tooltip: 'This graph shows the amount of data being sent and received by the network connection over time. Higher values mean more network activity, which might happen when transferring files or using the internet heavily.',
      description: 'Displays data transfer rates over time, reflecting network activity levels.',
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
        txBytesSeries.push(Number(eachData.y_tx_bytes));
        rxBytesSeries.push(Number(eachData.y_rx_bytes));
        xAxisCategories.push(formatDateWithTime(eachData.x));
      });

      state.dataSeries = [{
        name: 'Tx Bytes',
        data: txBytesSeries,
      }, {
        name: 'Rx Bytes',
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
.network-activity {
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
