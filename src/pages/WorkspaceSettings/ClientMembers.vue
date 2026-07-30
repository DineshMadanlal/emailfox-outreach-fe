<template>
  <div class="client-members-settings">
    <!-- Dialog -->
    <q-dialog
      v-model="showCreateClientMemberModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <CreateClientMember
        @onCreateClient="onCreateClient"
      />
    </q-dialog>

    <!-- Dialog -->
    <q-dialog
      v-model="showNewClientDetailsModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <NewClientDetails
        :newClientDetails="newClientDetails"
      />
    </q-dialog>

    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          Client Members
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          External client users, mainly for agencies and whitelabel setups.
        </p>
      </div>

      <!-- right side -->
      <div class="settings-header-right-side">
        <!-- Invite member -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Create Client Member"
          @click="showCreateClientMemberModal = true"

          v-if="!isEmptyState"
        />
      </div>
    </div>

    <!-- content -->
    <div class="settings-section-content">
      <!-- Content -->
      <ClientMembersTable
        ref="clientMembersTableRef"
        @inviteMember="showCreateClientMemberModal = true"

        v-if="showTeamMembersTable"
      />
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// components
import ClientMembersTable from 'components/Workspaces/ClientMembersTable.vue';
import NewClientDetails from 'src/components/Workspaces/Modals/NewClientDetails.vue';
import CreateClientMember from 'src/components/Workspaces/Modals/CreateClientMember.vue';

export default defineComponent({
  name: 'ClientMembers',

  components: {
    NewClientDetails,
    CreateClientMember,
    ClientMembersTable,
  },

  setup() {
    // composables
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Client Members'));

    // state
    const state = reactive({
      showNewClientDetailsModal: false,
      showCreateClientMemberModal: false,
      showTeamMembersTable: true,

      newClientDetails: {},

      // ref
      clientMembersTableRef: null,
    });

    // computed
    const isEmptyState = computed(() => {
      if (!state.clientMembersTableRef) {
        return false;
      }

      return state.clientMembersTableRef.showEmptyState;
    });

    // methods
    const onCreateClient = (payload) => {
      // close the modal
      state.showCreateClientMemberModal = false;

      state.newClientDetails = payload;

      state.showNewClientDetailsModal = true;

      // show team members table
      state.showTeamMembersTable = false;

      // re-render team members table logic
      setTimeout(() => {
        state.showTeamMembersTable = true;
      }, 100);
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isEmptyState,
      isMobileDevice,

      // methods
      onCreateClient,
    };
  },
});
</script>

<style lang="scss" scoped>
.client-members-settings {
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
