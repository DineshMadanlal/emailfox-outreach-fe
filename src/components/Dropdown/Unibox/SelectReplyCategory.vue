<template>
  <q-select
    dense
    outlined
    clearable
    emit-value
    map-options
    options-dense
    v-bind="$attrs"
    v-model="internalValue"
    :options="categoryOptions"

    option-value="id"
    clear-icon="clear"
    option-label="label"
    dropdown-icon="keyboard_arrow_down"
    class="app-filter-dropdown unibox-filter-dropdown"
    :class="{
      'show-placeholder': !internalValue,
    }"
    :data-placeholder="placeholderText"
  >
    <!-- Selected option display -->
    <template v-slot:selected-item="scope">
      <div
        v-if="scope.opt"
        class="flex no-wrap items-center selected-item-container"
      >
        <div class="selected-item-text ellipsis">
          {{ scope.opt.name }}
        </div>
      </div>
    </template>

    <!-- Option list item -->
    <template v-slot:option="{ itemProps, opt }">
      <q-item v-bind="itemProps">
        <q-item-section>
          <div
            :style="{
              height: '12px', width: '12px', borderRadius: '50%',
              backgroundColor: `var(--${opt.color}-color)`,
            }"
          >
          </div>
          <q-item-label class="ellipsis">
            {{ opt.name }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <!-- Empty state slot -->
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-black">
          No categories available
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'SelectReplyCategory',

  inheritAttrs: false,

  emits: ['update:modelValue'],

  props: {
    modelValue: {
      type: [Number, String],
      default: null,
    },
    options: {
      type: Array,
      default: () => [],
    },
    placeholderText: {
      type: String,
      default: 'Reply Categories',
    },
  },

  setup(props, { emit }) {
    // Two-way binding for selected reply_category_id
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    // Formats options if passed as simple strings or objects
    const categoryOptions = computed(() => {
      if (!props.options?.length) return [];

      return props.options;
    });

    return {
      // computed
      internalValue,
      categoryOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-filter-dropdown {

  .selected-item-container {
    width: 100%;
    max-width: 130px;

    .selected-item-text {
      color: $black;
      font-size: 13px;
      font-weight: 400;
      line-height: 16px;
    }
  }
}
</style>
