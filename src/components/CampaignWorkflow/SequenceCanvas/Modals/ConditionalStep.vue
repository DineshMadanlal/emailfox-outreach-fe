<template>
  <q-card
    flat
    class="conditional-step-card app-modal-card"
  >
    <!-- header -->
    <div class="app-modal-header">
      <!-- header text -->
        <h4 class="modal-header-text">
          Set Condition
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

    <!-- content -->
    <div class="app-modal-content">
      <!-- Condition -->
      <div class="set-condition-wrapper">
        <!-- header -->
        <p class="select-condition-text">
          Select Condition
        </p>

        <!-- Condition Options -->
        <div class="all-conditions-wrapper">
          <p class="linkedin-condition-text">
            LinkedIn Condition
          </p>

          <q-radio
            dense

            v-for="(option, index) in linkedInConditionOptions"
            :key="`linkedin-condition-option-${index}-${option.value}`"
            v-model="conditionType"
            :label="option.label"
            :val="option.value"
          />
        </div>
      </div>

      <!-- Timeout -->
      <div class="timeout-wrapper">
        <!-- header -->
        <p class="timeout-text">
          How long should we wait?
        </p>

        <!-- desc -->
        <p class="timeout-desc-text">
          The lead will wait here until the condition is met. If it doesn't happen within
          the selected time, the lead will automatically
          continue to the "<b>{{ noBranchLabel }}</b>" branch.
        </p>

        <!-- Wait up to -->
        <InputLabel
          label="Wait upto"
        />

        <q-input
          dense
          borderless
          v-model.number="timeoutValue"

          :min="0"

          type="number"
          class="timeout-value-input"
        >
          <template v-slot:append>
            <SelectDelay
              borderless
              :outlined="false"

              v-model="timeoutUnit"

              class="delay-unit-dropdown"
            />
          </template>
        </q-input>
      </div>

    </div>

    <!-- footer -->
    <div class="app-modal-footer">
      <q-btn
        no-caps
        unelevated
        :loading="isApiLoading"

        type="submit"
        color="primary"
        label="Save"

        @click="onSaveCondition"
      />
    </div>
  </q-card>
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, reactive, toRefs, onMounted, computed, inject,
} from 'vue';

// quasar
import { useQuasar } from 'quasar';

// components
import InputLabel from 'components/Form/InputLabel.vue';
import SelectDelay from 'components/Dropdown/SelectDelay.vue';

// constants
import {
  WORKFLOW_CONDITION_TYPES, WORKFLOW_CONDITION_CATALOG,
  WORKFLOW_BRANCH_CATALOG, WORKFLOW_BRANCH_KEYS, DELAY_UNIT_TYPES,
  LINKEDIN_WORKFLOW_CONDITION_OPTIONS,
} from 'boot/campaign-constants';

