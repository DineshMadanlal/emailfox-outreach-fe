<template>
  <q-card flat class="email-engagement-card">
    <ApiLoader :show="showLoader" />

    <div class="email-engagement-header">
      <h6 class="overview-header-text">
        Email Engagement
      </h6>

      <q-space />

      <DateRangeInput
        v-model="internalDateRangeInputJson"
      />
    </div>

    <div
      class="app-area-chart"
    >
      <EngagementAreaChart
        :dataSeries="formattedDataSeries"
        :xAxisCategories="xAxisCategories"

        v-if="formattedDataSeries.length > 0"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// Components
import EngagementAreaChart from 'components/Charts/EngagementAreaChart.vue';
import ApiLoader from 'components/General/ApiLoader.vue';
import DateRangeInput from 'components/Input/DateRangeInput.vue';

export default defineComponent({
  name: 'EmailEngagement',

  emits: ['update:dateRangeInputJson'],

  components: {
    EngagementAreaChart,
    ApiLoader,
    DateRangeInput,
  },

  props: {
    dataSeries: {
      type: Array,
      required: true,
    },
    xAxisCategories: {
      type: Array,
      required: true,
    },

    showLoader: {
      type: Boolean,
      default: false,
    },

    dateRangeInputJson: {
      type: Object,
      default: () => {},
    },
  },

  setup(props, { emit }) {
    const SERIES_COLOR_MAP = {
      'Emails Sent': 'primary',
      Replies: 'tertiary',
      'Hard Bounced': 'negative',
      'Soft Bounced': 'warning',
    };

    const formattedDataSeries = computed(() => {
      if (!props.dataSeries || !Array.isArray(props.dataSeries)) return [];
      return props.dataSeries.map((s) => ({
        ...s,
        colorName: s.colorName || SERIES_COLOR_MAP[s.name] || 'primary',
      }));
    });

    // Local state to manage the selected options
    const internalDateRangeInputJson = computed({
      get: () => props.dateRangeInputJson,
      set: (value) => {
        emit('update:dateRangeInputJson', value);
      },
    });

    return {
      // computed
      internalDateRangeInputJson,
      formattedDataSeries,
    };
  },
});
</script>

<style lang="scss" scoped>
.email-engagement-card {
  width: 100%;
  height: auto;
  padding: 20px;
  position: relative;
  height: fit-content;
  min-height: 400px;

  border-radius: 6px;
  border: 1px solid $grey-50;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 12px;
  }

  .overview-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
  }

  .email-engagement-header {
    width: 100%;
    display: flex;
    align-items: center;

    margin-bottom: 32px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-direction: column;
      row-gap: 4px;

      align-items: baseline;
    }
  }

  .app-area-chart {
    width: 100%;
  }
}
</style>
