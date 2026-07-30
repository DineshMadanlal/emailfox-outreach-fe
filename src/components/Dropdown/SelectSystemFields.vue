<template>
  <q-select
    dense
    emit-value
    map-options
    options-dense

    v-bind="$attrs"

    option-label="label"
    option-value="value"
    ref="selectSystemFieldsRef"
    class="app-filter-dropdown"
    menu-class="app-filter-dd-menu"
    popup-content-class="app-filter-dd-menu"
    dropdown-icon="keyboard_arrow_down"

    :class="{
      'show-placeholder': !internalValue,
    }"
    :data-placeholder="placeholderText"

    :loading="isLoading"
    :options="dropdownOptions"

    v-model="internalValue"
  >
    <!-- no slot -->
    <template
      v-slot:no-option
    >
      <!-- search filter -->
      <q-item
        v-if="searchFilterInput"
        class="dd-filter-search-item"
      >
        <AppSearchInput
          autofocus
          v-model="searchFilterInput"
          :outlined="false"
          :disable="isLoading"
          hide-bottom-space

          class="dd-filter-search-input"
          placeholder="Search field"
        />
      </q-item>

      <!-- Api Loader -->
      <ApiLoader
        show

        size="20px"
        color="primary"

        v-if="isLoading"
      />

      <!-- Not found -->
      <q-item
        v-else
        class="dd-filter-search-item"
      >
        <q-item-section class="q-pa-sm">
          No field found
        </q-item-section>
      </q-item>
    </template>

    <!-- before options -->
    <template v-slot:before-options>
      <!-- search filter -->
      <q-item
        class="dd-filter-search-item"
      >
        <AppSearchInput
          autofocus
          v-model="searchFilterInput"
          :outlined="false"
          hide-bottom-space

          class="dd-filter-search-input"
          placeholder="Search field"
        />
      </q-item>
    </template>

    <!-- dd menu slot -->
    <template v-slot:option="scope">
      <!-- Each item -->
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents || {}"
      >
        <q-item-section>
          {{ scope.opt.label }}
        </q-item-section>
      </q-item>
    </template>

    <!-- After slot -->
    <template
      v-slot:after-options
      v-if="isLoading && allData.length > 0"
    >
      <q-item>
        <q-item-section>
          <ApiLoader
            show

            size="20px"
            color="primary"
          />
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, toRefs,
} from 'vue';

// Components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// constants
import { DEFAULT_SYSTEM_FIELDS, IGNORE_FIELD, CUSTOM_FIELD } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'SelectSystemFields',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  components: {
    ApiLoader,
    AppSearchInput,
  },

  props: {
    modelValue: {
      type: [String, Number, Object],
      default: () => {},
    },
    placeholderText: {
      type: String,
      default: 'Select field',
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

    // state
    const state = reactive({
      isApiLoading: false,
      isSearchLoading: false,
      searchFilterInput: '',

      selectSystemFieldsRef: null,
    });

    // computed
    const isLoading = computed(() => state.isApiLoading || state.isSearchLoading);

    const systemFieldOptions = computed(() => [
      ...DEFAULT_SYSTEM_FIELDS,
      IGNORE_FIELD,
      CUSTOM_FIELD,
    ]);

    const dropdownOptions = computed(() => {
      if (state.searchFilterInput) {
        const searchTerm = state.searchFilterInput.toLowerCase();

        return [
          ...systemFieldOptions.value.filter(
            (field) => field.label.toLowerCase().includes(searchTerm),
          ),
        ];
      }

      return [
        ...systemFieldOptions.value,
      ];
    });

    return {
      // state
      ...toRefs(state),

      // computed value
      internalValue,
      isLoading,
      dropdownOptions,

      validate() {
        return state.selectSystemFieldsRef?.validate();
      },
      resetValidation() {
        return state.selectSystemFieldsRef?.resetValidation();
      },
    };
  },
});
</script>
