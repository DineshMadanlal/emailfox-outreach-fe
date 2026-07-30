<template lang="">
  <q-btn
    dense
    no-caps
    outline
    unelevated

    color="blue-grey"
    class="more-btn"
  >
    <!--  -->
    <LocalSvgIcon
      image="more"
    />

    <slot />
  </q-btn>
</template>
<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MoreButton',
});
</script>

<style lang="scss" scoped>
.more-btn {
  padding: 8px 12px;
}
</style>
