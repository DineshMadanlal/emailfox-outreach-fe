<template>
  <div
    class="email-thread-list-header"
    :class="{ 'mobile-view': mobileView }"
  >
    <!-- progress bar -->
    <q-linear-progress
      v-if="isApiProcessing"

      indeterminate
      color="primary"
      class="linear-progress-bar"
    />

    <div
      class="email-thread-list-top-header"
    >

      <!-- search input -->
      <AppSearchInput
        clearable
        :debounce="500"
        v-model="computedSearchInput"

        class="master-inbox-filter-input"
        placeholder="Search by email, keyword, or domain"
      />

      <q-btn
        flat
        no-caps
        unelevated

        color="primary"
        class="filter-btn"

        v-if="threadFilterApplied"

        @click="$emit('refreshEmailList')"
      >
        <AppTooltip
          content="Clear Filter"
        />

        <LocalSvgIcon
          image="filter"
          classes="filter-icon app-svg-icon-primary"
        />

        <LocalSvgIcon
          image="circle-close"
          classes="cancel-icon"
        />
      </q-btn>
    </div>

    <div
      class="email-thread-list-bottom-header"
    >
      <!-- Select Domain -->
      <SelectMultipleDomains
        v-model="computedFilterDomainsArray"

        class="master-inbox-dropdown-input"
      />

      <!-- Select Mailbox -->
      <SelectMultipleMailboxes
        v-model="computedFilterMailboxesArray"

        class="master-inbox-dropdown-input"
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// route
import { useRoute } from 'vue-router';

// components
import AppTooltip from 'components/General/AppTooltip.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';

import SelectMultipleDomains from 'components/Dropdown/SelectMultipleDomains.vue';
import SelectMultipleMailboxes from 'components/Dropdown/SelectMultipleMailboxes.vue';

export default defineComponent({
  name: 'EmailThreadListHeader',

  emits: ['update:searchFreeText', 'update:filterDomainsArray', 'update:filterDomainsArray', 'refreshEmailList'],

  components: {
    AppTooltip,
    AppSearchInput,

    SelectMultipleDomains,
    SelectMultipleMailboxes,
  },

  props: {
    mobileView: {
      type: Boolean,
      default: false,
    },
    isApiProcessing: {
      type: Boolean,
      default: false,
    },

    searchFreeText: {
      type: String,
      default: '',
    },
    filterDomainsArray: {
      type: Array,
      default: () => [],
    },
    filterMailboxesArray: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // route
    const $route = useRoute();

    // computed
    const threadFilterApplied = computed(() => !!$route.query.threadId);

    const computedSearchInput = computed({
      get: () => props.searchFreeText,
      set: (val) => {
        emit('update:searchFreeText', val);
      },
    });

    const computedFilterDomainsArray = computed({
      get: () => props.filterDomainsArray,
      set: (val) => {
        emit('update:filterDomainsArray', val);
      },
    });

    const computedFilterMailboxesArray = computed({
      get: () => props.filterMailboxesArray,
      set: (val) => {
        // Avoid unnecessary updates if the same array is set
        if (val?.length === props.filterMailboxesArray?.length) {
          return; // Avoid unnecessary updates if the same object is set
        }

        emit('update:filterMailboxesArray', val);
      },
    });

    return {
      // computed
      computedSearchInput,
      threadFilterApplied,
      computedFilterDomainsArray,
      computedFilterMailboxesArray,
    };
  },
});
</script>

<style lang="scss" scoped>
.email-thread-list-header {
  display: flex;
  gap: 12px;

  .linear-progress-bar {
    position: absolute;
    left: 0px;
    bottom: 0px;

    height: 2px;
  }

  .email-thread-list-top-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .master-inbox-filter-input {
      width: 260px;
    }

    .filter-btn {
      height: 36px;
      width: 36px;

      border-radius: 6px;
      border: 1px solid $primary;

      position: relative;

      :deep(.filter-icon) {
        min-width: 16px;
      }

      :deep(.cancel-icon) {
        position: absolute;
        top: -6px;
        right: -6px;

        circle {
          stroke-width: 0;
          fill: $primary;
        }

        path {
          stroke: $white;
        }
      }
    }
  }

  .email-thread-list-bottom-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  :deep(.master-inbox-dropdown-input) {
    width: auto;
    min-width: 160px;

    // md min
    @media (max-width: $breakpoint-md-max) {
      min-width: unset;
    }

    .q-field__native, .q-field__control {
      min-height: 36px;
      height: 36px;
    }
  }

  &.mobile-view {
    flex-direction: column;

    .master-inbox-filter-input {
      width: 100%;
    }

    .master-inbox-dropdown-input {
      min-width: unset;
      width: 100%;
    }
  }
}
</style>
