export const TEAM_MEMBER_STATUS = {
  invitation_pending: {
    value: 'invitation_pending',
    label: 'Invitation Pending',
    description: 'Invite sent but not yet accepted',
    color: 'warning',
  },

  invitation_accepted: {
    value: 'invitation_accepted',
    label: 'Active',
    description: 'User has access to the workspace',
    color: 'positive',
  },

  invitation_expired: {
    value: 'invitation_expired',
    label: 'Invitation Expired',
    description: 'Invite expired and is no longer valid',
    color: 'negative',
  },

  deleted: {
    value: 'deleted',
    label: 'Removed',
    description: 'User access has been removed',
    color: 'grey',
  },

  left: {
    value: 'left',
    label: 'Left Workspace',
    description: 'User left the workspace',
    color: 'grey',
  },
};

export const TEAM_MEMBER_STATUS_ACTIONS = {
  invitation_pending: [
    'resend_invitation',
    'edit_member_role',
    // 'cancel_invitation',
  ],

  invitation_accepted: [
    'edit_member_role',
    'deactivate_member',
    'remove_from_workspace',
  ],

  invitation_expired: [
    'resend_invitation',
    'edit_member_role',
    'remove_invitation',
  ],

  // deleted ones are not shown in the UI
  deleted: [
    'remove_from_workspace',
  ],

  left: [
    'reinvite_member',
    'remove_from_workspace',
  ],
};

export const TEAM_MEMBER_ACTIONS = {
  edit_member_role: {
    label: 'Edit Role',
    icon: 'edit',
    value: 'edit_member_role',
  },
  resend_invitation: {
    label: 'Resend Invitation',
    icon: 'mail',
    value: 'resend_invitation',
  },
  // cancel_invitation: {
  //   label: 'Cancel Invitation',
  //   icon: 'close',
  //   classes: 'delete-member-item',
  //   value: 'cancel_invitation',
  // },
  deactivate_member: {
    label: 'Deactivate Member',
    icon: 'close',
    value: 'deactivate_member',
  },
  remove_from_workspace: {
    label: 'Remove From Workspace',
    icon: 'delete',
    classes: 'delete-member-item',
    value: 'remove_from_workspace',
  },

  remove_invitation: {
    label: 'Remove Invitation',
    icon: 'delete',
    classes: 'delete-member-item',
    value: 'remove_invitation',
  },

  remove_from_history: {
    label: 'Remove From History',
    icon: 'delete',
    classes: 'delete-member-item',
    value: 'remove_from_history',
  },

  reinvite_member: {
    label: 'Re-invite Member',
    icon: 'mail',
    value: 'reinvite_member',
  },
  reactivate_member: {
    label: 'Reactivate Member',
    icon: 'reload',
    value: 'reactivate_member',
  },
};

export const TEAM_MEMBER_ROLES = {
  SUPER_ADMIN: {
    value: 'SUPER_ADMIN',
    label: 'Workspace Owner',
    description: 'Full access to the workspace, including billing and settings. Reserved for the workspace creator and cannot be assigned to others',
  },
  ADMIN: {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Full access to manage workspace, team, campaigns, settings and billing',
  },
  MEMBER: {
    value: 'MEMBER',
    label: 'Member',
    description: 'Full access to the app including campaigns and emails, except settings and billing',
  },
  INBOX_MANAGER: {
    value: 'INBOX_MANAGER',
    label: 'Inbox Manager',
    description: 'View-only access across the app, with permission to reply to conversations from the unified inbox',
  },
  VIEWER: {
    value: 'VIEWER',
    label: 'Viewer',
    description: 'Read-only access to view data and reports across the app, except billing and settings',
  },
};

export const CLIENT_MEMBER_ROLES = {
  ACCOUNT_MANAGER: {
    value: 'ACCOUNT_MANAGER',
    label: 'Account Manager',
    description: 'Manage campaigns, contacts, conversations and reports. Cannot access workspace settings or billing.',
    permission: {
      canWrite: true,
      canManageInbox: true,
      canManageWorkspace: false,
    },
  },

  INBOX_MANAGER: {
    value: 'INBOX_MANAGER',
    label: 'Inbox Manager',
    description: 'View workspace activity and manage conversations from the unified inbox.',
    permission: {
      canWrite: false,
      canManageInbox: true,
      canManageWorkspace: false,
    },
  },

  VIEWER: {
    value: 'VIEWER',
    label: 'Viewer',
    description: 'View campaigns, conversations and reports without making changes.',
    permission: {
      canWrite: false,
      canManageInbox: false,
      canManageWorkspace: false,
    },
  },
};

export const CLIENT_MEMBER_STATUS = {
  active: {
    value: 'active',
    label: 'Active',
    color: 'positive',
  },

  inactive: {
    value: 'inactive',
    label: 'Inactive',
    color: 'negative',
  },
};
