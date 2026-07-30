<template>
  <EmailThreadList
    :threadType="threadType"
  />
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import EmailThreadList from 'components/MasterInbox/EmailThreadList.vue';

// quasar
import { useMeta } from 'quasar';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { EMAIL_THREAD_TYPE } from 'boot/constants';

export default defineComponent({
  name: 'SkyBoxSpam',

  components: {
    EmailThreadList,
  },

  setup() {
    // composables
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Unibox Spam'));

    return {
      // constant
      threadType: EMAIL_THREAD_TYPE.SPAM,
    };
  },
});
</script>
