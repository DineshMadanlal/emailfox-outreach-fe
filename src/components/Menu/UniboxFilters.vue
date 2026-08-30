<template>
  <q-menu
    transition-show="jump-down"
    transition-hide="jump-up"
    class="unibox-filters-menu-card no-shadow"
  >
    <div class="unibox-filters-content">
      <!-- Menu Header -->
      <div class="filters-header flex items-center justify-between">
        <p class="filters-title">
          Filter By
        </p>

        <q-btn
          flat
          dense
          no-caps
          color="primary"
          class="reset-btn"
          :disable="!areFiltersActive"
          @click="onResetFilters"
        >
          Reset All
        </q-btn>
      </div>

      <!-- Filter Controls Grid -->
      <div class="filters-grid">
        <!-- Campaign Filter -->
        <div class="filter-item">
          <InputLabel label="Campaign" />

          <SelectCampaign
            v-model="internalFilters.seq_id"
            :options="campaigns"
            placeholderText="All Campaigns"

            @update:modelValue="onInputChange"
          />
        </div>

        <!-- Reply Category Filter -->
        <div class="filter-item">
          <InputLabel label="Reply Category" />
          <SelectReplyCategory
            v-model="internalFilters.reply_category_id"
            :options="replyCategories"
            placeholderText="All Categories"

            @update:modelValue="onInputChange"
          />
        </div>

        <!-- Mailbox Filter -->
        <div class="filter-item">
          <InputLabel label="Mailbox" />
          <SelectMailbox
            v-model="internalFilters.mailbox"
            placeholderText="All Mailboxes"

            @update:modelValue="onInputChange"
          />
        </div>

        <!-- Channel Filter -->
        <div class="filter-item">
          <InputLabel label="Channel" />
          <SelectChannel
            v-model="internalFilters.channel"
            placeholderText="All Channels"

            @update:modelValue="onInputChange"
          />
        </div>
      </div>
    </div>
  </q-menu>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import InputLabel from 'components/Form/InputLabel.vue';
import SelectChannel from 'components/Dropdown/Unibox/SelectChannel.vue';
import SelectMailbox from 'components/Dropdown/Unibox/SelectMailbox.vue';
import SelectCampaign from 'components/Dropdown/Unibox/SelectCampaign.vue';
import SelectReplyCategory from 'components/Dropdown/Unibox/SelectReplyCategory.vue';

// constants
import { DEFAULT_UNIBOX_FILTERS } from 'boot/unibox-constants';

export default defineComponent({
  name: 'UniboxFilters',

  components: {
    InputLabel,
    SelectChannel,
    SelectMailbox,
    SelectCampaign,
    SelectReplyCategory,
  },

  emits: ['update:filters', 'reset'],

  props: {
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
  },

  setup(props, { emit }) {
    // Two-way binding proxy for filters object
    const internalFilters = computed({
      get: () => props.filters,
      set: (updated) => {
        emit('update:filters', updated);
      },
    });

    // Check if any non-search filter is currently applied
    const areFiltersActive = computed(() => {
      const f = props.filters;
      return !!(f.domain || f.mailbox || f.seq_id || f.reply_category_id || f.channel);
    });

    // Reset filters handler
    const onResetFilters = () => {
      emit('reset');
    };

    const onInputChange = () => {
      emit('update:filters', internalFilters.value);
    };

    return {
      // computed
      internalFilters,
      areFiltersActive,

      // methods
      onResetFilters,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-filters-menu-card {
  .unibox-filters-content {
    width: 320px;
    border: 1px solid $grey-50;
    border-radius: 8px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      width: 300px;
    }

    .filters-header {
      padding: 12px;
      border-bottom: 1px solid $grey-50;

      .filters-title {
        color: $black;
        font-size: 14px;
        font-weight: 600;
      }

      .reset-btn {
        font-size: 12px;
        font-weight: 500;
        padding: 0 4px;
      }
    }

    .filters-grid {
      padding: 16px;
      display: grid;
      grid-row-gap: 12px;

      .filter-item {
        width: 100%;
      }
    }
  }
}
</style>
