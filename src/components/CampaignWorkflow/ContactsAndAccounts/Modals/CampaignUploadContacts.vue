<template>
  <div class="campaign-upload-contacts-card">
    <ImportContacts
      fromCampaignWorkflow
      :campaignId="campaignId"

      @closeModal="$emit('closeModal')"
      @onListImported="$emit('onListImported')"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import ImportContacts from 'components/ContactsManager/Import.vue';

export default defineComponent({
  name: 'CampaignUploadContacts',

  emits: ['closeModal', 'onListImported'],

  components: {
    ImportContacts,
  },

  props: {
    campaignId: {
      type: [String, Number],
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.campaign-upload-contacts-card {
  position: relative;
  max-width: 740px;
  background: $white;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 740px;
    min-height: 100%;

    display: flex;
    flex-direction: column;
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  @media (min-width: 601px) and (max-width: 760px) {
    // For medium screens, we can set a specific width or use a percentage
    width: calc(100vw - 32px);
  }

  :deep(.import-contacts) {
    flex: 1;
  }
}
</style>
