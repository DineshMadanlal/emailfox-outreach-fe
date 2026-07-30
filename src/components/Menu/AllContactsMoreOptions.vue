<template>
  <q-menu
    auto-close
    self="top right"
    anchor="bottom left"
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <!-- List -->
    <q-list style="min-width: 180px" class="all-contacts-action-list">
      <!-- Export as CSV -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-contact-action-item"

        @click="$emit('exportAsCsv')"
      >
        <LocalSvgIcon image="export" />

        <p class="contact-action-text">
          Export as CSV
        </p>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AllContactsMoreOptions',

  emits: ['exportAsCsv'],
});
</script>

<style lang="scss" scoped>
.all-contacts-action-list {
  .each-contact-action-item {
    padding: 10px 12px;
    min-height: unset;

    .contact-action-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-left: 8px;
    }
  }
}
</style>
