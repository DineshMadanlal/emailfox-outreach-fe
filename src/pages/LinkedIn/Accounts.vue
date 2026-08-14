<template>
  <div class="all-linkedin-page">
    <LinkedInTable
      fromAllLinkedInPage
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
import LinkedInTable from 'components/ConnectedAccounts/LinkedInTable.vue';

export default defineComponent({
  name: 'LinkedInAccounts',

  components: {
    LinkedInTable,
  },

  setup() {
    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('LinkedIn Accounts'));
  },
});
</script>

<style lang="scss" scoped>
.all-linkedin-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
