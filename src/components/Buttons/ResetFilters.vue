<template>
  <q-btn
    flat
    dense
    no-caps
    unelevated

    color="primary"
    class="reset-filters-btn"

    @click="$emit('click')"
  >
    <div class="flex no-wrap items-center">
      <LocalSvgIcon
        image="reload"
        classes="reset-filters-icon"
      />

      <div class="reset-text">
        Reset Filters
      </div>
    </div>
  </q-btn>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ResetFilters',

  emits: ['click'],
});
</script>

<style lang="scss" scoped>
.reset-filters-btn {
  :deep(.reset-filters-icon) {
    margin-right: 8px;
    min-width: 14px;

    @include svg-icon-stroke('path', $primary);
  }

  .reset-text {
    white-space: nowrap;
  }
}
</style>
