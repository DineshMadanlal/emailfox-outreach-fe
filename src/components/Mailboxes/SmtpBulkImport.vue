<template>
  <div class="smtp-bulk-import">
    <!-- Placeholder – bulk import UI goes here -->
    <p>Bulk Import CSV</p>

    <q-btn
      flat
      no-caps
      unelevated
      label="Back"
      color="primary"
      class="light-primary-btn q-mt-md"
      @click="$emit('goBack')"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SmtpBulkImport',

  emits: ['goBack'],

  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.smtp-bulk-import {
  width: 100%;
  max-width: 720px;
}
</style>
