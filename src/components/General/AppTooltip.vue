<template>
  <q-tooltip
    v-bind="$attrs"

    class="bg-secondary app-tooltip"
  >
    <span v-html="content"></span>
  </q-tooltip>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppTooltip',

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  props: {
    content: {
      type: String,
      required: true,
    },
  },
});
</script>
