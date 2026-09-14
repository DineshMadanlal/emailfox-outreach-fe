// vue
import { computed, reactive } from 'vue';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';

// constants
import { TEAM_MEMBER_ROLES } from 'src/boot/workspace-constants';

// 🧪 DEV TESTING OVERRIDE:
// Set to null to use actual logged-in user role, or assign any TEAM_MEMBER_ROLES value
const devState = reactive({
  roleOverride: TEAM_MEMBER_ROLES.SUPER_ADMIN.value, // Defaults to MAILBOX_MANAGER for testing
});

// Live browser console helper: window.setTestRole('MAILBOX_MANAGER') / window.setTestRole(null)
if (typeof window !== 'undefined') {
  window.setTestRole = (role) => {
    devState.roleOverride = role;
    console.log(
      `%c[usePermissions] Active Role set to: ${role || 'ACTUAL_USER_ROLE'}`,
      'color: #00d26a; font-weight: bold;',
    );
  };
  window.TEAM_ROLES = TEAM_MEMBER_ROLES;
}

export function usePermissions() {
  // computed
  const { activeWorkspaceJson } = useWorkspace();

  const currentRole = computed(() => {
    if (process.env.DEV_MODE) {
      return devState.roleOverride || activeWorkspaceJson.value?.role;
    }

    return activeWorkspaceJson.value?.role;
  });

  // Direct role flags
  const isSuperAdmin = computed(
    () => currentRole.value === TEAM_MEMBER_ROLES.SUPER_ADMIN.value,
  );
  const isAdmin = computed(
    () => currentRole.value === TEAM_MEMBER_ROLES.ADMIN.value,
  );
  const isMember = computed(
    () => currentRole.value === TEAM_MEMBER_ROLES.MEMBER.value,
  );
  const isMailboxManager = computed(
    () => currentRole.value === TEAM_MEMBER_ROLES.MAILBOX_MANAGER.value,
  );
  const isInboxManager = computed(
    () => currentRole.value === TEAM_MEMBER_ROLES.INBOX_MANAGER.value,
  );
  const isViewer = computed(
    () => currentRole.value === TEAM_MEMBER_ROLES.VIEWER.value,
  );

  // Grouped checks
  const isRoleAdminOrAbove = computed(
    () => isSuperAdmin.value || isAdmin.value,
  );
  const isReadOnly = computed(() => isViewer.value);

  // Module access permissions
  const canAccessCampaigns = computed(
    () => !isMailboxManager.value && !isInboxManager.value,
  );
  const canAccessMailboxes = computed(
    () => !isInboxManager.value,
  );
  const canAccessInbox = computed(
    () => !isMailboxManager.value,
  );
  const canAccessSettings = computed(
    () => canAccessCampaigns.value,
  );
  const canAccessBilling = computed(
    () => isRoleAdminOrAbove.value,
  );

  // Default redirect path based on user role
  const defaultRedirectPath = computed(() => {
    if (isMailboxManager.value) {
      return '/outreach/mailboxes';
    }
    if (isInboxManager.value) {
      return '/unibox';
    }
    return '/outreach/campaigns-all';
  });

  return {
    // Current role
    currentRole,

    // Specific role flags
    isSuperAdmin,
    isAdmin,
    isMember,
    isMailboxManager,
    isInboxManager,
    isViewer,

    // Level checks
    isRoleAdminOrAbove,
    isReadOnly,

    // Module access flags
    canAccessCampaigns,
    canAccessMailboxes,
    canAccessInbox,
    canAccessSettings,
    canAccessBilling,

    // Navigation helper
    defaultRedirectPath,
  };
}

export default usePermissions;
