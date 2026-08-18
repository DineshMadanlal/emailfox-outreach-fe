<template>
  <div class="workflow-empty-state">
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
      Build a sequence of steps you want your campaign to follow
    </p>

    <div class="workflow-steps">
      <div
        v-for="(step, index) in workflowSteps"
        :key="`empty-state-step-${index}`"

        class="each-workflow-step"

        @click="onAddNewStep(step)"
      >
        <!-- Image / Icon -->
        <div
          class="step-icon-wrapper"
          :class="step.theme"
        >
          <LocalSvgIcon
            :image="step.icon"
            class="step-icon"
          />
        </div>

        <!-- Content -->
        <div class="step-content">
          <div class="workflow-step-title">
            {{ step.title }}
          </div>

          <div class="workflow-step-desc">
            {{ step.description }}
          </div>
        </div>
      </div>
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
import LocalSvgIcon from 'components/Global/LocalSvgIcon.vue';

// constants
import {
  EMAIL_WORKFLOW_STEP_CATALOG,
  WORKFLOW_STEP_TYPES,
  WORKFLOW_STEP_CATEGORIES,
} from 'boot/campaign-constants';

export default defineComponent({
  name: 'WorkflowEmptyState',

  components: {
    LinkedInStep,
    LocalSvgIcon,
  },

  setup() {
    // inject
    const workflowContext = inject('workflowContext');
    const editCampaignContext = inject('editCampaignContext');

    // state
    const state = reactive({
      showLinkedInStepModal: false,

      selectedLinkedInStep: WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE,
    });

    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // computed
    const workflowSteps = computed(() => {
      const {
        isEmailOutreachCampaign,
        isLinkedInOutreachCampaign,
        isMultiChannelOutreachCampaign,
      } = editCampaignContext || {};

      const emailStep = {
        key: 'EMAIL',
        category: WORKFLOW_STEP_CATEGORIES.EMAIL,
        stepType: WORKFLOW_STEP_TYPES.EMAIL,
        title: 'Start with Email',
        description: 'Send personalized emails from your connected mailboxes.',
        icon: 'mail',
        theme: 'warning',
      };

      const linkedInStep = {
        key: 'LINKEDIN',
        category: WORKFLOW_STEP_CATEGORIES.LINKEDIN,
        stepType: WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE,
        title: 'Start with LinkedIn',
        description: 'Reach prospects through profile visits, connections, messages, InMails, & likes.',
        icon: 'people',
        theme: 'primary',
      };

      if (isEmailOutreachCampaign?.value) {
        return [emailStep];
      }
      if (isLinkedInOutreachCampaign?.value) {
        return [linkedInStep];
      }
      if (isMultiChannelOutreachCampaign?.value) {
        return [emailStep, linkedInStep];
      }

      return [emailStep, linkedInStep];
    });

    // methods
    const onAddNewStep = (step) => {
      if (step.category === WORKFLOW_STEP_CATEGORIES.LINKEDIN) {
        state.selectedLinkedInStep = WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE;
        state.showLinkedInStepModal = true;
        return;
      }

      if (step.category === WORKFLOW_STEP_CATEGORIES.EMAIL) {
        workflowContext.onAddNewStep({
          step: EMAIL_WORKFLOW_STEP_CATALOG[WORKFLOW_STEP_TYPES.EMAIL],
        });
      }
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
    font-size: 18px;
    font-weight: 600;
  }

  .empty-desc-text {
    margin-top: 8px;
    margin-bottom: 32px;

    color: rgba(var(--black-rgb), 0.8);
    text-align: center;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
  }

  .workflow-steps {
    width: 100%;

    display: flex;
    flex-direction: row;
    gap: 16px;
    justify-content: center;
    align-items: stretch;

    @media (max-width: 600px) {
      flex-direction: column;
      align-items: center;
      max-width: 320px;
    }

    .each-workflow-step {
      flex: 1;
      width: 100%;
      max-width: 300px;
      padding: 20px;
      border-radius: 6px;
      background: $white;
      border: 1px solid $grey-50;
      cursor: pointer;

      transition: all 0.2s ease-in-out;

      display: flex;
      flex-direction: column;
      align-items: flex-start;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.06);
        border-color: rgba(var(--primary-rgb), 0.3);
      }

      .step-icon-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;

        .step-icon {
          width: 16px;
          height: 16px;
        }

        &.warning {
          background: rgba(var(--warning-rgb), 0.08);
          border: 1px solid rgba(var(--warning-rgb), 0.25);

          :deep(.step-icon) {
            @include svg-icon-stroke('rect, path', $warning);
          }
        }

        &.primary {
          background: rgba(var(--primary-rgb), 0.08);
          border: 1px solid rgba(var(--primary-rgb), 0.25);

          :deep(.step-icon) {
            path {
              fill: inherit;
            }
            @include svg-icon-stroke('circle, rect, path', $primary);
          }
        }
      }

      .step-content {
        display: flex;
        flex-direction: column;
        text-align: left;

        .workflow-step-title {
          color: rgba(var(--black-rgb), 0.8);
          font-size: 14px;
          font-weight: 600;
          line-height: 16px;
        }

        .workflow-step-desc {
          color: rgba(var(--black-rgb), 0.8);
          font-size: 13px;
          font-weight: 400;
          line-height: 20px;
          margin-top: 8px;
        }
      }
    }
  }
}
</style>
