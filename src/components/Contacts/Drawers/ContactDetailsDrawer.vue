<template>
  <ContactById
    isModal
    :contactId="contactId"
    :campaignId="campaignId"
    :hideCampaignsTab="hideCampaignsTab"
    :defaultTab="defaultTab"
    :contactRow="contactRow"
    @closeModal="$emit('closeModal')"
    @update:replyCategory="$emit('update:replyCategory', $event)"
  />
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import ContactById from 'pages/ContactById/Index.vue';

export default defineComponent({
  name: 'ContactDetailsDrawer',

  components: {
    ContactById,
  },

  props: {
    contactId: {
      type: [String, Number],
      default: null,
    },
    campaignId: {
      type: [String, Number],
      default: null,
    },
    hideCampaignsTab: {
      type: Boolean,
      default: false,
    },
    defaultTab: {
      type: String,
      default: 'overview',
    },
    contactRow: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ['closeModal', 'update:replyCategory'],
});
</script>
