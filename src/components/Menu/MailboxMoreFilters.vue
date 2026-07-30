<template>
  <q-menu
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <q-list
      style="min-width: 220px"
      class="mailboxes-more-filters-list"
    >
      <!-- Dropdown filters here -->
      <div class="mailbox-dd-filters">
        <!-- Provider -->
        <div class="full-width">
          <InputLabel
            label="Provider"
          />
          <SelectProvider
            :clearable="true"
            placeholderText=""
            v-model="computedFilterProvider"

            class="dead-small full-width"
          />
        </div>

        <!-- Warmup Status -->
        <div class="full-width">
          <InputLabel
            label="Warmup Status"
          />

          <SelectWarmupStatus
            :clearable="true"
            placeholderText=""
            v-model="computedFilterWarmupStatus"

            class="dead-small full-width"
          />
        </div>

        <!-- Status -->
        <div class="full-width">
          <InputLabel
            label="Connection Status"
          />

          <SelectMailboxConnection
            :clearable="true"
            placeholderText=""
            v-model="computedFilterStatus"

            class="dead-small full-width"
          />
        </div>
      </div>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import SelectProvider from 'components/Dropdown/SelectProvider.vue';
import SelectWarmupStatus from 'components/Dropdown/SelectWarmupStatus.vue';
import SelectMailboxConnection from 'components/Dropdown/SelectMailboxConnection.vue';

export default defineComponent({
  name: 'MailboxMoreFilters',

  emits: [
    'update:filterProvider',
    'update:filterWarmupStatus',
    'update:filterStatus',
  ],

  props: {
    filterProvider: {
      type: String,
      default: '',
    },
    filterWarmupStatus: {
      type: String,
      default: '',
    },
    filterStatus: {
      type: String,
      default: '',
    },
  },

  components: {
    InputLabel,
    SelectProvider,
    SelectWarmupStatus,
    SelectMailboxConnection,
  },

  setup(props, { emit }) {
    // computed
    const computedFilterProvider = computed({
      get: () => props.filterProvider,
      set: (value) => {
        emit('update:filterProvider', value);
      },
    });

    const computedFilterWarmupStatus = computed({
      get: () => props.filterWarmupStatus,
      set: (value) => {
        emit('update:filterWarmupStatus', value);
      },
    });

    const computedFilterStatus = computed({
      get: () => props.filterStatus,
      set: (value) => {
        emit('update:filterStatus', value);
      },
    });

    return {
      // computed
      computedFilterProvider,
      computedFilterWarmupStatus,
      computedFilterStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailboxes-more-filters-list {
  .mailbox-dd-filters {
    width: 100%;
    padding: 8px 12px;

    display: grid;
    grid-row-gap: 12px;
  }
}
</style>
