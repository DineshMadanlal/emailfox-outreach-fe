<template>
  <q-select
    dense
    outlined
    emit-value
    map-options
    options-dense

    v-bind="$attrs"

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
  >
    <!-- selected slot -->
    <template
      v-slot:selected-item="scope"
      v-if="internalValue"
    >
      <span>
        {{ scope.opt.label }}
      </span>
    </template>

    <!-- dropdown slot option -->
    <template
      v-slot:option="scope"
    >
      <!-- each q item -->
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents || {}"
      >
        <q-item-section>
          {{ scope.opt.label }}
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// Constants
import { STOP_CONTACT_WHEN } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'SelectContactStop',

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
      default: 'Stop Contact When',
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

    const dropdownOptions = computed(() => Object.values(STOP_CONTACT_WHEN));

    return {
      // computed
      internalValue,
      dropdownOptions,
    };
  },
});
</script>

<style lang="scss" scoped>

</style>
