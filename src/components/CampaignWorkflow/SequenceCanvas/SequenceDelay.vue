<template>
  <q-card flat class="sequence-delay">
    <!-- input -->
    <q-input
      type="number"

      v-model.number="delayValue"
      dense
      borderless
      :min="0"

      class="delay-input"
      input-class="number-input"

      @update:model-value="onInputChange"
    />

    <!-- divider -->
    <div class="border-divider" />

    <!-- delay unit dropdown -->
    <SelectDelay
      borderless
      :outlined="false"

      v-model="delayUnit"

      class="delay-unit-dropdown"

      @update:model-value="onInputChange"
    />

    <!-- divider -->
    <div class="border-divider" />

    <!-- text -->
    <div class="after-step-text">
      after the previous step
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, onMounted, watch, inject,
} from 'vue';

// components
import SelectDelay from 'components/Dropdown/SelectDelay.vue';

// utils
import { getDelayState } from 'src/utils/campaignApi';

export default defineComponent({
  name: 'SequenceDelay',

  components: {
    SelectDelay,
  },

  props: {
    workflow: {
      type: Object,
      default: () => {},
    },
    conditionalWorkflowJson: {
      type: Object,
      default: () => {},
    },
  },

  setup(props) {
    // inject
    const workflowContext = inject('workflowContext');

    // state
    const state = reactive({
      delayUnit: '',
      delayValue: 0,
    });

    // methods
    const onInputChange = () => {
      // update the workflow context with the new delay values
      workflowContext.updateWorkflowStep({
        step: {
          ...props.workflow,
          delay_unit: state.delayUnit,
          delay_value: state.delayValue,
        },
        conditionalWorkflowJson: props.conditionalWorkflowJson,
      });
    };

    const setDelayState = (workflow) => {
      const delayState = getDelayState({
        unit: workflow?.delay_unit,
        value: workflow?.delay_value,
      });

      state.delayUnit = delayState.delayUnit;
      state.delayValue = delayState.delayValue;
    };

    // lifecycle hook
    onMounted(() => {
      // set default delay unit
      setDelayState(props.workflow);
    });

    watch(() => props.workflow, (newWorkflow) => {
      // ignore if the values are same
      // if (
      //   newWorkflow?.delay_unit === state.delayUnit
      //   && newWorkflow?.delay_value === state.delayValue
      // ) {
      //   return;
      // }

      // update the state when the workflow prop changes
      setDelayState(newWorkflow);
    });

    return {
      // state
      ...toRefs(state),

      // methods
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.sequence-delay {
  width: 100%;
  max-width: 285px;
  border-radius: 8px;
  border: 1px solid $grey-50;

  display: flex;
  align-items: center;
  justify-content: center;

  .after-step-text {
    color: $grey;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
    padding-left: 8px;
    padding-right: 12px;
  }

  :deep(.delay-input) {
    width: 100%;
    max-width: 30px;
    color: $primary;

    .number-input {
      color: $primary;
      text-align: center;
    }
  }

  .border-divider {
    width: 1px;
    height: 20px;
    border-left: 1px solid $grey-200;
  }

  :deep(.delay-unit-dropdown) {
    width: 100%;
    min-width: 80px;
    max-width: fit-content;
    padding: 0px 8px;
  }
}
</style>
