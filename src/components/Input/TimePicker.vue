<template>
  <q-input
    dense
    outlined
    hide-bottom-space

    v-model="internalValue"

    lazy-rules="ondemand"
    mask="time"
    :rules="['time']"
    :class="[
      'time-picker-input',
      moreClass,
    ]"
  >
    <!-- Prepend -->
    <template #prepend>
      <q-icon name="access_time">
        <q-popup-proxy>
          <q-time
            v-model="internalValue"
            format24h
            @update:model-value="updateValue"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'TimePicker',

  emits: ['update:modelValue'],

  props: {
    modelValue: {
      type: String,
      default: '08:00',
    },
    moreClass: {
      type: String,
      default: '',
    },
  },

  setup(props, { emit }) {
    // computed
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });

    // methods
    const updateValue = (value) => {
      emit('update:modelValue', value);
    };

    return {
      // computed
      internalValue,

      // methods
      updateValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.time-picker-input {
  :deep(.q-field__prepend) {
    .q-icon {
      color: $primary;
      font-size: 16px;
      cursor: pointer;
    }
  }

  &.dead-small {
    width: fit-content;
    max-width: 112px;

    :deep(.q-field__inner) {
      .q-field__control,
      .q-field__marginal {
        height: 28px;
        border-radius: 8px;
      }

      .search-icon {
        height: 12px;
        width: 12px;
      }
    }
  }
}
</style>
