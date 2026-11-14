<template>
  <div class="contact-campaigns-page">
    <CampaignsTable
      v-if="effectiveContactId"
      :contactId="effectiveContactId"
    />
  </div>
</template>

<script>
// vue
import { defineComponent, computed, inject } from 'vue';

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
    contactId: {
      type: [String, Number],
      default: null,
    },
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
    const injectedContactId = inject('contactId', null);

    // computed
    const effectiveContactId = computed(() => (
      props.contactId
      || injectedContactId?.value
      || props.contactJson?.contact?.id
      || props.contactJson?.id
      || props.contactOverviewData?.contact?.id
      || route.params.contactId
    ));

    return {
      // computed
      effectiveContactId,
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
