<template>
  <div class="sequence-by-id-contacts">
    <!-- contact delivery stats -->
    <ContactDeliveryStats
      :campaignId="campaignId"

      v-if="false"
    />

    <!-- table -->
    <CampaignContactsTable
      :campaignId="campaignId"
      :contactId="effectiveContactId"
    />
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// vue router
import { useRoute } from 'vue-router';

// Components
import CampaignContactsTable from 'components/Contacts/CampaignContactsTable.vue';
import ContactDeliveryStats from 'components/Contacts/ContactDeliveryStats.vue';

export default defineComponent({
  name: 'CampaignByIdContacts',

  components: {
    CampaignContactsTable,
    ContactDeliveryStats,
  },

  props: {
    campaignByIdJson: {
      type: Object,
      default: () => ({}),
    },
    contactId: {
      type: [String, Number],
      default: null,
    },
  },

  setup(props) {
    const route = useRoute();

    const campaignId = computed(() => (
      props.campaignByIdJson?.id
      || route.params.campaignId
    ));

    const effectiveContactId = computed(() => (
      props.contactId
      || route.query.contactId
      || null
    ));

    return {
      campaignId,
      effectiveContactId,
    };
  },
});
</script>

<style lang="scss" scoped>
.sequence-by-id-contacts {
  width: 100%;
  display: flex;
  min-height: 0;
  flex-direction: column;

  .contact-status-bar {
    min-height: 92px;
  }
}
</style>
