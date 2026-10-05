<template>
  <div class="floating-loader">
    <q-card flat class="floating-loader-card">
      <q-spinner-tail
        color="primary"
        size="20px"
        class="q-mr-sm"
      />

      <span class="floating-loader-label">
        {{ label }}
      </span>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FloatingLoader',

  props: {
    label: {
      type: String,
      default: 'Processing...',
    },
  },
});
</script>

<style lang="scss" scoped>
.floating-loader {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  position: relative;
    top: 80px;
    right: 14px;

  .floating-loader-card {
    padding: 12px 16px;
    border-radius: 8px;
    background-color: $white;
    border: 1px solid $grey-50;
    min-width: 200px;
    width: fit-content;

    display: flex;
    align-items: center;

    .floating-loader-label {
      font-size: 14px;
      font-weight: 500;
      color: $black;
    }
  }
}
</style>
