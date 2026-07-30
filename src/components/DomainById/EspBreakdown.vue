<template>
  <q-card
    flat
    class="esp-breakdown-card"
  >
    <ApiLoader :show="showLoader" />

    <h6 class="esp-header-text">
      ESP Breakdown
    </h6>

    <div class="esp-breakdown-grid">
      <!-- Gmail -->
      <div class="each-esp-breakdown-item">
        <div class="flex no-wrap items-center">
          <LocalSvgIcon image="gmail" classes="esp-icon" />
          <p class="esp-label-text">
            Gmail
          </p>
        </div>

        <q-linear-progress
          rounded
          :value="percentages.gmail_count / 100"

          color="primary"
          class="esp-usage-progress"
        >
        </q-linear-progress>

        <p class="percent-value-text">
          {{ percentages.gmail_count || 0 }}%
        </p>
      </div>

      <!-- Outlook -->
      <div class="each-esp-breakdown-item">
        <div class="flex no-wrap items-center">
          <LocalSvgIcon image="outlook" classes="esp-icon" />
          <p class="esp-label-text">
            Outlook
          </p>
        </div>

        <q-linear-progress
          rounded
          :value="percentages.outlook_count / 100"

          color="primary"
          class="esp-usage-progress"
        >
        </q-linear-progress>

        <p class="percent-value-text">
          {{ percentages.outlook_count || 0 }}%
        </p>
      </div>

      <!-- Zoho -->
      <div class="each-esp-breakdown-item">
        <div class="flex no-wrap items-center">
          <LocalSvgIcon image="zoho" classes="esp-icon" />
          <p class="esp-label-text">
            Zoho
          </p>
        </div>

        <q-linear-progress
          rounded
          :value="percentages.zoho_count / 100"

          color="primary"
          class="esp-usage-progress"
        >
        </q-linear-progress>

        <p class="percent-value-text">
          {{ percentages.zoho_count || 0 }}%
        </p>
      </div>

      <!-- Yahoo -->
      <div class="each-esp-breakdown-item">
        <div class="flex no-wrap items-center">
          <LocalSvgIcon image="yahoo" classes="esp-icon" />
          <p class="esp-label-text">
            Yahoo
          </p>
        </div>

        <q-linear-progress
          rounded
          :value="percentages.yahoo_count / 100"

          color="primary"
          class="esp-usage-progress"
        >
        </q-linear-progress>

        <p class="percent-value-text">
          {{ percentages.yahoo_count || 0 }}%
        </p>
      </div>

      <!-- Other -->
      <div class="each-esp-breakdown-item">
        <div class="flex no-wrap items-center">
          <LocalSvgIcon image="other-smtp" classes="esp-icon" />
          <p class="esp-label-text">
            Other
          </p>
        </div>

        <q-linear-progress
          rounded
          :value="percentages.other_count / 100"

          color="primary"
          class="esp-usage-progress"
        >
        </q-linear-progress>

        <p class="percent-value-text">
          {{ percentages.other_count || 0 }}%
        </p>
      </div>
    </div>
  </q-card>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import { defineComponent, computed } from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';

export default defineComponent({
  name: 'EspBreakdown',

  components: {
    ApiLoader,
  },

  props: {
    showLoader: {
      type: Boolean,
      default: false,
    },
    espPerformanceMetrics: {
      type: Object,
      default: () => {},
    },
  },

  setup(props) {
    // computed
    const hideEspBreakdown = computed(() => isEmpty(props.espPerformanceMetrics));

    const totalCount = computed(() => Object.values(
      props.espPerformanceMetrics,
    ).reduce((a, b) => a + b, 0));

    const percentages = computed(() => {
      if (!totalCount.value) {
        return {
          gmail_count: 0, outlook_count: 0, zoho_count: 0, yahoo_count: 0, other_count: 0,
        };
      }

      return Object.fromEntries(
        Object.entries(props.espPerformanceMetrics).map(([key, val]) => {
          const percent = (val / totalCount.value) * 100;
          const rounded = percent.toFixed(1);

          // return integer if zero, else keep 1 decimal
          return [key, percent === 0 ? 0 : parseFloat(rounded)];
        }),
      );
    });

    return {
      // computed
      percentages,
      hideEspBreakdown,
    };
  },
});
</script>

<style lang="scss" scoped>
.esp-breakdown-card {
  width: 100%;
  padding: 20px;
  height: fit-content;
  position: relative;

  border-radius: 6px;
  border: 1px solid $grey-50;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 12px;
  }

  .esp-header-text {
    margin-bottom: 32px;

    color: $black;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
  }

  .esp-breakdown-grid {
    display: grid;
    grid-row-gap: 24px;

    .each-esp-breakdown-item {
      display: flex;
      align-items: center;

      .esp-label-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px; /* 114.286% */
        margin-left: 6px;
        min-width: 50px;
      }

      .esp-usage-progress {
        margin: 0px 32px;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          margin: 0px 16px;
        }
      }

      .percent-value-text {
        color: $black;
        text-align: right;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}
</style>
