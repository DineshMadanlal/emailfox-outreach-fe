<template>
  <q-menu
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <q-list
      style="min-width: 220px"
      class="contacts-more-filters-list"
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

        <!-- Status -->
        <div class="full-width">
          <InputLabel
            label="Contact Status"
          />

          <SelectContactStatus
            :clearable="true"
            placeholderText=""
            v-model="computedFilterStatus"

            class="dead-small full-width"
          />
        </div>

        <!-- List -->
        <div
          v-if="canFilterList"
          class="full-width"
        >
          <InputLabel
            label="List"
          />
          <SelectList
            :clearable="true"
            placeholderText=""
            v-model="computedFilterList"

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
import SelectList from 'components/Dropdown/SelectList.vue';
import SelectContactStatus from 'components/Dropdown/SelectContactStatus.vue';

export default defineComponent({
  name: 'ContactsMoreFilters',

  emits: [
    'update:filterProvider',
    'update:filterStatus',
    'update:filterList',
  ],

  components: {
    InputLabel,
    SelectList,
    SelectProvider,
    SelectContactStatus,
  },

  props: {
    filterProvider: {
      type: String,
      default: '',
    },
    filterStatus: {
      type: String,
      default: '',
    },
    canFilterList: {
      type: Boolean,
      default: false,
    },
    filterList: {
      type: Object,
      default: null,
    },
  },

  setup(props, { emit }) {
    // computed
    const computedFilterProvider = computed({
      get: () => props.filterProvider,
      set: (value) => {
        emit('update:filterProvider', value);
      },
    });

    const computedFilterStatus = computed({
      get: () => props.filterStatus,
      set: (value) => {
        emit('update:filterStatus', value);
      },
    });

    const computedFilterList = computed({
      get: () => props.filterList,
      set: (value) => {
        emit('update:filterList', value);
      },
    });

    return {
      // computed
      computedFilterStatus,
      computedFilterProvider,
      computedFilterList,
    };
  },
});
</script>

<style lang="scss" scoped>
.contacts-more-filters-list {
  .mailbox-dd-filters {
    width: 100%;
    padding: 8px 12px;

    display: grid;
    grid-row-gap: 12px;
  }
}
</style>
