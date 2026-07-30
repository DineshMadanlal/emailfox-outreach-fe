<template>
  <q-card flat class="mailboxes-table-card">
    <!-- Dialog -->
    <q-dialog
      v-model="showDeleteMailboxModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteMailbox
        :domainId="domainId"
        :mailboxId="deleteMailboxId"
        @onSuccessfulDeleteMailbox="onSuccessfulDeleteMailbox"
      />
    </q-dialog>

    <!--  -->
    <div class="mailbox-table-header">
      <h6 class="overview-header-text">
        Mailboxes Added in this Domain
        <span>
          ({{ mailboxesCount }})
        </span>
      </h6>

      <q-space />

      <p class="number-mailboxes-text">
        {{ mailboxesCount }} {{ $pluralize('Mailbox', mailboxesCount) }} Added
      </p>
    </div>

    <!-- Table -->
    <q-table
      separator="cell"
      class="domain-mailboxes-table app-table"

      hide-pagination

      :rows="mailboxes"
      :columns="tableColumns"

      :grid="isMobileDevice"

      :pagination="TABLE_PAGINATION"

      no-data-label="No mailboxes found."
    >
      <!-- Full Name -->
      <template v-slot:body-cell-fullName="props">
        <q-td :props="props">
          <router-link
            :to="`/outreach/mailbox/${props.row.id}`"
            class="mailbox-route-link"
          >
            <div class="mailbox-name-text">
              {{ props.row.first_name }} {{ props.row.last_name }}
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Email -->
      <template v-slot:body-cell-email="props">
        <q-td :props="props">
          <router-link
            :to="`/outreach/mailbox/${props.row.id}`"
            class="mailbox-route-link"
          >
            <div>
              {{ props.row.email }}
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Sent -->
      <template v-slot:body-cell-sent="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.id}`"
            class="mailbox-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="sent"
                classes="mailbox-icon"
              />

              <div>
                {{ getNumeralAmount(props.row.sent_count) }}
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Received -->
      <template v-slot:body-cell-received="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.id}`"
            class="mailbox-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="replied"
                classes="mailbox-icon"
              />

              <div>
                {{ getNumeralAmount(props.row.reply_count) }}
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Bounced -->
      <template v-slot:body-cell-bounced="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.id}`"
            class="mailbox-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="bounced"
                classes="mailbox-icon"
              />

              <div>
                {{ getNumeralAmount(props.row.bounce_count) }}
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Action -->
      <template v-slot:body-cell-action="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.id}`"
            class="mailbox-route-link"
          >
            <div>
              <!-- Delete button -->
              <q-btn
                flat
                round
                dense

                color="negative"
                class="app-negative-button"

                @click.prevent.stop="onDeleteMailbox(props.row)"
              >
                <LocalSvgIcon
                  image="delete"
                  classes="app-negative-icon"
                />
              </q-btn>
            </div>
          </router-link>
        </q-td>
      </template>

      <template v-slot:item="props">
        <MailboxItemMobileView
          :mailboxTableProps="props"

          @deleteMailbox="onDeleteMailbox(props.row)"
        />
      </template>
    </q-table>
  </q-card>
</template>

<script>
// lodash
import size from 'lodash/size';
// vue
import {
  defineComponent, reactive, toRefs, computed,
} from 'vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import DeleteMailbox from 'components/Domains/Modals/DeleteMailbox.vue';
import MailboxItemMobileView from 'components/DomainById/MailboxItemMobileView.vue';

// constants
import { TABLE_PAGINATION } from 'boot/constants';

export default defineComponent({
  name: 'MailboxesTable',

  emits: ['removeMailboxEntryById'],

  components: {
    DeleteMailbox,
    MailboxItemMobileView,
  },

  props: {
    domainId: {
      type: Number,
      default: 0,
    },
    mailboxes: {
      type: Array,
      default: () => [],
    },
  },

  setup(props, { emit }) {
    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      deleteMailboxId: null,
      showDeleteMailboxModal: false,
    });

    // computed
    const mailboxesCount = computed(() => size(props.mailboxes));

    // table columns
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
        name: 'sent',
        label: 'Sent',
        align: 'left',
      },
      {
        name: 'received',
        label: 'Received',
        align: 'left',
      },
      {
        name: 'bounced',
        label: 'Bounced',
        align: 'left',
      },

      {
        name: 'action',
        label: '',
        align: 'right',
        field: 'action',
      },
    ];

    // methods
    const onDeleteMailbox = (row) => {
      state.deleteMailboxId = row.id;

      state.showDeleteMailboxModal = true;
    };

    const onSuccessfulDeleteMailbox = () => {
      emit('removeMailboxEntryById', state.deleteMailboxId);

      state.showDeleteMailboxModal = false;
      state.deleteMailboxId = null;
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      mailboxesCount,

      // methods
      onDeleteMailbox,
      getNumeralAmount,
      onSuccessfulDeleteMailbox,

      // hardcoded
      tableColumns,
      TABLE_PAGINATION,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailboxes-table-card {
  width: 100%;
  border-radius: 6px;
  border: 1px solid $grey-50;
  height: fit-content;

  .mailbox-table-header {
    display: flex;
    align-items: center;

    padding: 20px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 12px;
    }

    .overview-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
      line-height: 16px;

      span {
        display: none;
        font-weight: 600;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          display: inline;
        }
      }
    }

    .number-mailboxes-text {
      color: $grey;
      font-size: 14px;
      font-weight: 400;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        display: none;
      }
    }
  }

  .domain-mailboxes-table {
    width: 100%;

    .mailbox-route-link {
      display: flex;
      align-items: center;
      height: 100%;
      width: 100%;
      text-decoration: unset;

      color: $black;
    }

    tbody {
      tr {
        &:hover {
          .mailbox-name-text {
            color: $primary;
          }
        }
      }
    }

    .mailbox-icon {
      margin-right: 8px;
    }

    :deep(.q-table__grid-content) {
      display: grid;
      grid-row-gap: 8px;
      padding: 0px 12px 12px 12px;
    }
  }
}
</style>
