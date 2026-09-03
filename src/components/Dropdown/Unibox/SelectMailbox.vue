<template>
  <q-select
    dense
    outlined
    clearable
    emit-value
    map-options
    options-dense

    clear-icon="clear"
    menu-class="app-filter-dd-menu"
    dropdown-icon="keyboard_arrow_down"
    popup-content-class="app-filter-dd-menu"
    class="app-filter-dropdown unibox-filter-dropdown"
    :class="{
      'show-placeholder': !internalValue,
    }"
    :data-placeholder="placeholderText"
    :loading="isLoading"
    :options="dropdownOptions"
    option-label="email"
    option-value="email"
    v-model="internalValue"

    @filter="onDropdownFilter"

    v-bind="$attrs"
  >
    <!-- No option slot -->
    <template v-slot:no-option>
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
          placeholder="Search mailbox"
          @update:model-value="onSearchFilter"
        />
      </q-item>

      <ApiLoader
        show
        size="20px"
        color="primary"
        v-if="isLoading"
      />

      <p
        v-else
        class="dd-no-result-found-text q-pa-sm text-grey"
      >
        No mailbox found
      </p>
    </template>

    <!-- Search filter before options -->
    <template v-slot:before-options>
      <q-item class="dd-filter-search-item">
        <AppSearchInput
          v-model="searchFilterInput"
          :debounce="500"
          :outlined="false"
          hide-bottom-space
          class="dd-filter-search-input"
          placeholder="Search mailbox"
          @update:model-value="onSearchFilter"
        />
      </q-item>
    </template>

    <!-- Selected template -->
    <template
      v-slot:selected-item="scope"
    >
      <span
        v-if="scope.opt"
        class="selected-item-text ellipsis"
      >
        {{ scope.opt.email || scope.opt }}
      </span>
    </template>

    <!-- Option item -->
    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents || {}"
      >
        <q-item-section>
          <q-item-label class="ellipsis">
            {{ scope.opt.email || scope.opt }}
          </q-item-label>
        </q-item-section>

        <!-- Intersection observer to load more mailboxes -->
        <q-intersection
          @visibility="loadMoreOptions"
          v-if="scope.index === allMailboxes.length - 2"
        />
      </q-item>
    </template>

    <!-- Loader after options -->
    <template
      v-slot:after-options
      v-if="isLoading && allMailboxes.length > 0"
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

// components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// constants
import { DROPDOWN_MAX_FETCH_LIMIT } from 'boot/constants';

export default defineComponent({
  name: 'SelectMailbox',

  inheritAttrs: false,

  emits: ['update:modelValue'],

  components: {
    ApiLoader,
    AppSearchInput,
  },

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholderText: {
      type: String,
      default: 'Mailboxes',
    },
  },

  setup(props, { emit }) {
    const { appContext } = getCurrentInstance();

    // Two-way binding for selected mailbox string
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    // Local state
    const state = reactive({
      allMailboxes: [],
      previousSearchResults: [],
      isApiLoading: false,
      isSearchLoading: false,
      searchFilterInput: '',
      canFetchMoreRecords: true,
      totalMailboxesCount: null,
    });

    const isLoading = computed(() => state.isApiLoading || state.isSearchLoading);

    const dropdownOptions = computed(() => {
      if (state.isSearchLoading) {
        return state.previousSearchResults;
      }
      return state.allMailboxes;
    });

    const resetStateVariables = () => {
      state.allMailboxes = [];
      state.searchFilterInput = '';
      state.canFetchMoreRecords = true;
    };

    // Fetches mailboxes from backend
    const fetchMailboxes = async ({ loadingState = 'isApiLoading' } = {}) => {
      try {
        state[loadingState] = true;

        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: '/mailboxes',
          params: {
            limit: DROPDOWN_MAX_FETCH_LIMIT,
            offset: state.allMailboxes.length,
            search_text: state.searchFilterInput,
            attributes: 'id,email',
          },
        });

        state.totalMailboxesCount = response.total_count;
        state.allMailboxes = [
          ...state.allMailboxes,
          ...response.data,
        ];

        if (state.allMailboxes.length >= state.totalMailboxesCount) {
          state.canFetchMoreRecords = false;
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state[loadingState] = false;
      }
    };

    const onDropdownFilter = async (val, update) => {
      if (isLoading.value) {
        update();
        return;
      }

      if (size(state.allMailboxes)) {
        update();
        return;
      }

      resetStateVariables();
      await fetchMailboxes({ loadingState: 'isApiLoading' });
      update();
    };

    const onSearchFilter = async (searchInput) => {
      state.previousSearchResults = [...state.allMailboxes];
      resetStateVariables();
      state.searchFilterInput = searchInput;
      await fetchMailboxes({ loadingState: 'isSearchLoading' });
    };

    const loadMoreOptions = async () => {
      if (state.canFetchMoreRecords && !isLoading.value) {
        await fetchMailboxes({ loadingState: 'isApiLoading' });
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      internalValue,
      isLoading,
      dropdownOptions,

      // methods
      onDropdownFilter,
      loadMoreOptions,
      onSearchFilter,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-filter-dropdown {

  .selected-item-text {
    color: $black;
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
    max-width: 120px;
  }
}
</style>
