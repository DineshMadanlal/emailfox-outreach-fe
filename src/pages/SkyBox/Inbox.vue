<template>
  <EmailThreadList
    :threadType="threadType"
  />
</template>

<script>
// vue
import { defineComponent } from 'vue';

// quasar
import { useMeta } from 'quasar';

// components
import EmailThreadList from 'components/MasterInbox/EmailThreadList.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { EMAIL_THREAD_TYPE } from 'boot/constants';

export default defineComponent({
  name: 'SkyBoxInbox',

  components: {
    EmailThreadList,
  },

  setup() {
    // composables
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Unibox Inbox'));

    return {
      // constant
      threadType: EMAIL_THREAD_TYPE.INBOX,
    };
  },
});
</script>
