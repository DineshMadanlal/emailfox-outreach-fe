<template>
  <div class="all-mailboxes-page">
    <!-- table -->
    <MailboxesTable
      fromAllMailboxesPage

      @importHistory="modals.importHistory = true"
    />
  </div>
</template>

<script>
// vue
import { defineComponent, reactive, toRefs } from 'vue';

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

    // state
    const state = reactive({
      modals: {
        importHistory: false,
      },
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.all-mailboxes-page {
  width: 100%;
  display: flex;
  min-height: 0;
  flex-direction: column;
}
</style>
