<template>
  <div class="billing-table-container">
    <!-- Selected Plan -->
    <div
      class="selected-plan-text"
      :style="selectedPlanStyle"
    >
      Selected Plan
    </div>

    <!-- Dialog -->
    <q-dialog
      persistent
      v-model="showPlanCheckoutModal"

      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <PlanCheckout
        :selectedPlanDetails="selectedPlanDetails"

        @closeModal="showPlanCheckoutModal = false"
        @onSuccessfulPlanCheckout="onSuccessfulPlanCheckout"
      />
    </q-dialog>

    <!-- Dialog -->
    <q-dialog
      persistent
      v-model="showSelectEnterprisePlanModal"

      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SelectEnterprisePlan
        :currentPlan="currentPlan"
        @planCheckout="onCheckoutEnterprisePlan"
      />
    </q-dialog>

    <q-table
      flat
      hide-pagination
      :rows="pricingRows"
      :columns="pricingColumns"
      :rows-per-page-options="[0]"

      separator="cell"
      class="pricing-table custom-scrollbar"
    >
      <!-- header -->
      <template #header="props">
        <q-tr :props="props" class="pricing-header-row">
          <!-- features -->
          <q-th class="features-th">
            <div class="feature-header-text">
              Features
            </div>
          </q-th>

          <!-- plans -->
          <q-th
            v-for="plan in allPlans"
            :key="plan.type"
            :class="[
              'plan-header',
              {
                'current-plan': plan.isCurrentPlan,
                'highlighted-plan': plan.highlighted,
              }
            ]"
            :style="{ 'min-width': '215px' }"
            :id="`plan-header-${plan.type}`"
          >
            <div class="each-plan-header">
              <div class="plan-name-text">
                {{ plan.name }}
              </div>

              <div class="plan-price-block">
                $
                <div class="plan-price-text">
                  {{ plan.charge }}
                </div>

                <div class="plan-strike-through-price">
                  $ {{ plan.strikeCharge }}
                </div>
              </div>

              <div class="plan-billing-text">
                Billed monthly
              </div>

              <!-- CTA -->
              <template
                v-if="plan.isCurrentPlan"
              >
                <!-- Plan upgrade option for enterprise -->
                <q-btn
                  no-caps
                  unelevated

                  color="primary"

                  v-if="isEnterprisePlan"

                  @click="onSelectPlan(plan)"
                >
                  <div class="current-plan-text text-weight-medium">
                    Upgrade Available
                  </div>
                </q-btn>

                <!-- Current Plan -->
                <q-btn
                  no-caps
                  disabled
                  unelevated

                  color="grey-300"
                  class="current-plan-btn"

                  v-else
                >
                  <div class="current-plan-text text-weight-medium">
                    Current
                  </div>
                </q-btn>
              </template>

              <!-- If highlighted.. then black button -->
              <q-btn
                no-caps
                unelevated

                color="black"
                :label="plan.buttonCta"

                v-else-if="plan.highlighted"

                @click="onSelectPlan(plan)"
              >
              </q-btn>

              <!-- Primary Upgrade / Downgrade -->
              <q-btn
                v-else

                flat
                no-caps
                unelevated

                color="primary"
                class="light-primary-btn"

                :label="plan.buttonCta"

                @click="onSelectPlan(plan)"
              >
              </q-btn>
            </div>
          </q-th>
        </q-tr>
      </template>

      <!-- Body -->
      <template #body="props">
        <q-tr :props="props">
          <!-- Feature Column -->
          <q-td class="feature-column">
            <div class="row items-center no-wrap feature-name-row">
              <!--  -->
              <div class="feature-name-text">
                {{ props.row.feature }}
              </div>

              <InfoTooltip
                iconName="circle-question"
                :tooltipText="props.row.tooltip"
              />
            </div>
          </q-td>

          <!--  -->
          <!-- Plan Columns -->
          <q-td
            v-for="plan in allPlans"
            :key="`table-body-${plan.type}`"

            :class="[
              'plan-feature-td',
              {
                'current-plan': plan.isCurrentPlan,
                'highlighted-plan': plan.highlighted,
              }
            ]"
          >
            <!--  -->
            <template v-if="props.row.valueType === 'boolean'">
              <LocalSvgIcon
                v-if="props.row[plan.type]"

                image="success-tick"

                class="success-tick-icon"
              />

              <div v-else>
                -
              </div>
            </template>

            <!--  -->
            <template v-else>
              {{ props.row[plan.type] }}
              <span
                v-if="props.row.fup"
              >
                *
              </span>
            </template>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <p class="fair-usage-text">
      * Fair Use caps apply.
    </p>
  </div>
