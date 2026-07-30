<template>
  <q-expansion-item
    switch-toggle-side
    :default-opened="openByDefault"

    class="email-by-domain-panel"
    header-class="email-by-domain-panel-header"
  >
    <!-- Dialog -->
    <q-dialog
      v-model="showEditMailboxDetailsModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <EditMailboxDetails
        :domainEmailEntries="domainEmailEntries"
        :mailboxDetails="editMailboxDetailsJson.row"

        @onUpdateMailboxDetails="onUpdateMailboxDetails"
      />
    </q-dialog>

    <!-- header -->
    <template #header>
      <div class="full-width flex no-wrap items-center">
        <LocalSvgIcon image="plain-down-arrow" class="down-arrow-icon" />

        <p class="domain-name-text">
          Domain:
          <span>
            {{ domain }}
          </span>
        </p>

        <q-space />

        <p class="mailbox-number-text">
          {{ domainEmailEntriesLength }} {{ $pluralize('Mailbox', domainEmailEntriesLength) }} Added
        </p>

      </div>
    </template>

    <q-table
      separator="cell"
      class="emails-domains-table app-table"

      :dense="isMobileDevice"
      hide-pagination

      :columns="tableColumns"
      :rows="domainEmailEntries"

      :pagination="TABLE_PAGINATION"
    >
      <!-- email -->
      <template v-slot:body-cell-email="props">
        <q-td
          :props="props"
        >
          <div>
            {{ props.row.email }}
          </div>
        </q-td>
      </template>

      <!-- Full Name -->
      <template v-slot:body-cell-fullName="props">
        <q-td
          :props="props"
        >
          <div>
            {{ props.row.first_name }} {{ props.row.last_name }}
          </div>
        </q-td>
      </template>

      <!-- Action -->
      <template v-slot:body-cell-action="props">
        <q-td
          :props="props"
        >
          <div class="flex no-wrap items-center">
            <!-- Edit Button -->
            <q-btn
              flat
              round
              dense

              color="primary"
              class="app-primary-button q-mr-sm"

              @click="editMailboxDetails(props)"

              v-if="!props.row.is_active"
            >
              <LocalSvgIcon
                image="edit"
                classes="app-primary-icon"
              />
            </q-btn>

            <!-- Delete button -->
            <q-btn
              flat
              round
              dense

              color="negative"
              class="app-negative-button"

              @click="removeEmailByDomain(props)"

              v-if="!props.row.is_active"
            >
              <LocalSvgIcon
                image="delete"
                classes="app-negative-icon"
              />
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>
  </q-expansion-item>
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, computed, reactive, toRefs,
} from 'vue';

// Components
import EditMailboxDetails from 'components/NewDomain/Modals/EditMailboxDetails.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { TABLE_PAGINATION } from 'boot/constants';

export default defineComponent({
  name: 'EmailByDomainPanel',

  emits: ['updateEmailEntriesOfDomain'],

  components: {
    EditMailboxDetails,
  },

  props: {
    openByDefault: {
      type: Boolean,
      default: false,
    },
    domain: {
      type: String,
      required: true,
    },
    domainEmailEntries: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      editMailboxDetailsJson: {},
      showEditMailboxDetailsModal: false,
    });

    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // computed
    const domainEmailEntriesLength = computed(() => size(props.domainEmailEntries));

    const tableColumns = [
      {
        name: 'fullName',
        label: 'Full Name',
        align: 'left',
      },

      {
        name: 'email',
        label: 'Email',
        align: 'left',
        field: 'email',
      },

      {
        name: 'action',
        label: '',
        align: 'right',
        field: 'action',
      },
    ];

    // methods
    const removeEmailByDomain = (tableRowProps) => {
      const domainEmailEntries = [...props.domainEmailEntries];

      // remove email from domain
      domainEmailEntries.splice(tableRowProps.rowIndex, 1);

      emit('updateEmailEntriesOfDomain', {
        domain: props.domain, domainEmailEntries,
      });
    };

    const editMailboxDetails = (tableRowProps) => {
      state.editMailboxDetailsJson = tableRowProps;
      state.showEditMailboxDetailsModal = true;
    };

    const onUpdateMailboxDetails = (updatedMailboxDetails) => {
      const domainEmailEntries = [...props.domainEmailEntries];

      // update email details
      domainEmailEntries[state.editMailboxDetailsJson.rowIndex] = updatedMailboxDetails;

      emit('updateEmailEntriesOfDomain', {
        domain: props.domain, domainEmailEntries,
      });

      state.showEditMailboxDetailsModal = false;
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      domainEmailEntriesLength,

      // methods
      editMailboxDetails,
      removeEmailByDomain,
      onUpdateMailboxDetails,

      // hardcoded
      tableColumns,
      TABLE_PAGINATION,
    };
  },
});
</script>

<style lang="scss" scoped>
.email-by-domain-panel {
  width: 100%;
  border-radius: 6px;
  border: 1px solid $blue-grey;

  .down-arrow-icon {
    transition: transform 0.3s;
  }

  [aria-expanded="true"] {
    .down-arrow-icon {
      transform: rotate(180deg);
    }
  }

  :deep(.email-by-domain-panel-header) {
    width: 100%;
    padding: 20px;
    min-height: unset;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 16px;
    }

    .q-item__section {
      display: none;
    }

    .domain-name-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;

      margin-left: 10px;

      max-width: 500px;
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: normal;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        max-width: 200px;
      }

      span {
        font-weight: 600;
      }
    }

    .mailbox-number-text {
      color: $grey;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;

      margin-left: 8px;
    }
  }

  .emails-domains-table {
    border: 0px;
  }
}
</style>
