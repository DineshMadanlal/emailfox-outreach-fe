<template>
  <q-select
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
      'show-placeholder': !internalValue,
    }"
    :data-placeholder="placeholderText"

    v-bind="$attrs"
  >
  </q-select>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// Constants
import { DELAY_UNIT_TYPES } from 'boot/campaign-constants';

export default defineComponent({
  name: 'SelectDelay',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholderText: {
      type: String,
      default: 'Delay Unit',
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

    const dropdownOptions = computed(() => Object.values(DELAY_UNIT_TYPES));

    return {
      // computed
      internalValue,
      dropdownOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
.app-filter-dropdown {
  width: fit-content;
}
</style>