</template>
<script>
// vue
import {
  defineComponent, computed, nextTick, reactive, toRefs, onMounted, watch, onBeforeUnmount,
} from 'vue';

// Pinia
import { useAuthStore } from 'src/stores/auth';

// components
import InfoTooltip from 'components/General/InfoTooltip.vue';
import PlanCheckout from 'components/Subscription/Modals/PlanCheckout.vue';
import SelectEnterprisePlan from 'components/Subscription/Modals/SelectEnterprisePlan.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Utils
import { getNumeralAmount } from 'src/utils/numbers';
import { calculatePriceByOutboundCapacity } from 'src/utils/subscription';

// constants
import {
  PLAN_TYPES, PLAN_LABELS, PLAN_FEATURES, PLAN_CHARGE_TYPES, STRIKETHROUGH_PLAN_PRICE, PLAN_ORDER,
} from 'boot/constants';

export default defineComponent({
  name: 'BillingTable',

  emits: ['onPaymentSuccess'],

  components: {
    InfoTooltip,
    PlanCheckout,
    SelectEnterprisePlan,
  },

  setup(_, { emit }) {
    // Access the authentication store
    const authStorePinia = useAuthStore();

    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      // selected plan details for the checkout modal
      selectedPlanDetails: {},

      // selected plan div style css
      selectedPlanStyle: {
        left: '0px',
      },
      pricingTableScrollEl: null,

      // modal
      showPlanCheckoutModal: false,
      showSelectEnterprisePlanModal: false,
    });

    // computed
    const currentPlan = computed(() => authStorePinia.getUserPlan);

    const isEnterprisePlan = computed(() => {
      const planName = currentPlan.value.plan_name;

      if (planName === PLAN_TYPES.ENTERPRISE_PLAN
        || planName === PLAN_TYPES.ENTERPRISE_PLAN_100K
        || planName === PLAN_TYPES.ENTERPRISE_PLAN_1M
      ) {
        return true;
      }
      return false;
    });

    const getPlanAction = (planName) => {
      const currentOrder = PLAN_ORDER[currentPlan.value.plan_name] || 0;
      const targetOrder = PLAN_ORDER[planName];

      if (targetOrder > currentOrder) return 'Upgrade';
      if (targetOrder < currentOrder) return 'Downgrade';

      return 'Current';
    };

    const allPlans = computed(() => {
      const plans = [
        {
          type: PLAN_TYPES.LAUNCH_PLAN,
          name: PLAN_LABELS[PLAN_TYPES.LAUNCH_PLAN],
          charge: PLAN_CHARGE_TYPES.month[PLAN_TYPES.LAUNCH_PLAN],
          strikeCharge: STRIKETHROUGH_PLAN_PRICE.month[PLAN_TYPES.LAUNCH_PLAN],
          isCurrentPlan: currentPlan.value.plan_name === PLAN_TYPES.LAUNCH_PLAN,
          buttonCta: getPlanAction(PLAN_TYPES.LAUNCH_PLAN),
        },
        {
          type: PLAN_TYPES.GROWTH_PLAN,
          name: PLAN_LABELS[PLAN_TYPES.GROWTH_PLAN],
          charge: PLAN_CHARGE_TYPES.month[PLAN_TYPES.GROWTH_PLAN],
          strikeCharge: STRIKETHROUGH_PLAN_PRICE.month[PLAN_TYPES.GROWTH_PLAN],
          isCurrentPlan: currentPlan.value.plan_name === PLAN_TYPES.GROWTH_PLAN,
          buttonCta: getPlanAction(PLAN_TYPES.GROWTH_PLAN),
        },
        {
          highlighted: true,
          type: PLAN_TYPES.SCALE_PLAN,
          name: PLAN_LABELS[PLAN_TYPES.SCALE_PLAN],
          charge: PLAN_CHARGE_TYPES.month[PLAN_TYPES.SCALE_PLAN],
          strikeCharge: STRIKETHROUGH_PLAN_PRICE.month[PLAN_TYPES.SCALE_PLAN],
          isCurrentPlan: currentPlan.value.plan_name === PLAN_TYPES.SCALE_PLAN,
          buttonCta: getPlanAction(PLAN_TYPES.SCALE_PLAN),
        },
      ];

      if (isEnterprisePlan.value) {
        // show the current plan charge instead of the default
        // enterprise plan charge if the user is already on an enterprise plan
        plans.push({
          type: PLAN_TYPES.ENTERPRISE_PLAN,
          name: PLAN_LABELS[PLAN_TYPES.ENTERPRISE_PLAN],
          charge: calculatePriceByOutboundCapacity(currentPlan.value.email_credits),
          strikeCharge: STRIKETHROUGH_PLAN_PRICE.month[PLAN_TYPES.ENTERPRISE_PLAN],
          isCurrentPlan: isEnterprisePlan.value,
          buttonCta: getPlanAction(PLAN_TYPES.ENTERPRISE_PLAN),
        });
      } else {
        // show the default enterprise plan charge if the user is not on an enterprise plan
        plans.push({
          type: PLAN_TYPES.ENTERPRISE_PLAN,
          name: PLAN_LABELS[PLAN_TYPES.ENTERPRISE_PLAN],
          charge: PLAN_CHARGE_TYPES.month[PLAN_TYPES.ENTERPRISE_PLAN],
          strikeCharge: STRIKETHROUGH_PLAN_PRICE.month[PLAN_TYPES.ENTERPRISE_PLAN],
          isCurrentPlan: isEnterprisePlan.value,
          buttonCta: getPlanAction(PLAN_TYPES.ENTERPRISE_PLAN),
        });
      }

      return plans;
    });

    const pricingColumns = computed(() => {
      const columns = [
        {
          name: 'feature',
          label: 'Features',
          field: 'feature',
          align: 'left',
        },
        // starter
        {
          name: PLAN_TYPES.LAUNCH_PLAN,
          label: PLAN_LABELS[PLAN_TYPES.LAUNCH_PLAN],
          align: 'center',
        },
        // growth
        {
          name: PLAN_TYPES.GROWTH_PLAN,
          label: PLAN_LABELS[PLAN_TYPES.GROWTH_PLAN],
          align: 'center',
        },
        // essential
        {
          name: PLAN_TYPES.SCALE_PLAN,
          label: PLAN_LABELS[PLAN_TYPES.SCALE_PLAN],
          align: 'center',
        },
        // enterprise
        {
          name: PLAN_TYPES.ENTERPRISE_PLAN,
          label: PLAN_LABELS[PLAN_TYPES.ENTERPRISE_PLAN],
          align: 'center',
        },
      ];

      return columns;
    });

    const pricingRows = computed(() => {
      const rows = Object.values(PLAN_FEATURES).map((feature) => {
        const eachRow = {
          feature: feature.label,
          tooltip: feature.tooltip,
          valueType: feature.type,
          fup: feature.fup,

          [PLAN_TYPES.LAUNCH_PLAN]: feature[PLAN_TYPES.LAUNCH_PLAN],
          [PLAN_TYPES.GROWTH_PLAN]: feature[PLAN_TYPES.GROWTH_PLAN],
          [PLAN_TYPES.SCALE_PLAN]: feature[PLAN_TYPES.SCALE_PLAN],
          [PLAN_TYPES.ENTERPRISE_PLAN]: feature[PLAN_TYPES.ENTERPRISE_PLAN],
        };

        // update the outbound capacity value to show the actual
        // email credits for enterprise plan users instead of the default value
        if (feature.ouboundCapacity && isEnterprisePlan.value) {
          eachRow[PLAN_TYPES.ENTERPRISE_PLAN] = `${getNumeralAmount(currentPlan.value.email_credits)} Emails`;
        }

        return eachRow;
      });

      return rows;
    });

    // methods
    const onSelectPlan = (planDetails) => {
      if (planDetails.type === PLAN_TYPES.ENTERPRISE_PLAN) {
        state.showSelectEnterprisePlanModal = true;
      } else {
        state.selectedPlanDetails = planDetails;

        state.showPlanCheckoutModal = true;
      }
    };

    const onCheckoutEnterprisePlan = (planDetails) => {
      state.showSelectEnterprisePlanModal = false;
      state.selectedPlanDetails = planDetails;

      state.showPlanCheckoutModal = true;
    };

    const onSuccessfulPlanCheckout = () => {
      state.showPlanCheckoutModal = false;

      if (state.showSelectEnterprisePlanModal) {
        state.showSelectEnterprisePlanModal = false;
      }

      emit('onPaymentSuccess');
    };

    const updateSelectedPlanPosition = async () => {
      await nextTick();

      //
      let headerEl = document.getElementById(
        `plan-header-${currentPlan.value.plan_name}`,
      );

      if (isEnterprisePlan.value) {
        headerEl = document.getElementById(
          `plan-header-${PLAN_TYPES.ENTERPRISE_PLAN}`,
        );
      }

      // no active plan (free trial or expired) - hide the selected plan badge
      if (!headerEl) {
        state.selectedPlanStyle = {
          display: 'none',
        };

        return;
      }

      // left
      state.selectedPlanStyle = {
        left: `${headerEl.offsetLeft - state.pricingTableScrollEl.scrollLeft + (headerEl.offsetWidth / 2)}px`,
      };
    };

    onMounted(async () => {
      await nextTick();

      state.pricingTableScrollEl = document.querySelector('.pricing-table .q-table__middle');
      updateSelectedPlanPosition();

      // scroll event listener to update the position of the selected plan badge
      state.pricingTableScrollEl?.addEventListener(
        'scroll',
        updateSelectedPlanPosition,
      );

      // resize event listener to update the position of the selected plan badge
      window.addEventListener(
        'resize',
        updateSelectedPlanPosition,
      );
    });

    onBeforeUnmount(() => {
      state.pricingTableScrollEl?.removeEventListener(
        'scroll',
        updateSelectedPlanPosition,
      );

      window.removeEventListener(
        'resize',
        updateSelectedPlanPosition,
      );
    });

    watch(currentPlan.value, () => {
      updateSelectedPlanPosition();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      allPlans,
      currentPlan,
      pricingRows,
      pricingColumns,
      isMobileDevice,
      isEnterprisePlan,

      // methods
      onSelectPlan,
      onSuccessfulPlanCheckout,
      onCheckoutEnterprisePlan,
    };
  },
});
</script>

