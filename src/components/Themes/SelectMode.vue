<template>
  <q-item
    clickable
    role="listitem"
    class="select-mode-item"
    :class="{ 'selected': isActive }"

    @click="$emit('click')"
  >
    <!-- mode icon -->
    <LocalSvgIcon
      :image="image"
      :class="['select-mode-icon' ,{ 'app-svg-icon-primary': isActive }]"
    />

    <!-- mode label -->
    <p class="mode-label-text">
      {{ label }}
    </p>

  </q-item>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SelectMode',

  emits: ['click'],

  props: {
    image: {
      type: String,
      default: '',
    },
    label: {
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
.select-mode-item {
  min-width: 145px;
  border-radius: 8px;
  background: $white;
  border: 1px solid rgba($color: var(--grey-rgb), $alpha: 0.2);

  width: fit-content;
  min-height: unset;
  padding: 12px 20px;

  display: flex;
  align-items: center;

  .mode-label-text {
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

    .mode-label-text {
      color: $primary;
      font-weight: 500;
    }
  }

}
</style>
