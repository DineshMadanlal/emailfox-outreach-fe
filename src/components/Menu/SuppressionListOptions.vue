<template>
  <q-menu
    auto-close
    v-model="internalModelValue"

    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"

    :offset="[10, 10]"
  >
    <!-- List -->
    <q-list style="min-width: 180px" class="suppression-list-action-list">
      <!-- Export as CSV -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-suppression-action-item"

        @click="$emit('importCsv')"
      >
        <LocalSvgIcon image="export" />

        <p class="contact-action-text">
          Import CSV File
        </p>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'SuppressionListOptions',

  emits: ['importCsv', 'update:modelValue'],

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    const internalModelValue = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });

    return {
      internalModelValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.suppression-list-action-list {
  .each-suppression-action-item {
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
