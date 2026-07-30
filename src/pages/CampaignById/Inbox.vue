<template>
  <EmailThreadList
    :threadType="threadType"
    :sequenceByIdPage="true"
  />
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import EmailThreadList from 'components/MasterInbox/EmailThreadList.vue';

// constants
import { EMAIL_THREAD_TYPE } from 'boot/constants';

export default defineComponent({
  name: 'SequenceByIdInbox',

  components: {
    EmailThreadList,
  },

  setup() {
    return {
      // constant
      threadType: EMAIL_THREAD_TYPE.INBOX,
    };
  },
});
</script>
