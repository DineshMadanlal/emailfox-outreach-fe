<template>
  <q-card flat class="user-system-cpu-usage">
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
  name: 'UserSystemCpuUsage',

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
      getBrandColorByName('negative'),
    ]);

    const yAxisOptions = computed(() => ({
      title: {
        text: 'Cores',
      },
    }));

    // hardcoded
    const statusOverview = {
      header: 'User vs. System CPU Usage',
      tooltip: 'This graph breaks down CPU usage into two parts: User (for applications and programs) and System (for essential tasks the operating system handles). It shows how much processing power is being used for each, helping us see if it’s applications or system tasks that are demanding more CPU.',
      description: `Shows CPU usage split between applications (User) and essential OS tasks (System). Allowed cores 0 to ${props.numberOfCores || 1}.`,
    };

    // methods
    const setChartData = () => {
      if (isEmpty(props.chartDataArray)) {
        return;
      }

      const userSeries = [];
      const systemSeries = [];
      const xAxisCategories = [];

      forEach(props.chartDataArray, (eachData) => {
        userSeries.push(Number(eachData.y_user));
        systemSeries.push(Number(eachData.y_system));
        xAxisCategories.push(formatDateWithTime(eachData.x));
      });

      state.dataSeries = [{
        name: 'User',
        data: userSeries,
      }, {
        name: 'Kernel',
        data: systemSeries,
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
.user-system-cpu-usage {
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