export default defineComponent({
  name: 'ConditionalStep',

  emits: ['closeStepModal'],

  components: {
    InputLabel,
    SelectDelay,
  },

  props: {
    existingConditionStep: {
      type: Object,
      default: null,
    },
    conditionalWorkflowJson: {
      type: Object,
      default: () => {},
    },
  },

  setup(props, { emit }) {
    // inject
    const workflowContext = inject('workflowContext');

    // quasar
    const $q = useQuasar();

    // state
    const state = reactive({
      isApiLoading: false,

      conditionType: WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED,

      timeoutValue: null,
      timeoutUnit: '',
    });

    // computed
    const noBranchLabel = computed(() => {
      if (state.conditionType === WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED) {
        return WORKFLOW_BRANCH_CATALOG[WORKFLOW_BRANCH_KEYS.NOT_ACCEPTED].label;
      }

      return '';
    });

    const linkedInConditionOptions = computed(() => LINKEDIN_WORKFLOW_CONDITION_OPTIONS);

    // methods
    const setTimeoutState = (workflow) => {
      const hours = workflow?.timeout_value || 0;

      if (hours > 0 && hours % 24 === 0) {
        state.timeoutUnit = DELAY_UNIT_TYPES.DAYS.value;
        state.timeoutValue = hours / 24;
      } else {
        state.timeoutUnit = DELAY_UNIT_TYPES.HOURS.value;
        state.timeoutValue = hours;
      }
    };

    const onSaveCondition = () => {
      let errorMessage = '';

      // validate
      if (!state.conditionType) {
        errorMessage = 'Please select a condition.';
      }

      if (!state.timeoutValue || !state.timeoutUnit) {
        errorMessage = 'Please set a valid timeout value and unit.';
      }

      if (errorMessage) {
        // show error toast
        $q.dialog({
          title: 'Validation Error',
          message: errorMessage,
        });

        return;
      }

      //
      if (size(props.existingConditionStep) > 0) {
        const workflowStepJson = {
          ...props.existingConditionStep,

          condition_type: state.conditionType,
          timeout_value: state.timeoutValue,
          timeout_unit: state.timeoutUnit,
        };

        // add condition
        workflowContext.updateWorkflowStep({
          step: workflowStepJson,
          conditionalWorkflowJson: props.conditionalWorkflowJson,
        });

        emit('closeStepModal');
      } else {
        const selectedConditionType = WORKFLOW_CONDITION_CATALOG[
          WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED];

        const conditionStepJson = {
          step_type: selectedConditionType.stepType,

          ...selectedConditionType.jsonSchema,

          timeout_unit: state.timeoutUnit,
          timeout_value: state.timeoutValue,
        };

        // add condition
        workflowContext.onAddNewCondition({
          step: conditionStepJson,
          conditionalWorkflowJson: props.conditionalWorkflowJson,
        });

        emit('closeStepModal');
      }
    };

    // lifecycle hook
    onMounted(() => {
      // prefill the form with existing condition step data if available
      if (size(props.existingConditionStep) > 0) {
        const {
          condition_type,
          timeout_value,
          timeout_unit,
        } = props.existingConditionStep;

        // prefill the form with existing condition step data
        state.conditionType = condition_type;
        state.timeoutValue = timeout_value;
        state.timeoutUnit = timeout_unit;
      } else {
        // default condition type is LinkedIn Connection Accepted
        const defaultConditionType = WORKFLOW_CONDITION_CATALOG[
          WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED];

        //
        const {
          condition_type,
          timeout_value,
          timeout_unit,
        } = defaultConditionType.jsonSchema;

        state.conditionType = condition_type;

        setTimeoutState({
          timeout_value,
          timeout_unit,
        });
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      noBranchLabel,
      linkedInConditionOptions,

      // methods
      onSaveCondition,
    };
  },
});
</script>

<style lang="scss" scoped>
.conditional-step-card {
  $modalHeaderHeight: 68px;
  position: relative;
  max-width: 840px;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 840px;
    min-height: 100%;

    display: flex;
    flex-direction: column;
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  @media (min-width: 601px) and (max-width: 839px) {
    // For medium screens, we can set a specific width or use a percentage
    width: calc(100vw - 32px);
  }

  .app-modal-header {
    background: $grey-50;
    height: $modalHeaderHeight;
  }

  .app-modal-content {
    flex: 1;
    overflow-y: auto;
    @include custom-scrollbar;

    .set-condition-wrapper {
      padding-bottom: 32px;

      .select-condition-text {
        color: $black;
        font-size: 16px;
        font-weight: 600;

        margin-bottom: 20px;
      }

      .all-conditions-wrapper {
        width: 100%;

        .linkedin-condition-text {
          color: $grey-300;
          font-size: 12px;
          font-weight: 600;
          line-height: 16px;
          letter-spacing: 0.72px;
          text-transform: uppercase;

          margin-bottom: 20px;
        }
      }
    }

    .timeout-wrapper {
      width: 100%;
      padding-top: 32px;
      border-top: 1px solid $grey-50;

      .timeout-text {
        font-size: 16px;
        color: $black;
        font-weight: 600;
      }

      .timeout-desc-text {
        font-size: 14px;
        color: $black;
        margin-top: 12px;
        margin-bottom: 22px;
      }

      :deep(.timeout-value-input) {
        max-width: 320px;
        border: 1px solid $grey-50;
        padding: 0px 12px;
        border-radius: 6px;

        &:focus-within {
          border: 1px solid $primary;
        }
      }
    }
  }
}
</style>
