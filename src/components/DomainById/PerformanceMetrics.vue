<template>
  <q-card flat class="performance-metrics-card">
    <!-- Api Loader -->
    <ApiLoader :show="showLoader" />

    <div class="flex no-wrap items-center performance-header-block">
      <LocalSvgIcon image="stars" />

      <h6 class="performance-header-text">
        Performance Metrics
      </h6>
    </div>

    <!-- metrics value -->
    <div class="view-metrics-block">
      <!-- Deliverability Rate -->
      <div
        class="each-metric-block performance-metric-item"
        :class="`${deliverabilityRateJson.color}-metric`"
      >
        <!--  -->
        <div class="metric-icon-wrapper">
          <LocalSvgIcon
            :image="deliverabilityRateJson.icon"
            :classes="`${deliverabilityRateJson.icon}-icon`"
          />
        </div>

        <div>
          <h4
            class="metric-value-text"
            :class="`text-${deliverabilityRateJson.color}`"
          >
            {{ deliverabilityRate }}%
            <span>
              ({{ deliverabilityRateJson.label }})
            </span>
          </h4>

          <InputLabel
            label="Delivery Rate"
            :tooltip="deliverabilityRateJson.tooltip"
          />
        </div>
      </div>

      <!-- Bounced Rate -->
      <div
        class="each-metric-block performance-metric-item"
        :class="`${bouncedRateJson.color}-metric`"
      >
        <div class="metric-icon-wrapper">
          <LocalSvgIcon
            :image="bouncedRateJson.icon"
            :classes="`${bouncedRateJson.icon}-icon`"
          />
        </div>

        <div>
          <h4
            class="metric-value-text"
            :class="`text-${bouncedRateJson.color}`"
          >
            {{ bouncedRate }}%
            <span>
              ({{ bouncedRateJson.label }})
            </span>
          </h4>

          <InputLabel
            label="Bounced Rate"
            :tooltip="bouncedRateJson.tooltip"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>
<script>
// vue
import { computed, defineComponent } from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import ApiLoader from 'src/components/General/ApiLoader.vue';

// utils
import { getDeliverabilityRateJson, getBouncedRateJson } from 'src/utils/helperFunctions';

export default defineComponent({
  name: 'PerformanceMetrics',

  components: {
    ApiLoader,
    InputLabel,
  },

  props: {
    performanceMetrics: {
      type: Object,
      required: true,
    },

    showLoader: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const bouncedRate = computed(() => props.performanceMetrics.bouncedRate);
    const deliverabilityRate = computed(() => props.performanceMetrics.deliverabilityRate);

    const deliverabilityRateJson = computed(
      () => getDeliverabilityRateJson(deliverabilityRate.value),
    );

    const bouncedRateJson = computed(
      () => getBouncedRateJson(bouncedRate.value),
    );

    return {
      // computed
      deliverabilityRate,
      deliverabilityRateJson,

      bouncedRate,
      bouncedRateJson,
    };
  },
});
</script>

<style lang="scss" scoped>
.performance-metrics-card {
  width: 100%;
  padding: 20px;
  height: fit-content;
  position: relative;

  border-radius: 6px;
  border: 1px solid $grey-50;

  border-top: 0;
  border-radius: 0px 0px 8px 8px;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 12px;
  }

  .performance-header-block {
    margin-bottom: 24px;

    .performance-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;

      margin-left: 15px;
    }
  }

  .view-metrics-block {
    display: grid;
    grid-template-columns: repeat(auto-fill, 220px);

    grid-column-gap: 24px;
    grid-row-gap: 32px;

    :deep(.each-metric-block) {
      display: flex;

      .metric-value-text {
        font-size: 22px;
        font-weight: 600;

        span {
          font-size: 16px;
          font-weight: 400;
        }
      }

      .metric-icon-wrapper {
        min-height: 32px;
        min-width: 32px;

        max-height: 32px;
        max-width: 32px;

        border-radius: 50%;

        display: flex;
        align-items: center;
        justify-content: center;

        margin-right: 12px;
      }
    }
  }
}
</style>
