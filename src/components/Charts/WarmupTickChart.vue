<template>
  <WarmupTickBars
    v-bind="$attrs"
  />
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import WarmupTickBars from 'components/Charts/WarmupTickBars.vue';

export default defineComponent({
  name: 'WarmupTickChart',
  components: {
    WarmupTickBars,
  },
});
</script>
