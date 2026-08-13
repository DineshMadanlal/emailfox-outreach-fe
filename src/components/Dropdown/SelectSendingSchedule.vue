<template>
  <q-select
    dense
    outlined
    emit-value
    map-options
    options-dense

    ref="selectDataRef"
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

    v-bind="$attrs"

    @filter="onDropdownFilter"
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
          placeholder="Search schedule"

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
        v-else-if="canCreateSchedule"
        class="dd-no-create-new-result-found"

        @click="onCreateNewSchedule"
      >
        <!-- Create a new schedule -->
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
              {{ searchFilterInput }}</span>" Schedule
          </div>

          <div
            v-else
            class="text-weight-medium text-primary"
          >
            + Create a new schedule
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
          placeholder="Search schedule"

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

          v-if="scope.index === allData.length - 2"
        >
        </q-intersection>
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

    <!--  -->
    <template
      v-slot:after-options
      v-else-if="canCreateSchedule"
    >
      <q-item
        dense
        clickable
        class="dd-create-new-item"
        @click="onCreateNewSchedule"
      >
        <q-item-section>
          + Create a new Schedule
        </q-item-section>
      </q-item>
    </template>

    <!-- Dialog -->
    <q-dialog
      v-if="canCreateSchedule"

      v-model="modals.showSaveScheduleModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveSchedule
        :prefillScheduleName="searchFilterInput"

        @newCreated="onNewCreatedData"
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
import SaveSchedule from 'components/SendingSchedule/Modals/SaveSchedule.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { DROPDOWN_MAX_FETCH_LIMIT } from 'boot/constants';

export default defineComponent({
  name: 'SelectSendingSchedule',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  components: {
    ApiLoader,
    AppSearchInput,
    SaveSchedule,
  },

  props: {
    modelValue: {
      type: [String, Number, Object],
      default: () => {},
    },
    placeholderText: {
      type: String,
      default: 'Select Schedule',
    },
    canCreateSchedule: {
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
      allData: [],
      previousSearchResults: [],

      isApiLoading: false,
      isSearchLoading: false,
      searchFilterInput: '',

      canFetchMoreRecords: true,

      totalDataCount: null,

      selectDataRef: null,

      modals: {
        showSaveScheduleModal: false,
      },
    });

    // computed
    const isLoading = computed(() => state.isApiLoading || state.isSearchLoading);

    const dropdownOptions = computed(() => {
      if (state.isSearchLoading) {
        return state.previousSearchResults;
      }

      return state.allData;
    });

    // methods
    const resetStateVariables = () => {
      state.allData = [];
      state.searchFilterInput = '';
      state.canFetchMoreRecords = true;
    };

    // Fetches domains from backend with pagination and search term
    const fetchData = async ({
      loadingState = 'isApiLoading',
    }) => {
      try {
        state[loadingState] = true;

        const response = await getApiCall({
          endpoint: '/sending-schedules',
          includeWorkspace: true,
          params: {
            limit: DROPDOWN_MAX_FETCH_LIMIT,
            offset: state.allData.length,
            search_text: state.searchFilterInput,
          },
        });

        state.totalDataCount = response.count;

        state.allData = [
          ...state.allData, ...response.data,
        ];

        if (state.allData.length >= state.totalDataCount) {
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

      if (size(state.allData)) {
        update();
        return;
      }

      resetStateVariables();

      // try catch is not required because fetchData already has try catch
      await fetchData({
        loadingState: 'isApiLoading',
      });

      update();
    };

    const onSearchFilter = async (searchFilterInput) => {
      state.previousSearchResults = [...state.allData];

      resetStateVariables();

      state.searchFilterInput = searchFilterInput;

      // try catch is not required because the function already has try catch
      await fetchData({
        loadingState: 'isSearchLoading',
      });
    };

    const loadMoreOptions = async () => {
      if (state.canFetchMoreRecords) {
        // try catch is not required because fetchData already has try catch
        await fetchData({
          loadingState: 'isApiLoading',
        });
      }
    };

    const fetchScheduleByIdBasicDetails = async () => {
      if (!props.modelValue.id) {
        console.warn('No schedule id provided to fetch the schedule details');
        return;
      }
      try {
        state.isApiLoading = true;

        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: `/sending-schedules/${props.modelValue.id}`,
        });

        state.allData = [
          response,
        ];

        internalValue.value = {
          ...response,
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

    const onCreateNewSchedule = () => {
      state.modals.showSaveScheduleModal = true;
    };

    const onNewCreatedData = (inputJson) => {
      state.modals.showSaveScheduleModal = false;

      // add new to the top of the array
      state.allData.unshift(inputJson);

      // set the newly created
      internalValue.value = {
        ...inputJson,
      };
    };

    onMounted(() => {
      if (size(props.modelValue) && isEmpty(state.allData)) {
        fetchScheduleByIdBasicDetails();
      }
    });

    watch(() => props.modelValue, (newValue, oldValue) => {
      if (isEmpty(oldValue) && size(newValue) && isEmpty(state.allData)) {
        fetchScheduleByIdBasicDetails();
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
      onCreateNewSchedule,
      onNewCreatedData,

      validate() {
        return state.selectDataRef?.validate();
      },
      resetValidation() {
        return state.selectDataRef?.resetValidation();
      },
    };
  },
});
</script>
