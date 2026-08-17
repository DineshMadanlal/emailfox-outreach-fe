<template>
  <!-- campaign mailbox dropdown -->
  <q-select
    dense
    outlined
    emit-value
    map-options
    options-dense

    option-value="mailbox_id"

    class="app-filter-dropdown select-campaign-mailbox-dropdown"
    menu-class="app-filter-dd-menu"
    popup-content-class="app-filter-dd-menu"
    dropdown-icon="keyboard_arrow_down"

    :class="{
      'show-placeholder': !selectedOption?.mailbox_email,
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
          placeholder="Search mailbox"

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
        No mailboxes found
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
          placeholder="Search mailbox"

          @update:model-value="onSearchFilter"
        />
      </q-item>
    </template>

    <!-- selected template slot -->
    <template v-slot:selected>
      <div
        v-if="selectedOption"
        class="selected-mailbox-item flex items-center no-wrap"
      >
        <!-- avatar badge -->
        <div class="mailbox-avatar-badge flex items-center justify-center text-uppercase">
          {{ getInitials(selectedOption) }}
        </div>

        <!-- mailbox information -->
        <div class="mailbox-info-wrapper q-ml-sm overflow-hidden">
          <div class="mailbox-name-text text-weight-medium ellipsis text-primary">
            {{ getMailboxDisplayName(selectedOption) }}
          </div>
          <div class="mailbox-email-text text-caption text-grey-7 ellipsis flex items-center">
            <!-- esp provider icon -->
            <EspProvider
              v-if="selectedOption?.provider || selectedOption?.esp_provider"
              :provider="selectedOption?.provider || selectedOption?.esp_provider"
              class="q-mr-xs provider-icon-mini"
            />
            <span>{{ selectedOption?.mailbox_email }}</span>
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
        class="mailbox-option-item"
      >
        <q-item-section avatar class="mailbox-avatar-section">
          <!-- avatar badge -->
          <div class="mailbox-avatar-badge flex items-center justify-center text-uppercase">
            {{ getInitials(scope.opt) }}
          </div>
        </q-item-section>

        <q-item-section>
          <!-- name -->
          <q-item-label class="mailbox-name-text text-weight-medium">
            {{ getMailboxDisplayName(scope.opt) }}
          </q-item-label>

          <!-- email and provider -->
          <q-item-label caption class="mailbox-email-text flex items-center text-grey-7">
            <EspProvider
              v-if="scope.opt?.provider || scope.opt?.esp_provider"
              :provider="scope.opt?.provider || scope.opt?.esp_provider"
              class="q-mr-xs provider-icon-mini"
            />
            <span>{{ scope.opt?.mailbox_email }}</span>
          </q-item-label>
        </q-item-section>

        <!-- intersection observer for infinite scrolling -->
        <q-intersection
          v-if="scope.index === allMailboxes.length - 2"
          @visibility="loadMoreOptions"
        />
      </q-item>
    </template>

    <!-- loader slot after options -->
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

// components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import EspProvider from 'components/Mailboxes/EspProvider.vue';

// constants
import { DROPDOWN_MAX_FETCH_LIMIT } from 'boot/constants';

