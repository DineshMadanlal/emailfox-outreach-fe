<template>
  <q-card flat class="app-modal-card new-client-details-card">
    <!-- Header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        New Client Details
      </h4>

      <q-space />

      <!-- Close -->
      <q-btn
        flat
        round
        dense
        v-close-popup

        color="negative"
        class="app-negative-button"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>
    <!-- Content -->
    <div class="app-modal-content">
      <div class="modal-conter-container">
        <!-- email -->
        <div>
          <span class="client-label-text">Email:</span>
          <span class="client-value-text">{{ newClientDetails.email }}</span>
        </div>

        <!-- password -->
        <div>
          <span class="client-label-text">Password:</span>
          <span class="client-value-text">{{ newClientDetails.password }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Send Invites -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Copy Client Details"

          @click="copyClientDetails"

          v-close-popup
        />

        <!--  -->
        <q-btn
          flat
          no-caps
          unelevated
          v-close-popup

          label="Close"
          color="primary"
          class="light-primary-btn q-ml-md"
        />
    </div>
  </q-card>
</template>
<script>

// vue
import { defineComponent, getCurrentInstance } from 'vue';

// quasar
import { copyToClipboard } from 'quasar';

export default defineComponent({
  name: 'NewClientDetails',

  props: {
    newClientDetails: {
      type: Object,
      default: () => {},
    },
  },

  setup(props) {
    // app context
    const { appContext } = getCurrentInstance();

    // methods
    const copyClientDetails = () => {
      const credentialsText = `Email: ${props.newClientDetails.email}\nPassword: ${props.newClientDetails.password}`;

      // copy api key using clipboard
      copyToClipboard(credentialsText).then(() => {
        // show toast
        appContext.config.globalProperties.$toast({
          message: 'Client Details copied successfully',
        });
      });
    };

    return {
      copyClientDetails,
    };
  },
});
</script>

<style lang="scss" scoped>
.new-client-details-card {
  max-width: 550px;

  .modal-conter-container {
    max-width: 400px;
    background: rgba(var(--primary-rgb), 0.05);

    padding: 12px;

    display: flex;
    flex-direction: column;
    gap: 8px;

    font-size: 14px;
    font-weight: 400;

    .client-label-text {
      line-height: 29px;
    }

    .client-value-text {
      line-height: 29px;
      font-weight: 500;
    }
  }
}
</style>
