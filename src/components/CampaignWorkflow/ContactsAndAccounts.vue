<template>
  <div class="contacts-section">
    <div class="contacts-accounts-container">
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

      <ManageLinkedIn
        :campaignById="campaignById"

        v-if="canManageLinkedInAccounts"
      />
    </div>

    <div class="edit-sequence-footer">
      <!-- Back -->
      <q-btn
        flat
        no-caps

        label="Back"
        color="primary"
        class="light-primary-btn"

        @click="onGoBack"
      />

      <!-- Next Button -->
      <q-btn
        no-caps
        unelevated

        label="Next"
        color="primary"

        @click="onNextPage"
      />
    </div>
  </div>
</template>
<script>
// vue
import {
  defineComponent, toRefs, reactive, inject, computed,
} from 'vue';

// vue router
import { useRouter } from 'vue-router';

// components
import ManageContacts from 'components/CampaignWorkflow/ContactsAndAccounts/ManageContacts.vue';
import ManageMailboxes from 'components/CampaignWorkflow/ContactsAndAccounts/ManageMailboxes.vue';
import ManageLinkedIn from 'components/CampaignWorkflow/ContactsAndAccounts/ManageLinkedIn.vue';

export default defineComponent({
  name: 'ContactsAndAccounts',

  components: {
    ManageContacts,
    ManageMailboxes,
    ManageLinkedIn,
  },

  props: {
    campaignById: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // inject
    const editCampaignContext = inject('editCampaignContext');

    // router
    const $router = useRouter();

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

    // methods
    const onNextPage = () => {
      // route to contacts step
      $router.push(`/outreach/campaigns/${props.campaignById.id}/edit/settings`);
    };

    const onGoBack = () => {
      // route to contacts step
      $router.push(`/outreach/campaigns/${props.campaignById.id}/edit/sequence`);
    };

    return {
      // state
      ...toRefs(state),

      // computed
      canManageMailboxes,
      canManageLinkedInAccounts,

      // methods
      onGoBack,
      onNextPage,
    };
  },
});
</script>

<style lang="scss" scoped>
.contacts-section {
  width: 100%;
  min-height: 0;
  flex: 1;

  display: flex;
  flex-direction: column;

  .contacts-accounts-container {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;

    gap: 24px;
    padding: 20px 32px;

    overflow-y: auto;

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
}
</style>
