<template>
  <q-select
    v-bind="$attrs"

    dense
    outlined
    emit-value
    map-options
    options-dense
    hide-bottom-space

    class="app-filter-dropdown"
    menu-class="app-filter-dd-menu"
    popup-content-class="app-filter-dd-menu"
    dropdown-icon="keyboard_arrow_down"

    :class="{
      'show-placeholder': !internalValue,
    }"
    :data-placeholder="placeholderText"

    :options="dropdownOptions"

    v-model="internalValue"

    @filter="onDropdownFilter"
  >
    <!-- no option -->
    <template #no-option>
      <q-item v-if="searchFilterInput" class="dd-filter-search-item">
        <AppSearchInput
          v-model="searchFilterInput"
          :debounce="300"
          :outlined="false"
          hide-bottom-space
          class="dd-filter-search-input"
          placeholder="Search timezone"
          @update:model-value="onSearchFilter"
        />
      </q-item>

      <p class="dd-no-result-found-text">
        No timezone found
      </p>
    </template>

    <!-- before options -->
    <template #before-options>
      <q-item class="dd-filter-search-item">
        <AppSearchInput
          v-model="searchFilterInput"
          :debounce="300"
          :outlined="false"

          autofocus
          hide-bottom-space
          class="dd-filter-search-input"
          placeholder="Search timezone"
          @update:model-value="onSearchFilter"
        />
      </q-item>
    </template>

    <!-- selected -->
    <template #selected v-if="internalValue">
      <span>
        {{ selectedItem.label }}

        <span
          class="text-grey"
          :style="{ 'font-size': '12px' }"
        >
          ({{ selectedItem.gmt }})
        </span>
      </span>
    </template>

    <!-- option -->
    <template #option="scope">
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents || {}"

        class="flex no-wrap items-center"
      >
        <q-item-section>
          {{ scope.opt.label }}
        </q-item-section>

        <div
          class="text-grey"
          :style="{ 'font-size': '12px' }"
        >
          ({{ scope.opt.gmt }})
        </div>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import {
  defineComponent, computed, reactive, toRefs,
} from 'vue';

// components
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// constants
import { TIMEZONES_LIST } from 'boot/campaign-constants.js';

export default defineComponent({
  name: 'SelectTimezone',

  emits: ['update:modelValue'],

  inheritAttrs: false,

  components: {
    AppSearchInput,
  },

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholderText: {
      type: String,
      default: 'Select Timezone',
    },
  },

  setup(props, { emit }) {
    // v-model binding
    const internalValue = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val),
    });

    // state
    const state = reactive({
      allTimezones: [],
      filteredTimezones: [],
      searchFilterInput: '',
    });

    // init data (local, no API)
    const initTimezones = () => {
      const list = [...TIMEZONES_LIST];

      state.allTimezones = list;
      state.filteredTimezones = list;
    };

    // computed options
    const dropdownOptions = computed(() => state.filteredTimezones);

    const selectedItem = computed(() => {
      const found = state.allTimezones.find(
        (tz) => tz.value === internalValue.value,
      );
      return found || {};
    });

    // filter handlers (same pattern as mailbox)
    const onDropdownFilter = (val, update) => {
      update(() => {
        if (!val) {
          state.filteredTimezones = state.allTimezones;
          return;
        }

        const needle = val.toLowerCase();

        state.filteredTimezones = state.allTimezones.filter(
          (tz) => tz.label.toLowerCase().includes(needle),
        );
      });
    };

    const onSearchFilter = (val) => {
      state.searchFilterInput = val;

      if (!val) {
        state.filteredTimezones = state.allTimezones;
        return;
      }

      const needle = val.toLowerCase();

      state.filteredTimezones = state.allTimezones.filter(
        (tz) => tz.label.toLowerCase().includes(needle),
      );
    };

    // init
    initTimezones();

    return {
      ...toRefs(state),

      internalValue,
      dropdownOptions,
      selectedItem,

      onDropdownFilter,
      onSearchFilter,
    };
  },
});
</script>
