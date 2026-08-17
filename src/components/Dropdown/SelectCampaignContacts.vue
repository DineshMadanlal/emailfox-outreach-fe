<template>
  <!-- campaign contacts dropdown -->
  <q-select
    dense
    outlined
    emit-value
    map-options
    options-dense

    option-value="contact_id"

    class="app-filter-dropdown select-campaign-contacts-dropdown"
    menu-class="app-filter-dd-menu"
    popup-content-class="app-filter-dd-menu"
    dropdown-icon="keyboard_arrow_down"

    :class="{
      'show-placeholder': !selectedOption?.contact_email,
    }"
    :data-placeholder="placeholderText"

    :loading="isLoading"
    :options="dropdownOptions"

    v-model="internalValue"

    @filter="onDropdownFilter"

    v-bind="$attrs"
  >
    <!-- no options slot -->
    <template v-slot:no-option>
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
          placeholder="Search contact"

          @update:model-value="onSearchFilter"
        />
      </q-item>

      <!-- api loader -->
      <ApiLoader
        v-if="isLoading"
        show

        size="20px"
        color="primary"
      />

      <!-- empty message -->
      <p
        v-else
        class="dd-no-result-found-text"
      >
        No contacts found
      </p>
    </template>

    <!-- before options slot for search input -->
    <template v-slot:before-options>
      <!-- search filter -->
      <q-item class="dd-filter-search-item">
        <AppSearchInput
          v-model="searchFilterInput"
          :debounce="500"
          :outlined="false"
          hide-bottom-space

          class="dd-filter-search-input"
          placeholder="Search contact"

          @update:model-value="onSearchFilter"
        />
      </q-item>
    </template>

    <!-- selected template slot -->
    <template v-slot:selected>
      <div
        v-if="selectedOption"
        class="flex items-center no-wrap"
      >
        <!-- avatar badge -->
        <div class="contact-avatar-badge flex items-center justify-center text-uppercase">
          {{ getInitials(selectedOption) }}
        </div>

        <!-- contact information -->
        <div class="q-ml-sm overflow-hidden">
          <div class="ellipsis text-primary text-weight-medium">
            {{ selectedOption?.contact_email }}
          </div>
        </div>
      </div>
    </template>

    <!-- dropdown menu option slot -->
    <template v-slot:option="scope">
      <!-- each item -->
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents || {}"
        class="contact-option-item"
      >
        <q-item-section avatar class="contact-avatar-section">
          <!-- avatar badge -->
          <div class="contact-avatar-badge flex items-center justify-center text-uppercase">
            {{ getInitials(scope.opt) }}
          </div>
        </q-item-section>

        <q-item-section>
          <!-- email and provider -->
          <q-item-label class="contact-email-text flex items-center">
            {{ scope.opt?.contact_email }}
          </q-item-label>
        </q-item-section>

        <!-- intersection observer for infinite scrolling -->
        <q-intersection
          v-if="scope.index === allContacts.length - 2"
          @visibility="loadMoreOptions"
        />
      </q-item>
    </template>

    <!-- loader slot after options -->
    <template
      v-slot:after-options
      v-if="isLoading && allContacts.length > 0"
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

// components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// constants
import { DROPDOWN_MAX_FETCH_LIMIT } from 'boot/constants';

