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

    <!-- Manage Contacts -->
    <ManageContacts
      :campaignById="campaignById"
    />

    <!-- Add Sender Mailboxes Card -->
    <ManageMailboxes
      :campaignById="campaignById"

      v-if="canManageMailboxes"
    />
  </div>
</template>
<script>
// vue
import {
  defineComponent, toRefs, reactive, inject, computed,
} from 'vue';

// components
import ManageContacts from 'components/CampaignWorkflow/ContactsAndAccounts/ManageContacts.vue';
import ManageMailboxes from 'components/CampaignWorkflow/ContactsAndAccounts/ManageMailboxes.vue';

export default defineComponent({
  name: 'ContactsAndAccounts',

  components: {
    ManageContacts,
    ManageMailboxes,
  },

  props: {
    campaignById: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    // inject
    const editCampaignContext = inject('editCampaignContext');

    // state
    const state = reactive({
    });

    // computed
    const canManageMailboxes = computed(() => {
      const {
        isEmailOutreachCampaign,
        isMultiChannelOutreachCampaign,
      } = editCampaignContext;

      return isEmailOutreachCampaign.value || isMultiChannelOutreachCampaign.value;
    });

    const canManageLinkedInAccounts = computed(() => {
      const {
        isLinkedInOutreachCampaign,
        isMultiChannelOutreachCampaign,
      } = editCampaignContext;

      return isLinkedInOutreachCampaign.value || isMultiChannelOutreachCampaign.value;
    });

    return {
      // state
      ...toRefs(state),

      // computed
      canManageMailboxes,
      canManageLinkedInAccounts,
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
