<template>
  <q-select
    dense
    outlined
    emit-value
    map-options
    options-dense

    ref="selectListRef"
    class="app-filter-dropdown"
    menu-class="app-filter-dd-menu"
    popup-content-class="app-filter-dd-menu"
    dropdown-icon="keyboard_arrow_down"

    :class="{
      'show-placeholder': !internalValue?.name,
    }"
    :data-placeholder="placeholderText"

    :loading="isLoading"
    :options="dropdownOptions"

    v-model="internalValue"

    @filter="onDropdownFilter"

    v-bind="$attrs"
  >
    <!-- no slot -->
    <template
      v-slot:no-option
    >
      <!-- search filter -->
      <q-item
        class="dd-filter-search-item"
      >
        <AppSearchInput
          v-if="searchFilterInput"
          v-model="searchFilterInput"
          :debounce="500"
          :outlined="false"
          :disable="isLoading"
          hide-bottom-space

          class="dd-filter-search-input"
          placeholder="Search list"

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

      <div
        v-else-if="canCreateList"
        class="dd-no-create-new-result-found"

        @click="onCreateNewList"
      >
        <!-- Create a new list -->
        <q-item
          clickable
          class="dd-create-new-item"
        >
          <!-- create -->
          <div
            v-if="searchFilterInput"
            class="dd-create-new-text"
          >
            Create "<span class="text-primary text-weight-medium">
              {{ searchFilterInput }}</span>" List
          </div>

          <div
            v-else
            class="text-weight-medium text-primary"
          >
            + Create a new list
          </div>
        </q-item>
      </div>

      <div
        v-else
        class="dd-no-result-found-text"
      >
        No results found
      </div>
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
          placeholder="Search list"

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
        {{ internalValue.name }}
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
          {{ scope.opt.name }}
        </q-item-section>

        <!-- Add an intersection to load more domains - Kind of infinite scroll implementation -->
        <q-intersection
          @visibility="loadMoreOptions"

          v-if="scope.index === allLists.length - 2"
        >
        </q-intersection>
      </q-item>
    </template>

    <!-- After slot -->
    <template
      v-slot:after-options
      v-if="isLoading && allLists.length > 0"
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

    <!--  -->
    <template
      v-slot:after-options
      v-else-if="canCreateList"
    >
      <q-item
        dense
        clickable
        class="dd-create-new-item"
        @click="onCreateNewList"
      >
        <q-item-section>
          + Create New List
        </q-item-section>
      </q-item>
    </template>

    <!-- Dialog -->
    <q-dialog
      v-if="canCreateList"

      v-model="modals.showSaveListNameModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveListName
        :prefillListNameAndSave="searchFilterInput"

        @newCreatedList="onNewCreatedList"
      />
    </q-dialog>
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
import SaveListName from 'components/Lists/Modals/SaveListName.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { DROPDOWN_MAX_FETCH_LIMIT } from 'boot/constants';

export default defineComponent({
  name: 'SelectList',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  components: {
    ApiLoader,
    AppSearchInput,
    SaveListName,
  },

  props: {
    modelValue: {
      type: [String, Number, Object],
      default: () => {},
    },
    placeholderText: {
      type: String,
      default: 'List',
    },
    canCreateList: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // Local state to manage the selected options
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    // state
    const state = reactive({
      allLists: [],
      previousSearchResults: [],

      isApiLoading: false,
      isSearchLoading: false,
      searchFilterInput: '',

      canFetchMoreRecords: true,

      totalListsCount: null,

      selectListRef: null,

      modals: {
        showSaveListNameModal: false,
      },
    });

    // computed
    const isLoading = computed(() => state.isApiLoading || state.isSearchLoading);

    const dropdownOptions = computed(() => {
      if (state.isSearchLoading) {
        return state.previousSearchResults;
      }

      return state.allLists;
    });

    // methods
    const resetStateVariables = () => {
      state.allLists = [];
      state.searchFilterInput = '';
      state.canFetchMoreRecords = true;
    };

    // Fetches domains from backend with pagination and search term
    const fetchLists = async ({
      loadingState = 'isApiLoading',
    }) => {
      try {
        state[loadingState] = true;

        const response = await getApiCall({
          endpoint: '/lists',
          includeWorkspace: true,
          params: {
            limit: DROPDOWN_MAX_FETCH_LIMIT,
            offset: state.allLists.length,
            search_text: state.searchFilterInput,
            attributes: 'id,name',
          },
        });

        state.totalListsCount = response.count;

        state.allLists = [
          ...state.allLists, ...response.data,
        ];

        if (state.allLists.length >= state.totalListsCount) {
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

      if (size(state.allLists)) {
        update();
        return;
      }

      resetStateVariables();

      // try catch is not required because fetchLists already has try catch
      await fetchLists({
        loadingState: 'isApiLoading',
      });

      update();
    };

    const onSearchFilter = async (searchFilterInput) => {
      state.previousSearchResults = [...state.allLists];

      resetStateVariables();

      state.searchFilterInput = searchFilterInput;

      // try catch is not required because the function already has try catch
      await fetchLists({
        loadingState: 'isSearchLoading',
      });
    };

    const loadMoreOptions = async () => {
      if (state.canFetchMoreRecords) {
        // try catch is not required because fetchLists already has try catch
        await fetchLists({
          loadingState: 'isApiLoading',
        });
      }
    };

    const fetchListByIdBasicDetails = async () => {
      try {
        state.isApiLoading = true;

        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: `/lists/${props.modelValue.id}`,
        });

        state.allLists = [
          response,
        ];

        internalValue.value = {
          id: response.id,
          name: response.name,
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

    const onCreateNewList = () => {
      state.modals.showSaveListNameModal = true;
    };

    const onNewCreatedList = (newListJson) => {
      state.modals.showSaveListNameModal = false;

      // add new list to the top of the list
      state.allLists.unshift(newListJson);

      // set the newly created list as selected
      internalValue.value = {
        id: newListJson.id,
        name: newListJson.name,
      };
    };

    onMounted(() => {
      if (size(props.modelValue) && isEmpty(state.allLists)) {
        fetchListByIdBasicDetails();
      }
    });

    watch(() => props.modelValue, (newValue, oldValue) => {
      if (isEmpty(oldValue) && size(newValue) && isEmpty(state.allLists)) {
        fetchListByIdBasicDetails();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed value
      isLoading,
      internalValue,
      dropdownOptions,
      isMobileDevice,

      // methods
      onDropdownFilter,
      loadMoreOptions,
      onSearchFilter,
      onCreateNewList,
      onNewCreatedList,

      validate() {
        return state.selectListRef?.validate();
      },
      resetValidation() {
        return state.selectListRef?.resetValidation();
      },
    };
  },
});
</script>
