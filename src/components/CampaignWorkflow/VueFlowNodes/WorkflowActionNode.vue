<template>
  <div
    class="workflow-action-node nodrag nopan nowheel"
  >
    <!-- LinkedIn Step -->
    <q-dialog
      v-model="showLinkedInStepModal"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <LinkedInStep
        :editWorkflowJson="data?.step || {}"
        :conditionalWorkflowJson="data?.conditionalWorkflowJson || {}"

        @closeStepModal="showLinkedInStepModal = false"
      />
    </q-dialog>

    <!-- Email Step -->
    <q-dialog
      v-model="showEmailStepModal"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <EmailStep
        :workflow="data || {}"
        :vIndex="selectedVariantIndex"
        :emailVariants="emailVariants"

        @closeModal="showEmailStepModal = false"

      />
    </q-dialog>

    <!-- Variant Configurations -->
    <q-dialog
      v-model="showVariantConfigurationsModal"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <VariantConfigurations
        :workflow="data || {}"
        :emailVariants="emailVariants"

        @closeModal="showVariantConfigurationsModal = false"

      />
    </q-dialog>

    <!-- Archive Step Or Variant Modal -->
    <q-dialog
      v-model="showArchiveVariantModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ArchiveStepOrVariant
        isVariant
        :inputJson="selectedVariantForArchive || {}"

        @onConfirmArchive="onUserConfirmArchiveVariant"
      />
    </q-dialog>

    <!-- Handle -->
    <Handle
      id="top"
      type="target"
      :position="Position.Top"
      class="node-handle target-handle"
    />

    <!-- Sequence Delay -->
    <div
      v-if="isSequenceFirstStep"
      class="node-delay nodrag nopan nowheel"
    >
      <!--  -->
      <SequenceDelay
        :workflow="data?.step || {}"
        :conditionalWorkflowJson="data?.conditionalWorkflowJson || {}"
      />
    </div>

    <!-- Email Node Card -->
    <q-card
      flat
      class="node-card"

      v-if="isEmailStep"
    >
      <NodeCardHeader
        isEmailStep
        :data="data"
        :isEmailSingleVariant="isEmailSingleVariant"

        @onDelete="onDeleteStep"
        @editVariantConfigurations="showVariantConfigurationsModal = true"
      />

      <!-- each variant -->
      <div
        class="all-email-variants"
      >
        <q-item
          v-for="(variant, vIndex) in emailVariants"
          :key="`each-variant-${vIndex}-${data?.step?.id || data?.step?._tempId}`"

          clickable
          class="each-variant no-drag cursor-pointer"

          @click="onEditVariant(vIndex)"
        >
          <!-- Variant Label -->
          <p
            class="seq-variant-name-text"
          >
            {{ SEQUENCE_VARIANT_NAME[vIndex + 1] }}
          </p>

          <!-- Variant Message -->
          <p
            class="variant-message-text ellipsis"
            :class="{ 'add-opacity': !variant.message }"
            :title="getCleanText(variant.message)"
          >
            {{ getCleanText(variant.message) || 'Message will appear here' }}
          </p>

          <q-space />

          <!-- Delete -->
          <q-btn
            flat
            dense
            no-caps
            unelevated

            color="negative"
            class="nodrag app-negative-button"

            @click.stop="onDeleteVariant(vIndex)"

            v-if="!isEmailSingleVariant"
          >
            <LocalSvgIcon
              image="delete"
              classes="app-negative-icon"
            />
          </q-btn>
        </q-item>

        <!-- New Variant -->
        <q-item
          clickable
          class="each-variant"

          v-if="emailVariantsLength < SEQUENCE_VARIANTS_MAX_LIMIT"

          @click="onAddNewVariant"
        >
          <div class="seq-variant-name-text">
            <LocalSvgIcon
              image="plus"
            />
          </div>

          <p
            class="variant-message-text ellipsis"
          >
            New Variant
          </p>
        </q-item>
      </div>
    </q-card>

    <!-- LinkedIn Node Card -->
    <q-card
      flat
      class="node-card"

      v-else-if="isLinkedInStep"
    >
      <NodeCardHeader
        :data="data"

        @onDelete="onDeleteStep"
      />

      <!--  -->
      <div
        class="node-card__bottom nodrag cursor-pointer"
        @click="showLinkedInStepModal = true"
      >
        <p class="description-text">
          {{ data.description }}
        </p>
      </div>
    </q-card>

    <!--  -->
    <Handle
      type="source"
      :position="Position.Bottom"
      class="node-handle source-handle"
    />
  </div>
</template>

<script>
// vue
import {
  computed, defineComponent, inject, reactive, toRefs,
} from 'vue';

// npm
import { Handle, Position } from '@vue-flow/core';

// Components
import SequenceDelay from 'components/CampaignWorkflow/SequenceCanvas/SequenceDelay.vue';
import NodeCardHeader from 'components/CampaignWorkflow/SequenceCanvas/NodeCardHeader.vue';
import EmailStep from 'components/CampaignWorkflow/SequenceCanvas/Modals/EmailStep.vue';
import LinkedInStep from 'components/CampaignWorkflow/SequenceCanvas/Modals/LinkedInStep.vue';
import VariantConfigurations from 'components/CampaignWorkflow/SequenceCanvas/Modals/VariantConfigurations.vue';
import ArchiveStepOrVariant from 'components/CampaignWorkflow/SequenceCanvas/Modals/ArchiveStepOrVariant.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { getCleanText } from 'src/utils/froalaHelper';
import { findPercentage } from 'src/utils/numbers.js';

// constants
import { WORKFLOW_STEP_CATEGORIES, SEQUENCE_VARIANT_NAME, SEQUENCE_VARIANTS_MAX_LIMIT } from 'boot/campaign-constants';

