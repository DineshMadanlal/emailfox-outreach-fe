<template>
  <div class="info-alert-card">
    <!-- Info Icon -->
    <LocalSvgIcon
      image="info-circle"
      class="info-circle"
    />

    <p class="alert-msg-text">
      {{ alert }}
    </p>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InfoAlertBox',

  props: {
    alert: {
      type: String,
      default: '',
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.info-alert-card {
  width: 100%;
  padding: 16px;

  border-radius: 8px !important;
  background-color: rgba($color: var(--grey-rgb), $alpha: 0.05);

  display: flex;

  :deep(.info-circle) {
    min-width: 18px;
    max-width: 18px;
  }

  .alert-msg-text {
    color: $grey;
    font-size: 14px;

    margin-left: 4px;
  }
}
</style>
