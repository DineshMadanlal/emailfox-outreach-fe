<template>
  <q-card
    v-if="showSequenceEditor"
    flat class="sequence-editor-card"
  >
    <!-- Content Performance -->
    <q-dialog
      v-model="showContentPerformanceModal"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ContentPerformance
        :spamAnalysis="spamAnalysis"
        :spamResultJson="spamResultJson"
      />
    </q-dialog>

    <!-- header -->
    <div class="sequence-editor-header">
      <p class="header-name-text">
        {{ activeWorkflowJson.name }}
      </p>

      <p
        v-if="variantsLength > 1"
        class="variant-name-text"
      >
        Variant {{ activeVariantJson.label }}
      </p>

      <q-space />

      <div class="spam-analytics-side">
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
    </div>

    <!-- Subject here -->
    <div class="subject-container">
      <p class="subject-text">
        Subject
      </p>

      <AppEditor
        hideToolbar
        subjectEditor
        v-model="sequenceSubject"

        placeholderText="Enter your subject here..."
        class="sequence-subject-editor custom-scrollbar"
      />
    </div>

    <!-- content -->
    <AppEditor
      sequenceEditor
      class="sequence-app-editor"
      placeholderText="Enter your emai here..."

      v-model="sequenceHtml"

      @onDeleteVariant="$emit('onDeleteVariant')"
    />
  </q-card>
</template>

<script>
// vue
import {
  computed, defineAsyncComponent, defineComponent, onMounted, reactive, toRefs, watch,
} from 'vue';

// composables
import useSpamAnalytics from 'src/composables/spamAnalytics';

// Components
import ContentPerformance from 'components/CampaignWorkflow/Workflows/Modals/ContentPerformance.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { cleanEditorHtmlForSave } from 'src/utils/helperFunctions';

export default defineComponent({
  name: 'SequenceEditor',

  emits: ['update:onUpdateActiveVariant', 'onDeleteVariant'],

  components: {
    AppEditor: defineAsyncComponent(() => import('components/Editor/AppEditor.vue')),
    ContentPerformance,
  },

  props: {
    activeWorkflowJson: {
      type: Object,
      default: () => {},
    },
    activeVariantJson: {
      type: Object,
      default: () => {},
    },
  },

  setup(props, { emit }) {
    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      showSequenceEditor: false,
      showContentPerformanceModal: false,
    });

    // computed
    const variantsLength = computed(() => {
      const variants = props.activeWorkflowJson.variants || [];

      return variants.length;
    });

    const sequenceSubject = computed({
      get: () => props.activeVariantJson.subject || '',
      set: (value) => {
        emit('update:onUpdateActiveVariant', 'subject', value);
      },
    });

    const sequenceHtml = computed({
      get: () => props.activeVariantJson.body || '',
      set: (value) => {
        emit('update:onUpdateActiveVariant', 'body', cleanEditorHtmlForSave(value));
      },
    });

    // Pass it to the hook
    const spamResultJson = computed(() => useSpamAnalytics(sequenceHtml.value));

    const spamAnalysis = computed(() => spamResultJson.value?.spamAnalysis?.value);

    // lifecycle hooks
    onMounted(() => {
      // We need to show the editor only on the client side, because it uses window object
      state.showSequenceEditor = true;
    });

    watch(
      () => props.activeVariantJson.uid,
      (newUid, oldUid) => {
        if (newUid !== oldUid) {
          state.showSequenceEditor = false;

          //
          setTimeout(() => {
            state.showSequenceEditor = true;
          });
        }
      },
    );

    return {
      // state
      ...toRefs(state),

      // computed
      sequenceHtml,
      variantsLength,
      sequenceSubject,

      spamResultJson,
      spamAnalysis,
      isMobileDevice,
    };
  },
});
</script>

<style lang="scss" scoped>
.sequence-editor-card {
  width: 100%;
  background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.8);

  display: flex;
  flex-direction: column;
  padding: 4px;

  :deep(.app-editor) {
    flex: 1;
    display: flex;
    min-height: 0;
    background: $white;
    filter: drop-shadow(-2px -2px 15px rgba(184, 188, 196, 0.16));
  }

  .sequence-editor-header {
    width: 100%;
    display: flex;
    align-items: center;

    padding: 10px 12px;

    .header-name-text {
      color: $secondary;
      font-size: 14px;
      font-weight: 600;
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
  }

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
    .app-editor-toolbar-button {
      width: 30px;
      height: 30px;
    }
  }

  .spam-analytics-side {
    display: flex;
    align-items: center;

    gap: 12px;

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
</style>
