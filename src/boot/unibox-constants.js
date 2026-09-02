/**
 * Unibox Constants
 * Defines thread types, action events, and status constants for Unibox
 */

// Thread types supported in Unibox
export const UNIBOX_THREAD_TYPE = {
  INBOX: 'INBOX',
  UNTRACKED_REPLIES: 'UNTRACKED_REPLIES',
  IMPORTANT: 'IMPORTANT',
  BOUNCED: 'BOUNCED',
};

// Secondary sidebar click events for Unibox
export const UNIBOX_SIDEBAR_CLICK_EVENTS = {
  REFRESH_UNIBOX: 'REFRESH_UNIBOX',
  COMPOSE_EMAIL: 'COMPOSE_EMAIL',
};

// Email message type
export const UNIBOX_EMAIL_TYPE = {
  SENT: 'SENT',
  REPLY: 'REPLY',
};

// Outreach channel filter types
export const UNIBOX_CHANNEL_TYPE = {
  EMAIL: 'EMAIL',
  LINKEDIN: 'LINKEDIN',
  MULTI_CHANNEL: 'MULTI_CHANNEL',
};

// Outreach channel dropdown options
export const UNIBOX_CHANNEL_OPTIONS = [
  {
    label: 'Email',
    value: UNIBOX_CHANNEL_TYPE.EMAIL,
    icon: 'mail',
  },
  {
    label: 'LinkedIn',
    value: UNIBOX_CHANNEL_TYPE.LINKEDIN,
    icon: 'linkedin-1',
  },
  {
    label: 'Multi-Channel',
    value: UNIBOX_CHANNEL_TYPE.MULTI_CHANNEL,
    icon: 'exchange',
  },
];

// Default initial filters configuration for Unibox
export const DEFAULT_UNIBOX_FILTERS = {
  search_text: '',
  domain: '',
  mailbox: '',
  seq_id: null,
  reply_category_id: null,
  channel: null,
};
