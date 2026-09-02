<template>
  <div
    class="unibox-header"
    :class="{ 'mobile-view': isMobileDevice || compactView }"
  >
    <!-- API Progress Bar -->
    <q-linear-progress
      v-if="isApiProcessing"
      indeterminate
      color="primary"
      class="linear-progress-bar"
    />

    <!-- Top Row: Title, Counter & Action Buttons -->
    <div class="unibox-header-top-row">
      <div class="flex no-wrap items-center">
        <!-- checkbox slot -->
        <slot name="headerCheckbox" />

        <!-- header title -->
        <h5 class="header-title">
          {{ title }}
          <span
            v-if="totalList > 0"
            class="total-count"
          >
            ({{ getNumeralAmount(totalList) }})
          </span>
        </h5>
      </div>

      <!-- Right Action Controls -->
      <div class="header-actions flex items-center">
        <!-- Reload / Refresh Button -->
        <q-btn
          flat
          round
          dense
          unelevated
          class="reload-btn"
          id="uniboxEmailListReloadBtn"
          :class="{ 'is-refreshing': isRefreshing }"
          :disable="isRefreshing || isApiProcessing"
          @click="$emit('refresh')"
        >
          <LocalSvgIcon
            image="reload"
            classes="reload-icon"
          />
          <AppTooltip content="Refresh" />
        </q-btn>

        <!-- Mobile Drawer Toggle Button -->
        <q-btn
          flat
          round
          dense
          icon="menu"
          class="unibox-header-menu-icon"
          @click="toggleLeftDrawer"
        />
      </div>
    </div>

    <!-- Bottom Row: Search Bar & Filter Menu Button -->
    <div class="unibox-header-search-row flex items-center">
      <!-- Search Input -->
      <AppSearchInput
        clearable
        :debounce="400"
        v-model="computedSearchText"
        class="unibox-search-input"
        placeholder="Search by contact..."
      />

      <!-- Filter Menu Trigger Button -->
      <q-btn
        flat
        no-caps
        unelevated
        class="filter-trigger-btn"
        :class="{ 'filters-active': areFiltersActive }"
      >
        <LocalSvgIcon
          image="filter"
          classes="filter-icon"
        />

        <AppTooltip content="Filter" />

        <!-- Active Filter Indicator Dot -->
        <span
          v-if="areFiltersActive"
          class="active-filter-indicator"
        />

        <!-- Unibox Filters Menu -->
        <UniboxFilters
          v-model:filters="computedFilters"
          :campaigns="campaigns"
          :replyCategories="replyCategories"
          @reset="onResetFilters"
        />
      </q-btn>

      <!-- Clear Filters Shortcut Button -->
      <q-btn
        flat
        dense
        no-caps
        v-if="areFiltersActive"
        color="negative"
        class="clear-filters-btn"
        @click="onResetFilters"
      >
        <LocalSvgIcon
          image="circle-close"
          classes="clear-icon"
        />
        <AppTooltip content="Clear all filters" />
      </q-btn>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// stores
import { storeExclusions } from 'src/stores/storeExclusions.js';

// Utils
import { getNumeralAmount } from 'src/utils/numbers.js';

// components
import AppTooltip from 'components/General/AppTooltip.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import UniboxFilters from 'components/Menu/UniboxFilters.vue';

// constants
import { DEFAULT_UNIBOX_FILTERS } from 'boot/unibox-constants';

