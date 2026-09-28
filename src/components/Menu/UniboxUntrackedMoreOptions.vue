<template>
  <!-- LIST -->
  <q-list
    style="min-width: 250px"
    class="more-action-list"
  >
    <q-item
      clickable
      :class="`${action.class || ''} more-action-item`"

      v-for="action in moreActions"
      :key="`each-more-action-${action.emitValue}`"

      @click="$emit('emitAction', action.emitValue)"
    >
      <div class="more-action-text">
        {{ action.label }}
      </div>
    </q-item>
  </q-list>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// constants
import { UNIBOX_UNTRACKED_ACTIONS } from 'src/boot/unibox-constants.js';

export default defineComponent({
  name: 'UniboxUntrackedMoreOptions',

  emits: ['emitAction'],

  setup() {
    // computed
    const moreActions = computed(() => {
      const actions = [
        {
          label: 'Mark as Read',
          emitValue: UNIBOX_UNTRACKED_ACTIONS.MARK_AS_READ,
        },
        {
          label: 'Mark as Unread',
          emitValue: UNIBOX_UNTRACKED_ACTIONS.MARK_AS_UNREAD,
        },
        {
          label: 'Delete',
          emitValue: UNIBOX_UNTRACKED_ACTIONS.DELETE,
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
    min-height: unset !important;

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
