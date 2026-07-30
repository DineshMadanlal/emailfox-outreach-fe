<template>
  <q-list class="domain-more-options-list">
    <!-- Delete Domain -->
    <q-item
      clickable

      class="domain-option-item delete-domain-item"

      @click="$emit('deleteDomain')"
    >
      <q-item-section>
        <div class="flex no-wrap items-center">
          <LocalSvgIcon image="delete" class="delete-icon" />

          <p class="domain-item-label">
            Delete Domain
          </p>
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DomainMoreOptions',

  emits: ['deleteDomain'],
});
</script>

<style lang="scss" scoped>
.domain-more-options-list {
  min-width: 240px;

  .domain-option-item {
    min-height: unset;
    padding: 10px 12px;
    cursor: pointer;

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    :deep(.delete-icon) {
      @include svg-icon-stroke('path, circle, rect', $grey);
    }

    .domain-item-label {
      color: $black;
      font-size: 14px;
      font-weight: 400;

      margin-left: 8px;
    }

    &.delete-domain-item {
      :deep(.delete-icon) {
        @include svg-icon-stroke('path, circle, rect', $negative);
      }

      .domain-item-label {
        color: $negative;
      }

      &:hover {
        background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);
      }
    }
  }
}
</style>
