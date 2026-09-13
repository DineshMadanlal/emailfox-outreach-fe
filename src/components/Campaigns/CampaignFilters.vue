<template>
  <div class="campaign-filters">
    <!-- Add campaign -->
    <q-btn
      no-caps
      unelevated

      color="primary"
      label="+ Create Campaign"
      :disable="isReadOnly"

      @click="!isReadOnly && $emit('createNewCampaign')"
    >
      <AppTooltip
        v-if="isReadOnly"
        content="You have read-only access in this workspace"
      />
    </q-btn>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed,
} from 'vue';

// composables
import { usePermissions } from 'src/composables/usePermissions';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'CampaignFilters',

  components: {
    AppTooltip,
  },

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
    // composables
    const { isReadOnly } = usePermissions();

    // computed
    const computedSearchInput = computed({
      get: () => props.searchSequenceInput,
      set: (value) => {
        emit('update:searchSequenceInput', value);
      },
    });

    return {
      // computed
      isReadOnly,
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
