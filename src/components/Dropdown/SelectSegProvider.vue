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
    <!-- selected slot -->
    <template v-slot:selected-item="scope">
      <div
        v-if="scope.opt"
        class="flex no-wrap items-center seg-dropdown-item"
      >
        <img
          v-if="getOptionIcon(scope.opt)"
          :src="getOptionIcon(scope.opt)"
          :alt="getOptionLabel(scope.opt)"
          class="seg-option-icon"
          loading="lazy"
        />
        <p class="seg-option-label">
          {{ getOptionLabel(scope.opt) }}
        </p>
      </div>
    </template>

    <!-- dropdown slot option -->
    <template
      v-slot:option="{ itemProps, opt }"
    >
      <q-item
        v-bind="itemProps"
      >
        <div class="flex no-wrap items-center seg-dropdown-item">
          <img
            v-if="opt.icon"
            :src="opt.icon"
            :alt="opt.label"
            class="seg-option-icon"
            loading="lazy"
          />
          <p class="seg-option-label">
            {{ opt.label }}
          </p>
        </div>
      </q-item>
    </template>
  </q-select>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// Constants
import { SEG_SIGNATURES } from 'boot/workspace-constants';

export default defineComponent({
  name: 'SelectSegProvider',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    placeholderText: {
      type: String,
      default: 'Email Authentication',
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

    const dropdownOptions = computed(() => SEG_SIGNATURES.map((item) => ({
      label: item.label,
      value: item.provider,
      icon: item.icon,
    })));

    const getOption = (opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return opt;
      }
      return dropdownOptions.value.find((item) => item.value === opt) || null;
    };

    const getOptionLabel = (opt) => {
      const resolved = getOption(opt);
      return resolved?.label || (typeof opt === 'string' ? opt : '');
    };

    const getOptionIcon = (opt) => {
      const resolved = getOption(opt);
      return resolved?.icon || '';
    };

    return {
      // computed
      internalValue,
      dropdownOptions,

      // methods
      getOptionLabel,
      getOptionIcon,
    };
  },
});
</script>

<style lang="scss" scoped>
.app-filter-dropdown {
  width: fit-content;
}

.seg-dropdown-item {
  gap: 8px;

  .seg-option-icon {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .seg-option-label {
    margin: 0;
    font-size: 14px;
    line-height: 16px;
    color: inherit;
    white-space: nowrap;
  }
}
</style>
