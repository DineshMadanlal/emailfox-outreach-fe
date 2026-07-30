<template>
  <q-btn
    flat
    no-caps
    unelevated
    color="black"
    class="dropdown-options-btn"
  >
    <div class="flex no-wrap items-center">
      <LocalSvgIcon
        image="filter"
        classes="filter-icon"
      />

      <p
        class="filter-label-text"
      >
        {{ filterLabel }}
      </p>
    </div>

    <q-menu
      auto-close
      v-model="showMoreMenu"
      transition-hide="jump-up"
      transition-show="jump-down"
      :offset="[0, 10]"
    >
      <!-- Menu content slot -->
      <slot name="menu" />
    </q-menu>
  </q-btn>
</template>

<script>
// vue
import { reactive, defineComponent, toRefs } from 'vue';

export default defineComponent({
  name: 'FilterOptionsButton',

  props: {
    filterLabel: {
      type: String,
      default: 'Filter By',
    },
  },

  setup() {
    // state
    const state = reactive({
      showMoreMenu: false,
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.dropdown-options-btn {
  border: 1px solid $blue-grey;

  .filter-label-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;

    margin-left: 8px;
  }

  :deep(.filter-icon) {
    min-width: 16px;
    min-height: 16px;
  }
}
</style>
