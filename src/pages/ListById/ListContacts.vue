<template>
  <!--  -->
  <ListContactsProgress
    :listId="listId"
    v-if="isSetupInProgress"
  />

  <!--  -->
  <ContactsTable
    hideHeader
    :listId="listId"
  />
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import ContactsTable from 'components/Contacts/ContactsTable.vue';
import ListContactsProgress from 'components/ListById/ListContactsProgress.vue';

export default defineComponent({
  name: 'ListContacts',

  components: {
    ContactsTable,
    ListContactsProgress,
  },

  props: {
    listId: {
      type: Number,
      required: true,
    },
    listByJson: {
      type: Object,
      required: true,
    },
    isSetupInProgress: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>

</style>
