<template>
  <div class="flow-builder-section custom-scrollbar">
    <!-- Edit Webhook -->
    <q-dialog
      v-model="modals.showArchiveStepOrVariant"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ArchiveStepOrVariant
        :inputJson="modals.archiveStepJson"

        @onConfirmArchive="onUserConfirmArchiveStep"
      />
    </q-dialog>

    <!-- content -->
    <div class="flow-builder-content">
      <!-- API Loader -->
      <ApiLoader
        :show="ui.isFetchApiLoading"
      />

      <!-- empty workflow -->
      <div
        v-if="isWorkflowEmpty"
        class="empty-workflow-state"
      >
        <WorkflowEmptyState />
      </div>

      <!-- Vue Flow -->
      <VueFlow
        v-else
        :nodes="flowNodes"
        :edges="flowEdges"
        :node-types="nodeTypes"
        :fit-view-on-init="false"
        :min-zoom="0.35"
        :max-zoom="2"
        :default-viewport="{ x: 350, y: 48, zoom: 1 }"
        class="workflow-vueflow"
      >
        <!-- Controls -->
        <Controls position="bottom-right" />
      </VueFlow>
    </div>

    <!-- Edit Campaign Footer -->
    <div
      class="edit-sequence-footer"
      v-if="isEditCampaign"
    >
      <!-- Save Button -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        :loading="ui.isSaving"
        :label="footerButtonLabel"

        @click="onSubmitForm"
      />
    </div>

    <!-- Campaign By ID footer -->
    <div
      v-else-if="ui.hasChanges"
      class="campaign-by-id-footer"
    >
      <!-- Save Button -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Save Changes"
        :loading="ui.isSaving"

        @click="onSaveSequenceSteps"
      />
    </div>
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';

// vue
import {
  computed, defineComponent, markRaw, onBeforeUnmount, provide, reactive, watch,
  toRefs, getCurrentInstance, onMounted,
} from 'vue';

// vue router
import { useRouter } from 'vue-router';

// vue flow
import {
  MarkerType,
  Position,
  VueFlow,
  useVueFlow,
} from '@vue-flow/core';
// import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import WorkflowAddNode from 'components/CampaignWorkflow/VueFlowNodes/WorkflowAddNode.vue';
import WorkflowEmptyState from 'components/CampaignWorkflow/SequenceCanvas/WorkflowEmptyState.vue';
import WorkflowActionNode from 'components/CampaignWorkflow/VueFlowNodes/WorkflowActionNode.vue';
import WorkflowConditionNode from 'components/CampaignWorkflow/VueFlowNodes/WorkflowConditionNode.vue';

import ArchiveStepOrVariant from 'components/CampaignWorkflow/SequenceCanvas/Modals/ArchiveStepOrVariant.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Utils
import { getApiCall, postApiCall } from 'src/utils/apiRequests';
import { getBrandRgbColorByName, getBlendedHexFromRgba } from 'src/utils/quasarHelpers.js';

// Constants
import {
  WORKFLOW_BRANCH_CATALOG,
  WORKFLOW_BRANCH_KEYS,
  WORKFLOW_STEP_CATALOG,
  WORKFLOW_STEP_TYPES,
  WORKFLOW_CONDITION_CATALOG,
  CAMPAIGN_STATUS,
} from 'boot/campaign-constants';

// css imports
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';

//
const ARROW_GAP = 64;
const HORIZONTAL_GAP = 360;

// Base heights (in pixels) for your UI components
const HEIGHT_CONFIG = {
  EMAIL_ACTION: 180 / 1.25, // Base email step card height
  VARIANT_ROW: 48, // Height added per email variant row
  CONDITION: 160, // Height of condition card
  ADD_BUTTON: 48, // Height of '+' Add Step node
  OTHER_ACTION: 170, // Base height for other action types
};

