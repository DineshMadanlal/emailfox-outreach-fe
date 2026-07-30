<template>
  <q-card flat class="app-modal-card invite-members-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Invite Team Members
      </h4>

      <q-space />

      <!-- Close -->
      <q-btn
        flat
        round
        dense
        v-close-popup

        color="negative"
        class="app-negative-button"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <!-- content -->
    <div class="app-modal-content">
      <!-- Invite Grid -->
      <div class="invite-grid">
        <!-- Invite Header -->
        <div class="invite-header">
          <div class="invite-header-cell">
            Email
          </div>
          <div class="invite-header-cell">
            Role
          </div>
          <div class="action-cell" />
        </div>

        <!-- Invite Rows -->
        <div
          v-for="(member, index) in members"
          :key="`each-member-invite-row-${index}`"
          class="invite-row"
        >
          <!-- Email -->
          <q-input
            dense
            borderless
            hide-bottom-space

            :ref="`email-input-${index}`"
            placeholder="name@company.com"

            class="invite-email"
            lazy-rules="ondemand"
            v-model="member.email"

            :rules="emailRules"

            @keypress.enter="onEmailInputKeypressEnter(index)"
          />

          <!-- Role -->
          <MemberRoles
            borderless
            v-model="member.role"
            class="invite-role-dropdown"
          />

          <!-- Remove member -->
          <div class="flex no-wrap items-center action-cell">
            <!-- Remove button -->
            <q-btn
              flat
              round
              dense

              color="negative"
              class="app-negative-button"
              @click="members.splice(index, 1)"
            >
              <LocalSvgIcon
                image="delete"
                classes="app-negative-icon"
              />
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Add Member button -->
      <q-btn
        flat
        no-caps
        unelevated

        color="grey"
        class="add-member-btn"
        @click="onAddNewMember"
      >
        <div class="flex no-wrap items-center">
          <LocalSvgIcon
            image="add-circle"
            classes="add-member-icon"
          />
          <p class="text-weight-medium q-ml-sm">
            Add Member
          </p>
        </div>
      </q-btn>
    </div>

    <!-- footer -->
    <div class="app-modal-footer">
      <!-- Send Invites -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Send Invites"

        :loading="isApiLoading"

        @click="onSendInvites"
      />

      <!-- Cancel button -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        label="Cancel"
        color="primary"
        class="light-primary-btn q-ml-md"

        :loading="isApiLoading"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// Components
import MemberRoles from 'components/Dropdown/MemberRoles.vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';

// constants
import { EMAIL_REGEX } from 'boot/constants';
import { TEAM_MEMBER_ROLES } from 'boot/workspace-constants';

export default defineComponent({
  name: 'InviteTeamMembers',

  emits: ['onInvitesSent'],

  components: {
    MemberRoles,
  },

  setup(props, { emit }) {
    // current instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      members: [
        {
          email: '',
          name: '',
          role: TEAM_MEMBER_ROLES.MEMBER.value,
        },
      ],

      isApiLoading: false,
    });

    // methods
    const focusEmailInput = (index) => {
      const emailInput = document.querySelectorAll('.invite-email')[index];
      if (emailInput) {
        emailInput.focus();
      }
    };

    const validateMembers = () => {
      for (let index = 0; index < state.members.length; index += 1) {
        // member
        const member = state.members[index];

        // empty email
        if (!member.email?.trim()) {
          appContext.config.globalProperties.$toast({
            warning: true,
            message: `Email is required for row ${index + 1}`,
          });

          focusEmailInput(index);

          return false;
        }

        // invalid email
        if (!EMAIL_REGEX.test(member.email)) {
          appContext.config.globalProperties.$toast({
            warning: true,
            message: `Invalid email in row ${index + 1}`,
          });

          focusEmailInput(index);

          return false;
        }
      }

      return true;
    };

    const onAddNewMember = () => {
      // add new member with default role as 'Member'
      state.members.push({ email: '', role: TEAM_MEMBER_ROLES.MEMBER.value });

      setTimeout(() => {
        // Move focus to the newly added email input
        focusEmailInput(state.members.length - 1);
      }, 100);
    };

    const onEmailInputKeypressEnter = (index) => {
      if (index === state.members.length - 1) {
        // add new member if it's the last input
        onAddNewMember();

        setTimeout(() => {
          // Move focus to the newly added email input
          focusEmailInput(index + 1);
        }, 100);
      } else {
        // Move focus to the next email input
        focusEmailInput(index + 1);
      }
    };

    const onSendInvites = async () => {
      try {
        if (validateMembers()) {
          state.isApiLoading = true;

          // API CALL to send invites
          await postApiCall({
            endpoint: '/users/invite-members',
            payload: {
              members: state.members,
            },
          });

          appContext.config.globalProperties.$toast({
            message: 'Invites sent successfully',
          });

          emit('onInvitesSent');
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    return {
      emailRules: [
        (val) => EMAIL_REGEX.test(val) || 'Invalid email',
      ],

      // state
      ...toRefs(state),

      // methods
      onSendInvites,
      onAddNewMember,
      onEmailInputKeypressEnter,
    };
  },
});
</script>

<style lang="scss" scoped>
.invite-members-card {
  max-width: 600px;

  @include custom-scrollbar;

  .invite-grid {
    max-height: 400px;
    overflow-y: auto;
    border-radius: 4px;
    border: 1px solid $grey-50;

    .action-cell {
      min-width: 42px;
    }
  }

  .invite-header {
    position: sticky;
    top: 0;
    z-index: 2;
    backdrop-filter: blur(100px);

    width: 100%;
    display: flex;
    background: rgba($color: var(--primary-rgb), $alpha: 0.05);

    .invite-header-cell {
      width: 100%;
      padding: 10px 12px;

      border-right: 1px solid $grey-50;

      &:last-child {
        border-right: none;
      }
    }
  }

  .invite-row {
    display: flex;
    border-top: 1px solid $grey-50;

    .invite-email, .invite-role-dropdown {
      width: 100%;
      padding: 0px 12px;
    }

    .invite-role-dropdown {
      border-left: 1px solid $grey-50;
      // border-right: 1px solid $grey-50;
    }
  }

  .add-member-btn {
    margin-top: 12px;
  }

  :deep(.add-member-icon) {
    circle, path {
      stroke: $grey;
    }
  }
}
</style>
