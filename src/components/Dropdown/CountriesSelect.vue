<template>
  <q-select
    v-bind="$attrs"

    dense
    outlined
    emit-value
    map-options
    options-dense
    hide-bottom-space

    v-model="internalValue"

    class="app-filter-dropdown"
    menu-class="app-filter-dd-menu"
    popup-content-class="app-filter-dd-menu"
    dropdown-icon="keyboard_arrow_down"

    :options="dropdownOptions"
    :class="{
      'show-placeholder': !internalValue,
    }"
    :data-placeholder="placeholderText"

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
          placeholder="Search country"
          @update:model-value="onSearchFilter"
        />
      </q-item>

      <p class="dd-no-result-found-text">
        No country found
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
          placeholder="Search country"
          @update:model-value="onSearchFilter"
        />
      </q-item>
    </template>

    <!-- selected slot -->
    <template
      v-slot:selected-item="scope"
      v-if="internalValue"
    >
      <div
        v-if="scope.opt"
        class="flex no-wrap items-center"
      >
        <!-- Flag -->
        <q-img
          width="24px"
          height="16px"
          :src="`https://flagcdn.com/16x12/${scope.opt?.value?.toLowerCase()}.png`"
        />

        <p class="q-ml-sm">
          {{ selectedItemLabel }}
        </p>
      </div>
    </template>

    <!-- dropdown slot option -->
    <template
      v-slot:option="scope"
    >
      <!-- each q item -->
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents || {}"
      >
        <div
          v-if="scope?.opt"
          class="flex no-wrap items-center"
        >
          <!-- Flag -->
          <q-img
            width="24px"
            height="16px"
            :src="`https://flagcdn.com/16x12/${scope.opt.value?.toLowerCase()}.png`"
          />

          <p class="q-ml-sm">
            {{ scope.opt?.label }}
          </p>
        </div>
      </q-item>
    </template>
  </q-select>
</template>

<script>
// lodash
import get from 'lodash/get';

// vue
import {
  defineComponent, computed, toRefs, reactive,
} from 'vue';

// components
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// Main data and utils
import { countries } from 'countries-list';

export default defineComponent({
  name: 'CountriesSelect',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
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
      default: 'Select Country',
    },
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      allList: [],
      filteredList: [],
      searchFilterInput: '',
    });

    // Local state to manage the selected options
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    const dropdownOptions = computed(() => state.filteredList);

    // selected item
    const selectedItemLabel = computed(() => {
      if (internalValue.value) {
        return get(countries, `${internalValue.value}.name`, '');
      }

      return '';
    });

    // methods
    const initDropdownList = () => {
      const options = Object.entries(countries).map(([key, value]) => ({
        label: value.name,
        value: key,
      }));

      state.allList = options;
      state.filteredList = options;
    };

    // filter handlers (same pattern as mailbox)
    const onDropdownFilter = (val, update) => {
      update(() => {
        if (!val) {
          state.filteredList = state.allList;
          return;
        }

        const needle = val.toLowerCase();

        state.filteredList = state.allList.filter(
          (data) => data.label.toLowerCase().includes(needle),
        );
      });
    };

    const onSearchFilter = (val) => {
      state.searchFilterInput = val;

      if (!val) {
        state.filteredList = state.allList;
        return;
      }

      const needle = val.toLowerCase();

      state.filteredList = state.allList.filter(
        (data) => data.label.toLowerCase().includes(needle),
      );
    };

    // init
    initDropdownList();

    return {
      // state
      ...toRefs(state),

      // computed
      internalValue,
      dropdownOptions,
      selectedItemLabel,

      // methods
      onDropdownFilter,
      onSearchFilter,
    };
  },
});
</script>
