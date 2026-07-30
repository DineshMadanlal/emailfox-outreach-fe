<template>
  <div class="mailbox-filters">
    <!--  -->
    <div
      v-if="canFilter"
      class="available-filters-block"
    >
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
import {
  defineComponent,
} from 'vue';

export default defineComponent({
  name: 'MailboxFilters',

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

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      width: 100%;
      flex-direction: column;
      align-items: flex-end;
    }
  }
}
</style>
