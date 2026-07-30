<template>
  <div class="all-contacts-container">
    <AppHeader
      title="Contacts"
    >
      <template v-slot:headerRightSection>
        <div id="mainContactsRightHeader"></div>
      </template>
    </AppHeader>

    <ContactsTable />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// quasar
import { useMeta } from 'quasar';

// Components
import AppHeader from 'components/Headers/AppHeader.vue';
import ContactsTable from 'components/Contacts/ContactsTable.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'AllContacts',

  components: {
    AppHeader,
    ContactsTable,
  },

  setup() {
    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('All Contacts'));
  },
});
</script>

<style lang="scss" scoped>
.all-contacts-container {
  width: 100%;
  flex: 1;
  display: flex;
  min-height: 0;
  flex-direction: column;

  :deep(.app-header) {
    padding-bottom: 0px;
  }
}
</style>
