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
      class="reply-categories-action-list"
    >
      <!-- Edit -->
      <q-item
        v-ripple
        clickable

        v-for="(action, index) of moreActions"
        :key="`reply-categories-profile-action-${index}`"
        :class="`flex items-center each-profile-action-item ${action.classes || ''}`"

        @click="onActionClick(action)"
      >
        <LocalSvgIcon
          :image="action.icon"
          classes="profile-menu-icon"
        />

        <p class="profile-action-text">
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
  name: 'ReplyCategoryMoreOptions',

  emits: ['editReplyCategory', 'deleteReplyCategory', 'updateReplyCategoryStatus'],

  props: {
    tableRow: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // computed
    const moreActions = computed(() => {
      const availableActions = [
        {
          icon: 'edit',
          label: 'Edit Reply Category',
          emitValue: 'editReplyCategory',
        },
        {
          icon: 'reload',
          label: props.tableRow.is_active ? 'Mark as Inactive' : 'Mark as Active',
          emitValue: 'updateReplyCategoryStatus',
        },
        {
          icon: 'delete',
          classes: 'delete-profile-item',
          label: 'Delete Reply Category',
          emitValue: 'deleteReplyCategory',
        },
      ];

      return availableActions;
    });

    // methods
    const onActionClick = (action) => {
      emit(action.emitValue, props.tableRow);
    };

    return {
      // computed
      moreActions,

      // methods
      onActionClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.reply-categories-action-list {

  .each-profile-action-item {
    padding: 10px 12px;
    min-height: unset;

    .profile-action-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-left: 8px;
    }

    :deep(.profile-menu-icon) {
      @include svg-icon-stroke('path, circle, rect', $grey);
    }

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    &.delete-profile-item {
      :deep(.profile-menu-icon) {
        @include svg-icon-stroke('path, circle, rect', $negative);
      }

      .profile-action-text {
        color: $negative;
      }

      &:hover {
        background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);
      }
    }
  }
}
</style>
