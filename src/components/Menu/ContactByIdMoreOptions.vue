<template>
  <q-menu
    auto-close
    self="top right"
    anchor="bottom left"
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <q-list
      style="min-width: 170px"
      class="more-action-list"
    >
      <div
        :class="`${action.class || ''} more-action-item`"
        v-for="action in moreActions"
        :key="`each-more-action-${action.emitValue}`"
        @click="$emit(action.emitValue, contactJson)"
      >
        <div class="more-action-text">
          {{ action.label }}
        </div>
      </div>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// composables
import { usePermissions } from 'src/composables/usePermissions';

export default defineComponent({
  name: 'ContactByIdMoreOptions',

  emits: [
    'editContact',
    'deleteContact',
  ],

  props: {
    contactJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    const { isReadOnly } = usePermissions();

    const moreActions = computed(() => {
      const actions = [];

      if (!isReadOnly.value) {
        actions.push({
          label: 'Edit Contact',
          emitValue: 'editContact',
        });

        actions.push({
          label: 'Delete Contact',
          emitValue: 'deleteContact',
          class: 'negative-action',
        });
      }

      return actions;
    });

    return {
      moreActions,
    };
  },
});
</script>

<style lang="scss" scoped>
.more-action-list {
  display: flex;
  flex-direction: column;
  gap: 0.5px;

  border-radius: 6px;

  .more-action-item {
    padding: 8px 12px;
    cursor: pointer;

    .more-action-text {
      font-size: 14px;
      color: $black;
    }

    &:hover {
      background: rgba(var(--primary-rgb), 0.1);
    }

    &.negative-action {
      .more-action-text {
        color: $negative;
      }

      &:hover {
        background: rgba(var(--negative-rgb), 0.1);
      }
    }
  }
}
</style>
