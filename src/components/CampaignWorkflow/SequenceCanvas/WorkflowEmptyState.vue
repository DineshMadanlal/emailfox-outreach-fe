<template>
  <div class="workflow-empty-state">
    <!-- LinkedIn Followup -->
    <q-dialog
      v-model="showLinkedInStepModal"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <LinkedInStep
        :isFollowupStep="false"
        :preSelectLinkedInStep="selectedLinkedInStep"
        @closeStepModal="showLinkedInStepModal = false"
      />
    </q-dialog>

    <p class="empty-header-text">
      Automate Your Outreach
    </p>

    <p class="empty-desc-text">
      Build your outreach sequence by choosing the first step.
    </p>

    <div class="workflow-steps">
      <q-card
        flat
        v-for="(step, index) in workflowSteps"
        :key="`empty-state-step-${index}`"

        class="each-workflow-step"

        @click="onAddNewStep(step)"
      >
        <!-- Image -->
        <WorkflowStepIcon
          :icon="step.icon"
          :theme="step.theme"
        />

        <!-- Content -->
        <div>
          <div class="workflow-step-title">
            {{ step.title }}
          </div>

          <div class="workflow-step-desc">
            {{ step.description }}
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>
<script>
// vue
import {
  defineComponent, computed, reactive, toRefs, inject,
} from 'vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import LinkedInStep from 'components/CampaignWorkflow/SequenceCanvas/Modals/LinkedInStep.vue';
import WorkflowStepIcon from 'components/CampaignWorkflow/SequenceCanvas/WorkflowStepIcon.vue';

// constants
import {
  LINKEDIN_WORKFLOW_STEP_CATALOG, EMAIL_WORKFLOW_STEP_CATALOG,
  WORKFLOW_STEP_CATALOG, WORKFLOW_STEP_CATEGORIES, LINKEDIN_ACTION_DETAILS,
} from 'boot/campaign-constants';

export default defineComponent({
  name: 'WorkflowEmptyState',

  components: {
    LinkedInStep,
    WorkflowStepIcon,
  },

  setup() {
    // inject
    const workflowContext = inject('workflowContext');
    const editCampaignContext = inject('editCampaignContext');

    // state
    const state = reactive({
      showLinkedInStepModal: false,

      selectedLinkedInStep: '',
    });

    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // computed
    const workflowSteps = computed(() => {
      //
      const {
        isEmailOutreachCampaign,
        isLinkedInOutreachCampaign,
        isMultiChannelOutreachCampaign,
      } = editCampaignContext;

      if (isEmailOutreachCampaign.value) {
        return Object.values(EMAIL_WORKFLOW_STEP_CATALOG);
      } if (isLinkedInOutreachCampaign.value) {
        return Object.values(LINKEDIN_WORKFLOW_STEP_CATALOG);
      } if (isMultiChannelOutreachCampaign.value) {
        return Object.values(WORKFLOW_STEP_CATALOG);
      }

      return Object.values(WORKFLOW_STEP_CATALOG);
    });

    // methods
    const onAddNewStep = (step) => {
      if (step.category === WORKFLOW_STEP_CATEGORIES.LINKEDIN) {
        const currentActionDetails = LINKEDIN_ACTION_DETAILS[step.stepType];

        //
        if (currentActionDetails.supportsMessage) {
          state.showLinkedInStepModal = true;
          state.selectedLinkedInStep = step.stepType;
          return;
        }
      }

      // add new step
      workflowContext.onAddNewStep({
        step,
      });
    };

    return {
      // state
      ...toRefs(state),

      // computed
      workflowSteps,
      isMobileDevice,

      // methods
      onAddNewStep,
    };
  },
});
</script>

<style lang="scss" scoped>
.workflow-empty-state {
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .empty-header-text {
    color: $black;
    text-align: center;
    font-family: Inter;
    font-size: 18px;
    font-weight: 600;
  }

  .empty-desc-text {
    margin-top: 8px;
    margin-bottom: 32px;

    color: $black;
    text-align: center;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px; /* 114.286% */
  }

  .workflow-steps {
    width: 100%;
    max-width: 390px;

    display: flex;
    flex-direction: column;
    gap: 12px;

    .each-workflow-step {
      padding: 12px;
      border-radius: 8px;
      background: $white;
      border: 1px solid $grey-50;
      cursor: pointer;

      transition: all 0.2s ease-in-out;

      display: flex;
      gap: 12px;

      &:hover {
        transform: translateY(-1px);
        backdrop-filter: blur(100px);
        background: rgba(var(--primary-rgb), 0.03);
        border: 1px solid rgba(var(--primary-rgb), 0.2);
      }

      .workflow-step-title {
        color: $black;
        font-size: 14px;
        font-weight: 600;
      }

      .workflow-step-desc {
        color: $grey;
        font-size: 12px;
        font-weight: 400;
        line-height: 20px; /* 133.333% */

        margin-top: 4px;
      }
    }
  }
}
</style>
