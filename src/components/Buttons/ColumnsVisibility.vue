<template>
  <q-btn
    dense
    outlined
    unelevated

    @click="$emit('click')"
    class="columns-visibility-btn"
  >
    <LocalSvgIcon
      image="columns"

      class="columns-icon"
    />
  </q-btn>
</template>
<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ColumnsVisibility',

  emits: ['click'],
});
</script>

<style lang="scss" scoped>
.columns-visibility-btn {
  border: 1px solid $blue-grey;

  :deep(.columns-icon) {
    @include svg-icon-stroke('path', $grey-400);
  }
}
</style>
