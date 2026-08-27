export const MAILBOX_PROVIDERS = {
  GMAIL: {
    label: 'Gmail',
    value: 'GMAIL',
  },
  OUTLOOK: {
    label: 'Outlook',
    value: 'OUTLOOK',
  },
  SMTP: {
    label: 'SMTP',
    value: 'SMTP',
  },
  AZURE: {
    label: 'Azure',
    value: 'AZURE',
  },
};

export const MAILBOX_STATUS = {
  ACTIVE: 'ACTIVE',
  DISCONNECTED: 'DISCONNECTED',
  DELETED: 'DELETED',
  SUSPENDED: 'SUSPENDED',
  DISABLED: 'DISABLED',
};

export const MAILBOX_STATUS_LABELS = {
  ACTIVE: {
    label: 'Active',
    value: 'ACTIVE',
  },
  DISCONNECTED: {
    label: 'Disconnected',
    value: 'DISCONNECTED',
  },
  // DELETED: {
  //   label: 'Deleted',
  //   value: 'DELETED',
  // },
  SUSPENDED: {
    label: 'Suspended',
    value: 'SUSPENDED',
  },
  // DISABLED: {
  //   label: 'Disabled',
  //   value: 'DISABLED',
  // },
};

export const ESP_PROVIDERS = {
  GMAIL: 'GMAIL',
  OUTLOOK: 'OUTLOOK',
  CUSTOM_SMTP: 'CUSTOM_SMTP',
  YAHOO: 'YAHOO',
  ZOHO: 'ZOHO',
  SKYSENDERS: 'SKYSENDERS',
};

export const MAILBOX_ACTIONS = {
  SET_DAILY_SEND_COUNT: 'setDailySendCount',
  ENABLE_WARMUP: 'enableWarmup',
  DISABLE_WARMUP: 'disableWarmup',
  SET_SIGNATURE: 'setSignature',
  CLEAR_SIGNATURE: 'clearSignature',
  DELETE: 'delete',
};

export const ACTION_CONFIG = {
  [MAILBOX_ACTIONS.SET_DAILY_SEND_COUNT]: {
    title: ({ count, word }) => `Set Daily Limit for ${count} ${word}`,
    description: 'Applies to every selected mailbox. Maximum is 50 per day.',
    submitLabel: 'Update Daily Limit',
    type: 'dailyLimit',
    color: 'primary',
  },

  [MAILBOX_ACTIONS.ENABLE_WARMUP]: {
    title: ({ count, word }) => `Enable Warmup for ${count} ${word}`,
    description: 'Warmup will be enabled for the selected mailboxes.',
    submitLabel: 'Enable Warmup',
    type: 'confirm',
    color: 'primary',
  },

  [MAILBOX_ACTIONS.DISABLE_WARMUP]: {
    title: ({ count, word }) => `Disable Warmup for ${count} ${word}`,
    description: 'Warmup emails will stop for the selected mailboxes.',
    submitLabel: 'Disable Warmup',
    type: 'confirm',
    color: 'primary',
  },

  [MAILBOX_ACTIONS.SET_SIGNATURE]: {
    title: ({ count, word }) => `Set Signature for ${count} ${word}`,
    description: '',
    submitLabel: 'Save Signature',
    type: 'signature',
    color: 'primary',
  },

  [MAILBOX_ACTIONS.CLEAR_SIGNATURE]: {
    title: ({ count, word }) => `Clear Signature for ${count} ${word}`,
    description: 'The signature will be cleared from the selected mailboxes.',
    submitLabel: 'Clear Signature',
    type: 'confirm',
    color: 'primary',
  },

  [MAILBOX_ACTIONS.DELETE]: {
    title: ({ count, word }) => `Delete ${count} ${word}`,
    description: '',
    submitLabel: 'Delete',
    type: 'danger',
    color: 'negative',
  },
};

