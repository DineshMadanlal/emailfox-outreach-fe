<template>
  <q-btn
    flat
    no-caps
    unelevated

    color="primary"
    class="more-filters-btn"
    :class="{ active: isFilterApplied }"
  >
    <div class="flex no-wrap items-center">
      <LocalSvgIcon
        image="filter"
        classes="filter-icon"
      />
      <p class="more-filter-text">
        {{ buttonLabel }}
      </p>

      <!-- menu slot -->
      <slot></slot>
    </div>
  </q-btn>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MoreFilters',

  props: {
    buttonLabel: {
      type: String,
      default: 'More',
    },
    isFilterApplied: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.more-filters-btn {
  min-height: unset;

  border-radius: 6px;
  border: 1px solid $blue-grey;

  padding: 2px 8px;

  :deep(.filter-icon) {
    height: 14px;
    min-width: 14px;
  }

  .more-filter-text {
    margin-left: 8px;

    color: $grey;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
  }

  &.active {
    border: 1px solid $primary;

    :deep(.filter-icon) {
      @include svg-icon-stroke('path', $primary);
    }

    .more-filter-text {
      color: $primary;
    }
  }

}
</style>
