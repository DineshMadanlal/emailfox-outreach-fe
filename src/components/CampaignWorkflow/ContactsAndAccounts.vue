<template>
  <div class="contacts-section">
    <div class="full-width">
      <!-- header -->
      <p class="contacts-header-text">
        Set Up Contacts and Mailboxes
      </p>

      <!-- desc -->
      <p class="contacts-desc-text">
        Import your contacts and connect mailboxes for campaign delivery and tracking.
      </p>
    </div>

    <!-- Add Contacts Card -->
    <SaveContacts
      :campaignById="campaignById"
    />

    <!-- Add Sender Mailboxes Card -->
    <SaveSenderAccounts
      :campaignById="campaignById"
    />
  </div>
</template>
<script>
// vue
import { defineComponent, toRefs, reactive } from 'vue';

// components
import SaveContacts from 'components/CampaignWorkflow/ContactsAndAccounts/SaveContacts.vue';
import SaveSenderAccounts from 'components/CampaignWorkflow/ContactsAndAccounts/SaveSenderAccounts.vue';

export default defineComponent({
  name: 'ContactsAndAccounts',

  components: {
    SaveContacts,
    SaveSenderAccounts,
  },

  props: {
    campaignById: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    // state
    const state = reactive({
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.contacts-section {
  width: 100%;
  gap: 24px;
  display: flex;
  flex-direction: column;
  padding: 20px 32px;

  .contacts-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;
  }

  .contacts-desc-text {
    color: rgba(var(--black-rgb), 0.8);
    font-size: 14px;
    font-weight: 400;
    line-height: 16px; /* 114.286% */

    margin-top: 6px;
  }

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;
  }
}
</style>
