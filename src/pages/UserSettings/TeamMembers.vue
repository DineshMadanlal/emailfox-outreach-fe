<template>
  <div class="team-members-settings">
    <!-- Dialog -->
    <q-dialog
      v-model="showInviteMembersModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <InviteTeamMembers
        @onInvitesSent="onInvitesSent"
      />
    </q-dialog>

    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          Team Members
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Internal users invited by email to access and manage the workspace.
        </p>
      </div>

      <!-- right side -->
      <div class="settings-header-right-side">
        <!-- Invite member -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Invite Team Member"
          @click="showInviteMembersModal = true"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="settings-section-content">
      <TeamMembersTable
        @inviteMember="showInviteMembersModal = true"

        v-if="showTeamMembersTable"
      />
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// components
import TeamMembersTable from 'components/Workspaces/TeamMembersTable.vue';
import InviteTeamMembers from 'components/Workspaces/Modals/InviteTeamMembers.vue';

export default defineComponent({
  name: 'TeamMembers',

  components: {
    InviteTeamMembers,
    TeamMembersTable,
  },

  setup() {
    // composables
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Team Members'));

    // state
    const state = reactive({
      isMounted: false,

      showInviteMembersModal: false,
      showTeamMembersTable: true,
    });

    // methods
    const onInvitesSent = () => {
      // close the modal
      state.showInviteMembersModal = false;

      // show team members table
      state.showTeamMembersTable = false;

      // re-render team members table logic
      setTimeout(() => {
        state.showTeamMembersTable = true;
      }, 200);
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      onInvitesSent,
    };
  },
});
</script>

<style lang="scss" scoped>
.team-members-settings {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;

  .settings-section-header {
    border-bottom: 0px;
    padding-bottom: 0px;
  }

  .settings-section-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}
</style>
