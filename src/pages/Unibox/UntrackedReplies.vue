<template>
  <UniboxEmailThreadList
    :threadType="threadType"
  />
</template>

<script>
// vue
import { defineComponent } from 'vue';

// quasar
import { useMeta } from 'quasar';

// components
import UniboxEmailThreadList from 'components/Unibox/EmailThreadList.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { UNIBOX_THREAD_TYPE } from 'boot/unibox-constants';

export default defineComponent({
  name: 'UniboxUntrackedRepliesPage',

  components: {
    UniboxEmailThreadList,
  },

  setup() {
    // composables
    const { generateMetadata } = useAppHelpersApi();

    // page metadata
    useMeta(generateMetadata('Untracked Replies | Unibox'));

    return {
      // constants
      threadType: UNIBOX_THREAD_TYPE.UNTRACKED_REPLIES,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
