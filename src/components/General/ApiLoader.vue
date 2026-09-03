<template>
  <q-inner-loading
    :showing="!!show"
    class="app-api-loader"
  >
    <slot>
      <q-spinner-bars :size="size" :color="color" />
    </slot>
  </q-inner-loading>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ApiLoader',

  props: {
    show: {
      type: Boolean,
      default: false,
      required: true,
    },
    size: {
      type: String,
      default: '40px',
    },
    color: {
      type: String,
      default: 'primary',
    },
  },
});
</script>

<style lang="scss" scoped>
/* Scoped style if any custom styling is required */
.app-api-loader {
  z-index: 2;
  background: inherit;
}
</style>
