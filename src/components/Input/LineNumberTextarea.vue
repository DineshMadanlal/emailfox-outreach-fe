<template>
  <!-- Textarea -->
  <q-input
    dense
    outlined
    autogrow
    hide-bottom-space
    v-model="internalValue"

    v-bind="$attrs"

    type="textarea"
    class="line-number-textarea"
  >
    <template v-slot:prepend>
      <div
        class="line-numbers"
      >
        <p
          v-for="n in lineCount"
          :key="`line-count-${n}`"
          class="line-number-text"
        >
          {{ n }}
        </p>
      </div>
    </template>
  </q-input>
</template>

<script>
// vue
import {
  defineComponent, reactive, onMounted, toRefs, computed,
} from 'vue';

export default defineComponent({
  name: 'LineNumberTextarea',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  props: {
    modelValue: {
      type: String,
      default: () => '',
    },
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      lineCount: 14,
    });

    // methods
    const updateLineCount = (modelValue) => {
      state.lineCount = modelValue?.split('\n').length || 1;
    };

    // Local state to manage the selected options
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        updateLineCount(value);
        emit('update:modelValue', value);
      },
    });

    onMounted(() => {
      if (props.modelValue) {
        updateLineCount(props.modelValue);
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      internalValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.line-number-textarea {
  width: 100%;
  font-size: 14px;

  :deep(.q-field__control) {
    padding-left: 0px;
  }

  :deep(.q-field__prepend) {
    height: unset;
    padding-right: 0;
    align-items: baseline;
    background: rgba($color: var(--grey-50-rgb), $alpha: 0.4);

    .line-numbers {
      padding: 10px 12px 12px 12px;

      .line-number-text {
        color: $grey;
        font-size: 10px;
        font-weight: 400;
        line-height: 16px; /* 160% */

        margin-top: 2px;
      }
    }
  }

  :deep(.q-field__native) {
    padding-left: 12px;
    min-height: 220px;
  }
}
</style>
