<template>
  <div class="signature-editor">
    <div class="signature-variables">
      <p
        class="signature-text"
        v-if="showSignatureText"
      >
        Signature
      </p>

      <q-space />

      <q-item
        v-for="variable in senderVariables"
        :key="`variable-${variable.value}`"
        class="variable-item"
        clickable

        @mousedown.prevent="onInsertVariable(variable.value)"
      >
        <!--  -->
        <div class="variable-label">
          +{{ variable.label }}
        </div>
      </q-item>
    </div>

    <!-- Editro container -->
    <div class="editor-container">
      <AppEditor

        v-model="computedSignature"
        :autofocusEditor="autofocusEditor"
        :placeholderText="placeholderText"

        ref="appEditorRef"
      />
    </div>
  </div>
</template>
<script>
// vue
import {
  defineComponent, computed, defineAsyncComponent, reactive, toRefs,
} from 'vue';

// utils
import { cleanEditorHtmlForSave } from 'src/utils/helperFunctions';

// constants
import { SENDER_VARIABLES } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'SignatureEditor',

  components: {
    AppEditor: defineAsyncComponent(() => import('components/Editor/AppEditor.vue')),
  },

  props: {
    showSignatureText: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      default: '',
    },
    autofocusEditor: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    // state
    const state = reactive({
      appEditorRef: null,
    });

    // computed
    const senderVariables = SENDER_VARIABLES.filter(
      ({ value }) => value !== 'sender_signature',
    );

    const computedSignature = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', cleanEditorHtmlForSave(value));
      },
    });

    const placeholderText = computed(() => {
      if (!props.modelValue) {
        return 'Best Regards, <br> {{sender_name}}, <br> {{sender_email}} <br> Company Name | Website';
      }
      return '';
    });

    // methods
    const onInsertVariable = (value) => {
      const variableText = `{{${value}}}`;
      const editorInstance = state.appEditorRef?.editorInstance;

      if (editorInstance) {
        editorInstance.events?.focus();
        editorInstance.selection?.restore();

        editorInstance?.html?.insert(variableText);

        editorInstance.selection?.save();
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      placeholderText,
      senderVariables,
      computedSignature,

      // methods
      onInsertVariable,
    };
  },
});
</script>

<style lang="scss" scoped>
.signature-editor {
  width: 100%;
  border-radius: 4px;

  .signature-variables {
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 8px;

    .signature-text {
      font-size: 14px;
      font-weight: 600;
    }

    .variable-item {
      padding: 2px;
      border-radius: 4px;
      min-height: unset;
      border: 1px solid $primary;
      background: rgba(var(--primary-rgb), 0.1);

      .variable-label {
        font-size: 12px;
        color: $primary;
      }
    }
  }

  .editor-container {
    width: 100%;
    border-radius: 4px;
    border: 1px solid $grey-50;
    background: $white;

    :deep(.app-editor-container) {
      min-height: 170px;
      border-radius: 4px;
    }
  }
}
</style>