export default defineComponent({
  name: 'SelectCampaignMailbox',

  emits: ['update:modelValue'],

  inheritAttrs: false,

  components: {
    ApiLoader,
    AppSearchInput,
    EspProvider,
  },

  props: {
    campaignId: {
      type: [String, Number],
      default: '',
    },
    campaignById: {
      type: Object,
      default: () => ({}),
    },
    modelValue: {
      type: [String, Number, Object],
      default: null,
    },
    placeholderText: {
      type: String,
      default: 'Select Mailbox',
    },
    preSelectFirstOption: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // extract resolved campaign ID
    const resolvedCampaignId = computed(() => props.campaignId || props.campaignById?.id || '');

    // internal value computed wrapper (emits primitive ID)
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

    const selectedOption = computed(() => {
      const val = internalValue.value;
      if (!val) return null;
      return state.allMailboxes.find((item) => item.mailbox_id === val);
    });

    // methods
    const resetStateVariables = () => {
      state.allMailboxes = [];
      state.searchFilterInput = '';
      state.canFetchMoreRecords = true;
    };

    // helper to extract initials
    const getInitials = (mailbox) => {
      if (!mailbox) return 'MB';

      const name = mailbox.mailbox_name;
      if (name) {
        const parts = name.trim().split(' ');
        if (parts.length > 1) {
          return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      }

      if (mailbox.mailbox_email) {
        return mailbox.mailbox_email.substring(0, 2).toUpperCase();
      }

      return 'MB';
    };

    // helper to construct display name
    const getMailboxDisplayName = (mailbox) => {
      if (!mailbox) return '';
      return mailbox.mailbox_name || '';
    };

    // fetch mailboxes from backend endpoint
    const fetchMailboxes = async ({
      loadingState = 'isApiLoading',
    }) => {
      if (!resolvedCampaignId.value) return false;

      try {
        state[loadingState] = true;

        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: `sequences/${resolvedCampaignId.value}/mailboxes`,
          params: {
            limit: DROPDOWN_MAX_FETCH_LIMIT,
            offset: state.allMailboxes.length,
            search_text: state.searchFilterInput,
          },
        });

        // handle response structures
        const mailboxesList = response.data || [];
        const totalCount = response.count;

        state.totalMailboxesCount = totalCount;
        state.allMailboxes = [
          ...state.allMailboxes,
          ...mailboxesList,
        ];

        if (state.allMailboxes.length >= state.totalMailboxesCount) {
          state.canFetchMoreRecords = false;
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to load mailboxes',
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

      await fetchMailboxes({
        loadingState: 'isApiLoading',
      });

      update();
    };

    const onSearchFilter = async (searchFilterInput) => {
      state.previousSearchResults = [...state.allMailboxes];

      resetStateVariables();
      state.searchFilterInput = searchFilterInput;

      await fetchMailboxes({
        loadingState: 'isSearchLoading',
      });
    };

    const loadMoreOptions = async () => {
      if (state.canFetchMoreRecords) {
        await fetchMailboxes({
          loadingState: 'isApiLoading',
        });
      }
    };

    const fetchMailboxById = async () => {
      const targetId = props.modelValue;
      if (!targetId || !resolvedCampaignId.value) return;

      try {
        state.isApiLoading = true;

        const response = await getApiCall({
          endpoint: `sequences/${resolvedCampaignId.value}/mailboxes/${targetId}`,
        });

        if (response) {
          state.allMailboxes = [response];
        }
      } catch (error) {
        // fallback
      } finally {
        state.isApiLoading = false;
      }
    };

    // helper to handle preselecting the first option
    const handleAutoPreselect = async () => {
      if (props.preSelectFirstOption && !props.modelValue && resolvedCampaignId.value) {
        if (isEmpty(state.allMailboxes)) {
          await fetchMailboxes({ loadingState: 'isApiLoading' });
        }
        if (!props.modelValue && state.allMailboxes.length > 0) {
          const firstOption = state.allMailboxes[0];
          const firstId = firstOption.mailbox_id || firstOption.id;
          if (firstId) {
            internalValue.value = firstId;
          }
        }
      }
    };

    onMounted(async () => {
      if (props.modelValue && isEmpty(state.allMailboxes)) {
        fetchMailboxById();
      } else {
        await handleAutoPreselect();
      }
    });

    watch(() => props.modelValue, (newValue, oldValue) => {
      if (oldValue !== newValue && newValue && isEmpty(state.allMailboxes)) {
        fetchMailboxById();
      }
    });

    watch(() => resolvedCampaignId.value, async () => {
      resetStateVariables();
      await handleAutoPreselect();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      resolvedCampaignId,
      internalValue,
      isLoading,
      dropdownOptions,
      selectedOption,

      // methods
      onDropdownFilter,
      onSearchFilter,
      loadMoreOptions,
      getInitials,
      getMailboxDisplayName,
    };
  },
});
</script>

<style lang="scss" scoped>
.select-campaign-mailbox-dropdown {
  .mailbox-avatar-badge {
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

.mailbox-option-item {
  min-height: 48px;

  .mailbox-avatar-section {
    min-width: 40px;
  }

  .mailbox-avatar-badge {
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
