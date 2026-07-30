<template>
  <q-item
    :to="`/outreach/mailbox/${mailboxTableProps.row.id}`"
    class="mailbox-item-mobile-view"
  >
    <!-- Delete Mailbox -->
    <q-btn
      flat
      round
      dense
      v-close-popup

      color="negative"
      class="app-negative-button"

      @click.prevent.stop="$emit('deleteMailbox')"
    >
      <LocalSvgIcon
        image="delete"
        classes="app-negative-icon"
      />
    </q-btn>

    <div class="table-grid-row">
      <div
        v-for="column in mailboxTableProps.cols"
        :key="`table-grid-${column.name}`"
        class="table-grid-each-data"
      >
        <p class="table-grid-label-text">
          {{ column.label }}
        </p>

        <!-- full name -->
        <p
          class="table-grid-value-text"
          v-if="column.name === 'fullName'"
        >
          {{ mailboxTableProps.row.first_name }} {{ mailboxTableProps.row.last_name }}
        </p>

        <!-- email -->
        <p
          class="table-grid-value-text"
          v-if="column.name === 'email'"
        >
          {{ mailboxTableProps.row.email }}
        </p>

        <!-- sent -->
        <div
          class="flex no-wrap items-center"
          v-if="column.name === 'sent'"
        >
          <LocalSvgIcon
            image="sent"
            class="mailbox-icon"
          />

          <p
            class="table-grid-value-text"
          >
            {{ getNumeralAmount(mailboxTableProps.row.sent_count) }}
          </p>
        </div>

        <!-- received -->
        <div
          class="flex no-wrap items-center"
          v-if="column.name === 'received'"
        >
          <LocalSvgIcon
            image="replied"
            class="mailbox-icon"
          />

          <p
            class="table-grid-value-text"
          >
            {{ getNumeralAmount(mailboxTableProps.row.reply_count) }}
          </p>
        </div>

        <!-- bounced -->
        <div
          class="flex no-wrap items-center"
          v-if="column.name === 'bounced'"
        >
          <LocalSvgIcon
            image="bounced"
            class="mailbox-icon"
          />

          <p
            class="table-grid-value-text"
          >
            {{ getNumeralAmount(mailboxTableProps.row.bounce_count) }}
          </p>
        </div>

      </div>
    </div>
  </q-item>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers';

export default defineComponent({
  name: 'MailboxItemMobileView',

  emits: ['deleteMailbox'],

  props: {
    mailboxTableProps: {
      type: Object,
      required: true,
    },
  },

  setup() {
    return {
      // methods
      getNumeralAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailbox-item-mobile-view {
  width: 100%;
  padding: 12px;
  min-height: unset;
  border: 1px solid $grey-50;

  position: relative;

  .app-negative-button {
    position: absolute;
    top: 8px;
    right: 8px;
  }

  .table-grid-row {
    display: grid;
    grid-row-gap: 4px;

    .table-grid-each-data {
      display: grid;
      grid-row-gap: 2px;

      .table-grid-label-text {
        font-size: 12px;
        color: rgba($color: var(--black-rgb), $alpha: 0.54);
      }

      .table-grid-value-text {
        font-size: 13px;
        color: $black;
      }

      .mailbox-icon {
        margin-right: 8px;
      }
    }
  }
}
</style>
