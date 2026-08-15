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

    option-label="name"
    option-value="value"

    class="app-filter-dropdown reply-sentiment-dropdown"
    dropdown-icon="keyboard_arrow_down"

    :class="{
      'show-placeholder': !internalValue,
    }"
    :data-placeholder="placeholderText"
  >
    <!-- selected slot -->
    <template v-slot:selected-item="scope">
      <div
        v-if="scope.opt"
        class="flex no-wrap items-center"
      >
        <!-- icon -->
        <LocalSvgIcon
          image="circle-dot"
          :style="{ height: '12px', width: '12px' }"
          :classes="`circle-dot-icon ${scope.opt.color}`"
        />

        <p class="q-ml-sm">
          {{ scope.opt.label }}
        </p>
      </div>
    </template>

    <!-- dropdown slot option -->
    <template
      v-slot:option="{ itemProps, opt }"
    >
      <!-- each q item -->
      <q-item
        v-bind="itemProps"
      >
        <div class="flex no-wrap items-center">
          <!-- Icon -->
          <div
            :style="{
              minWidth: '12px', maxWidth: '12px',
              minHeight: '12px', maxHeight: '12px',
              borderRadius: '50%',
              backgroundColor: `var(--${opt.color}-color)`,
            }"
          >
          </div>

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

// Constants
import { REPLY_SENTIMENT } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'SelectReplySentiment',

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
      default: 'Reply Sentiment',
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

    const dropdownOptions = computed(() => Object.values(REPLY_SENTIMENT));

    return {
      // computed
      internalValue,
      dropdownOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
.reply-sentiment-dropdown {
  :deep(.circle-dot-icon) {
    &.positive {
      @include svg-icon-fill('circle', $positive);
    }

    &.negative {
      @include svg-icon-fill('circle', $negative);
    }

    &.warning {
      @include svg-icon-fill('circle', $warning);
    }
  }
}
</style>
