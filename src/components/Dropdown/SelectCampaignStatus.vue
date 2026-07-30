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
    class="app-filter-dropdown"
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
        <!-- <LocalSvgIcon
          :image="scope.opt.icon"
          :style="{ height: '20px', width: '20px' }"
        /> -->

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
          <LocalSvgIcon
            :image="opt.icon"
            :style="{ height: '20px', width: '20px' }"
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

// Constants
import { CAMPAIGN_STATUS } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'SelectCampaignStatus',

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
      default: 'Status',
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

    const dropdownOptions = computed(() => Object.values(CAMPAIGN_STATUS));

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
