<template>
  <!-- LIST -->
  <q-menu
    auto-close
    self="top right"
    anchor="bottom left"
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <q-list
      style="min-width: 196px"
      class="more-action-list"
    >
      <div
        :class="`${action.class || ''} more-action-item`"

        v-for="action in moreActions"
        :key="`each-more-action-${action.emitValue}`"

        @click="$emit(action.emitValue, listJson)"
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

export default defineComponent({
  name: 'ListByIdMoreOptions',

  emits: [
    'importHistory',
    'updateListName',
    'deleteContacts',
    'deleteList',
  ],

  props: {
    listJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup() {
    const moreActions = computed(() => {
      const actions = [
        {
          label: 'Update List Name',
          emitValue: 'updateListName',
        },
        {
          label: 'Contact Import History',
          emitValue: 'importHistory',
        },
        {
          label: 'Delete Contacts',
          emitValue: 'deleteContacts',
          class: 'negative-action',
        },
        {
          label: 'Delete List',
          emitValue: 'deleteList',
          class: 'negative-action',
        },
      ];

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
