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
    'show-placeholder': internalValue === null
      || internalValue === undefined || internalValue === '',
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
          <div>
            {{ scope.opt.label }}
          </div>

          <div>
            {{ scope.opt.description }}
          </div>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// Constants
import { SENDING_VOLUME_OPTIONS } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'SelectSendingVolume',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  props: {
    modelValue: {
      type: [String, Number],
      default: 100,
    },
    placeholderText: {
      type: String,
      default: 'Sending Volume',
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

    const dropdownOptions = computed(() => Object.values(SENDING_VOLUME_OPTIONS));

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
