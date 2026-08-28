<template>
  <div class="mailbox-filters">
    <!--  -->
    <div
      v-if="canFilter"
      class="available-filters-block"
    >
      <!-- More options / Import History -->
      <q-btn
        dense
        outlined
        unelevated

        class="filter-more-btn"
      >
        <!-- more -->
        <LocalSvgIcon
          image="more"
          classes="filter-more-icon"
        />

        <!--  -->
        <AllMailboxesMoreOptions
          @importHistory="$emit('importHistory')"
        />

      </q-btn>

      <!-- Connect Mailbox Button -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Connect Mailbox"

        to="/outreach/mailboxes/new"
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import AllMailboxesMoreOptions from 'components/Menu/AllMailboxesMoreOptions.vue';

export default defineComponent({
  name: 'MailboxFilters',

  emits: [
    'importHistory',
  ],

  components: {
    AllMailboxesMoreOptions,
  },

  props: {
    canFilter: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.mailbox-filters {
  width: 100%;
  display: flex;
  align-items: center;

  .available-filters-block {
    display: flex;
    align-items: center;

    row-gap: 12px;
    column-gap: 12px;

    .filter-more-btn {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      border: 1px solid $blue-grey;

      .filter-more-icon {
        transform: rotate(90deg);
      }
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      width: 100%;
      flex-direction: column;
      align-items: flex-end;
    }
  }
}
</style>
