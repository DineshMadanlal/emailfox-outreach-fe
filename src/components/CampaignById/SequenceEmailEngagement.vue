<template>
  <q-card flat class="sequence-email-engagement-card">
    <ApiLoader :show="isApiLoading" />

    <!-- header -->
    <div class="email-engagement-header">
      <h6 class="engagement-header-text">
        Email Engagement
      </h6>

      <q-space />

      <DateRangeInput
        v-model="dateRangeInputJson"
      />
    </div>

    <!-- Content -->
    <div
      class="sequence-chart"
    >
      <BarChart
        :dataSeries="dataSeries"
        :xAxisCategories="xAxisCategories"

        v-if="dataSeries.length > 0"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent, reactive, toRefs } from 'vue';

// Components
import BarChart from 'components/Charts/BarChart.vue';
import ApiLoader from 'components/General/ApiLoader.vue';
import DateRangeInput from 'components/Input/DateRangeInput.vue';

// utils
import { yearMonthDateFilterFormat, subtractDaysFromTheCurrentDate, addNDaysForTheGivenDate } from 'src/utils/dates';

export default defineComponent({
  name: 'SequenceEmailEngagement',

  components: {
    BarChart,
    ApiLoader,
    DateRangeInput,
  },

  setup() {
    // state
    const state = reactive({
      isApiLoading: false,

      dateRangeInputJson: {
        from: yearMonthDateFilterFormat(subtractDaysFromTheCurrentDate(5)),
        to: yearMonthDateFilterFormat(addNDaysForTheGivenDate(new Date(), 0)),
      },

      dataSeries: [{ name: 'Emails Sent', data: [274, 674, 1101, 1502, 1934, 2100], group: 'apexcharts-axis-0' }, { name: 'Replies', data: [129, 255, 4793, 5197, 5245, 3584], group: 'apexcharts-axis-0' }, { name: 'Bounce', data: [7, 44, 64, 74, 30, 37], group: 'apexcharts-axis-0' }],
      xAxisCategories: ['14 Dec', '15 Dec', '16 Dec', '17 Dec', '18 Dec', '19 Dec'],
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.sequence-email-engagement-card {
  width: 100%;
  border: 1px solid $grey-50;
  border-radius: 6px;

  padding: 20px;
  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 16px 12px;
  }

  .email-engagement-header {
    gap: 12px;
    display: flex;
    align-items: center;

    margin-bottom: 16px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-direction: column;
      align-items: flex-start;
    }

    .engagement-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
      line-height: 16px; /* 100% */
    }
  }

  .sequence-chart {
    width: 100%;
  }
}
</style>