<style lang="scss" scoped>
.billing-table-container {
  width: 100%;

  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  position: relative;

  .selected-plan-text {
    position: absolute;
    white-space: nowrap;

    color: $white;
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    line-height: 16px; /* 123.077% */

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 12px 12px 0 0;
    background: $positive;

    padding: 4px 12px;

    top: -12px;
    left: 50%;
    transform: translate(-50%, -50%);

    z-index: 2;
  }

  .fair-usage-text {
    margin-top: 12px;

    color: $grey;
    font-size: 13px;
  }

  .pricing-table {
    width: 100%;
    border: 1px solid $grey-50;

    display: flex;
    flex: 1;
    min-height: 0;

    :deep(.q-table__middle) {
      height: 100%;
      overflow-x: auto;
      overflow-y: auto;
      color: $black;

      /** table border **/
      tr,
      td,
      th,
      thead {
        border-color: $grey-50;
        text-align: center;
      }

      // sticky table header
      thead {
        tr {
          &:first-child {
            th {
              position: sticky;
              top: 0px;
              z-index: 1;
              background: $white;
            }
          }
        }
      }

      .pricing-header-row {
        .features-th {
          .feature-header-text {
            font-size: 13px;
            font-weight: 500;
            line-height: normal;
            text-transform: uppercase;

            left: 16px;
            bottom: 16px;
            position: absolute;
          }
        }

        .plan-header {
          padding: 16px 12px;

          &.highlighted-plan {
            backdrop-filter: blur(100px);
            background: rgba(var(--primary-rgb), 0.05);
            border-color: rgba(var(--primary-rgb), 0.1);
          }
        }

        .each-plan-header {
          display: flex;
          flex-direction: column;
          row-gap: 12px;

          .plan-name-text {
            font-size: 13px;
            font-weight: 500;
            line-height: normal;
            text-transform: uppercase;
          }

          .plan-price-block {
            display: flex;
            align-items: baseline;
            flex-wrap: nowrap;
            justify-content: center;

            font-size: 16px;
            line-height: 22px;

            .plan-price-text {
              font-size: 28px;
              font-weight: 600;
              line-height: 22px;
            }

            .plan-strike-through-price {
              font-size: 14px;
              font-weight: 400;
              line-height: 22px;
              text-decoration-line: line-through;

              margin-left: 8px;

              color: rgba(var(--black-rgb), 0.4);
            }
          }

          .plan-billing-text {
            font-size: 12px;
            color: rgba(var(--black-rgb), 0.6);
          }

          .current-plan-btn {
            border-radius: 6px;
            background: rgba(var(--grey-rgb), 0.04);

            .current-plan-text {
              color: $grey-300;
            }
          }
        }
      }

      .feature-column {
        .feature-name-row {
          display: flex;
          align-items: center;
          gap: 4px;

          .feature-name-text {
            font-size: 14px;
            font-weight: 400;
            line-height: 16px;
          }
        }
      }

      .plan-feature-td {
        &.highlighted-plan {
          background: rgba(var(--primary-rgb), 0.05);
          border-color: rgba(var(--primary-rgb), 0.1);
        }
      }

      .success-tick-icon {
        width: 16px;
        height: 16px;
      }
    }
  }
}
</style>
