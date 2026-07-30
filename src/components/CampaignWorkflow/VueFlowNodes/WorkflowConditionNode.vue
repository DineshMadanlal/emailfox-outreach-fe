<template>
  <div class="workflow-condition-node">
    <!-- Condition Step Modal -->
    <q-dialog
      v-model="showConditionModal"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ConditionalStep
        :existingConditionStep="data?.step || {}"
        :conditionalWorkflowJson="data?.conditionalWorkflowJson || {}"

        @closeStepModal="showConditionModal = false"
      />
    </q-dialog>

    <!-- Handle -->
    <Handle
      id="top"
      type="target"
      :position="Position.Top"
      class="node-handle target-handle"
    />

    <!-- Condition Card -->
    <q-card
      flat
      class="condition-node-card"

      @click="showConditionModal = true"
    >
      <NodeCardHeader
        :data="data"

        @onDelete="onDeleteStep"
      />

      <div class="node-card__bottom">
        <!-- description -->
        <p class="description-text">
          {{ data.description }}
        </p>

        <!-- timeout -->
        <p class="timeout-text">
          Timeout: {{ timeoutDuration }}
        </p>
      </div>
    </q-card>

    <!-- Handle -->
    <Handle
      id="notAccepted"
      type="source"
      :position="Position.Left"
      class="node-handle left-handle"
    />

    <!-- Handle -->
    <Handle
      id="accepted"
      type="source"
      :position="Position.Right"
      class="node-handle right-handle"
    />
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, inject,
} from 'vue';

// npm
import { Handle, Position } from '@vue-flow/core';

// Components
import NodeCardHeader from 'components/CampaignWorkflow/SequenceCanvas/NodeCardHeader.vue';
import ConditionalStep from 'components/CampaignWorkflow/SequenceCanvas/Modals/ConditionalStep.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { getDelayState } from 'src/utils/campaignApi';

export default defineComponent({
  name: 'WorkflowConditionNode',

  components: {
    ConditionalStep,
    Handle,
    NodeCardHeader,
  },

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // inject
    const workflowContext = inject('workflowContext');

    // state
    const state = reactive({
      showConditionModal: false,
    });

    // computed
    const timeoutDuration = computed(() => {
      const delayState = getDelayState({
        unit: props.data?.step?.timeout_unit,
        value: props.data?.step?.timeout_value,
      });

      return `${delayState.delayValue} ${delayState.delayUnit}`.toLowerCase();
    });

    // methods
    const onDeleteStep = () => {
      const step = props.data?.step;
      if (!step) {
        return;
      }

      workflowContext.archiveWorkflowStep(step);
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      timeoutDuration,

      // methods
      onDeleteStep,

      // npm
      Position,
    };
  },
});
</script>

<style lang="scss" scoped>
.workflow-condition-node {
  min-width: 360px;
  max-width: 360px;

  position: relative;

  gap: 8px;
  display: flex;
  flex-direction: column;

  .condition-node-card {
    width: 100%;
    border: 1px solid $grey-50;
    border-radius: 8px;
    background: $white;

    cursor: pointer;

    .node-card__bottom {
      padding: 16px 12px;
      border-top: 1px solid $grey-50;

      .description-text {
        color: $primary;
        font-size: 14px;
        line-height: 20px;
      }

      .timeout-text {
        color: $grey;
        font-size: 14px;
        font-style: italic;
        margin-top: 4px;

        text-transform: capitalize;
      }
    }
  }

  :deep(.node-handle) {
    width: 10px;
    height: 10px;
    border: 2px solid $white;
    background: $primary;
  }

  :deep(.target-handle) {
    top: -6px;
  }

  :deep(.left-handle) {
    left: -6px;
  }

  :deep(.right-handle) {
    right: -6px;
  }
}
</style>
