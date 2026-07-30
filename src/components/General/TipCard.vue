<template>
  <q-card flat class="tip-card">
    <!--  -->
    <LocalSvgIcon image="thunder" class="thunder-icon" />

    <div class="tip-text">
      {{ tipText }}
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TipCard',

  props: {
    tipText: {
      type: String,
      default: '',
    },
  },
});
</script>

<style lang="scss" scoped>
.tip-card {
  gap: 8px;
  display: flex;
  width: fit-content;

  border-radius: 8px;
  border: 1px solid $grey-100;
  background: rgba($color: var(--grey-50-rgb), $alpha: 0.3);

  padding: 16px;

  :deep(.thunder-icon) {
    min-width: 16px;
  }

  .tip-text {
    color: $grey;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px; /* 114.286% */
  }
}
</style>
