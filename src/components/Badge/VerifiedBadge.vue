<template>
  <div class="verified-badge">
    <LocalSvgIcon
      image="badge-tick"
    />

    <p class="verified-text">
      Verified
    </p>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VerifiedBadge',
});
</script>

<style lang="scss" scoped>
.verified-badge {
  width: fit-content;

  border-radius: 4px;
  background: rgba($color: var(--positive-rgb), $alpha: 0.1);
  border: 1px solid rgba($color: var(--positive-rgb), $alpha: 0.2);

  padding: 2px 4px;

  display: flex;
  align-items: center;

  height: 20px;

  .verified-text {
    color: $positive;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;

    margin-left: 4px;
  }
}
</style>
