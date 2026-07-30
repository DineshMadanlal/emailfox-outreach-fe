<template>
  <q-menu
    auto-close
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <!-- List -->
    <q-list
      style="min-width: 180px"
      class="client-members-action-list"
    >
      <!-- Edit -->
      <q-item
        v-ripple
        clickable

        v-for="(action, index) of memberActions"
        :key="`client-member-action-${index}`"

        class="flex items-center each-member-action-item"
        :class="`flex items-center each-member-action-item ${action.classes || ''}`"

        @click="$emit(action.emitValue, tableRow)"
      >
        <LocalSvgIcon
          :image="action.icon"
          classes="member-menu-icon"
        />

        <p class="member-action-text">
          {{ action.label }}
        </p>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ClientMemberMoreOptions',

  emits: ['deleteClient'],

  props: {
    tableRow: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup() {
    // computed
    const memberActions = computed(() => [
      {
        label: 'Delete Client',
        emitValue: 'deleteClient',
        icon: 'delete',
        classes: 'delete-member-item',
      },
    ]);

    return {
      // computed
      memberActions,

    };
  },
});
</script>

<style lang="scss" scoped>
.client-members-action-list {

  .each-member-action-item {
    padding: 10px 12px;
    min-height: unset;

    .member-action-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-left: 8px;
    }

    :deep(.member-menu-icon) {
      @include svg-icon-stroke('path, circle, rect', $grey);
    }

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    &.delete-member-item {
      :deep(.member-menu-icon) {
        @include svg-icon-stroke('path, circle, rect', $negative);
      }

      .member-action-text {
        color: $negative;
      }

      &:hover {
        background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);
      }
    }
  }
}
</style>
