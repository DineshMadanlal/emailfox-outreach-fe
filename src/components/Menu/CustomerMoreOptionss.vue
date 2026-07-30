<template>
  <q-menu
    auto-close
    v-model="computedShowMenu"
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <!-- List -->
    <q-list style="min-width: 202px" class="customers-action-list">
      <!-- Edit -->
      <!-- <q-item
        v-ripple
        clickable
        class="flex items-center each-customer-action-item"
        @click="onEditCustomer"
      >
        <LocalSvgIcon image="edit" classes="customer-menu-icon" />

        <p class="customer-action-text">
          Edit
        </p>
      </q-item> -->

      <!-- Mark as Inactive -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-customer-action-item"
        @click="onUpdateCustomerStatus"
      >
        <LocalSvgIcon image="rectangle-box" classes="customer-menu-icon" />

        <p class="customer-action-text">
          {{ customerStatusUpdateText }}
        </p>
      </q-item>

      <!-- Delete -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-customer-action-item delete-customer-item"
        @click="onDeleteCustomer"
      >
        <LocalSvgIcon image="delete" classes="customer-menu-icon delete-icon" />

        <p class="customer-action-text">
          Delete
        </p>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// constants
import { CUSTOMER_STATUS } from 'boot/constants';

export default defineComponent({
  name: 'CustomersMoreOptions',

  emits: ['update:showMenu', 'deleteCustomer', 'updateCustomerStatus', 'onEditCustomer'],

  props: {
    // show menu
    showMenu: {
      type: Boolean,
      default: false,
    },
    customerDetails: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // computed
    const computedShowMenu = computed({
      get: () => props.showMenu,
      set: (value) => {
        emit('update:showMenu', value);
      },
    });

    const customerStatusUpdateText = computed(() => {
      const newStatus = props.customerDetails.status === CUSTOMER_STATUS.ACTIVE ? 'Inactive' : 'Active';

      return `Mark as ${newStatus}`;
    });

    // methods
    const onEditCustomer = () => {
      emit('onEditCustomer', props.customerDetails);
    };

    const onDeleteCustomer = () => {
      emit('deleteCustomer', props.customerDetails);
    };

    const onUpdateCustomerStatus = () => {
      emit('updateCustomerStatus', props.customerDetails);
    };

    return {
      // computed
      computedShowMenu,
      customerStatusUpdateText,

      // methods
      onEditCustomer,
      onDeleteCustomer,
      onUpdateCustomerStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
.customers-action-list {

  .each-customer-action-item {
    padding: 10px 12px;
    min-height: unset;

    .customer-action-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-left: 8px;
    }

    :deep(.customer-menu-icon) {
      @include svg-icon-stroke('path, circle, rect', $grey);
    }

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    &.delete-customer-item {
      &:hover {
        background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);

        :deep(.customer-menu-icon) {
          @include svg-icon-stroke('path, circle, rect', $negative);
        }

        .customer-action-text {
          color: $negative;
        }
      }
    }
  }
}
</style>
