<template>
  <q-toggle
    dense
    left-label

    color="primary"
    checked-icon="check"
    unchecked-icon="clear"
    class="toggle-input"

    v-model="internalModelValue"
    :label="internalModelValue ? 'Enabled' : 'Disabled'"
  />
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ToggleInput',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // computed
    const internalModelValue = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });

    return {
      // computed
      internalModelValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.toggle-input {
  height: fit-content;

  // aria-checked
  &[aria-checked='true'] {
    :deep(.q-toggle__label) {
      color: $primary;
      font-weight: 500;
    }
  }
}
</style>
