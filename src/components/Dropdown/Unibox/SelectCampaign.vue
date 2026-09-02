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
    :options="campaignOptions"

    option-value="id"
    option-label="name"
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
        <p class="selected-item-text ellipsis">
          {{ scope.opt.name }}
        </p>
      </div>
    </template>

    <!-- Option list item -->
    <template v-slot:option="{ itemProps, opt }">
      <q-item v-bind="itemProps">
        <q-item-section>
          <q-item-label class="ellipsis">
            {{ opt.name }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <!-- Empty state slot -->
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey text-caption">
          No campaigns available
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'SelectCampaign',

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
      default: 'Campaigns',
    },
  },

  setup(props, { emit }) {
    // Two-way binding for selected campaign seq_id
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    // Formats options if passed as simple strings or objects
    const campaignOptions = computed(() => {
      if (!props.options?.length) return [];

      return props.options;
    });

    return {
      // computed
      internalValue,
      campaignOptions,
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
