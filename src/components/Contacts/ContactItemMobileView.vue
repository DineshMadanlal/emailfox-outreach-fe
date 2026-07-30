<template>
  <q-item
    class="contact-item-mobile-view"
  >
    {{ contactTableProps.row }}
  </q-item>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ContactItemMobileView',

  props: {
    contactTableProps: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.contact-item-mobile-view {
  width: 100%;
  padding: 12px;
  min-height: unset;
  border: 1px solid $grey-50;

  position: relative;
}
</style>
