<template>
  <div class="mailbox-campaign-page">
    <CampaignsTable
      :mailboxByJson="mailboxByJson"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import CampaignsTable from 'components/Campaigns/CampaignsTable.vue';

export default defineComponent({
  name: 'MailboxCampaign',

  components: {
    CampaignsTable,
  },

  props: {
    mailboxByJson: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.mailbox-campaign-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