export default defineComponent({
  name: 'UniboxHeader',

  components: {
    AppTooltip,
    AppSearchInput,
    UniboxFilters,
  },

  emits: ['update:filters', 'refresh', 'reset-filters'],

  props: {
    title: {
      type: String,
      default: 'Inbox',
    },
    isApiProcessing: {
      type: Boolean,
      default: false,
    },
    isRefreshing: {
      type: Boolean,
      default: false,
    },
    compactView: {
      type: Boolean,
      default: false,
    },
    filters: {
      type: Object,
      required: true,
      default: () => ({ ...DEFAULT_UNIBOX_FILTERS }),
    },
    campaigns: {
      type: Array,
      default: () => [],
    },
    replyCategories: {
      type: Array,
      default: () => [],
    },
    totalList: {
      type: Number,
      default: 0,
    },
  },

  setup(props, { emit }) {
    // store
    const storeExclusionsPinia = storeExclusions();

    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // Two-way proxy for filters
    const computedFilters = computed({
      get: () => props.filters,
      set: (updated) => {
        emit('update:filters', updated);
      },
    });

    // Proxy for search text inside filters
    const computedSearchText = computed({
      get: () => props.filters.search_text || '',
      set: (val) => {
        emit('update:filters', {
          ...props.filters,
          search_text: val,
        });
      },
    });

    // Check if any non-search filter is currently active
    const areFiltersActive = computed(() => {
      const filterKeys = Object.keys(computedFilters.value);
      const filtersApplied = filterKeys.some((key) => !!computedFilters.value[key]);

      return !!filtersApplied;
    });

    // Reset filters handler
    const onResetFilters = () => {
      emit('update:filters', { ...DEFAULT_UNIBOX_FILTERS });
      emit('reset-filters');
    };

    return {
      // computed
      isMobileDevice,
      computedFilters,
      computedSearchText,
      areFiltersActive,

      // methods
      onResetFilters,
      getNumeralAmount,
      toggleLeftDrawer: storeExclusionsPinia.toggleLeftDrawer,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-header {
  width: 100%;
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 3;
  border-bottom: 1px solid $grey-50;
  background-color: $white;
  flex-shrink: 0;

  .linear-progress-bar {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 2px;
  }

  .unibox-header-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .header-title {
      color: $black;
      font-size: 20px;
      font-weight: 600;

      .total-count {
        color: $black;
        font-size: 14px;
      }
    }

    .reload-btn {
      width: 32px;
      height: 32px;

      :deep(.reload-icon) {
        width: 16px;
        height: 16px;
        @include svg-icon-stroke('path, circle, rect', $grey);
      }

      &.is-refreshing {
        :deep(.reload-icon) {
          animation: spin 1s linear infinite;
        }
      }
    }

    .unibox-header-menu-icon {
      display: none;
      margin-left: 8px;
      color: $grey;

      @media (max-width: $breakpoint-sm-max) {
        display: inline-flex;
      }
    }
  }

  .unibox-header-search-row {
    gap: 8px;
    width: 100%;
    min-width: 0;

    .header-multi-select-wrapper {
      margin-right: 4px;
    }

    .unibox-search-input {
      flex: 1;
      max-width: 262px;
      min-width: 0;

      :deep(.q-field__control) {
        height: 32px;
        min-height: 32px;
        border-radius: 6px;
      }
    }

    .filter-trigger-btn {
      width: 32px;
      height: 32px;
      min-height: unset;
      padding: 0;
      flex-shrink: 0;

      border-radius: 6px;
      border: 1px solid $grey-50;
      background-color: $white;
      position: relative;

      :deep(.filter-icon) {
        width: 16px;
        height: 16px;
        @include svg-icon-stroke('path, circle, rect', $grey-400);
      }

      &:hover, &.filters-active {
        border-color: $primary;
        background-color: rgba($color: var(--primary-rgb), $alpha: 0.05);

        :deep(.filter-icon) {
          @include svg-icon-stroke('path, circle, rect', $primary);
        }
      }

      .active-filter-indicator {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: $primary;
      }
    }

    .clear-filters-btn {
      width: 28px;
      height: 28px;
      min-height: unset;
      padding: 0;
      flex-shrink: 0;

      :deep(.clear-icon) {
        width: 14px;
        height: 14px;
        @include svg-icon-stroke('path, circle, rect', $negative);
      }
    }
  }

  @media (max-width: $breakpoint-sm-max) {
    padding: 12px 14px;

    .unibox-header-search-row {
      .unibox-search-input {
        max-width: 100%;
      }
    }
  }

  &.mobile-view {
    padding: 12px 14px;

    .unibox-search-input {
      max-width: 100%;
    }
  }
}
</style>
