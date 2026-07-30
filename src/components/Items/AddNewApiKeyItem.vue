<template>
  <q-item
    clickable
    @click="$emit('click')"

    class="add-api-key-item"
  >
    <div class="flex no-wrap items-center">
      <!-- Add Icon -->
      <LocalSvgIcon
        image="add-circle"
      />

      <p class="add-api-text">
        Add New API Key
      </p>
    </div>
  </q-item>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AddNewApiKeyItem',

  emits: ['click'],
});
</script>

<style lang="scss" scoped>
.add-api-key-item {
  width: 100%;
  min-height: unset;
  padding: 16px 20px;

  background: rgba($color: var(--grey-50-rgb), $alpha: 0.3);

  .add-api-text {
    font-size: 14px;
    color: $primary;
    font-weight: 500;

    margin-left: 8px;
  }
}
</style>
