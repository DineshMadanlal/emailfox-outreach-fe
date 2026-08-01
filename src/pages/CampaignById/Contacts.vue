<template>
  <div class="sequence-by-id-contacts">
    <!-- contact delivery stats -->
    <ContactDeliveryStats
      :campaignId="campaignByIdJson.id"

      v-if="false"
    />

    <!-- table -->
    <ContactsTable
      hideHeader
      :campaignId="campaignByIdJson.id"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import ContactsTable from 'components/Contacts/ContactsTable.vue';
import ContactDeliveryStats from 'components/Contacts/ContactDeliveryStats.vue';

export default defineComponent({
  name: 'CampaignByIdContacts',

  components: {
    ContactsTable,
    ContactDeliveryStats,
  },

  props: {
    campaignByIdJson: {
      type: Object,
      default: () => ({}),
    },
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
