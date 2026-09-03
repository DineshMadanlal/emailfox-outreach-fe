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
        class="flex no-wrap items-center q-gutter-sm selected-item-container"

        :title="scope.opt.name"
      >
        <div
          :style="{
            height: '8px', minWidth: '8px', borderRadius: '50%',
            backgroundColor: getCategoryColor(scope.opt.sentiment),
          }"
        >
        </div>

        <div
          class="selected-item-text ellipsis"
        >
          {{ scope.opt.name }}
        </div>
      </div>
    </template>

    <!-- Option list item -->
    <template v-slot:option="{ itemProps, opt }">
      <q-item v-bind="itemProps">
        <q-item-section>
          <div class="flex no-wrap items-center q-gutter-sm">
            <div
              :style="{
                height: '8px', width: '8px', borderRadius: '50%',
                backgroundColor: getCategoryColor(opt.sentiment),
              }"
            >
            </div>
            <div class="ellipsis">
              {{ opt.name }}
            </div>
          </div>
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

// constants
import { REPLY_SENTIMENT } from 'boot/campaign-constants';

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

    const getCategoryColor = (sentiment) => {
      if (REPLY_SENTIMENT[sentiment]) {
        return `var(--${REPLY_SENTIMENT[sentiment].color}-color)`;
      }

      return 'var(--warning-color)';
    };

    return {
      // computed
      internalValue,
      categoryOptions,

      // methods
      getCategoryColor,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-filter-dropdown {

  .selected-item-container {
    width: 100%;
    max-width: 160px;

    .selected-item-text {
      color: $black;
      font-size: 13px;
      font-weight: 400;
      line-height: 16px;
    }
  }
}
</style>
