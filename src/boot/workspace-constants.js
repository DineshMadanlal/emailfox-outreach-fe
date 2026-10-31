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
  MAILBOX_MANAGER: {
    value: 'MAILBOX_MANAGER',
    label: 'Mailbox Manager',
    description: 'Access restricted exclusively to the mailboxes module to connect and manage email accounts, without access to campaigns, inbox, settings, or billing',
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

export const TAGS_PRESET_COLORS = [
  '#2563EB', // Blue
  '#0D9488', // Teal
  '#BE185D', // Magenta/Pink
  '#581C87', // Dark Purple
  '#D97706', // Orange/Amber
  '#374151', // Slate/Charcoal
];

export const BULK_ASSIGN_TAG_FEATURE = {
  CAMPAIGNS: 'CAMPAIGNS',
  MAILBOXES: 'MAILBOXES',
  CONTACT_LISTS: 'CONTACT_LISTS',
};

export const ENGAGEMENT_SCORE_STATUS = {
  HOT: {
    label: 'Hot',
    value: 'HOT',
    color: 'positive',
  },
  ENGAGED: {
    label: 'Engaged',
    value: 'ENGAGED',
    color: 'warning',
  },
  COLD: {
    label: 'Cold',
    value: 'COLD',
    color: 'information',
  },
  INACTIVE: {
    label: 'Inactive',
    value: 'INACTIVE',
    color: 'grey',
  },
};

export const SEG_PROVIDERS = {
  PROOFPOINT: 'PROOFPOINT',
  MIMECAST: 'MIMECAST',
  BARRACUDA: 'BARRACUDA',
  CISCO: 'CISCO',
  SOPHOS: 'SOPHOS',
  FORTINET: 'FORTINET',
  TREND_MICRO: 'TREND_MICRO',
  SYMANTEC: 'SYMANTEC',
  SPAMTITAN: 'SPAMTITAN',
  HORNETSECURITY: 'HORNETSECURITY',
  APPRIVER: 'APPRIVER',
};

export const SEG_SIGNATURES = [
  {
    provider: 'PROOFPOINT',
    label: 'Proofpoint',
    icon: 'https://www.google.com/s2/favicons?domain=proofpoint.com&sz=128',
    patterns: ['pphosted.com', 'ppe-hosted.com', 'proofpoint.com'],
  },
  {
    provider: 'MIMECAST',
    label: 'Mimecast',
    icon: 'https://www.google.com/s2/favicons?domain=mimecast.com&sz=128',
    patterns: ['mimecast.com', 'mimecast-offshore.com', 'mimecast.co.za'],
  },
  {
    provider: 'BARRACUDA',
    label: 'Barracuda',
    icon: 'https://www.google.com/s2/favicons?domain=barracuda.com&sz=128',
    patterns: ['barracudanetworks.com', 'barracuda.com'],
  },
  {
    provider: 'CISCO',
    label: 'Cisco',
    icon: 'https://www.google.com/s2/favicons?domain=cisco.com&sz=128',
    patterns: ['iphmx.com', 'cisco.com'],
  },
  {
    provider: 'SOPHOS',
    label: 'Sophos',
    icon: 'https://www.google.com/s2/favicons?domain=sophos.com&sz=128',
    patterns: ['sophos.com', 'hydra.sophos.com'],
  },
  {
    provider: 'FORTINET',
    label: 'Fortinet',
    icon: 'https://www.google.com/s2/favicons?domain=fortinet.com&sz=128',
    patterns: ['fortimail.com'],
  },
  {
    provider: 'TREND_MICRO',
    label: 'Trend Micro',
    icon: 'https://www.google.com/s2/favicons?domain=trendmicro.com&sz=128',
    patterns: ['trendmicro.com', 'tmes.trendmicro.com', 'trendmicro.eu'],
  },
  {
    provider: 'SYMANTEC',
    label: 'Symantec',
    icon: 'https://www.google.com/s2/favicons?domain=symantec.com&sz=128',
    patterns: ['messagelabs.com', 'symantec.com'],
  },
  {
    provider: 'SPAMTITAN',
    label: 'SpamTitan',
    icon: 'https://www.google.com/s2/favicons?domain=spamtitan.com&sz=128',
    patterns: ['spamtitan.com', 'titanhq.com'],
  },
  {
    provider: 'HORNETSECURITY',
    label: 'Hornetsecurity',
    icon: 'https://www.google.com/s2/favicons?domain=hornetsecurity.com&sz=128',
    patterns: ['hornetsecurity.com', 'antispameurope.com'],
  },
  {
    provider: 'APPRIVER',
    label: 'AppRiver',
    icon: 'https://www.google.com/s2/favicons?domain=appriver.com&sz=128',
    patterns: ['appriver.com', 'zixcorp.com'],
  },
];
