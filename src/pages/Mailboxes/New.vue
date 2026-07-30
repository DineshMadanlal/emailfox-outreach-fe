<template>
  <AddMailbox />
</template>

<script>
// vue
import { defineComponent } from 'vue';

// quasar
import { useMeta } from 'quasar';

// components
import AddMailbox from 'components/Mailboxes/AddMailbox.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'NewMailbox',

  components: {
    AddMailbox,
  },

  setup() {
    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('New Mailbox'));
  },
});
</script>