// Stepper steps for the standard 2-step mailbox import flow
// (Google, Microsoft, single IMAP/SMTP)
export const MAILBOX_IMPORT_STEPS = {
  SELECT_PROVIDER: {
    step: 1,
    label: 'Select Provider',
    value: 'select_provider',
    previousStep: null,
  },
  CONNECT_MAILBOX: {
    step: 2,
    label: 'Connect Mailbox',
    value: 'connect_mailbox',
    previousStep: 'select_provider',
    lastStep: true,
  },
};

// Stepper steps for the 3-step SMTP bulk CSV import flow
export const BULK_MAILBOX_IMPORT_STEPS = {
  SELECT_PROVIDER: {
    step: 1,
    label: 'Select Provider',
    value: 'select_provider',
    previousStep: null,
  },
  UPLOAD_FILE: {
    step: 2,
    label: 'Upload File',
    value: 'upload_file',
    previousStep: 'select_provider',
  },
  IMPORT_MAILBOXES: {
    step: 3,
    label: 'Import Mailboxes',
    value: 'import_mailboxes',
    previousStep: 'upload_file',
    lastStep: true,
  },
};

// System field definitions for SMTP bulk CSV field mapping
// Each entry defines a target API field with display label,
// group, aliases for auto-detection, and whether it is required
export const SMTP_BULK_FIELD_DEFINITIONS = [
  // Basic
  {
    key: 'name',
    label: 'Full Name',
    group: null,
    required: true,
    aliases: ['name', 'full name', 'fullname', 'full_name'],
  },
  {
    key: 'email',
    label: 'User Name / Email',
    group: null,
    required: true,
    aliases: ['email', 'email address', 'email_address'],
  },
  {
    key: 'password',
    label: 'Password',
    group: null,
    required: true,
    aliases: ['password', 'pass', 'pwd'],
  },

  // SMTP
  {
    key: 'smtp_host',
    label: 'Host',
    group: 'SMTP (Outgoing Mail)',
    required: true,
    aliases: ['smtp_host', 'smtp host', 'outgoing host', 'smtphost'],
  },
  {
    key: 'smtp_port',
    label: 'SMTP Port',
    group: 'SMTP (Outgoing Mail)',
    required: true,
    aliases: ['smtp_port', 'smtp port', 'outgoing port', 'smtpport'],
  },
  {
    key: 'smtp_secure',
    label: 'SMTP Proxy Type',
    group: 'SMTP (Outgoing Mail)',
    required: true,
    aliases: ['smtp_secure', 'smtp secure', 'proxy type', 'proxytype', 'smtp_ssl'],
  },

  // IMAP
  {
    key: 'imap_host',
    label: 'Host',
    group: 'IMAP (Incoming Mail)',
    required: true,
    aliases: ['imap_host', 'imap host', 'incoming host', 'imaphost'],
  },
  {
    key: 'imap_port',
    label: 'IMAP Port',
    group: 'IMAP (Incoming Mail)',
    required: true,
    aliases: ['imap_port', 'imap port', 'incoming port', 'imapport'],
  },
  {
    key: 'imap_secure',
    label: 'IMAP Proxy Type',
    group: 'IMAP (Incoming Mail)',
    required: true,
    aliases: ['imap_secure', 'imap secure', 'imap_ssl'],
  },

  // Configuration
  {
    key: 'sending_limit_per_day',
    label: 'Sending Limit / Day',
    group: 'Configuration',
    required: false,
    aliases: ['sending_limit_per_day', 'sending limit', 'daily limit', 'send limit'],
  },
  {
    key: 'minimum_time_gap_mins',
    label: 'Min Time Gap (mins)',
    group: 'Configuration',
    required: false,
    aliases: ['minimum_time_gap_mins', 'time gap', 'min gap', 'minimum time gap'],
  },
];

export const BULK_IMPORT_JOB_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
};

export const BULK_IMPORT_LOG_STATUS = {
  PENDING: 'pending',
  FAILED: 'failed',
  SUCCESS: 'success',
};
