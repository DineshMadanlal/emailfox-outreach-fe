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
};

export const GOOGLE_API = {
  CLIENT_ID: '207877469190-eoe2a1h7k0o553e413hn5urv4tsu224t.apps.googleusercontent.com',
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
