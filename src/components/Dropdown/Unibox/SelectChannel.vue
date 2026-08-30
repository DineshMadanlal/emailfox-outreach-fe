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
    :options="channelOptions"
    option-label="label"
    option-value="value"
    class="app-filter-dropdown unibox-filter-dropdown"
    dropdown-icon="keyboard_arrow_down"
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
        <LocalSvgIcon
          v-if="scope.opt.icon"
          :image="scope.opt.icon"
          class="channel-icon"
        />

        <p class="selected-item-text ellipsis">
          {{ scope.opt.label }}
        </p>
      </div>
    </template>

    <!-- Option list item -->
    <template v-slot:option="{ itemProps, opt }">
      <q-item v-bind="itemProps">
        <div class="flex no-wrap items-center">
          <LocalSvgIcon
            v-if="opt.icon"
            :image="opt.icon"
            class="channel-icon"
          />

          <p class="q-ml-sm">
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

// constants
import { UNIBOX_CHANNEL_OPTIONS } from 'boot/unibox-constants';

export default defineComponent({
  name: 'SelectChannel',

  inheritAttrs: false,

  emits: ['update:modelValue'],

  props: {
    modelValue: {
      type: String,
      default: null,
    },
    placeholderText: {
      type: String,
      default: 'Channels',
    },
  },

  setup(props, { emit }) {
    // Two-way binding for selected channel enum
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    // Outreach channel options from constants
    const channelOptions = computed(() => UNIBOX_CHANNEL_OPTIONS);

    return {
      // computed
      internalValue,
      channelOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-filter-dropdown {
  .channel-icon {
    width: 16px;
    height: 16px;
    margin-right: 6px;
    @include svg-icon-stroke('path, circle, rect', $black);
  }

  .selected-item-container {
    width: 100%;
    max-width: 120px;

    .selected-item-text {
      color: $black;
      font-size: 13px;
      font-weight: 400;
      line-height: 16px;
    }
  }
}
</style>
