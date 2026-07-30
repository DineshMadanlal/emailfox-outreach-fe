<template>
  <q-table
    separator="cell"
    class="selected-domains-table app-table"

    hide-pagination

    :rows="tableRows"
    :columns="tableColumns"
    :pagination="TABLE_PAGINATION"
  >
    <!-- Domain name -->
    <template v-slot:body-cell-domain="props">
      <q-td
        :props="props"
        :class="{ 'total-row': props.row.isTotalRow }"
      >
        <div>
          {{ props.row.domain }}
        </div>
      </q-td>
    </template>

    <!-- Price -->
    <template v-slot:body-cell-price="props">
      <q-td
        :props="props"
        :class="{ 'total-row': props.row.isTotalRow }"
      >
        {{ props.row.price }}
      </q-td>
    </template>

    <!-- Action -->
    <template v-slot:body-cell-action="props">
      <q-td
        :props="props"
      >
        <!-- Delete button -->
        <q-btn
          flat
          round
          dense

          color="negative"
          class="app-negative-button"

          @click="removeDomain(props)"

          v-if="!props.row.isTotalRow"
        >
          <LocalSvgIcon
            image="delete"
            classes="app-negative-icon"
          />
        </q-btn>
      </q-td>
    </template>
  </q-table>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// constants
import { TABLE_PAGINATION } from 'boot/constants';

export default defineComponent({
  name: 'SelectedDomainsTable',

  emits: ['removeDomain'],

  props: {
    domainsToPurchase: {
      type: Array,
      required: true,
      default: () => [],
    },
  },

  setup(props, { emit }) {
    // computed
    const purchasedDomainsLength = computed(() => props.domainsToPurchase.length);

    // calculate domain cost
    // const totalDomainsCost = computed(() => {
    //   const totalCost = props.domainsToPurchase
    //     .reduce((acc, domain) => acc + parseFloat(domain.price.replace('$', '')), 0);

    //   return `$${totalCost}`;
    // });

    const tableRows = computed(() => {
      const rows = [
        ...props.domainsToPurchase,
        // {
        //   isTotalRow: true,
        //   domain: 'Total Cost',
        //   price: totalDomainsCost.value,
        //   action: '',
        // },
      ];

      return rows;
    });

    const tableColumns = computed(() => [
      {
        name: 'domain',
        label: `Selected Domains (${purchasedDomainsLength.value})`,
        align: 'left',
        field: 'domain',
      },

      // {
      //   name: 'price',
      //   label: 'Cost/Domain',
      //   align: 'right',
      //   field: 'price',
      // },

      {
        name: 'action',
        label: '',
        align: 'right',
        field: 'action',
      },
    ]);

    const removeDomain = (tableRowProps) => {
      emit('removeDomain', {
        domainJson: tableRowProps.row,
        rowIndex: tableRowProps.rowIndex,
      });
    };

    return {
      // computed
      tableRows,
      tableColumns,

      // methods
      removeDomain,

      // hardcoded
      TABLE_PAGINATION,
    };
  },
});
</script>

<style lang="scss" scoped>
.selected-domains-table {
  width: 100%;
  max-width: 560px;

  margin-top: 32px;

  .total-row {
    font-weight: 600;
  }
}
</style>
