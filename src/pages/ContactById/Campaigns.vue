<template>
  <div class="contact-campaigns-page">
    <CampaignsTable
      v-if="contactId"
      :contactId="contactId"
    />
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// router
import { useRoute } from 'vue-router';

// components
import CampaignsTable from 'components/Campaigns/CampaignsTable.vue';

export default defineComponent({
  name: 'ContactCampaigns',

  components: {
    CampaignsTable,
  },

  props: {
    contactJson: {
      type: Object,
      default: () => ({}),
    },
    contactOverviewData: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // route
    const route = useRoute();

    // computed
    const contactId = computed(() => props.contactJson?.id || route.params.contactId);

    return {
      // computed
      contactId,
    };
  },
});
</script>

<style lang="scss" scoped>
.contact-campaigns-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
