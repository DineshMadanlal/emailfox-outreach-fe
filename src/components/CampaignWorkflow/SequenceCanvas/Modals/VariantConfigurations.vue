<template>
  <q-card flat class="app-modal-card variant-configurations-card">
    <!-- header -->
    <div class="app-modal-header">
      <!-- header text -->
      <h4 class="modal-header-text">
        Variant Configurations
      </h4>

      <q-space />

      <!-- Close -->
      <q-btn
        flat
        round
        dense
        v-close-popup

        color="negative"
        class="app-negative-button"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <!-- Content -->
    <div class="app-modal-content">
      <!--  -->
      <q-checkbox
        dense
        v-model="config.isABTestEnabled"

        color="primary"
        class="app-checkbox ab-test-checkbox"
      >
        <div>
          <p class="ab-test-label">
            Run an A/B test on this step
          </p>

          <p class="ab-test-desc">
            Split your audience to test multiple subject lines or email variants.
          </p>
        </div>
      </q-checkbox>

      <!--  -->
      <div
        class="ab-test-configuration"
        :class="{ 'click-prevent': !config.isABTestEnabled }"
      >
        <!-- full width -->
        <div class="full-width">
          <!-- header -->
          <p class="ab-header-text">
            Test Contacts Allocation
          </p>

          <!-- desc -->
          <p class="ab-desc-text">
            Choose what percentage of your contacts will receive the test variants. The rest will
            automatically receive the winning version.
          </p>

          <!-- slider -->
          <div class="slider-container vertical-spacer">
            <p class="slider-label-text">
              {{ config.testContactsAllocation }}% of contacts
            </p>
            <q-slider
              :key="sliderKey"
              v-model="config.testContactsAllocation"

              :min="0"
              :max="100"
              :step="1"
              track-size="42px"

              color="primary"
              class="custom-pill-slider"

              @change="onSliderChange"
              @update:model-value="onUpdateSliderValue"
            >
            </q-slider>
          </div>
        </div>

        <!--  -->
        <div class="full-width vertical-spacer">
          <!-- header -->
          <p class="ab-header-text">
            Variant Breakdown
          </p>

          <!-- Desc -->
          <p class="ab-desc-text">
            Each variant receives an equal share of your group to ensure fair performance tracking.
          </p>

          <q-table
            hide-pagination
            :rows="variantDropdownOptions"
            :columns="variantTableColumns"
            :pagination="TABLE_PAGINATION"

            separator="cell"
            class="app-table variant-breakdown-table"
          >
          </q-table>

          <!-- Remaning Contacts -->
          <q-card
            flat
            class="remaining-contacts-card"
          >
            <LocalSvgIcon
              image="info-circle"
              class="info-circle"
            />

            <div>
              <p class="remaining-contacts-text">
                Remaining Contacts
              </p>

              <p class="remaining-contacts-desc">
                <b>
                  {{ remainingContactsPercentage }}%
                </b> will receive the winning variant.
              </p>
            </div>
          </q-card>
        </div>

        <!-- Winning Metrics -->
        <div class="full-width vertical-spacer">
          <!-- header -->
          <p class="ab-header-text">
            Winning Metrics
          </p>

          <!-- Desc -->
          <p class="ab-desc-text">
            Select the performance goal used to determine the best-performing variant.
          </p>

          <SelectEmailMetric
            v-model="config.winningMetric"
            placeholder-text="Select Metric"
            class="config-dd"
          />
        </div>

        <!-- Fallback Variant -->
        <div class="full-width vertical-spacer">
          <!-- header -->
          <p class="ab-header-text">
            Fallback Variant
          </p>

          <!-- Desc -->
          <p class="ab-desc-text">
            If the test is inconclusive, send this version to the remaining recipients.
          </p>

          <!--  -->
          <SelectVariants
            v-model="config.fallbackVariant"
            :dropdownOptions="variantDropdownOptions"
            placeholder-text="Select Variant"
            class="config-dd"
          />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <q-btn
        no-caps
        unelevated
        :loading="isApiLoading"

        color="primary"
        label="Save"

        @click="onSaveVariantConfigurations"
      />
    </div>
  </q-card>
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, toRefs, reactive, onMounted, inject, computed,
} from 'vue';

// Components
import SelectVariants from 'components/Dropdown/SelectVariants.vue';
import SelectEmailMetric from 'components/Dropdown/SelectEmailMetric.vue';

// utils
import { findPercentage } from 'src/utils/numbers.js';

// constants
import { TABLE_PAGINATION } from 'boot/constants';
import { EMAIL_METRICS, SEQUENCE_VARIANT_NAME } from 'boot/campaign-constants';

