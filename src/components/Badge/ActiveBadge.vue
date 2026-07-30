<template>
  <div class="active-badge">
    <p class="active-text">
      Active
    </p>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActiveBadge',
});
</script>

<style lang="scss" scoped>
.active-badge {
  width: fit-content;

  border-radius: 4px;
  background: rgba($color: var(--positive-rgb), $alpha: 0.1);
  border: 1px solid rgba($color: var(--positive-rgb), $alpha: 0.2);

  padding: 1px 6px;

  display: flex;
  align-items: center;

  height: 16px;

  .active-text {
    color: $positive;
    font-size: 12px;
    font-weight: 500;
    line-height: 14px;
  }
}
</style>
