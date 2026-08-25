<template>
  <!-- List -->
  <q-list
    style="min-width: 180px"
    class="warmup-profiles-action-list"
  >
    <!-- Edit -->
    <q-item
      v-ripple
      clickable

      v-for="(action, index) of profileActions"
      :key="`team-profile-action-${index}`"
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
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'LinkedInMoreOptions',

  emits: ['editSendingLimits', 'updateProxySettings', 'deleteAccount'],

  props: {
    tableRow: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // computed
    const profileActions = computed(() => {
      const availableActions = [
        {
          icon: 'edit',
          label: 'Update Sending Limits',
          emitValue: 'editSendingLimits',
        },
        {
          icon: 'proxy',
          label: 'Proxy Settings',
          emitValue: 'updateProxySettings',
        },
        {
          icon: 'delete',
          classes: 'delete-profile-item',
          label: 'Delete Account',
          emitValue: 'deleteAccount',
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
      profileActions,

      // methods
      onActionClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-profiles-action-list {

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
