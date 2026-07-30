<template>
  <q-card flat class="app-modal-card domain-limit-warning-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Domain Limit Reached
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
        You've reached the maximum number of domains allowed in your current plan.
        Please upgrade your subscription to add more domains.
      </p>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Upgrade -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Upgrade Now"

        @click="$emit('upgradePlan')"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DomainLimitWarning',

  emits: ['upgradePlan'],
});
</script>

<style lang="scss" scoped>
.domain-limit-warning-card {
  max-width: 600px;
}
</style>
