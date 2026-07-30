<template>
  <div class="add-sequence-step">
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
        :conditionalWorkflowJson="conditionalWorkflowJson"

        @closeStepModal="showLinkedInStepModal = false"
      />
    </q-dialog>

    <!-- Set Condition -->
    <q-dialog
      v-model="showConditionalStepModal"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ConditionalStep
        :conditionalWorkflowJson="conditionalWorkflowJson"

        @closeStepModal="showConditionalStepModal = false"
      />
    </q-dialog>

    <!-- add sequence step button -->
    <q-btn
      flat
      no-caps
      unelevated

      color="primary"
      class="add-sequence-step-btn"
      :class="{ 'menu-active': showAddSequenceStepMenu }"

      @click="onAddStepSequence"
    >
      <div class="flex no-wrap items-center">
        <LocalSvgIcon
          image="add-circle"
          class="add-sequence-step-icon"
        />

        <p class="add-sequence-text">
          Add Sequence Step
        </p>
      </div>

      <!-- Menu -->
      <q-menu
        :offset="[0, 10]"
        v-model="showAddSequenceStepMenu"

        class="no-shadow"

        v-if="!isEmailOutreachCampaign"
      >
        <AddSequenceStepOptions
          @onEmailFollowUp="onAddEmailStep"
          @onLinkedInFollowUp="showLinkedInStepModal = true"
          @onConditionFollowUp="showConditionalStepModal = true"

          :isEmailOutreachCampaign="isEmailOutreachCampaign"
          :isLinkedInOutreachCampaign="isLinkedInOutreachCampaign"
          :isMultiChannelOutreachCampaign="isMultiChannelOutreachCampaign"
        />
      </q-menu>
    </q-btn>
  </div>
</template>
<script>
// vue
import {
  defineComponent, reactive, toRefs, inject, computed,
} from 'vue';

// components
import AddSequenceStepOptions from 'components/Menu/AddSequenceStepOptions.vue';
import LinkedInStep from 'components/CampaignWorkflow/SequenceCanvas/Modals/LinkedInStep.vue';
import ConditionalStep from 'components/CampaignWorkflow/SequenceCanvas/Modals/ConditionalStep.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { EMAIL_WORKFLOW_STEP_CATALOG, WORKFLOW_STEP_TYPES } from 'boot/campaign-constants';

export default defineComponent({
  name: 'AddSequenceStep',

  components: {
    AddSequenceStepOptions,
    LinkedInStep,
    ConditionalStep,
  },

  props: {
    conditionalWorkflowJson: {
      type: Object,
      default: () => {},
    },
  },

  setup(props) {
    // inject
    const workflowContext = inject('workflowContext');

    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      showAddSequenceStepMenu: false,

      showLinkedInStepModal: false,
      showConditionalStepModal: false,
    });

    // computed
    const isEmailOutreachCampaign = computed(() => workflowContext.isEmailOutreachCampaign.value);
    const isLinkedInOutreachCampaign = computed(
      () => workflowContext.isLinkedInOutreachCampaign.value,
    );
    const isMultiChannelOutreachCampaign = computed(
      () => workflowContext.isMultiChannelOutreachCampaign.value,
    );

    // methods
    const addNewWorkflowStep = (step) => {
      workflowContext.onAddNewStep({
        step,
        conditionalWorkflowJson: props.conditionalWorkflowJson,
      });
    };

    const onAddEmailStep = () => {
      addNewWorkflowStep(EMAIL_WORKFLOW_STEP_CATALOG[WORKFLOW_STEP_TYPES.EMAIL]);
    };

    const onAddStepSequence = () => {
      if (isEmailOutreachCampaign.value) {
        onAddEmailStep();
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      isEmailOutreachCampaign,
      isLinkedInOutreachCampaign,
      isMultiChannelOutreachCampaign,

      // methods
      onAddEmailStep,
      onAddStepSequence,
    };
  },
});
</script>

<style lang="scss" scoped>
.add-sequence-step {
  width: 100%;

  .add-sequence-step-btn {
    width: 100%;
    height: 48px;

    border: 1px dashed transparent;
    border-image: repeating-linear-gradient(
      90deg,
      $grey-100 0 10px,
      transparent 10px 17px
    ) 1;

    :deep(.q-btn__content) {
      justify-content: flex-start;

      .add-sequence-step-icon {
        width: 16px;
        @include svg-icon-stroke('path, circle', $grey);
      }

      .add-sequence-text {
        margin-left: 6px;
        color: $grey;
        line-height: 1.6;
      }
    }

    &.menu-active {
      border-image: repeating-linear-gradient(
        90deg,
        $primary 0 10px,
        transparent 10px 17px
      ) 1;

      :deep(.q-btn__content) {
        .add-sequence-step-icon {
          @include svg-icon-stroke('path, circle', $primary);
        }

        .add-sequence-text {
          color: $primary;
        }
      }
    }
  }
}
</style>
