<template>
  <q-item
    clickable

    role="listitem"
    class="select-theme-item"
    :class="{ 'selected': isActive }"

    @click="$emit('click')"
  >
    <!-- color circle -->
    <div
      v-if="color"
      class="theme-color-circle"
      :style="{ backgroundColor: color }"
    >
    </div>

    <!-- mode label -->
    <p class="theme-label-text">
      {{ label }}
    </p>

    <!-- Default slot for menu -->
    <slot />
  </q-item>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SelectMode',

  emits: ['click'],

  props: {
    label: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.select-theme-item {
  min-width: 150px;
  border-radius: 8px;
  background: $white;
  border: 1px solid rgba($color: var(--grey-rgb), $alpha: 0.2);

  width: fit-content;
  min-height: unset;
  padding: 12px 20px;

  display: flex;
  align-items: center;

  .theme-label-text {
    color: $black;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;

    margin-left: 12px;
  }

  &.selected {
    border: 1.2px solid $primary;
    background: rgba($color: var(--primary-rgb), $alpha: 0.05);

    .theme-label-text {
      color: $primary;
      font-weight: 500;
    }
  }

  .theme-color-circle {
    width: 24px;
    height: 24px;
    border-radius: 100%;
  }

}
</style>
