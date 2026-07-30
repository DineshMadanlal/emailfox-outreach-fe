<template>
  <ImportContacts />
</template>

<script>
// vue
import { defineComponent } from 'vue';

// quasar
import { useMeta } from 'quasar';

// components
import ImportContacts from 'components/ContactsManager/Import.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'UploadContacts',

  components: {
    ImportContacts,
  },

  setup() {
    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Upload Contacts'));
  },
});
</script>