export default defineComponent({
  name: 'SelectCampaignContacts',

  emits: ['update:modelValue'],

  inheritAttrs: false,

  components: {
    ApiLoader,
    AppSearchInput,
  },

  props: {
    campaignId: {
      type: [String, Number],
      required: true,
    },
    modelValue: {
      type: [String, Number, Object],
      default: null,
    },
    placeholderText: {
      type: String,
      default: 'Select Contact',
    },
    preSelectFirstOption: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // internal value computed wrapper (emits primitive ID)
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    // state
    const state = reactive({
      allContacts: [],
      previousSearchResults: [],

      isApiLoading: false,
      isSearchLoading: false,
      searchFilterInput: '',

      canFetchMoreRecords: true,
      totalContactsCount: null,
    });

    // computed
    const isLoading = computed(() => state.isApiLoading || state.isSearchLoading);

    const dropdownOptions = computed(() => {
      if (state.isSearchLoading) {
        return state.previousSearchResults;
      }

      return state.allContacts;
    });

    const selectedOption = computed(() => {
      const val = internalValue.value;
      if (!val) return null;
      return state.allContacts.find((item) => item.contact_id === val);
    });

    // methods
    const resetStateVariables = () => {
      state.allContacts = [];
      state.searchFilterInput = '';
      state.canFetchMoreRecords = true;
    };

    // helper to extract initials
    const getInitials = (contact) => {
      if (!contact) return 'CN';

      if (contact.contact_email) {
        return contact.contact_email.substring(0, 2).toUpperCase();
      }

      return 'CN';
    };

    // fetch contacts from backend endpoint
    const fetchContacts = async ({
      loadingState = 'isApiLoading',
    }) => {
      if (!props.campaignId) return false;

      try {
        state[loadingState] = true;

        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: `/sequences/${props.campaignId}/contacts`,
          params: {
            limit: DROPDOWN_MAX_FETCH_LIMIT,
            offset: state.allContacts.length,
            search_text: state.searchFilterInput,
          },
        });

        // handle response structures
        const contactsList = response.data || [];
        const totalCount = response.count;

        state.totalContactsCount = totalCount;
        state.allContacts = [
          ...state.allContacts,
          ...contactsList,
        ];

        if (state.allContacts.length >= state.totalContactsCount) {
          state.canFetchMoreRecords = false;
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to load contacts',
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

      if (size(state.allContacts)) {
        update();
        return;
      }

      resetStateVariables();

      await fetchContacts({
        loadingState: 'isApiLoading',
      });

      update();
    };

    const onSearchFilter = async (searchFilterInput) => {
      state.previousSearchResults = [...state.allContacts];

      resetStateVariables();
      state.searchFilterInput = searchFilterInput;

      await fetchContacts({
        loadingState: 'isSearchLoading',
      });
    };

    const loadMoreOptions = async () => {
      if (state.canFetchMoreRecords) {
        await fetchContacts({
          loadingState: 'isApiLoading',
        });
      }
    };

    const fetchContactById = async () => {
      const targetId = props.modelValue;
      if (!targetId || !props.campaignId) return;

      try {
        state.isApiLoading = true;

        const response = await getApiCall({
          endpoint: `/sequences/${props.campaignId}/contacts/${targetId}`,
        });

        if (response) {
          state.allContacts = [response];
        }
      } catch (error) {
        // fallback
      } finally {
        state.isApiLoading = false;
      }
    };

    // helper to handle preselecting the first option
    const handleAutoPreselect = async () => {
      if (props.preSelectFirstOption && !props.modelValue && props.campaignId) {
        if (isEmpty(state.allContacts)) {
          await fetchContacts({ loadingState: 'isApiLoading' });
        }
        if (!props.modelValue && state.allContacts.length > 0) {
          const firstOption = state.allContacts[0];
          const firstId = firstOption.contact_id || firstOption.id;
          if (firstId) {
            internalValue.value = firstId;
          }
        }
      }
    };

    onMounted(async () => {
      if (props.modelValue && isEmpty(state.allContacts)) {
        fetchContactById();
      } else {
        await handleAutoPreselect();
      }
    });

    watch(() => props.modelValue, (newValue, oldValue) => {
      if (oldValue !== newValue && newValue && isEmpty(state.allContacts)) {
        fetchContactById();
      }
    });

    watch(() => props.campaignId, async () => {
      resetStateVariables();
      await handleAutoPreselect();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      internalValue,
      isLoading,
      dropdownOptions,
      selectedOption,

      // methods
      onDropdownFilter,
      onSearchFilter,
      loadMoreOptions,
      getInitials,
    };
  },
});
</script>

<style lang="scss" scoped>
.select-campaign-contacts-dropdown {
  .contact-avatar-badge {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background-color: rgba(var(--primary-rgb), 0.1);
    color: $primary;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .provider-icon-mini {
    :deep(img), :deep(svg) {
      width: 14px;
      height: 14px;
    }
  }
}

.contact-option-item {
  min-height: 48px;

  .contact-avatar-section {
    min-width: 40px;
  }

  .contact-avatar-badge {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background-color: rgba(var(--primary-rgb), 0.1);
    color: $primary;
    font-size: 12px;
    font-weight: 600;
  }
}
</style>
