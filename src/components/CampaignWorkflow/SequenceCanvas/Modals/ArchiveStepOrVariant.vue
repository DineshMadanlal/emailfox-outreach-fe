<template>
  <q-card flat class="app-modal-card archive-step-or-variant-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Archive {{ isVariant ? 'Variant' : 'Step' }}
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
      <p class="archive-warning-text">
        Archiving the {{ isVariant ? 'variant' : 'step' }} will
        <span class="permanent-archive-text">
          permanently archive
        </span>
        all associated data.
        <br />
        <br />
        This action cannot be undone. Are you sure you want to continue?
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToDelete"

        color="primary"
        :label="`I understand the consequences of archiving the ${isVariant ? 'variant' : 'step'}.`"
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="negative"
        label="Permanently Archive"

        :disabled="!agreeToDelete"

        @click="$emit('onConfirmArchive', inputJson)"
      />

      <!-- Delete -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        label="Cancel"
        color="negative"

        class="light-negative-btn"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs,
} from 'vue';

export default defineComponent({
  name: 'ArchiveStepOrVariant',

  emits: ['onConfirmArchive'],

  props: {
    inputJson: {
      type: Object,
      required: true,
    },
    isVariant: {
      type: Boolean,
      required: false,
    },
  },

  setup() {
    // state
    const state = reactive({
      agreeToDelete: false,
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.archive-step-or-variant-card {
  max-width: 600px;

  .light-negative-btn {
    margin-left: 12px;
  }

  .archive-warning-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;

    margin-bottom: 20px;

    .permanent-archive-text {
      color: $negative;
    }
  }
}
</style>
