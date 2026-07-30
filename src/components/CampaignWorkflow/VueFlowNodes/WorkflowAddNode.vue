<template>
  <div class="workflow-add-node nodrag nopan nowheel">
    <!-- Handle -->
    <Handle
      id="top"
      type="target"
      :position="Position.Top"
      class="node-handle target-handle"
    />

    <!-- Add Sequence Step -->
    <div class="workflow-add-content nodrag nopan nowheel">
      <AddSequenceStep
        :conditionalWorkflowJson="data?.conditionalWorkflowJson || {}"
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// npm
import { Handle, Position } from '@vue-flow/core';

// Components
import AddSequenceStep from 'components/CampaignWorkflow/SequenceCanvas/AddSequenceStep.vue';

export default defineComponent({
  name: 'WorkflowAddNode',

  components: {
    Handle,
    AddSequenceStep,
  },

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    return {
      // npm
      Position,
    };
  },
});
</script>

<style lang="scss" scoped>
.workflow-add-node {
  min-width: 360px;
  max-width: 360px;

  .workflow-add-content {
    pointer-events: auto;
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
}
</style>
