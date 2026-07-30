<template>
  <div class="flow-builder-section edit-workflow-section">
    <!-- container -->
    <div class="flow-builder-container">
      <!-- left section -->
      <div class="sequence-flow-overview-section">
        <EachWorkflow
          v-for="(workflow, index) in workflows"
          :key="`each-workflow-${index}`"
          :workflow="workflow"
          :workflowIndex="index"

          :id="`each-work-flow-${index}`"

          @deleteVariant="onDeleteVariant"
          @deleteWorkflow="onDeleteWorkflow"
          @addNewVariant="onAddNewVariant(index)"
          @update:delayDays="onUpdateDelayDays"

          @viewWorkflow="onViewWorkflow"
        />

        <!-- Add New Step -->
        <div class="add-new-workflow">
          <div class="workflow-bordered"></div>
          <NewStepButton
            @click="onAddNewWorkflow"
          />
        </div>
      </div>

      <!-- right section -->
      <SequenceEditor
        v-if="activeVariantJson"
        :activeVariantJson="activeVariantJson"
        :activeWorkflowJson="activeWorkflowJson"

        @onDeleteVariant="onDeleteActiveVariant"
        @update:onUpdateActiveVariant="onUpdateActiveVariant"
      />
    </div>

    <!-- action -->
    <div class="edit-sequence-footer">
      <!-- Next button -->
      <q-btn
        no-caps
        unelevated

        label="Next"
        color="primary"
      />
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, onMounted, reactive, toRefs, computed,
} from 'vue';

// quasar
import { uid } from 'quasar';

// Components
import NewStepButton from 'components/CampaignWorkflow/Workflows/NewStepButton.vue';
import EachWorkflow from 'components/CampaignWorkflow/Workflows/EachWorkflow.vue';
import SequenceEditor from 'components/CampaignWorkflow/Workflows/SequenceEditor.vue';

// utils
import { elementScrollIntoView } from 'src/utils/htmlScrollApi.js';

// constants
import { VARIANT_STATUS, SEQUENCE_VARIANT_NAME } from 'src/boot/campaign-constants.js';

// hardcoded constant
const DEFAULT_VARIANT_JSON = {
  body: '',
  subject: '',
  stats: {
    sent: 0,
    replied: 0,
    opens: 0,
    bounced: 0,
  },
  status: VARIANT_STATUS.DRAFT,
};

const DEFAULT_DELAY_DAYS = 3;

