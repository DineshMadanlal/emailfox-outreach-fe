<template>
  <q-input
    dense
    outlined
    hide-bottom-space
    v-model="internalValue"

    v-bind="$attrs"

    :class="`${moreClasses} app-search-input`"
  >
    <template v-slot:prepend>
      <!-- search icon -->
      <LocalSvgIcon
        image="search"
        class="search-icon"
      />
    </template>
  </q-input>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'AppSearchInput',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  props: {
    modelValue: {
      type: String,
      default: () => '',
    },
    moreClasses: {
      type: String,
      default: () => '',
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
      // computed value
      internalValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.app-search-input {
  border-radius: 6px;

  :deep(.q-field__inner) {
    .q-field__control,
    .q-field__marginal {
      height: 36px;
    }

    .q-field__outlined {
      .q-field__control {
        &::before {
          border: 1px solid $blue-grey;
        }
      }
    }

    .search-icon {
      height: 16px;
      width: 16px;
    }
  }

  &.dead-small {
    :deep(.q-field__inner) {
      .q-field__control,
      .q-field__marginal {
        height: 28px;
      }

      .search-icon {
        height: 12px;
        width: 12px;
      }
    }
  }
}
</style>
