<template>
  <div class="all-mailboxes-page">
    <MailboxesTable
      fromAllMailboxesPage
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// quasar
import { useMeta } from 'quasar';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import MailboxesTable from 'components/Mailboxes/MailboxesTable.vue';

export default defineComponent({
  name: 'AllMailboxes',

  components: {
    MailboxesTable,
  },

  setup() {
    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('All Mailboxes'));
  },
});
</script>

<style lang="scss" scoped>
.all-mailboxes-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