export default defineComponent({
  name: 'VariantConfigurations',

  emits: ['closeModal'],

  components: {
    SelectVariants,
    SelectEmailMetric,
  },

  props: {
    emailVariants: {
      type: Array,
      default: () => ([]),
    },
    workflow: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // inject
    const workflowContext = inject('workflowContext');

    // state
    const state = reactive({
      isApiLoading: false,
      sliderKey: 0,

      config: {
        testContactsAllocation: 30,
        winningMetric: EMAIL_METRICS.REPLY_RATE.value,
        fallbackVariant: 0,
        isABTestEnabled: false,
      },
    });

    // computed
    const variantWeight = computed(() => {
      const numVariants = props.emailVariants.length;
      return findPercentage({
        part: 1,
        whole: numVariants,
      });
    });

    const variantDropdownOptions = computed(() => props.emailVariants.map((variant, index) => ({
      label: `Variant ${SEQUENCE_VARIANT_NAME[index + 1]}`,
      value: index,
      weight: variantWeight.value,
    })));

    const variantTableColumns = computed(() => [
      {
        name: 'variant',
        label: 'Variants',
        field: 'label',
        align: 'left',
      },
      {
        name: 'percentage',
        label: 'Percentage (%)',
        align: 'left',
        field: (row) => `${row.weight}%`,
        classes: 'percentage-column',
      },
    ]);

    const remainingContactsPercentage = computed(() => 100 - state.config.testContactsAllocation);

    // methods
    const onSaveVariantConfigurations = () => {
      //
      const abTestConfig = {};

      //
      const currentStep = props.workflow.step || {};

      //
      if (state.config.isABTestEnabled) {
        abTestConfig.is_ab_test_enabled = true;
        abTestConfig.test_contacts_percentage = state.config.testContactsAllocation;
        abTestConfig.winning_metric = state.config.winningMetric;
        abTestConfig.fallback_variant_index = state.config.fallbackVariant;
      } else {
        abTestConfig.is_ab_test_enabled = false;
      }

      // ab test config
      currentStep.ab_test = abTestConfig;

      const updatedWorkflowJson = {
        ...props.workflow,
        step: currentStep,
      };

      //
      workflowContext.updateWorkflowStep(updatedWorkflowJson);

      emit('closeModal');
    };

    const onUpdateSliderValue = (value) => {
      state.config.testContactsAllocation = Math.max(30, value);
    };

    const onSliderChange = () => {
      // Force re-render of the slider
      state.sliderKey += 1;
    };

    // lifecycle hooks
    onMounted(() => {
      // any initialization logic can go here
      if (size(props.workflow.step?.ab_test)) {
        //
        const {
          is_ab_test_enabled,
          test_contacts_percentage,
          winning_metric,
          fallback_variant_index,
        } = props.workflow.step?.ab_test || {};

        //
        if (is_ab_test_enabled) {
          // prefill the state with existing values
          state.config = {
            isABTestEnabled: true,
            testContactsAllocation: test_contacts_percentage,
            winningMetric: winning_metric,
            fallbackVariant: fallback_variant_index,
          };
        }
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      variantTableColumns,
      variantDropdownOptions,
      remainingContactsPercentage,

      // methods
      onSaveVariantConfigurations,
      onUpdateSliderValue,
      onSliderChange,

      // hardcoded
      TABLE_PAGINATION,
    };
  },
});
</script>

<style lang="scss" scoped>
.variant-configurations-card {
  position: relative;
  max-width: 740px;
  display: flex;
  flex-direction: column;
  flex: 1;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 740px;
    min-height: 100%;

    display: flex;
    flex-direction: column;
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  @media (min-width: 601px) and (max-width: 745px) {
    // For medium screens, we can set a specific width or use a percentage
    width: calc(100vw - 32px);
  }

  .app-modal-content {
    flex: 1;

    // checkbox
    .ab-test-checkbox {
      align-items: flex-start;

      .ab-test-label {
        font-size: 16px;
        font-weight: 600;
        color: $black;
        position: relative;
        bottom: 2px;
      }

      .ab-test-desc {
        font-size: 13px;
        color: $grey;
      }
    }

    //
    .ab-test-configuration {
      width: 100%;
      max-width: 630px;
      margin-top: 32px;

      &.click-prevent {
        opacity: 0.2;
        user-select: none;
        pointer-events: none;
      }

      .ab-header-text {
        font-size: 16px;
        font-weight: 600;
        color: $black;
      }

      .ab-desc-text {
        color: $black;
        font-size: 14px;
        margin-top: 6px;
      }

      .config-dd {
        margin-top: 12px;
        width: 100%;
        max-width: 372px;
      }

      .vertical-spacer {
        margin-top: 30px;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          margin-top: 20px;
        }
      }

      .variant-breakdown-table {
        margin-top: 12px;
        max-width: 372px;

        :deep(.percentage-column) {
          color: $primary;
          font-weight: 500;
        }
      }

      .remaining-contacts-card {
        width: 100%;
        max-width: 572px;
        border: 1px solid rgba(var(--warning-rgb), 0.1);
        background: rgba(var(--warning-rgb), 0.05);
        padding: 16px 20px;
        margin-top: 24px;

        display: flex;
        gap: 8px;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          margin-top: 20px;
          padding: 16px 12px;
        }

        :deep(.info-circle) {
          min-width: 16px;
          max-width: 16px;

          path {
            fill: $white;
            stroke: $white;
          }

          .circle-1 {
            fill: $warning;
            stroke: $warning;
          }

          .circle-2 {
            stroke: $white;
            fill: $white;
          }
        }

        .remaining-contacts-text {
          font-size: 14px;
          color: $black;
        }

        .remaining-contacts-desc {
          margin-top: 6px;
          font-size: 14px;
          color: $black;
        }
      }

      .slider-container {
        height: 42px;
        position: relative;

        .slider-label-text {
          pointer-events: none;
          position: absolute;

          z-index: 2;
          top: 50%;
          left: 12px;
          transform: translate(0px, -9px);

          font-size: 14px;
          font-weight: 500;
          color: $white;
        }

        :deep(.custom-pill-slider) {
          .q-slider__track-container {
            padding: 0px;
          }

          .q-slider__inner {
            background: rgba($color: var(--primary-rgb), $alpha: 0.1);
          }

          .q-slider__thumb {
            position: relative;

            .q-slider__thumb-shape {
              display: none;
            }

            &::after {
              content: "";

              position: absolute; /* make it layer correctly */
              top: 50%;
              left: 10%;
              transform: translate(-50%, -50%);

              background-image: url('/icons/slider-1.svg');
              display: block;

              width: 24px; /* adjust as needed */
              height: 24px; /* adjust as needed */
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;

              z-index: 2; /* ensure it's above */
              pointer-events: none;
            }
          }
        }
      }
    }
  }
}
</style>
