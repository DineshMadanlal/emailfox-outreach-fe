<template>
  <q-card flat class="app-modal-card mailbox-limit-warning-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Mailbox Limit Reached
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
      <p>
        Maximum mailboxes reached for this domain.
        Add another domain to create more mailboxes.
      </p>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Upgrade -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Okay, Close"

        v-close-popup
      />
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MailboxLimitWarning',
});
</script>

<style lang="scss" scoped>
.mailbox-limit-warning-card {
  max-width: 600px;
}
</style>
