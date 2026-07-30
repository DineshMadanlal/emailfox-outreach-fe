<template>
  <div class="sequence-by-id-contacts">
    <!-- contact delivery stats -->
    <ContactDeliveryStats />

    <!-- table -->
    <ContactsTable
      hideHeader
      :sequenceByIdPage="true"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import ContactsTable from 'components/Contacts/ContactsTable.vue';
import ContactDeliveryStats from 'components/Contacts/ContactDeliveryStats.vue';

export default defineComponent({
  name: 'SequenceByIdContacts',

  components: {
    ContactsTable,
    ContactDeliveryStats,
  },
});
</script>

<style lang="scss" scoped>
.sequence-by-id-contacts {
  width: 100%;
  display: flex;
  min-height: 0;
  flex-direction: column;

  .contact-status-bar {
    min-height: 92px;
  }
}
</style>
