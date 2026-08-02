<template>
  <q-card
    flat
    class="linkedin-step-card app-modal-card"
  >
    <!-- header -->
    <div class="app-modal-header">
      <!-- header text -->
        <h4 class="modal-header-text">
          LinkedIn {{ isFollowupStep ? 'Followup' : 'Step' }}
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
      <p class="linkedin-text">
        LinkedIn Action
      </p>
      <!--  -->
      <div class="linkedin-actions-flex">
        <!--  -->
        <q-btn
          flat
          no-caps
          unelevated

          color="primary"
          class="each-linkedin-action"
          :class="{
            'selected': data.stepType === selectedLinkedInStep
          }"

          v-for="(data, index) in linkedInWorkflowSteps"
          :key="`each-linkedin-step-${index}`"

          @click="onSelectLinkedInStep(data)"
        >
          <div class="linkedin-action-content">
            <!--  -->
            <WorkflowStepIcon
              :icon="data.icon"
              :theme="data.theme"

              removeBackground
            />

            <p class="linkedin-action-text">
              {{ data.title }}
            </p>
          </div>
        </q-btn>
      </div>

      <!--  -->
      <div class="linkedin-step-details">
        <!-- sub title -->
        <p class="action-sub-title-text">
          {{ selectedLinkedInActionDetails.subTitle }}
          <span
            v-if="selectedLinkedInActionDetails.isOptional"
            class="optional-text"
          >
            (Optional)
          </span>
        </p>

        <!-- description -->
        <p class="action-desc-text">
          {{ selectedLinkedInActionDetails.description }}
        </p>

        <!-- container -->
        <div
          class="message-container"
          v-if="selectedLinkedInActionDetails.supportsMessage"
        >
          <!-- subject -->
          <q-input
            v-if="selectedLinkedInActionDetails.supportsSubject"

            dense
            counter
            outlined

            v-model="subject"
            :maxlength="selectedLinkedInActionDetails?.limits.subject"

            type="text"
            class="linkedin-subject"
            input-class="subject-text-input"
            placeholder="Enter your subject here..."

            @click="updateSubjectSelection"
            @keyup="updateSubjectSelection"
            @select="updateSubjectSelection"
          >
            <!-- Append -->
            <template v-slot:append>
              <!-- Add Variables Button -->
              <q-btn
                flat
                no-caps
                unelevated
                @mousedown.prevent.stop
                @touchstart.prevent.stop
                @pointerdown.prevent.stop

                @click="onAddVariableClick('subject')"
              >
                <!-- menu anchor -->
                <div
                  ref="subjectMenuAnchor"
                  style="position: fixed; width: 1px; height: 1px; visibility: hidden; z-index: -1;"
                />

                <EditorMenuOptions
                  v-if="subjectMenuAnchor"

                  isLinkedInWorkflow
                  :target="subjectMenuAnchor"
                  :variableMenuOptions="variableMenuOptions"

                  v-model="showVariableMenu.subject"

                  @insertVariable="insertSubjectVariable"
                />

                <div class="flex no-wrap items-center">
                  <LocalSvgIcon
                    image="variables"
                    classes="add-variables-icon"
                  />

                  <div class="q-ml-xs">
                    Variables
                  </div>
                </div>
              </q-btn>
            </template>
          </q-input>

          <!-- message -->
          <q-input
            counter
            borderless
            :outlined="selectedLinkedInActionDetails.supportsSubject"

            v-model="message"
            :maxlength="selectedLinkedInActionDetails?.limits.body"

            type="textarea"
            class="linkedin-message"
            input-class="textarea-input"
            placeholder="Write your message here..."

            @click="updateMessageSelection"
            @keyup="updateMessageSelection"
            @select="updateMessageSelection"
          >
          </q-input>

          <!-- Variables -->
          <div
            class="variables-wrapper"
          >
            <!-- Add Variables Button -->
            <q-btn
              flat
              no-caps
              unelevated
              @mousedown.prevent.stop
              @touchstart.prevent.stop
              @pointerdown.prevent.stop

              class="add-variables-btn"
              @click="onAddVariableClick('message')"
            >
              <!-- menu anchor -->
              <div
                ref="messageMenuAnchor"
                style="position: fixed; width: 1px; height: 1px; visibility: hidden; z-index: -1;"
              />

              <EditorMenuOptions
                v-if="messageMenuAnchor"

                isLinkedInWorkflow
                :target="messageMenuAnchor"
                :variableMenuOptions="variableMenuOptions"

                v-model="showVariableMenu.message"

                @insertVariable="insertMessageVariable"
              />

              <div class="flex no-wrap items-center">
                <LocalSvgIcon
                  image="variables"
                  classes="add-variables-icon"
                />

                <div class="variable-text">
                  Variables
                </div>
              </div>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- footer -->
    <div class="app-modal-footer">
      <q-btn
        no-caps
        unelevated

        :loading="isApiLoading"
        :disable="!selectedLinkedInStep"

        type="submit"
        color="primary"
        label="Save"

        @click="onSaveWorkflowStep"
      />
    </div>
  </q-card>
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  computed, defineComponent, reactive, toRefs, onMounted, inject,
} from 'vue';

