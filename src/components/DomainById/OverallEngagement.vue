<template>
  <q-card flat class="overall-engagement-card">
    <ApiLoader :show="showLoader" />

    <h6 class="overview-header-text">
      Campaign Engagement
    </h6>

    <div class="overall-analytics-block">
      <!--  -->
      <div
        v-for="(analytic, index) in overallEngagement"
        :key="`overall-analytics-${index}`"
        class="each-analytic-item"
      >
        <LocalSvgIcon
          :image="analytic.icon"
          classes="engagement-analytics-icon"
        />

        <div>
          <p class="analytic-value-text">
            {{ getNumeralAmount(analytic.value) }}
          </p>

          <p class="analytic-label-text">
            {{ analytic.label }}
          </p>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// Components
import ApiLoader from 'src/components/General/ApiLoader.vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers';

export default defineComponent({
  name: 'OverallEngagement',

  components: {
    ApiLoader,
  },

  props: {
    engagementMetrics: {
      type: Object,
      required: true,
    },

    showLoader: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // computed
    const overallEngagement = computed(() => ({
      sent: {
        value: props.engagementMetrics.sent,
        label: 'Emails Sent',
        icon: 'email-sent',
      },
      replies: {
        value: props.engagementMetrics.replies,
        label: 'Received',
        icon: 'email-replied',
      },
      bounce: {
        value: props.engagementMetrics.bounced,
        label: 'Emails Bounced',
        icon: 'email-bounced',
      },
    }));

    return {
      // computed
      overallEngagement,

      // methods
      getNumeralAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
.overall-engagement-card {
  width: 100%;
  padding: 20px;
  height: fit-content;
  position: relative;

  border-radius: 6px;
  border: 1px solid $grey-50;
  border-radius: 8px 8px 0px 0px;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 12px;
  }

  .overview-header-text {
    margin-bottom: 32px;

    color: $black;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
  }

  .overall-analytics-block {
    display: grid;
    grid-template-columns: repeat(auto-fill, 180px);

    grid-column-gap: 24px;
    grid-row-gap: 32px;

    .each-analytic-item {
      display: flex;

      .engagement-analytics-icon {
        top: 8px;
        position: relative;
        margin-right: 16px;
      }

      .analytic-value-text {
        color: $black;
        font-size: 22px;
        font-weight: 600;
      }

      .analytic-label-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;
        margin-top: 3px;
      }
    }
  }
}
</style>
