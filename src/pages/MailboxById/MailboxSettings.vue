<template>
  <div class="mailbox-settings-container">
    <!-- Top Grid: General Preference & Custom Signature -->
    <div class="settings-top-grid">
      <!-- General Preference Card -->
      <GeneralPreference
        :mailboxByJson="mailboxByJson"

        @editGeneralPreference="$emit('editGeneralPreference')"
      />

      <!-- Custom Signature Card -->
      <CustomSignature
        :mailboxByJson="mailboxByJson"

        @editSignature="$emit('editSignature')"
      />
    </div>

    <div class="section-divider" />

    <!-- BCC to CRM Section -->
    <BccToCrm
      :mailboxByJson="mailboxByJson"

      @addBcc="$emit('addBcc')"
      @editBcc="$emit('editBcc')"
    />

    <div class="section-divider" />

    <!-- Custom Tracking Domain Section -->
    <CustomTrackingDomain
      :mailboxByJson="mailboxByJson"

      @addCustomTrackingDomain="$emit('addCustomTrackingDomain')"
      @editCustomTrackingDomain="$emit('editCustomTrackingDomain')"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import BccToCrm from 'components/MailboxById/Settings/BccToCrm.vue';
import CustomSignature from 'components/MailboxById/Settings/CustomSignature.vue';
import GeneralPreference from 'components/MailboxById/Settings/GeneralPreference.vue';
import CustomTrackingDomain from 'components/MailboxById/Settings/CustomTrackingDomain.vue';

export default defineComponent({
  name: 'MailboxSettings',

  components: {
    GeneralPreference,
    CustomSignature,
    BccToCrm,
    CustomTrackingDomain,
  },

  props: {
    mailboxByJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  emits: [
    'addBcc',
    'editBcc',
    'editSignature',
    'editGeneralPreference',
    'addCustomTrackingDomain',
    'editCustomTrackingDomain',
  ],
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
