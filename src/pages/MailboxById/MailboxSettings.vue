<template>
  <div class="mailbox-settings-container">
    <!-- Modal: Edit General Preference -->
    <q-dialog
      v-model="modals.showEditGeneralPreferenceModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <EditGeneralPreference
        :mailboxByJson="mailboxByJson"
        @onSuccessfulUpdate="onSuccessfulUpdateGeneralPreference"
      />
    </q-dialog>

    <!-- Modal: Edit Signature -->
    <q-dialog
      v-model="modals.showEditSignatureModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SetSignature
        :mailboxByJson="mailboxByJson"
        @onSuccessfulUpdate="onSuccessfulUpdateSignature"
      />
    </q-dialog>

    <!-- Modal: Edit BCC to CRM -->
    <q-dialog
      v-model="modals.showEditBccModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <EditBccToCrm
        :mailboxByJson="mailboxByJson"
        @onSuccessfulUpdate="onSuccessfulUpdateBcc"
      />
    </q-dialog>

    <!-- Top Grid: General Preference & Custom Signature -->
    <div class="settings-top-grid">
      <!-- General Preference Card -->
      <GeneralPreference
        :mailboxByJson="mailboxByJson"
        @editGeneralPreference="modals.showEditGeneralPreferenceModal = true"
      />

      <!-- Custom Signature Card -->
      <CustomSignature
        :mailboxByJson="mailboxByJson"
        @editSignature="modals.showEditSignatureModal = true"
      />
    </div>

    <div class="section-divider" />

    <!-- BCC to CRM Section -->
    <BccToCrm
      :mailboxByJson="mailboxByJson"
      @editBcc="modals.showEditBccModal = true"
    />
  </div>
</template>

<script>
// vue
import { defineComponent, toRefs, reactive } from 'vue';

// components
import BccToCrm from 'components/MailboxById/Settings/BccToCrm.vue';
import CustomSignature from 'components/MailboxById/Settings/CustomSignature.vue';
import GeneralPreference from 'components/MailboxById/Settings/GeneralPreference.vue';
import SetSignature from 'components/MailboxById/Settings/Modals/SetSignature.vue';
import EditGeneralPreference from 'components/MailboxById/Settings/Modals/EditGeneralPreference.vue';
import EditBccToCrm from 'components/MailboxById/Settings/Modals/EditBccToCrm.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'MailboxSettings',

  components: {
    GeneralPreference,
    CustomSignature,
    BccToCrm,
    SetSignature,
    EditGeneralPreference,
    EditBccToCrm,
  },

  props: {
    mailboxByJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  emits: [
    'updateMailbox',
  ],

  setup(props, { emit }) {
    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      modals: {
        showEditSignatureModal: false,
        showEditGeneralPreferenceModal: false,
        showEditBccModal: false,
      },
    });

    const onSuccessfulUpdateSignature = (updatedMailbox) => {
      state.modals.showEditSignatureModal = false;
      emit('updateMailbox', updatedMailbox);
    };

    const onSuccessfulUpdateGeneralPreference = (updatedMailbox) => {
      state.modals.showEditGeneralPreferenceModal = false;
      emit('updateMailbox', updatedMailbox);
    };

    const onSuccessfulUpdateBcc = (updatedMailbox) => {
      state.modals.showEditBccModal = false;
      emit('updateMailbox', updatedMailbox);
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      onSuccessfulUpdateSignature,
      onSuccessfulUpdateGeneralPreference,
      onSuccessfulUpdateBcc,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailbox-settings-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 740px;
  padding: 32px 20px;

  .settings-top-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    @media (max-width: $breakpoint-sm-max) {
      grid-template-columns: 1fr;
    }
  }

  .section-divider {
    height: 1px;
    width: 100%;
    border-top: 1px solid $grey-50;
  }
}
</style>
