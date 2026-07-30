<template>
  <q-card
    flat
    class="pricing-plan-card"
    :class="{
      'most-used-plan-card': planDetails.planMostUsed,
      'current-plan-card': planDetails.isCurrentPlan
    }"
  >
    <!-- header -->
    <div class="pricing-plan-card-header">
      <h6 class="plan-name-text">
        {{ planDetails.name }}
      </h6>

      <div class="flex no-wrap items-center">
        <!-- charge -->
        <p class="plan-charge-text">
          ${{ planDetails.charge }}
        </p>

        <!-- strike -->
        <p class="plan-strike-charge-text">
          ${{ planDetails.strikeCharge }}
        </p>

        <q-space />

        <!-- monthly -->
        <p class="plan-monthly-text">
          Billed monthly
        </p>

      </div>
    </div>

    <!-- benefits -->
    <div class="pricing-plan-card-benefits">
      <div class="full-width">
        <!-- Resources -->
        <h6 class="benefit-header-label">
          RESOURCES
        </h6>
        <div class="plan-benefit-grid resources-grid">
          <!-- Resources -->
          <div
            class="each-plan-benefit"
            v-for="(benefit, index) in planDetails.resources"
            :key="`each-benefit-${planDetails.name}-${index}`"
          >
            <LocalSvgIcon
              image="basic-tick"
              classes="basic-tick-icon"
            />

            <!-- label -->
            <p class="benefit-label-text">
              {{ benefit.text }}
            </p>

            <InfoTooltip
              v-if="benefit.tooltip"
              iconName="circle-question"
              :tooltipText="benefit.tooltip"
            />
          </div>
        </div>

        <!-- Features -->
        <h6
          :class="[planDetails.cssClass || 'benefit-header-label']"
        >
          {{ planDetails.featuresLabel }}
        </h6>

        <div class="plan-benefit-grid features-grid">
          <div
            class="each-plan-benefit"
            v-for="(benefit, index) in planDetails.features"
            :key="`each-benefit-${planDetails.name}-${index}`"
          >
            <LocalSvgIcon
              image="basic-tick"
              classes="basic-tick-icon"
            />

            <!-- label -->
            <p class="benefit-label-text">
              {{ benefit.text }}
            </p>

            <InfoTooltip
              v-if="benefit.tooltip"
              iconName="circle-question"
              :tooltipText="benefit.tooltip"
            />
          </div>
        </div>
      </div>

      <q-space />

      <!-- Current Plan Button -->
      <q-btn
        v-if="planDetails.isCurrentPlan && !planDetails.allowUpdatePlan"

        flat
        no-caps
        unelevated

        color="positive"
        class="current-plan-btn"
      >
        <p class="text-bold">
          Current Plan
        </p>
      </q-btn>

      <!-- Select Plan Button -->
      <q-btn
        v-else

        flat
        no-caps
        unelevated

        color="primary"
        :label="buttonCta"
        class="light-primary-btn select-plan-btn"

        @click="$emit('selectPlan', planDetails)"
      />

      <div
        v-if="planDetails.isCurrentPlan"
        class="current-plan-positive-fill"
      >
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// Components
import InfoTooltip from 'components/General/InfoTooltip.vue';

// constants
import { PLAN_TYPES } from 'boot/constants';

export default defineComponent({
  name: 'PricingPlanCard',

  emits: ['selectPlan'],

  components: {
    InfoTooltip,
  },

  props: {
    planDetails: {
      type: Object,
      default: () => {},
    },
  },

  setup(props) {
    // computed
    const isPartnerPlan = computed(() => props.planDetails.type === PLAN_TYPES.PARTNER_PLAN);
    const isEnterprisePlan = computed(() => props.planDetails.type === PLAN_TYPES.ENTERPRISE_PLAN);

    const buttonCta = computed(() => {
      if (isPartnerPlan.value || isEnterprisePlan.value) {
        return props.planDetails.isCurrentPlan ? 'Update Domain' : 'Select Domain';
      }
      return 'Select Plan';
    });

    return {
      // computed
      buttonCta,
      isEnterprisePlan,
    };
  },
});
</script>

<style lang="scss" scoped>
.pricing-plan-card {
  width: 100%;
  max-width: 260px;

  border-radius: 8px;
  background: $white;
  border: 1px solid $grey-50;

  display: flex;
  flex-direction: column;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    max-width: unset;
  }

  .pricing-plan-card-header {
    transform: all ease 0.3s;
    color: $black;
    width: 100%;
    padding: 16px;

    border-radius: 8px 8px 0px 0px;

    background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);

    .plan-name-text {
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;

      margin-bottom: 9px;
    }

    .plan-charge-text {
      font-size: 24px;
      font-weight: 600;
      line-height: 22px;
    }

    .plan-strike-charge-text {
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      text-decoration-line: line-through;

      margin-left: 8px;
    }

    .plan-monthly-text {
      font-size: 12px;
      font-weight: 400;
      line-height: 16px; /* 133.333% */

      opacity: 0.6;
      text-align: right;
    }
  }

  .pricing-plan-card-benefits {
    width: 100%;
    padding: 16px;
    border-radius: 0px 0px 8px 8px;

    flex: 1;
    display: flex;
    flex-direction: column;

    .current-plan-positive-fill {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 50px;
      left: 0;

      background: linear-gradient(
        180deg, rgba(255, 255, 255, 0.00) 14.42%, rgba(11, 156, 86, 0.40) 173.08%);;
    }

    .each-plan-benefit {
      display: flex;

      :deep(.basic-tick-icon) {
        min-width: 12px;
        min-height: 12px;

        max-width: 12px;
        max-height: 12px;

        top: 2px;
        position: relative;
      }

      .benefit-label-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 14px; /* 100% */

        margin-left: 10px;

        margin-right: 8px;
      }
    }

    .benefit-header-label {
      color: $grey;
      font-size: 14px;
      font-weight: 600;
      line-height: 16px; /* 114.286% */
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .everything-plan {
      color: rgba($color: var(--primary-rgb), $alpha: 0.8);
      font-size: 14px;
      font-weight: 600;
      line-height: 16px; /* 114.286% */
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .plan-benefit-grid {
      width: 100%;
      display: grid;
      grid-row-gap: 16px;

      &.resources-grid {
        margin-bottom: 30px;

        min-height: 104px;
      }
    }

    .select-plan-btn {
      z-index: 1;
      margin-top: 28px;
    }
  }

  &.most-used-plan-card {
    .pricing-plan-card-header {
      color: $white;
      background-color: $primary;
    }

    .select-plan-btn {
      color: $white !important;
      background: $primary !important;
    }
  }

  &.current-plan-card {
    border: 1px solid $positive;

    .pricing-plan-card-header {
      background-color: rgba($color: var(--positive-rgb), $alpha: 0.1);
    }
  }
}
</style>
