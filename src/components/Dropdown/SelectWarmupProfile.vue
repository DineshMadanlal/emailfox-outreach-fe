<template>
  <q-select
    v-bind="$attrs"

    :loading="isLoading"
    :options="dropdownOptions"
    :data-placeholder="placeholderText"
    :display-value="selectedProfileLabel"
    :class="{ 'show-placeholder': !internalValue }"

    dense
    outlined
    emit-value
    map-options
    options-dense
    hide-bottom-space
    v-model="internalValue"

    option-value="id"
    option-label="name"

    menu-class="app-filter-dd-menu"
    dropdown-icon="keyboard_arrow_down"
    popup-content-class="app-filter-dd-menu"
    class="app-filter-dropdown warmup-profile-select"

    @filter="onDropdownFilter"
  >
    <template #no-option>
      <q-item class="dd-filter-search-item">
        <AppSearchInput
          v-model="searchFilterInput"
          :debounce="500"
          :outlined="false"
          :disable="isLoading"

          hide-bottom-space
          class="dd-filter-search-input"
          placeholder="Search profile"
          @update:model-value="onSearchFilter"
        />
      </q-item>

      <ApiLoader
        v-if="isLoading"
        show
        size="20px"
        color="primary"
      />

      <p v-else class="dd-no-result-found-text">
        No warmup profile found
      </p>
    </template>

    <template #before-options>
      <q-item class="dd-filter-search-item">
        <AppSearchInput
          v-model="searchFilterInput"
          :debounce="500"
          :outlined="false"
          hide-bottom-space
          class="dd-filter-search-input"
          placeholder="Search profile"
          @update:model-value="onSearchFilter"
        />
      </q-item>
    </template>

    <template #selected>
      <span>{{ selectedProfileLabel }}</span>
    </template>

    <template #option="scope">
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents || {}"
      >
        <q-item-section>
          <div class="text-weight-medium">{{ scope.opt.name }}</div>
          <div class="text-caption text-grey-7">
            Last updated: {{ formatDate(scope.opt.updated_at) }}
          </div>
        </q-item-section>

        <q-intersection
          :disable="isLoading"
          v-if="scope.index === dropdownOptions.length - 2 && canFetchMoreRecords"

          @visibility="loadMoreOptions"
        />
      </q-item>
    </template>

    <template #after-options v-if="isLoading && dropdownOptions.length > 0">
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
  defineComponent, computed, reactive, toRefs, getCurrentInstance, onMounted, watch,
} from 'vue';

// components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// utils
import { fetchWarmupProfileById, fetchWarmupProfiles } from 'src/utils/warmupApi';

// constants
import { API_CALLS_MAX_LIMIT } from 'boot/constants';
import { WARMUP_SENDING_SCHEDULE } from 'boot/warmup-constants';

export default defineComponent({
  name: 'SelectWarmupProfile',

  inheritAttrs: false,
  emits: ['update:modelValue'],

  components: {
    ApiLoader,
    AppSearchInput,
  },

  props: {
    modelValue: {
      type: [String, Number, null],
      default: null,
    },
    placeholderText: {
      type: String,
      default: 'Choose a profile to get started',
    },
    preloadedOptions: {
      type: Array,
      default: () => [],
    },
  },

  setup(props, { emit }) {
    // current instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      allProfiles: [],
      previousSearchResults: [],

      isApiLoading: false,
      isSearchLoading: false,
      searchFilterInput: '',
      canFetchMoreRecords: true,
    });

    // computed
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });

    const isLoading = computed(() => state.isApiLoading || state.isSearchLoading);

    const dropdownOptions = computed(() => {
      const source = state.isSearchLoading
        ? state.previousSearchResults
        : state.allProfiles;

      return source;
    });

    const selectedProfileLabel = computed(() => {
      const match = dropdownOptions.value.find(
        (opt) => opt.id === internalValue.value,
      );

      return match?.name || '';
    });

    const sendingScheduleOptions = computed(() => [
      {
        label: 'Only Weekdays',
        description: 'Sends Monday to Friday to match business patterns.',
        value: WARMUP_SENDING_SCHEDULE.ONLY_WEEKDAYS,
        recommended: true,
      },
      {
        label: 'Including Weekends',
        description: 'Sends daily, including weekends, for steady volume.',
        value: WARMUP_SENDING_SCHEDULE.INCLUDE_WEEKENDS,
        recommended: false,
      },
    ]);

    const resetStateVariables = () => {
      state.allProfiles = [];

      state.searchFilterInput = '';

      state.canFetchMoreRecords = true;
    };

    const fetchProfiles = async ({ loadingState = 'isApiLoading' } = {}) => {
      try {
        state[loadingState] = true;

        const response = await fetchWarmupProfiles({
          apiEndPoint: '/warmup/profiles',
          apiParams: {
            limit: API_CALLS_MAX_LIMIT,
            offset: state.allProfiles.length,
            search_text: state.searchFilterInput,
          },
        });

        state.allProfiles = [...state.allProfiles, ...response];

        if (size(response) < API_CALLS_MAX_LIMIT) {
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

      return true;
    };

    const onDropdownFilter = async (val, update) => {
      if (isLoading.value) {
        update();
        return;
      }

      if (size(state.allProfiles)) {
        update();
        return;
      }

      resetStateVariables();

      await fetchProfiles({ loadingState: 'isApiLoading' });
      update();
    };

    const onSearchFilter = async (searchValue) => {
      state.previousSearchResults = [...state.allProfiles];

      resetStateVariables();

      state.searchFilterInput = searchValue;

      await fetchProfiles({ loadingState: 'isSearchLoading' });
    };

    const loadMoreOptions = async () => {
      if (state.canFetchMoreRecords) {
        await fetchProfiles({ loadingState: 'isApiLoading' });
      }
    };

    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    };

    const getWarmupProfileDetailsById = async () => {
      try {
        state.isApiLoading = true;

        const response = await fetchWarmupProfileById(props.modelValue);

        state.allProfiles = [
          response,
        ];
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
      if (size(props.preloadedOptions)) {
        state.allProfiles = props.preloadedOptions;
      }

      if (size(props.modelValue) && isEmpty(state.allProfiles)) {
        getWarmupProfileDetailsById();
      }
    });

    watch(() => props.modelValue, (newValue, oldValue) => {
      if (!oldValue && !!newValue && isEmpty(state.allProfiles)) {
        getWarmupProfileDetailsById();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isLoading,
      internalValue,
      dropdownOptions,
      selectedProfileLabel,
      sendingScheduleOptions,

      // methods
      formatDate,
      onSearchFilter,
      loadMoreOptions,
      onDropdownFilter,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-profile-select {
  background: $white;
}
</style>
