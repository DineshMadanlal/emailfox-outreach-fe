<template>
  <q-select
    v-bind="$attrs"

    dense
    multiple
    outlined
    clearable
    emit-value
    map-options
    options-dense

    option-value="id"
    option-label="domain_name"

    class="app-filter-dropdown"
    menu-class="app-filter-dd-menu"
    popup-content-class="app-filter-dd-menu"
    dropdown-icon="keyboard_arrow_down"

    :class="{
      'show-placeholder': !internalValue?.length,
    }"
    :data-placeholder="placeholderText"

    :loading="isLoading"
    :options="dropdownOptions"

    v-model="internalValue"

    @filter="onDropdownFilter"
    @clear="onClearInputValue"
  >
    <!-- selected template -->
    <template
      v-slot:selected
      v-if="internalValue?.length"
    >
      <span class="multiple-dd-selected-label">
        {{ internalValue.length }} {{ $pluralize('Domain', internalValue.length) }}
      </span>
    </template>

    <!-- no slot -->
    <template
      v-slot:no-option
      v-if="!isSearchLoading"
    >
      <!-- search filter -->
      <q-item
        v-if="searchFilterInput"
        class="dd-filter-search-item"
      >
        <AppSearchInput
          v-model="searchFilterInput"
          :debounce="500"
          :outlined="false"
          :disable="isLoading"
          hide-bottom-space

          class="dd-filter-search-input"
          placeholder="Search domain"

          @update:model-value="onSearchFilter"
        />
      </q-item>

      <ApiLoader
        show

        size="20px"
        color="primary"

        v-if="isApiLoading"
      />

      <p
        v-else
        class="dd-no-result-found-text"
      >
        No domains found
      </p>
    </template>

    <!-- before options -->
    <template v-slot:before-options>
      <!-- search filter -->
      <q-item
        class="dd-filter-search-item"
      >
        <AppSearchInput
          v-model="searchFilterInput"
          :debounce="500"
          :outlined="false"
          hide-bottom-space

          class="dd-filter-search-input"
          placeholder="Search domain"

          @update:model-value="onSearchFilter"
        />
      </q-item>
    </template>

    <!-- dd menu each item slot -->
    <template
      v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption, index }"
    >
      <!-- Each item -->
      <q-item
        v-bind="itemProps"
        v-on="itemEvents || {}"
        class="multi-dd-each-option-item"
      >
        <!-- Checkbox -->
        <q-checkbox
          :model-value="selected"
          @update:model-value="toggleOption(opt)"

          class="multi-dd-item-checkbox app-checkbox"
        >
          <!-- domain -->
          {{ opt.domain_name }}
        </q-checkbox>

        <!-- Add an intersection to load more domains - Kind of infinite scroll implementation -->
        <q-intersection
          @visibility="loadMoreOptions"

          v-if="index === allDomains.length - 2"
        >
        </q-intersection>
      </q-item>
    </template>

    <!-- After slot -->
    <template
      v-slot:after-options
      v-if="isLoading && allDomains.length > 0"
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
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, computed, reactive, toRefs, getCurrentInstance,
} from 'vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';

// Components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// constants
import { DROPDOWN_MAX_FETCH_LIMIT } from 'boot/constants';

export default defineComponent({
  name: 'SelectMultipleDomains',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  components: {
    ApiLoader,
    AppSearchInput,
  },

  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    placeholderText: {
      type: String,
      default: 'Domain',
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // Local state to manage the selected options
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    // state
    const state = reactive({
      allDomains: [],
      previousSearchResults: [],

      isApiLoading: false,
      isSearchLoading: false,
      searchFilterInput: '',

      canFetchMoreRecords: true,

      totalDomainsCount: null,
    });

    // computed
    const isLoading = computed(() => state.isApiLoading || state.isSearchLoading);

    const dropdownOptions = computed(() => {
      if (state.isSearchLoading) {
        return state.previousSearchResults;
      }

      return state.allDomains;
    });

    // methods
    const resetStateVariables = () => {
      state.allDomains = [];
      state.searchFilterInput = '';
      state.canFetchMoreRecords = true;
    };

    // Fetches domains from backend with pagination and search term
    const fetchDomains = async ({
      loadingState = 'isApiLoading',
    }) => {
      try {
        state[loadingState] = true;

        const params = {
          limit: DROPDOWN_MAX_FETCH_LIMIT,
          offset: state.allDomains.length,
          search_text: state.searchFilterInput,
        };

        const response = await getApiCall({
          endpoint: '/domains/get-overview',
          params,
        });

        state.totalDomainsCount = response.total_count;

        state.allDomains = [
          ...state.allDomains, ...response.domain_list,
        ];

        if (state.allDomains.length >= state.totalDomainsCount) {
          state.canFetchMoreRecords = false;
        }
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state[loadingState] = false;
      }

      return true;
    };

    const onClearInputValue = () => {
      internalValue.value = [];
    };

    const onDropdownFilter = async (val, update) => {
      if (isLoading.value) {
        update();
        return;
      }

      if (size(state.allDomains)) {
        update();
        return;
      }

      resetStateVariables();

      // try catch is not required because the function already has try catch
      await fetchDomains({
        loadingState: 'isApiLoading',
      });

      update();
    };

    const onSearchFilter = async (searchFilterInput) => {
      state.previousSearchResults = [...state.allDomains];

      resetStateVariables();

      state.searchFilterInput = searchFilterInput;

      // try catch is not required because the function already has try catch
      await fetchDomains({
        loadingState: 'isSearchLoading',
      });
    };

    const loadMoreOptions = async () => {
      if (state.canFetchMoreRecords) {
        // try catch is not required because the function already has try catch
        await fetchDomains({
          loadingState: 'isApiLoading',
        });
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed value
      internalValue,
      isLoading,
      dropdownOptions,

      // methods
      onDropdownFilter,
      loadMoreOptions,
      onSearchFilter,
      onClearInputValue,
    };
  },
});
</script>