// Components
import EditorMenuOptions from 'components/Menu/EditorMenuOptions.vue';
import WorkflowStepIcon from 'components/CampaignWorkflow/SequenceCanvas/WorkflowStepIcon.vue';

// constants
import {
  DEFAULT_SYSTEM_FIELDS,
  LINKEDIN_WORKFLOW_STEP_CATALOG, WORKFLOW_STEP_TYPES, LINKEDIN_ACTION_DETAILS,
} from 'boot/campaign-constants';

export default defineComponent({
  name: 'LinkedInStep',

  emits: ['closeStepModal'],

  components: {
    EditorMenuOptions,
    WorkflowStepIcon,
  },

  props: {
    editWorkflowJson: {
      type: Object,
      default: () => ({}),
    },
    conditionalWorkflowJson: {
      type: Object,
      default: () => ({}),
    },
    isFollowupStep: {
      type: Boolean,
      default: true,
    },
    preSelectLinkedInStep: {
      type: String,
      default: '',
    },
  },

  setup(props, { emit }) {
    // inject
    const workflowContext = inject('workflowContext');

    // state
    const state = reactive({
      isApiLoading: false,

      selectedLinkedInStep: WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE,

      message: '',
      subject: '',

      subjectMenuAnchor: null,
      messageMenuAnchor: null,

      showVariableMenu: {
        subject: false,
        message: false,
      },

      textSelection: {
        subject: {
          start: 0,
          end: 0,
        },
        message: {
          start: 0,
          end: 0,
        },
      },
    });

    const defaultLinkedInActionDetails = {
      subTitle: '',
      description: '',
      isOptional: false,
      supportsMessage: false,
      supportsSubject: false,
      limits: {},
    };

    // computed
    const linkedInWorkflowSteps = computed(() => Object.values(LINKEDIN_WORKFLOW_STEP_CATALOG));

    const variableMenuOptions = computed(() => DEFAULT_SYSTEM_FIELDS.map((field) => ({
      label: field.label,
      value: `{{${field.value}}}`,
    })));

    const selectedLinkedInActionDetails = computed(() => {
      if (state.selectedLinkedInStep) {
        return {
          ...defaultLinkedInActionDetails,
          ...LINKEDIN_ACTION_DETAILS[state.selectedLinkedInStep],
        };
      }

      return defaultLinkedInActionDetails;
    });

    // methods
    const focusTextarea = () => {
      const textarea = document.querySelector('.linkedin-message textarea');

      if (textarea) {
        textarea.focus();

        // Move the cursor to the end of the text
        const { length } = textarea.value;

        if (length) {
          textarea.setSelectionRange(length, length);
        }
      }
    };

    const onSelectLinkedInStep = (data) => {
      state.selectedLinkedInStep = data.stepType;

      setTimeout(() => {
        if (selectedLinkedInActionDetails.value.supportsMessage) {
          focusTextarea();
        }
      }, 300);
    };

    const updateSubjectSelection = () => {
      const subjectInput = document.querySelector('.linkedin-subject input');

      if (!subjectInput) return;

      state.textSelection.subject = {
        start: subjectInput.selectionStart,
        end: subjectInput.selectionEnd,
      };
    };

    const insertSubjectVariable = (variable) => {
      const { start, end } = state.textSelection.subject;

      state.subject = state.subject.slice(0, start)
        + variable
        + state.subject.slice(end);

      requestAnimationFrame(() => {
        const subjectInput = document.querySelector('.linkedin-subject input');

        if (!subjectInput) return;

        subjectInput.focus();

        const pos = start + variable.length;

        subjectInput.setSelectionRange(pos, pos);

        state.textSelection.subject = {
          start: pos,
          end: pos,
        };
      });
    };

    const updateMessageSelection = () => {
      const textarea = document.querySelector('.linkedin-message textarea');

      if (!textarea) return;

      state.textSelection.message = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      };
    };

    const insertMessageVariable = (variable) => {
      const { start, end } = state.textSelection.message;

      state.message = state.message.slice(0, start)
        + variable
        + state.message.slice(end);

      requestAnimationFrame(() => {
        const textarea = document.querySelector('.linkedin-message textarea');

        if (!textarea) return;

        textarea.focus();

        const pos = start + variable.length;

        textarea.setSelectionRange(pos, pos);

        state.textSelection.message = {
          start: pos,
          end: pos,
        };
      });
    };

    const onAddVariableClick = (type) => {
      requestAnimationFrame(() => {
        state.showVariableMenu[type] = true;
      });
    };

    const createVariantJson = () => {
      const variantJson = {
        message: state.message,
        weight: 100,
      };

      if (selectedLinkedInActionDetails.value.supportsSubject) {
        variantJson.subject = state.subject;
      }

      return variantJson;
    };

    const onSaveWorkflowStep = () => {
      const isEditWorkflow = size(props.editWorkflowJson) > 0;

      const newStepJson = LINKEDIN_WORKFLOW_STEP_CATALOG[state.selectedLinkedInStep];

      // create new workflow step
      const workflowStepJson = isEditWorkflow
        ? {
          ...props.editWorkflowJson,
          step_type: state.selectedLinkedInStep,
        }
        : {
          ...newStepJson,
        };

      if (selectedLinkedInActionDetails.value.supportsMessage) {
        const variants = [createVariantJson()];

        if (isEditWorkflow) {
          workflowStepJson.variants = variants;
        } else {
          workflowStepJson.jsonSchema = {
            ...newStepJson.jsonSchema,
            variants,
          };
        }
      } else if (isEditWorkflow) {
        // delete variants if the step does not support message and is being edited
        workflowStepJson.variants = [];
      }

      if (isEditWorkflow) {
        // update existing workflow step
        workflowContext.updateWorkflowStep({
          step: workflowStepJson,
          conditionalWorkflowJson: props.conditionalWorkflowJson,
        });
      } else {
        // add new workflow step
        workflowContext.onAddNewStep({
          step: workflowStepJson,
          conditionalWorkflowJson: props.conditionalWorkflowJson,
        });
      }

      emit('closeStepModal');
    };

    // lifecycle hooks
    onMounted(() => {
      if (size(props.editWorkflowJson) > 0) {
        const { step_type, variants } = props.editWorkflowJson;

        //
        if (variants && variants.length > 0) {
          state.message = variants[0].message || '';
          state.subject = variants[0].subject || '';
        }

        onSelectLinkedInStep({ stepType: step_type });
      } else if (props.preSelectLinkedInStep) {
        onSelectLinkedInStep({ stepType: props.preSelectLinkedInStep });
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      variableMenuOptions,
      linkedInWorkflowSteps,
      selectedLinkedInActionDetails,

      // methods
      insertMessageVariable,
      updateMessageSelection,
      updateSubjectSelection,
      insertSubjectVariable,
      onAddVariableClick,
      onSelectLinkedInStep,
      onSaveWorkflowStep,
    };
  },
});
</script>

<style lang="scss" scoped>
.linkedin-step-card {
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
    display: flex;
    flex-direction: column;

    .linkedin-text {
      color: $black;
      font-size: 14px;
      margin-bottom: 12px;
    }

    .linkedin-actions-flex {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;

      padding-bottom: 32px;
      border-bottom: 1px solid $grey-50;

      .each-linkedin-action {
        border-radius: 8px;
        background: $white;
        border: 1px solid $grey-50;
        padding: 12px;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          padding: 8px;
        }

        .linkedin-action-content {
          gap: 8px;
          display: flex;
          align-items: center;

          .linkedin-action-text {
            font-size: 14px;
            font-weight: 400;
            color: $black;
          }
        }

        &.selected {
          border: 1px solid $primary;
          background: rgba(var(--primary-rgb), 0.05);
        }
      }
    }

    .linkedin-step-details {
      width: 100%;
      padding-top: 32px;

      display: flex;
      flex-direction: column;
      flex: 1;

      .action-sub-title-text {
        font-size: 14px;
        color: $black;
        font-weight: 600;
        margin-bottom: 4px;

        .optional-text {
          font-weight: 400;
        }
      }

      .action-desc-text {
        color: $grey;
        font-size: 13px;
        margin-bottom: 4px;
      }

      .message-container {
        display: flex;
        flex-direction: column;
        flex: 1;

        .variables-wrapper {
          width: 100%;
          display: flex;
          gap: 8px;

          padding-top: 16px;
          border-top: 1px solid $grey-50;

          // xs max
          @media (max-width: $breakpoint-xs-max) {
            padding-top: 12px;
          }

          .add-variables-btn {
            border-radius: 6px;
            border: 1px solid $grey-50;

            .variable-text {
              margin-left: 6px;
            }
          }
        }
      }

      :deep(.linkedin-subject) {
        width: 100%;
        margin: 8px 0px;

        .subject-text-input {
          font-size: 14px;
          color: $black;
        }

        .q-field__control {
          padding-right: 0px;
        }
      }

      :deep(.linkedin-message) {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow-y: auto;
        margin-bottom: 20px;

        @include custom-scrollbar;

        .q-field__inner,
        .q-field__control {
          height: unset;
          min-height: unset;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .q-field__bottom {
          position: absolute;
          bottom: 2px;
        }

        .textarea-input {
          display: flex;
          flex-direction: column;
          flex: 1;
          resize: none;
        }
      }
    }
  }
}
</style>
