<template>
  <div class="main-campaign-page">
    <CampaignsTable
      fromAllCampaignsPage
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
import CampaignsTable from 'components/Campaigns/CampaignsTable.vue';

export default defineComponent({
  name: 'AllCampaigns',

  components: {
    CampaignsTable,
  },

  setup() {
    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('All Campaigns'));
  },
});
</script>

<style lang="scss" scoped>
.main-campaign-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
