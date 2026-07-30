<template>
  <q-card
    flat
    class="email-step-card app-modal-card"
  >
    <!-- Content Performance -->
    <q-dialog
      v-model="showContentPerformanceModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ContentPerformance
        :spamAnalysis="spamAnalysis"
        :spamResultJson="spamResultJson"
      />
    </q-dialog>

    <!-- header -->
    <div class="app-modal-header">
      <!-- header text -->
      <h4 class="modal-header-text">
        Email
      </h4>

      <p
        class="variant-name-text"
      >
        Variant {{ SEQUENCE_VARIANT_NAME[vIndex + 1] }}
      </p>

      <q-space />

      <div
        class="spam-analytics-side"
      >
        <!-- Words -->
        <q-item
          clickable
          class="each-spam-section"

          @click="showContentPerformanceModal = true"
        >
          <div class="flex no-wrap items-center">
            <div class="count-label-text char-text">
              {{ spamResultJson.wordCount }}
            </div>

            <div class="desc-label-text">
              {{ $pluralize('Word', spamResultJson.wordCount) }}
            </div>
          </div>
        </q-item>

        <div class="space-bordered" />

        <!-- Spam words -->
        <q-item
          clickable
          class="each-spam-section"

          @click="showContentPerformanceModal = true"
        >
          <div class="flex no-wrap items-center">
            <div class="count-label-text spam-text">
              {{ spamAnalysis.totalSpamWords }}
            </div>

            <div class="desc-label-text">
              {{ $pluralize('Spam word', spamAnalysis.totalSpamWords) }}
            </div>
          </div>
        </q-item>

        <div class="space-bordered" />

        <!-- Spam Score -->
        <q-item
          clickable
          class="each-spam-section"

          @click="showContentPerformanceModal = true"
        >
          <div class="flex no-wrap items-center">

            <LocalSvgIcon
              image="spam-score"
            />

            <div class="desc-label-text">
              Spam Score
            </div>
          </div>
        </q-item>
      </div>

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
      <!-- Subject here -->
      <div class="subject-container">
        <p class="subject-text">
          Subject
        </p>

        <AppEditor
          hideToolbar
          subjectEditor
          v-model="subject"

          placeholderText="Enter your subject here..."
          class="sequence-subject-editor custom-scrollbar"
        />
      </div>

      <!-- HTML -->
      <AppEditor
        sequenceEditor
        class="sequence-app-editor"
        placeholderText="Enter your emai here..."

        v-model="message"
      />
    </div>

    <!-- footer -->
    <div class="app-modal-footer">
      <q-btn
        no-caps
        unelevated
        :loading="isApiLoading"

        color="primary"
        label="Save"

        @click="onSaveEmailStep"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, onMounted, computed,
  defineAsyncComponent, inject,
} from 'vue';

// Components
import ContentPerformance from 'components/CampaignWorkflow/Workflows/Modals/ContentPerformance.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';
import useSpamAnalytics from 'src/composables/spamAnalytics';

// constants
import { SEQUENCE_VARIANT_NAME } from 'boot/campaign-constants';

export default defineComponent({
  name: 'EmailStep',

  emits: ['closeModal'],

  components: {
    ContentPerformance,
    AppEditor: defineAsyncComponent(() => import('components/Editor/AppEditor.vue')),
  },

  props: {
    workflow: {
      type: Object,
      default: () => ({}),
    },
    vIndex: {
      type: Number,
      default: 0,
    },
    emailVariants: {
      type: Array,
      default: () => [],
    },
  },

  setup(props, { emit }) {
    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // inject
    const workflowContext = inject('workflowContext');

    // state
    const state = reactive({
      isApiLoading: false,

      subject: '',
      message: '',
      showSequenceEditor: false,

      // modal
      showContentPerformanceModal: false,
    });

    // Pass it to the hook
    const spamResultJson = computed(() => useSpamAnalytics(state.message));
    const spamAnalysis = computed(() => spamResultJson.value?.spamAnalysis?.value);

    // methods
    const onSaveEmailStep = () => {
      const updatedVariantJson = {
        subject: state.subject,
        message: state.message,
      };

      //
      const currentWorkflowJson = { ...props.workflow };

      const updatedEmailVariants = [...props.emailVariants];
      updatedEmailVariants[props.vIndex] = updatedVariantJson;

      const updatedWorkflowJson = {
        ...currentWorkflowJson,
        step: {
          ...currentWorkflowJson.step,
          variants: updatedEmailVariants,
        },
      };

      //
      workflowContext.updateWorkflowStep(updatedWorkflowJson);

      emit('closeModal');
    };

    // life cycle hooks
    onMounted(() => {
      // any initialization logic can go here
      state.showSequenceEditor = true;

      const currentVariant = props.emailVariants[props.vIndex] || {};

      state.subject = currentVariant.subject || '';
      state.message = currentVariant.message || '';
    });

    return {
      // state
      ...toRefs(state),

      // computed
      spamResultJson,
      spamAnalysis,
      isMobileDevice,

      // methods
      onSaveEmailStep,

      // constants
      SEQUENCE_VARIANT_NAME,
    };
  },
});
</script>

<style lang="scss" scoped>
.email-step-card {
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

  @media (min-width: 601px) and (max-width: 845px) {
    // For medium screens, we can set a specific width or use a percentage
    width: calc(100vw - 32px);
  }

  .app-modal-header {
    background: $grey-50;
    height: $modalHeaderHeight;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      height: auto;
      flex-wrap: wrap;
    }

    .variant-name-text {
      margin-left: 6px;

      border-radius: 4px;
      border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.2);
      background: $white;

      padding: 0px 6px;

      color: $grey;
      text-align: center;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px; /* 142.857% */

      width: fit-content;
    }

    .spam-analytics-side {
      display: flex;
      align-items: center;

      gap: 12px;
      margin-right: 12px;

      @media (max-width: $breakpoint-xs-max) {
        margin-right: 0px;
        margin-top: 12px;
        order: 2;
      }

      .space-bordered {
        height: 20px;
        width: 1px;
        border-left: 1px solid $grey-100;
      }

      .each-spam-section {
        min-height: unset;
        padding: 3px;
        border-radius: 4px;

        .count-label-text {
          display: flex;
          height: 20px;
          min-width: 17px;
          padding: 0 4px;
          justify-content: center;
          align-items: center;
          border-radius: 40px;

          color: $white;
          line-height: 20px;

          &.char-text {
            background-color: $grey-400;
          }

          &.spam-text {
            background-color: $warning;
          }
        }

        .desc-label-text {
          margin-left: 6px;
        }
      }
    }
  }

  .app-modal-content {
    flex: 1;
    padding: 0px;
    display: flex;
    flex-direction: column;

    // subject
    .subject-container {
      display: flex;
      padding: 4px 20px;
      align-items: center;
      background: $white;
      border-bottom: 1px solid $grey-50;
      gap: 16px;

      .subject-text {
        color: $grey;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 20px; /* 142.857% */
      }

      :deep(.sequence-subject-editor) {
        flex: unset;
        min-height: unset;

        .email-editor-content {
          min-height: unset;
          height: 40px;
          overflow-y: auto;
          padding: 8px 0px;

          .fr-wrapper {
            border-radius: 0;
          }

          .fr-element {
            padding: 0;
            min-height: unset;
          }
        }
      }
    }

    :deep(.sequence-app-editor) {
      flex: 1;

      .app-editor-toolbar-button {
        width: 30px;
        height: 30px;
      }
    }
  }
}
</style>
