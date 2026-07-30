<template>
  <q-select
    v-bind="$attrs"

    dense
    outlined
    emit-value
    map-options
    options-dense

    class="app-filter-dropdown"
    menu-class="app-filter-dd-menu"
    popup-content-class="app-filter-dd-menu"
    dropdown-icon="keyboard_arrow_down"

    :class="{
      'show-placeholder': !internalValue?.email,
    }"
    :data-placeholder="placeholderText"

    :loading="isLoading"
    :options="dropdownOptions"

    v-model="internalValue"

    @filter="onDropdownFilter"
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
          v-model="searchFilterInput"
          :debounce="500"
          :outlined="false"
          :disable="isLoading"
          hide-bottom-space

          class="dd-filter-search-input"
          placeholder="Search Email"

          @update:model-value="onSearchFilter"
        />
      </q-item>

      <!-- Api Loader -->
      <ApiLoader
        show

        size="20px"
        color="primary"

        v-if="isLoading"
      />

      <p
        v-else
        class="dd-no-result-found-text"
      >
        No mailbox found
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

    <!-- selected template -->
    <template
      v-slot:selected
      v-if="internalValue"
    >
      <span>
        {{ internalValue.email }}
      </span>
    </template>

    <!-- dd menu slot -->
    <template v-slot:option="scope">
      <!-- Each item -->
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents || {}"
      >
        <q-item-section>
          {{ scope.opt.email }}
        </q-item-section>

        <!-- Add an intersection to load more domains - Kind of infinite scroll implementation -->
        <q-intersection
          @visibility="loadMoreOptions"

          v-if="scope.index === allMailboxes.length - 2"
        >
        </q-intersection>
      </q-item>
    </template>

    <!-- After slot -->
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
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, computed, reactive, toRefs, getCurrentInstance,
  onMounted, watch,
} from 'vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';

// Components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// constants
import { DROPDOWN_MAX_FETCH_LIMIT } from 'boot/constants';

export default defineComponent({
  name: 'SelectMailbox',

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
      default: 'Mailbox',
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
      allMailboxes: [],
      previousSearchResults: [],

      isApiLoading: false,
      isSearchLoading: false,
      searchFilterInput: '',

      canFetchMoreRecords: true,

      totalMailboxesCount: null,
    });

    // computed
    const isLoading = computed(() => state.isApiLoading || state.isSearchLoading);

    const dropdownOptions = computed(() => {
      if (state.isSearchLoading) {
        return state.previousSearchResults;
      }

      return state.allMailboxes;
    });

    // methods
    const resetStateVariables = () => {
      state.allMailboxes = [];
      state.searchFilterInput = '';
      state.canFetchMoreRecords = true;
    };

    // Fetches domains from backend with pagination and search term
    const fetchMailboxes = async ({
      loadingState = 'isApiLoading',
    }) => {
      try {
        state[loadingState] = true;

        const response = await getApiCall({
          endpoint: '/mailboxes/get-overview',
          params: {
            limit: DROPDOWN_MAX_FETCH_LIMIT,
            offset: state.allMailboxes.length,
            search_text: state.searchFilterInput,
            attributes: 'id,domain_id,email',
          },
        });

        state.totalMailboxesCount = response.total_count;

        state.allMailboxes = [
          ...state.allMailboxes, ...response.mailboxes_list,
        ];

        if (state.allMailboxes.length >= state.totalMailboxesCount) {
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

      // try catch is not required because fetchMailboxes already has try catch
      await fetchMailboxes({
        loadingState: 'isApiLoading',
      });

      update();
    };

    const onSearchFilter = async (searchFilterInput) => {
      state.previousSearchResults = [...state.allMailboxes];

      resetStateVariables();

      state.searchFilterInput = searchFilterInput;

      // try catch is not required because the function already has try catch
      await fetchMailboxes({
        loadingState: 'isSearchLoading',
      });
    };

    const loadMoreOptions = async () => {
      if (state.canFetchMoreRecords) {
        // try catch is not required because fetchMailboxes already has try catch
        await fetchMailboxes({
          loadingState: 'isApiLoading',
        });
      }
    };

    const fetchMailboxByIdBasicDetails = async () => {
      try {
        state.isApiLoading = true;

        const response = await getApiCall({
          endpoint: `/mailboxes/${props.modelValue.id}/overview`,
        });

        state.allMailboxes = [
          response,
        ];

        internalValue.value = {
          id: response.id,
          email: response.email,
          domain_id: response.domain_id,
        };
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    onMounted(() => {
      if (size(props.modelValue) && isEmpty(state.allMailboxes)) {
        fetchMailboxByIdBasicDetails();
      }
    });

    watch(() => props.modelValue, (newValue, oldValue) => {
      if (isEmpty(oldValue) && size(newValue) && isEmpty(state.allMailboxes)) {
        fetchMailboxByIdBasicDetails();
      }
    });

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
    };
  },
});
</script>