export default defineComponent({
  name: 'FlowBuilder',

  emits: ['updateFormChanged'],

  components: {
    Controls,
    VueFlow,
    ApiLoader,
    WorkflowEmptyState,
    ArchiveStepOrVariant,
  },

  props: {
    campaignByIdJson: {
      type: Object,
      default: () => ({}),
    },
    formChanged: {
      type: Boolean,
      default: false,
    },
    isEditCampaign: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // router
    const $router = useRouter();

    // Composables
    const { isMobileDevice } = useAppHelpersApi();

    // app cntext
    const { appContext } = getCurrentInstance();

    // npm
    const {
      setCenter, findNode, dimensions, getViewport,
    } = useVueFlow();

    // state
    const state = reactive({
      workflow: {
        steps: [],
        archivedStepIds: [],
      },

      ui: {
        isSaving: false,
        hasChanges: false,
        isFetchApiLoading: false,
      },

      modals: {
        archiveStepJson: null,
        showArchiveStepOrVariant: false,
      },
    });

    // timer
    let autoSaveTimer = null;

    const nodeTypes = markRaw({
      actionNode: markRaw(WorkflowActionNode),
      addNode: markRaw(WorkflowAddNode),
      conditionNode: markRaw(WorkflowConditionNode),
    });

    const footerButtonLabel = computed(() => {
      if (state.ui.isSaving) {
        return 'Saving...';
      }

      if (state.ui.hasChanges) {
        return 'Save & Next';
      }

      return 'Next';
    });

    const isCampaignDrafted = computed(
      () => props.campaignByIdJson.status === CAMPAIGN_STATUS.DRAFTED.value,
    );

    // methods
    const getTempId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

    const getStepKey = (step, fallback) => {
      const rawKey = step?.id ?? step?._tempId ?? fallback;

      if (rawKey === undefined || rawKey === null || rawKey === '') {
        return null;
      }

      return String(rawKey);
    };

    const isSameStep = (leftStep, rightStep) => {
      const leftKey = getStepKey(leftStep);
      const rightKey = getStepKey(rightStep);

      return Boolean(leftKey && rightKey && leftKey === rightKey);
    };

    const isConditionNode = (step) => step?.step_type === WORKFLOW_STEP_TYPES.CONDITION;

    // methods
    const getCleanSteps = (steps) => steps.map((step) => {
      const { _tempId, ...rest } = step;
      const cleanedStep = { ...rest };

      if (isConditionNode(step)) {
        cleanedStep.branches = (step.branches || []).map((branch) => ({
          ...branch,
          steps: getCleanSteps(branch.steps || []),
        }));
      }

      return cleanedStep;
    });

    const centerSequence = async ({ nodeId, isFirstStep }) => {
      setTimeout(() => {
        const node = findNode(nodeId);
        if (!node) {
          return;
        }

        // 1. Calculate the center X coordinate of the node
        // If node.dimensions.width is not yet available, fallback to a default or 0
        const nodeWidth = node.dimensions?.width || 0;
        const targetX = node.position.x + nodeWidth / 2;

        let targetY;
        const currentViewport = getViewport();

        if (isFirstStep) {
          // Keep the current vertical position exactly where it is (Horizontal pan only)
          const containerHeight = dimensions.value.height;
          targetY = (containerHeight / 2 - currentViewport.y) / currentViewport.zoom;
        } else {
          // Center the node completely in the middle of the screen (Both X and Y)
          const nodeHeight = node.dimensions?.height || 0;
          targetY = node.position.y + nodeHeight / 2;
        }

        // 3. Smoothly pan horizontally
        setCenter(targetX, targetY, {
          duration: 250, // Animation duration in milliseconds
          zoom: 1, // Optional: Limit the zoom level during the pan
        });
      }, 100);
    };

    const updateStepRecursive = ({ steps, step }) => {
      if (!Array.isArray(steps)) {
        return false;
      }

      for (let index = 0; index < steps.length; index += 1) {
        const currentStep = steps[index];

        if (isSameStep(currentStep, step)) {
          steps[index] = {
            ...currentStep,
            ...step,
          };

          return true;
        }

        const branches = currentStep?.branches || [];

        for (let branchIndex = 0; branchIndex < branches.length; branchIndex += 1) {
          const branchSteps = branches[branchIndex]?.steps || [];
          const updated = updateStepRecursive({
            steps: branchSteps,
            step,
          });

          if (updated) {
            return true;
          }
        }
      }

      return false;
    };

    const saveWorkflowStepsFromApi = (responseSteps) => {
      state.workflow.steps = [];

      // for loop response
      responseSteps.forEach((step) => {
        if (isConditionNode(step)) {
          step.branches = step.branches || [];
        }

        //
        state.workflow.steps.push(step);
      });

      // archive step ids
      state.workflow.archivedStepIds = [];
    };

    const getStepsByCampaignId = async () => {
      try {
        state.ui.isFetchApiLoading = true;

        //
        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: `/sequences/${props.campaignByIdJson.id}/steps`,
        });

        if (!response || !Array.isArray(response)) {
          throw new Error('Invalid response from API');
        }

        //
        if (response?.length > 0) {
          //
          saveWorkflowStepsFromApi(response);

          // center the vue flow
          const nodeId = getStepKey(response[0]);

          // center sequence
          centerSequence({
            nodeId,
            isFirstStep: true,
          });
        }
      } catch (error) {
        // show error warning
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        //
        setTimeout(() => {
          state.ui.hasChanges = false;
        }, 500);

        state.ui.isFetchApiLoading = false;
      }
    };

    const onSaveSteps = async () => {
      try {
        state.ui.isSaving = true;

        const workflowSnapshot = cloneDeep(state.workflow);

        // remove _tempId from steps before sending to API
        const cleanSteps = getCleanSteps(workflowSnapshot.steps);

        const payload = {
          steps: cleanSteps,
          archived_steps_id: state.workflow.archivedStepIds || [],
        };

        // API call to save steps
        const response = await postApiCall({
          includeWorkspace: true,
          endpoint: `/sequences/${props.campaignByIdJson.id}/steps`,
          payload,
        });

        //
        if (response.length) {
          //
          saveWorkflowStepsFromApi(response);

          //
          setTimeout(() => {
            state.ui.hasChanges = false;

            if (props.isEditCampaign) {
              // move to the contacts step
              $router.push(`/outreach/campaigns/${props.campaignByIdJson.id}/edit/contacts`);
            }
          }, 500);
        }
      } catch (error) {
        // show error warning
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.ui.isSaving = false;
      }
    };

    const scheduleAutoSave = () => {
      state.ui.hasChanges = true;

      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      // auto save logic
      autoSaveTimer = setTimeout(() => {
        // const workflowSnapshot = cloneDeep(state.workflow);

        // state.ui.isSaving = true;

        // state.ui.isSaving = false;
        // state.ui.hasChanges = false;
      }, 500);
    };

    const findConditionalBranchIndex = (branches, branchKey) => branches.findIndex(
      (branch) => branch.branch_key === branchKey,
    );

    const addStepToBranchRecursive = ({ steps, conditionalWorkflowJson, newStepJson }) => {
      if (!Array.isArray(steps) || isEmpty(conditionalWorkflowJson)) {
        return false;
      }

      for (let index = 0; index < steps.length; index += 1) {
        const currentStep = steps[index];

        if (
          getStepKey(currentStep) === conditionalWorkflowJson.parentWorkflowId
          && isConditionNode(currentStep)
        ) {
          const branches = currentStep.branches || [];
          const branchIndex = findConditionalBranchIndex(
            branches,
            conditionalWorkflowJson.branchKey,
          );

          if (branchIndex === -1) {
            return false;
          }

          branches[branchIndex].steps = [
            ...(branches[branchIndex].steps || []),
            newStepJson,
          ];

          currentStep.branches = branches;
          return true;
        }

        const branches = currentStep?.branches || [];

        for (let branchIndex = 0; branchIndex < branches.length; branchIndex += 1) {
          const branchSteps = branches[branchIndex]?.steps || [];
          const added = addStepToBranchRecursive({
            steps: branchSteps,
            conditionalWorkflowJson,
            newStepJson,
          });

          if (added) {
            return true;
          }
        }
      }

      return false;
    };

    const removeStepRecursive = ({ steps, step }) => {
      if (!Array.isArray(steps)) {
        return false;
      }

      for (let index = 0; index < steps.length; index += 1) {
        const currentStep = steps[index];

        if (isSameStep(currentStep, step)) {
          steps.splice(index, 1);
          return true;
        }

        const branches = currentStep?.branches || [];

        for (let branchIndex = 0; branchIndex < branches.length; branchIndex += 1) {
          const branchSteps = branches[branchIndex]?.steps || [];
          const removed = removeStepRecursive({
            steps: branchSteps,
            step,
          });

          if (removed) {
            return true;
          }
        }
      }

      return false;
    };

    const onAddNewBranchStepsForCondition = ({ conditionalWorkflowJson, newStepJson }) => {
      addStepToBranchRecursive({
        steps: state.workflow.steps,
        conditionalWorkflowJson,
        newStepJson,
      });
    };

    const onAddNewStep = ({ step, conditionalWorkflowJson }) => {
      const jsonSchema = cloneDeep(step.jsonSchema || {});
      const isFirstStep = state.workflow.steps.length === 0;

      if (isFirstStep) {
        jsonSchema.delay_value = 0;
      }

      const _tempId = getTempId();

      const newStepJson = {
        _tempId,
        step_type: step.stepType || null,
        ...jsonSchema,
      };

      if (isEmpty(conditionalWorkflowJson)) {
        state.workflow.steps.push(newStepJson);
      } else {
        onAddNewBranchStepsForCondition({
          conditionalWorkflowJson,
          newStepJson,
        });
      }

      // center sequence on the newly added step
      const nodeId = getStepKey({
        _tempId,
      });

      centerSequence({
        nodeId,
        isFirstStep,
      });

      scheduleAutoSave();
    };

    const onAddNewCondition = ({ step, conditionalWorkflowJson }) => {
      const newStepJson = {
        _tempId: getTempId(),
        ...cloneDeep(step),
      };

      if (isEmpty(conditionalWorkflowJson)) {
        state.workflow.steps.push(newStepJson);
      } else {
        onAddNewBranchStepsForCondition({
          conditionalWorkflowJson,
          newStepJson,
        });
      }

      scheduleAutoSave();
    };

    const updateWorkflowStep = ({ step }) => {
      const updated = updateStepRecursive({
        steps: state.workflow.steps,
        step,
      });

      if (updated) {
        scheduleAutoSave();
      }
    };

    const removeWorkflowStep = (stepJson) => {
      const removed = removeStepRecursive({
        steps: state.workflow.steps,
        step: stepJson,
      });

      if (removed) {
        scheduleAutoSave();
      }
    };

    const onUserConfirmArchiveStep = (stepJson) => {
      state.workflow.archivedStepIds.push(stepJson.id);
      removeWorkflowStep(stepJson);

      state.modals.archiveStepJson = null;
      state.modals.showArchiveStepOrVariant = false;
    };

    const archiveWorkflowStep = (stepJson) => {
      if (stepJson?.id) {
        if (isCampaignDrafted.value) {
          onUserConfirmArchiveStep(stepJson);
        } else {
          state.modals.archiveStepJson = stepJson;
          state.modals.showArchiveStepOrVariant = true;
        }
      } else {
        removeWorkflowStep(stepJson);
      }
    };

    // Helper to calculate exact dynamic height based on step content
    const getNodeHeight = (step) => {
      if (isConditionNode(step)) {
        return HEIGHT_CONFIG.CONDITION;
      }

      // 2. Email Steps (Dynamic height based on actual variants)
      if (step.step_type === WORKFLOW_STEP_TYPES.EMAIL) {
        const variants = step?.variants || [];
        const variantCount = variants.length;

        // A single variant email step (Variant A + "New Variant" button) is the baseline
        const extraVariants = Math.max(0, variantCount);

        return HEIGHT_CONFIG.EMAIL_ACTION + (extraVariants * HEIGHT_CONFIG.VARIANT_ROW);
      }

      return HEIGHT_CONFIG.OTHER_ACTION;
    };

    const getNodeMeta = (step) => {
      if (step?.step_type === WORKFLOW_STEP_TYPES.CONDITION) {
        const conditionCatalog = WORKFLOW_CONDITION_CATALOG[step.condition_type];

        return {
          icon: 'condition',
          theme: 'tertiary',
          title: 'Condition',
          description: conditionCatalog.description,
        };
      }

      const catalog = WORKFLOW_STEP_CATALOG[step?.step_type] || {};

      return {
        icon: catalog.icon,
        theme: catalog.theme,
        title: catalog.title,
        category: catalog.category,
        description: catalog.description,
      };
    };

    const createEdge = ({
      source,
      target,
      sourceHandle,
      label,
      edgeId,
    }) => {
      const grey100Colors = `${getBrandRgbColorByName('grey-100')}`;

      const edgeJson = {
        id: edgeId,
        source,
        target,
        sourceHandle,
        targetHandle: null,
        animated: false,
        type: 'step',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        label,
        style: {
          stroke: `rgba(${grey100Colors}, 1)`,
          strokeWidth: 1.2,
        },
      };

      if (label) {
        if (label === WORKFLOW_BRANCH_CATALOG[WORKFLOW_BRANCH_KEYS.NOT_ACCEPTED].label) {
          const negativeColor = `${getBrandRgbColorByName('negative')}`;
          const hexColor = getBlendedHexFromRgba(`rgba(${negativeColor}, 0.1)`);

          // negative
          edgeJson.labelStyle = {
            fontWeight: 400,
            fontSize: 13,
            fill: `rgba(${negativeColor}, 1)`,
          };
          edgeJson.labelBgPadding = [8, 2];
          edgeJson.labelBgBorderRadius = 4;
          edgeJson.labelBgStyle = {
            fill: hexColor,
          };
        } else if (label === WORKFLOW_BRANCH_CATALOG[WORKFLOW_BRANCH_KEYS.ACCEPTED].label) {
          const positiveColor = `${getBrandRgbColorByName('positive')}`;
          const hexColor = getBlendedHexFromRgba(`rgba(${positiveColor}, 0.1)`);

          // positive
          edgeJson.labelStyle = {
            fontWeight: 400,
            fontSize: 13,
            fill: `rgba(${positiveColor}, 1)`,
          };
          edgeJson.labelBgPadding = [8, 2];
          edgeJson.labelBgBorderRadius = 4;
          edgeJson.labelBgStyle = {
            fill: hexColor,
          };
        }
      }

      return edgeJson;
    };

    const buildGraph = (steps) => {
      const nodes = [];
      const edges = [];

      const walk = ({
        inputSteps,
        x,
        startY,
        parentNodeId,
        parentEdgeLabel,
        parentSourceHandle,
        conditionalWorkflowJson,
        path,
      }) => {
        let y = startY;
        let previousId = parentNodeId || null;
        let previousSourceHandle = parentSourceHandle || null;
        let pendingLabel = parentEdgeLabel || null;
        let lastNodeWasCondition = false;

        for (let index = 0; index < inputSteps.length; index += 1) {
          const step = inputSteps[index];
          const stepPath = [...path, index];
          const nodeId = getStepKey(step, `wf-${stepPath.join('-')}`);
          const nodeMeta = getNodeMeta(step);
          const condition = isConditionNode(step);

          // 1. Calculate dynamic height for the CURRENT node
          const currentNodeHeight = getNodeHeight(step);

          nodes.push({
            id: nodeId,
            type: condition ? 'conditionNode' : 'actionNode',
            position: {
              x,
              y,
            },
            sourcePosition: condition ? Position.Right : Position.Bottom,
            targetPosition: Position.Top,
            draggable: false,
            selectable: true,
            data: {
              ...nodeMeta,
              isFirstStep: !previousId,
              conditionalWorkflowJson: conditionalWorkflowJson || {},
              step,
            },
          });

          if (previousId) {
            edges.push(createEdge({
              source: previousId,
              target: nodeId,
              sourceHandle: previousSourceHandle,
              label: pendingLabel,
              edgeId: `edge-${previousId}-${nodeId}`,
            }));

            pendingLabel = null;
            previousSourceHandle = null;
          }

          if (condition) {
            const branches = step?.branches || [];
            const acceptedBranch = branches.find(
              (branch) => branch.branch_key === WORKFLOW_BRANCH_KEYS.ACCEPTED,
            ) || { steps: [] };
            const notAcceptedBranch = branches.find(
              (branch) => branch.branch_key === WORKFLOW_BRANCH_KEYS.NOT_ACCEPTED,
            ) || { steps: [] };

            // 2. Start child branches AFTER the condition card's height + ARROW_GAP
            const branchStartY = y + currentNodeHeight + ARROW_GAP;
            let acceptedEndY = branchStartY;
            let notAcceptedEndY = branchStartY;

            if ((notAcceptedBranch.steps || []).length > 0) {
              const leftBranch = walk({
                inputSteps: notAcceptedBranch.steps,
                x: x - HORIZONTAL_GAP,
                startY: branchStartY,
                parentNodeId: nodeId,
                parentEdgeLabel: WORKFLOW_BRANCH_CATALOG[WORKFLOW_BRANCH_KEYS.NOT_ACCEPTED].label,
                parentSourceHandle: 'notAccepted',
                conditionalWorkflowJson: {
                  parentWorkflowId: nodeId,
                  branchKey: WORKFLOW_BRANCH_KEYS.NOT_ACCEPTED,
                },
                path: [...stepPath, WORKFLOW_BRANCH_KEYS.NOT_ACCEPTED],
              });

              notAcceptedEndY = leftBranch.endY;
            } else {
              const emptyLeftId = `${nodeId}-notAccepted-empty`;
              nodes.push({
                id: emptyLeftId,
                type: 'addNode',
                position: {
                  x: x - HORIZONTAL_GAP,
                  y: branchStartY,
                },
                sourcePosition: Position.Bottom,
                targetPosition: Position.Top,
                draggable: false,
                selectable: false,
                data: {
                  conditionalWorkflowJson: {
                    parentWorkflowId: nodeId,
                    branchKey: WORKFLOW_BRANCH_KEYS.NOT_ACCEPTED,
                  },
                },
              });

              edges.push(createEdge({
                source: nodeId,
                target: emptyLeftId,
                sourceHandle: 'notAccepted',
                label: WORKFLOW_BRANCH_CATALOG[WORKFLOW_BRANCH_KEYS.NOT_ACCEPTED].label,
                edgeId: `edge-${nodeId}-${emptyLeftId}`,
              }));

              notAcceptedEndY = branchStartY + HEIGHT_CONFIG.ADD_BUTTON;
            }

            if ((acceptedBranch.steps || []).length > 0) {
              const rightBranch = walk({
                inputSteps: acceptedBranch.steps,
                x: x + HORIZONTAL_GAP,
                startY: branchStartY,
                parentNodeId: nodeId,
                parentEdgeLabel: WORKFLOW_BRANCH_CATALOG[WORKFLOW_BRANCH_KEYS.ACCEPTED].label,
                parentSourceHandle: 'accepted',
                conditionalWorkflowJson: {
                  parentWorkflowId: nodeId,
                  branchKey: WORKFLOW_BRANCH_KEYS.ACCEPTED,
                },
                path: [...stepPath, WORKFLOW_BRANCH_KEYS.ACCEPTED],
              });

              acceptedEndY = rightBranch.endY;
            } else {
              const emptyRightId = `${nodeId}-accepted-empty`;
              nodes.push({
                id: emptyRightId,
                type: 'addNode',
                position: {
                  x: x + HORIZONTAL_GAP,
                  y: branchStartY,
                },
                sourcePosition: Position.Bottom,
                targetPosition: Position.Top,
                draggable: false,
                selectable: false,
                data: {
                  conditionalWorkflowJson: {
                    parentWorkflowId: nodeId,
                    branchKey: WORKFLOW_BRANCH_KEYS.ACCEPTED,
                  },
                },
              });

              edges.push(createEdge({
                source: nodeId,
                target: emptyRightId,
                sourceHandle: 'accepted',
                label: WORKFLOW_BRANCH_CATALOG[WORKFLOW_BRANCH_KEYS.ACCEPTED].label,
                edgeId: `edge-${nodeId}-${emptyRightId}`,
              }));

              acceptedEndY = branchStartY + HEIGHT_CONFIG.ADD_BUTTON;
            }

            // 3. Next Y position after condition branches finish
            y = Math.max(notAcceptedEndY, acceptedEndY) + ARROW_GAP;
            previousSourceHandle = 'next';
            lastNodeWasCondition = true;
          } else {
            // 4. Regular Action step: Advance Y by current node height + ARROW_GAP
            y += currentNodeHeight + ARROW_GAP;
            previousSourceHandle = null;
            lastNodeWasCondition = false;
          }

          previousId = nodeId;
        }

        if (previousId && !lastNodeWasCondition) {
          const addNodeId = `${path.join('-')}-add-${previousId}`;

          nodes.push({
            id: addNodeId,
            type: 'addNode',
            position: {
              x,
              y,
            },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            draggable: false,
            selectable: false,
            data: {
              conditionalWorkflowJson: conditionalWorkflowJson || {},
            },
          });

          edges.push(createEdge({
            source: previousId,
            target: addNodeId,
            sourceHandle: previousSourceHandle,
            label: null,
            edgeId: `edge-${previousId}-${addNodeId}`,
          }));

          y += HEIGHT_CONFIG.ADD_BUTTON + ARROW_GAP;
        }

        return {
          endY: y,
        };
      };

      walk({
        inputSteps: steps || [],
        x: 0,
        startY: 0,
        parentNodeId: null,
        parentEdgeLabel: null,
        parentSourceHandle: null,
        conditionalWorkflowJson: {},
        path: ['root'],
      });

      if (nodes.length === 0) {
        nodes.push({
          id: 'empty-root',
          type: 'addNode',
          position: {
            x: 0,
            y: 0,
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          draggable: false,
          selectable: false,
          data: {
            conditionalWorkflowJson: {},
          },
        });
      }

      return {
        nodes,
        edges,
      };
    };

    // computed
    const flowGraph = computed(() => buildGraph(state.workflow.steps));
    const isWorkflowEmpty = computed(() => isEmpty(state.workflow.steps));

    const flowNodes = computed(() => flowGraph.value.nodes);
    const flowEdges = computed(() => flowGraph.value.edges);

    const onSubmitForm = () => {
      if (state.ui.hasChanges) {
        // API call to save steps
        onSaveSteps();
      } else {
        // route to contacts step
        $router.push(`/outreach/campaigns/${props.campaignByIdJson.id}/edit/contacts`);
      }
    };

    const onSaveSequenceSteps = () => {
      onSaveSteps();
    };

    // lifecycle hooks
    onMounted(() => {
      getStepsByCampaignId();
    });

    // watchers
    watch(
      () => state.workflow,
      () => {
        //
        scheduleAutoSave();
      },
      { deep: true },
    );

    watch(
      () => state.ui.hasChanges,
      (newVal) => {
        emit('updateFormChanged', newVal);
      },
    );

    // before unmount
    onBeforeUnmount(() => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    });

    //
    const workflowContext = {
      // computed
      isCampaignDrafted,

      // methods
      onAddNewStep,
      onAddNewCondition,
      updateWorkflowStep,
      archiveWorkflowStep,
    };

    provide('workflowContext', workflowContext);

    return {
      // state
      ...toRefs(state),

      // computed
      flowEdges,
      flowNodes,
      nodeTypes,
      isMobileDevice,
      isWorkflowEmpty,
      footerButtonLabel,

      // methods
      onSubmitForm,
      onSaveSequenceSteps,
      onUserConfirmArchiveStep,
    };
  },
});
</script>

<style lang="scss" scoped>
.flow-builder-section {
  width: 100%;
  min-height: 0;
  flex: 1;

  display: flex;
  flex-direction: column;

  background-size: 28px 28px;
  background-color: rgba(var(--primary-rgb), 0.03);
  background-image: radial-gradient($grey-100 1px, transparent 1px);

  overflow-y: auto;

  // content
  .flow-builder-content {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: 24px 12px;
    position: relative;

    .empty-workflow-state {
      width: 100%;
      min-height: 560px;
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
    }

    .workflow-vueflow {
      height: 100%;
      min-height: 200px;

      :deep(.vue-flow__node) {
        padding: 0;
        border: none;
        box-shadow: none;
        background: transparent;
      }

      :deep(.vue-flow__edge-path) {
        stroke: $grey-200;
        stroke-width: 1;
      }
    }
  }

  .campaign-by-id-footer {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;

    position: sticky;
    bottom: 0px;
    z-index: 3;
    background: $white;

    padding: 20px 16px;
    border-top: 1px solid $grey-50;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 12px 16px;
    }
  }
}
</style>
