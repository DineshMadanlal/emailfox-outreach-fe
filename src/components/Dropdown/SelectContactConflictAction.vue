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
    dropdown-icon="keyboard_arrow_down"

    :class="{
      'show-placeholder': !internalValue,
    }"
    :hint="inputHint"
    :data-placeholder="placeholderText"
  >
    <!-- dropdown slot option -->
    <template
      v-slot:option="{ itemProps, opt }"
    >
      <!-- each q item -->
      <q-item
        v-bind="itemProps"
        class="each-contact-conflict-role-item"
      >
        <div>
          <p class="contact-conflict-label">
            {{ opt.label }}
          </p>
          <p class="contact-conflict-description">
            {{ opt.description }}.
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
import { CONTACT_IMPORT_CONFLICT_ACTION } from 'boot/campaign-constants';

export default defineComponent({
  name: 'SelectContactConflictAction',

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
      default: 'Conflict Action',
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

    const inputHint = computed(() => {
      if (internalValue.value) {
        return CONTACT_IMPORT_CONFLICT_ACTION[internalValue.value].description;
      }

      return '';
    });

    const dropdownOptions = computed(() => Object.values(CONTACT_IMPORT_CONFLICT_ACTION));

    return {
      // computed
      inputHint,
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

.each-contact-conflict-role-item {
  padding-top: 4px;

  .contact-conflict-label {
    font-size: 14px;
  }

  .contact-conflict-description {
    font-size: 12px;
    color: $grey;

    max-width: 400px;
  }
}
</style>
