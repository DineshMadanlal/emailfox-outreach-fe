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
      class="team-members-action-list"
    >
      <!-- Edit -->
      <q-item
        v-ripple
        clickable

        v-for="(action, index) of memberActions"
        :key="`team-member-action-${index}`"

        class="flex items-center each-member-action-item"
        :class="`flex items-center each-member-action-item ${action.classes || ''}`"

        @click="onActionClick(action)"
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

// constants
import { TEAM_MEMBER_STATUS_ACTIONS, TEAM_MEMBER_ACTIONS } from 'src/boot/workspace-constants';

export default defineComponent({
  name: 'TeamMembersMoreOptions',

  emits: ['editMember', 'deleteMember', 'resendInvitation', 'deactivateMember', 'reinviteMember', 'reactivateMember'],

  props: {
    tableRow: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // computed
    const memberActions = computed(() => {
      let availableActions = [
        'reactivate_member',
        'remove_from_workspace',
      ];

      if (props.tableRow.is_active) {
        availableActions = TEAM_MEMBER_STATUS_ACTIONS[props.tableRow.status] || [];
      }

      return availableActions.map((action) => {
        const actionDetails = TEAM_MEMBER_ACTIONS[action] || {};
        return {
          ...actionDetails,
          value: action,
        };
      });
    });

    // methods
    const onActionClick = (action) => {
      switch (action.value) {
        case TEAM_MEMBER_ACTIONS.edit_member_role.value:
          emit('editMember', props.tableRow);
          break;
        case TEAM_MEMBER_ACTIONS.resend_invitation.value:
          emit('resendInvitation', props.tableRow);
          break;
        case TEAM_MEMBER_ACTIONS.deactivate_member.value:
          emit('deactivateMember', props.tableRow);
          break;
        case TEAM_MEMBER_ACTIONS.remove_from_workspace.value:
        case TEAM_MEMBER_ACTIONS.remove_invitation.value:
        case TEAM_MEMBER_ACTIONS.remove_from_history.value:
          emit('deleteMember', props.tableRow);
          break;
        case TEAM_MEMBER_ACTIONS.reinvite_member.value:
          emit('reinviteMember', props.tableRow);
          break;
        case TEAM_MEMBER_ACTIONS.reactivate_member.value:
          emit('reactivateMember', props.tableRow);
          break;

        default:
          break;
      }
    };

    return {
      // computed
      memberActions,

      // methods
      onActionClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.team-members-action-list {

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