export default defineComponent({
  name: 'WorkflowActionNode',

  components: {
    Handle,
    EmailStep,
    LinkedInStep,
    SequenceDelay,
    NodeCardHeader,
    ArchiveStepOrVariant,
    VariantConfigurations,
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
      showEmailStepModal: false,
      showLinkedInStepModal: false,

      showVariantConfigurationsModal: false,

      showArchiveVariantModal: false,
      selectedVariantForArchive: null,

      selectedVariantIndex: null,
    });

    // computed
    const isEmailStep = computed(
      () => props.data?.category === WORKFLOW_STEP_CATEGORIES.EMAIL,
    );

    const isLinkedInStep = computed(
      () => props.data?.category === WORKFLOW_STEP_CATEGORIES.LINKEDIN,
    );

    const isSequenceFirstStep = computed(
      () => !props.data?.isFirstStep,
    );

    const emailVariants = computed(() => {
      if (isEmailStep.value) {
        return props.data?.step?.variants || [];
      }
      return [];
    });

    const emailVariantsLength = computed(() => emailVariants.value.length);

    const isEmailSingleVariant = computed(() => emailVariantsLength.value === 1);

    // methods
    const onDeleteStep = () => {
      const step = props.data?.step;

      if (!step) {
        return;
      }

      workflowContext.archiveWorkflowStep(step);
    };

    const onAddNewVariant = () => {
      const updatedNumberOfVariants = emailVariantsLength.value + 1;

      const variantWeight = findPercentage({
        part: 1,
        whole: updatedNumberOfVariants,
      });

      //
      const newVariantJson = {
        subject: '',
        message: '',
      };

      const newEmailVariants = [...emailVariants.value, newVariantJson];

      newEmailVariants.forEach((variant) => {
        variant.weight = Number(variantWeight);
      });

      //
      const currentWorkflowJson = { ...props.data };

      const updatedWorkflowJson = {
        ...currentWorkflowJson,
        step: {
          ...currentWorkflowJson.step,
          variants: newEmailVariants,
        },
      };

      //
      workflowContext.updateWorkflowStep(updatedWorkflowJson);
    };

    const removeVariant = (variantIndex) => {
      const currentWorkflowJson = { ...props.data };

      const updatedVariants = [...(currentWorkflowJson.step?.variants || [])];

      const archivedVariantsId = currentWorkflowJson.step?.archived_variants_id || [];

      if (updatedVariants[variantIndex]?.id) {
        archivedVariantsId.push(updatedVariants[variantIndex].id);
      }

      updatedVariants.splice(variantIndex, 1);

      const updatedWorkflowJson = {
        ...currentWorkflowJson,
        step: {
          ...currentWorkflowJson.step,
          archived_variants_id: archivedVariantsId,
          variants: updatedVariants,
        },
      };

      workflowContext.updateWorkflowStep(updatedWorkflowJson);
    };

    const onUserConfirmArchiveVariant = (variantJson) => {
      const targetIndex = variantJson?.index;
      if (targetIndex !== null && targetIndex !== undefined && targetIndex >= 0) {
        removeVariant(targetIndex);
      }
      state.showArchiveVariantModal = false;
      state.selectedVariantForArchive = null;
    };

    const onDeleteVariant = (variantIndex) => {
      const variant = emailVariants.value[variantIndex];
      if (!variant) return;

      if (variant?.id) {
        if (workflowContext?.isCampaignDrafted?.value) {
          removeVariant(variantIndex);
        } else {
          state.selectedVariantForArchive = { ...variant, index: variantIndex };
          state.showArchiveVariantModal = true;
        }
      } else {
        removeVariant(variantIndex);
      }
    };

    const onEditVariant = (variantIndex) => {
      state.selectedVariantIndex = variantIndex;
      state.showEmailStepModal = true;
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isEmailStep,
      isMobileDevice,
      isLinkedInStep,
      isSequenceFirstStep,

      emailVariants,
      isEmailSingleVariant,
      emailVariantsLength,

      // methods
      onDeleteStep,
      getCleanText,
      onAddNewVariant,
      onDeleteVariant,
      onUserConfirmArchiveVariant,
      onEditVariant,

      // npm
      Position,

      // hardcoded constant
      SEQUENCE_VARIANT_NAME,
      SEQUENCE_VARIANTS_MAX_LIMIT,
    };
  },
});
</script>

<style lang="scss" scoped>
.workflow-action-node {
  min-width: 360px;
  max-width: 360px;

  position: relative;

  gap: 8px;
  display: flex;
  flex-direction: column;

  .node-delay {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .node-card {
    width: 100%;
    border: 1px solid $grey-50;
    border-radius: 8px;
    background: $white;

    // bottom
    .node-card__bottom {
      padding: 16px 12px;
      border-top: 1px solid $grey-50;

      .description-text {
        color: $black;
        font-size: 14px;
        line-height: 20px;
      }
    }

    .all-email-variants {
      border-top: 1px solid $grey-50;

      .each-variant {
        display: flex;
        align-items: center;
        gap: 15px;

        min-height: unset;
        padding: 10px 12px;
        border-bottom: 1px solid $grey-50;

        &:last-child {
          border-bottom: 0px;
        }

        .seq-variant-name-text {
          color: $grey;
          font-size: 14px;
          line-height: 20px;

          height: 20px;
          width: 20px;
          min-width: 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 4px;
          border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.2);
        }

        .variant-message-text {
          color: $black;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;

          &.add-opacity {
            opacity: 0.4;
          }
        }
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

  :deep(.source-handle) {
    bottom: -6px;
  }
}
</style>
