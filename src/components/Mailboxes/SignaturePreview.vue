<template>
  <div class="signature-preview">
    <!--  -->
    <p class="preview-text">
      Preview:
    </p>

    <!--  -->
    <div class="editor-container">
      <!-- Editor -->
      <AppEditor
        :isEditable="false"
        :modelValue="handleBarSignature"

        v-if="handleBarSignature"
      />

      <div
        v-else
        class="placeholder-text"
      >
        {{ placeholderText }}
      </div>
    </div>
  </div>
</template>
<script>
// vue
import { defineComponent, defineAsyncComponent, computed } from 'vue';

export default defineComponent({
  name: 'SignaturePreview',

  components: {
    AppEditor: defineAsyncComponent(() => import('components/Editor/AppEditor.vue')),
  },

  props: {
    signatureHtml: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const placeholderText = computed(() => {
      if (!props.signatureHtml) {
        return 'Your signature preview will appear here..';
      }
      return '';
    });

    const handleBarSignature = computed(() => {
      if (!props.signatureHtml) {
        return '';
      }

      // variables value
      const variablesMap = {
        '{{sender_firstname}}': 'John',
        '{{sender_lastname}}': 'Doe',
        '{{sender_email}}': 'john.doe@example.com',
      };

      // replace variables with sample values for preview
      let previewSignature = props.signatureHtml;
      Object.entries(variablesMap).forEach(([variable, value]) => {
        const regex = new RegExp(variable, 'g');
        previewSignature = previewSignature.replace(regex, value);
      });

      return previewSignature;
    });

    return {
      // computed
      placeholderText,
      handleBarSignature,
    };
  },
});
</script>

<style lang="scss" scoped>
.signature-preview {
  width: 100%;
  margin-top: 20px;

  .preview-text {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .placeholder-text {
    padding: 20px;
    min-height: 168px;
    color: $grey;
    background: rgba(var(--grey-50-rgb), 0.5);
  }

  .editor-container {
    border-radius: 4px;
    border: 1px solid $grey-50;

    :deep(.app-editor-container) {
      padding: 20px;
      background: rgba(var(--grey-50-rgb), 0.5);
    }
  }
}
</style>
