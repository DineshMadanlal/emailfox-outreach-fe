<template>
  <ImportContacts />
</template>

<script>
// vue
import { defineComponent, onMounted } from 'vue';

// vue router
import { useRouter } from 'vue-router';

// quasar
import { useMeta } from 'quasar';

// components
import ImportContacts from 'components/ContactsManager/Import.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';
import { usePermissions } from 'src/composables/usePermissions';

export default defineComponent({
  name: 'UploadContacts',

  components: {
    ImportContacts,
  },

  setup() {
    // router
    const $router = useRouter();

    // permissions
    const { isReadOnly } = usePermissions();

    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Upload Contacts'));

    onMounted(() => {
      if (isReadOnly.value) {
        $router.replace('/outreach/contacts/all');
      }
    });
  },
});
</script>