export default defineComponent({
  name: 'EmailOnlyFlowBuilder',

  components: {
    NewStepButton,
    EachWorkflow,
    SequenceEditor,
  },

  setup() {
    // state
    const state = reactive({
      workflows: [],

      activeWorkflowUid: '',
      activeVariantUid: '',
    });

    // computed
    const activeWorkflowIndex = computed(() => state.workflows
      .findIndex((wf) => wf.uid === state.activeWorkflowUid));

    const activeWorkflowJson = computed(() => ({
      ...state.workflows[activeWorkflowIndex.value] || null,
      name: `Email ${activeWorkflowIndex.value + 1}`,
    }));

    const activeVariantJson = computed(() => {
      const workflow = activeWorkflowJson.value;
      if (!workflow) return null;

      const variantIndex = workflow.variants?.findIndex((v) => v.uid === state.activeVariantUid);

      if (variantIndex > -1) {
        return {
          ...workflow.variants[variantIndex],
          label: SEQUENCE_VARIANT_NAME[variantIndex + 1],
        };
      }

      return null;
    });

    // methods
    const scrollToNewlyAddedWorkflow = (workflowIndex) => {
      setTimeout(() => {
        // scroll to the newly created ID
        elementScrollIntoView(`each-work-flow-${workflowIndex}`);
      }, 500);
    };

    const getNewVariantJson = () => ({
      ...DEFAULT_VARIANT_JSON,
      uid: uid(),
    });

    const onAddNewVariant = (workflowIndex) => {
      const newVariantJson = getNewVariantJson();

      state.workflows[workflowIndex].variants = [
        ...state.workflows[workflowIndex].variants,
        newVariantJson,
      ];

      state.activeVariantUid = newVariantJson.uid;
      state.activeWorkflowUid = state.workflows[workflowIndex].uid;

      scrollToNewlyAddedWorkflow(workflowIndex);
    };

    const moveToThePreviousWorkflow = (workflowIndex) => {
      // move to the previous workflow if available
      if (workflowIndex - 1 > -1) {
        const newActiveWorkflow = state.workflows[workflowIndex - 1];

        state.activeWorkflowUid = newActiveWorkflow.uid;
        state.activeVariantUid = newActiveWorkflow.variants[0]?.uid;
      }
    };

    const onDeleteVariant = ({ workflowIndex, variantIndex }) => {
      const workflowJson = state.workflows[workflowIndex];
      const toBeDeletedVariant = workflowJson.variants[variantIndex];

      if (workflowJson.uid === state.activeWorkflowUid
        && toBeDeletedVariant.uid === state.activeVariantUid) {
        state.activeVariantUid = '';
        state.activeWorkflowUid = '';

        // move to the previous workflow if available
        moveToThePreviousWorkflow(workflowIndex);
      }

      if (toBeDeletedVariant.status === VARIANT_STATUS.DRAFT) {
        // directly delete
        state.workflows[workflowIndex].variants.splice(variantIndex, 1);
      } else {
        // soft delete for non-draft variants
        state.workflows[workflowIndex].variants[variantIndex].status = VARIANT_STATUS.ARCHIVED;
      }
    };

    const onDeleteWorkflow = (workflowIndex) => {
      const workflowJson = state.workflows[workflowIndex];

      if (workflowJson.uid === state.activeWorkflowUid) {
        state.activeVariantUid = '';
        state.activeWorkflowUid = '';

        // move to the previous workflow if available
        moveToThePreviousWorkflow(workflowIndex);
      }

      const firstVariant = state.workflows[workflowIndex].variants[0];

      if (firstVariant.status === VARIANT_STATUS.DRAFT) {
        // directly delete
        state.workflows.splice(workflowIndex, 1);
      } else {
        // for workflows which are sent.. disable the step and don't delete
      }
    };

    const onAddNewWorkflow = () => {
      const newUid = uid();
      const workflowCount = state.workflows.length;

      const newVariantJson = getNewVariantJson();

      const newWorkflowJson = {
        uid: newUid,
        variants: [newVariantJson],
        delayDays: workflowCount === 0 ? 0 : DEFAULT_DELAY_DAYS,
      };

      state.workflows = [
        ...state.workflows,
        newWorkflowJson,
      ];

      state.activeWorkflowUid = newWorkflowJson.uid;
      state.activeVariantUid = newVariantJson.uid;

      scrollToNewlyAddedWorkflow(state.workflows.length - 1);
    };

    const onUpdateDelayDays = ({ value, workflowIndex }) => {
      state.workflows[workflowIndex].delayDays = value;
    };

    const onViewWorkflow = ({ workflowJson, variantJson }) => {
      state.activeWorkflowUid = workflowJson.uid;
      state.activeVariantUid = variantJson.uid;
    };

    const onDeleteActiveVariant = () => {
      const workflowIndex = activeWorkflowIndex.value;
      if (workflowIndex === -1) return;

      const workflowVariants = state.workflows[workflowIndex].variants;

      const variantIndex = workflowVariants.findIndex((v) => v.uid === state.activeVariantUid);
      if (variantIndex === -1) return;

      if (workflowVariants.length === 1) {
        // if it's the only variant in the workflow, delete the workflow
        onDeleteWorkflow(workflowIndex);
        return;
      }

      onDeleteVariant({ workflowIndex, variantIndex });
    };

    const onUpdateActiveVariant = (key, value) => {
      const workflowIndex = activeWorkflowIndex.value;
      if (workflowIndex === -1) return;

      const variantIndex = state.workflows[workflowIndex].variants
        .findIndex((v) => v.uid === state.activeVariantUid);
      if (variantIndex === -1) return;

      state.workflows[workflowIndex].variants[variantIndex][key] = value;
    };

    const onComponentMounted = () => {
      onAddNewWorkflow();
    };

    onMounted(() => {
      onComponentMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      activeVariantJson,
      activeWorkflowJson,

      // methods
      onAddNewVariant,
      onDeleteVariant,
      onDeleteWorkflow,
      onAddNewWorkflow,
      onUpdateDelayDays,
      onViewWorkflow,
      onDeleteActiveVariant,
      onUpdateActiveVariant,
    };
  },
});
</script>

<style lang="scss" scoped>
.flow-builder-section {
  .flow-builder-container {
    width: 100%;
    min-height: 0;

    padding: 20px 24px;
    padding-bottom: 48px;

    display: flex;
    gap: 24px;
    flex: 1;

    // lg min
    @media (min-width: $breakpoint-lg-min) {
      padding: 24px 32px;
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 12px;
    }

    .sequence-flow-overview-section {
      padding-right: 12px;
      min-width: 310px;
      max-width: 310px;

      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;

      .add-new-workflow {
        .workflow-bordered {
          position: relative;
          left: 24px;
          height: 24px;
          width: 1px;
          border-left: 1px dashed $grey-200;
        }
      }
    }
  }
}
</style>
