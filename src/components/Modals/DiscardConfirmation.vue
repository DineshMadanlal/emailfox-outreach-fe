<template>
  <q-card flat class="app-modal-card discard-confirmation-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Exit Page?
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
      <p class="discard-text">
        If you leave this page, any unsaved changes will be lost. Are you sure you want to continue?
      </p>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Stay -->
      <q-btn
        no-caps
        unelevated
        v-close-popup

        label="Stay"
        color="primary"
      />

      <!-- Exit -->
      <q-btn
        flat
        no-caps
        unelevated

        label="Exit"
        color="primary"

        class="light-primary-btn"

        @click="$emit('onExit')"
      />
    </div>

  </q-card>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DiscardConfirmation',

  emits: ['onExit'],
});
</script>

<style lang="scss" scoped>
.discard-confirmation-card {
  max-width: 600px;

  .app-modal-content {
    .discard-text {
      color: $black;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
    }
  }

  .light-primary-btn {
    margin-left: 12px;
  }
}
</style>
