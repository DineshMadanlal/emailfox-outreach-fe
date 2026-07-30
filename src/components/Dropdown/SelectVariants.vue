<template>
  <q-select
    v-bind="$attrs"

    dense
    outlined
    emit-value
    map-options
    options-dense

    v-model="internalValue"
    :options="dropdownOptions"

    option-label="label"
    option-value="value"
    class="app-filter-dropdown"
    dropdown-icon="keyboard_arrow_down"

    :class="{
  'show-placeholder': internalValue === null
    || internalValue === undefined || internalValue === '',
    }"
    :data-placeholder="placeholderText"
  >
  </q-select>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'SelectVariants',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  props: {
    modelValue: {
      type: [String, Number],
      default: 0,
    },
    placeholderText: {
      type: String,
      default: 'Metric',
    },
    dropdownOptions: {
      type: Array,
      default: () => ([]),
    },
  },

  setup(props, { emit }) {
    // Local state to manage the selected options
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    return {
      // computed
      internalValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.app-filter-dropdown {
  width: fit-content;
}
</style>
