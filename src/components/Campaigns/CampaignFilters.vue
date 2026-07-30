<template>
  <div class="campaign-filters">
    <!-- Add campaign -->
    <q-btn
      no-caps
      unelevated

      color="primary"
      label="+ Create Campaign"

      @click="$emit('createNewCampaign')"
    >
    </q-btn>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed,
} from 'vue';

export default defineComponent({
  name: 'CampaignFilters',

  emits: ['createNewCampaign', 'update:searchCampaignInput'],

  props: {
    searchCampaignInput: {
      type: String,
      default: '',
    },
    canFilter: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // computed
    const computedSearchInput = computed({
      get: () => props.searchSequenceInput,
      set: (value) => {
        emit('update:searchSequenceInput', value);
      },
    });

    return {
      // computed
      computedSearchInput,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-filters {
  gap: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: $breakpoint-xs-max) {
    width: 100%;
  }

  .available-filters-block {
    display: flex;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      width: 100%;
    }
  }
}
</style>
