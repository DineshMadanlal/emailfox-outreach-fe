<template>
  <q-btn
    flat
    no-caps
    unelevated
    color="black"
    class="dropdown-options-btn"
  >
    <div class="flex no-wrap items-center">
      <p class="more-text">
        {{ dropdownLabel }}
      </p>
      <LocalSvgIcon
        image="plain-down-arrow"
        classes="plain-down-arrow-icon"
        :class="{ 'rotate-180': showMoreMenu }"
      />
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
  name: 'DropdownOptionsButton',

  props: {
    dropdownLabel: {
      type: String,
      default: 'More',
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

  .more-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;

    margin-right: 8px;
  }

  :deep(.plain-down-arrow-icon) {
    transition: transform 0.3s;

    &.rotate-180 {
      transform: rotate(180deg);
    }
  }
}
</style>
