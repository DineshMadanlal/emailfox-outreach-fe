export const DOMAIN_REGEX = /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;

export const EMAIL_REGEX = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;

export const CUSTOM_TRACKING_URL_REGEX = /^(?!https?:\/\/)[\w.-]+(?:\.[\w\\.-]+)+$/;

export const HTTPS_URL_REGEX = /^(https:\/\/)(www\.)?([a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;

export const HTTP_OR_HTTPS_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export const BRANDS_PRIMARY_SECONDAY_COLOR = {
  EMAIL_FOX: {
    primary: '#1C1F26',
    secondary: '#12151A',
  },
};

export const DEFAULT_BRAND_OTHER_COLORS = {
  positive: '#0B9C56',
  warning: '#E77E03',
  negative: '#DE1D2B',
  grey: '#55647F',

  information: '#268BEB',
  white: '#FFFFFF',
  black: '#040A14',

  'grey-50': '#eef0f2',
  tertiary: '#553FEB',
  'grey-100': '#cacfd7',
};

export const DARK_MODE_BRAND_OTHER_COLORS = {
  positive: '#0B9C56',
  warning: '#E77E03',
  negative: '#DE1D2B',
  grey: '#FFFFFF',

  information: '#268BEB',
  white: '#040A14',
  black: '#FFFFFF',
};

export const APP_MODE = {
  LIGHT_MODE: 'light',
  DARK_MODE: 'dark',
  DEFAULT_MODE: 'default',
};

//
export const SUPPORTED_THEMES = {
  DEFAULT: {
    label: 'Default Black',
    value: '#1C1F26',
  },
  PALATINE: {
    label: 'Palatine',
    value: '#52154E',
  },
  ONYX: {
    label: 'Onyx',
    value: '#353B3C',
  },
  BROWN: {
    label: 'Brown',
    value: '#6f1d1b',
  },
  INDIGO: {
    label: 'Indigo',
    value: '#4F46E5',
  },
  PURPLE: {
    label: 'Purple',
    value: '#9333EA',
  },
  CYAN: {
    label: 'Cyan',
    value: '#0891B2',
  },
  SLATE: {
    label: 'Slate',
    value: '#334155',
  },
  ZINC: {
    label: 'Zinc',
    value: '#3F3F46',
  },
  SKY: {
    label: 'Sky',
    value: '#0284C7',
  },
  PERIWINKLE: {
    label: 'Periwinkle',
    value: '#6366F1',
  },
  MAUVE: {
    label: 'Mauve',
    value: '#7E5BEF',
  },
  MIDNIGHT: {
    label: 'Midnight',
    value: '#1E293B',
  },
};

export const CONTACTS_IMPORT_STEPS = {
  UPLOAD_FILE: {
    step: 1,
    label: 'Upload File',
    value: 'upload_file',
    previousStep: null,
  },
  MAP_FIELDS: {
    step: 2,
    label: 'Map Fields',
    value: 'map_fields',
    previousStep: 'upload_file',
    lastStep: true,
  },
};

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

export const TABLE_PAGINATION = {
  page: 1,
  rowsPerPage: 0, // 0 means all rows
};

export const TABLE_MULTI_SELECT_OPTIONS = {
  SELECT_CURRENT_LIST: 'SELECT_CURRENT_LIST',
  SELECT_ALL: 'SELECT_ALL',
  SELECT_SPECIFIC_LIMIT: 'SELECT_SPECIFIC_LIMIT',
};

export const LOCAL_STORAGE_KEY = 'aipruntimeoutreach';

export const DEFAULT_TABLE_PAGINATION = {
  page: 1,
  perPage: 20,
  rowsNumber: 0,
  rowsPerPage: 20,
};

export const DROPDOWN_MAX_FETCH_LIMIT = 40;

export const PLAN_TYPES = {
  TRIAL_PLAN: 'TRIAL_PLAN',
  LAUNCH_PLAN: 'LAUNCH_PLAN',
  GROWTH_PLAN: 'GROWTH_PLAN',
  SCALE_PLAN: 'SCALE_PLAN',
  ENTERPRISE_PLAN: 'ENTERPRISE_PLAN',
  ENTERPRISE_PLAN_100K: 'ENTERPRISE_PLAN_100K',
  ENTERPRISE_PLAN_1M: 'ENTERPRISE_PLAN_1M',
};

export const PLAN_LABELS = {
  [PLAN_TYPES.TRIAL_PLAN]: 'Trial',
  [PLAN_TYPES.LAUNCH_PLAN]: 'Launch',
  [PLAN_TYPES.GROWTH_PLAN]: 'Growth',
  [PLAN_TYPES.SCALE_PLAN]: 'Scale',
  [PLAN_TYPES.ENTERPRISE_PLAN]: 'Enterprise',
  [PLAN_TYPES.ENTERPRISE_PLAN_100K]: 'Enterprise',
  [PLAN_TYPES.ENTERPRISE_PLAN_1M]: 'Enterprise',
};

export const PLAN_ORDER = {
  [PLAN_TYPES.TRIAL_PLAN]: 0,
  [PLAN_TYPES.LAUNCH_PLAN]: 1,
  [PLAN_TYPES.GROWTH_PLAN]: 2,
  [PLAN_TYPES.SCALE_PLAN]: 3,
  [PLAN_TYPES.ENTERPRISE_PLAN]: 4,
  [PLAN_TYPES.ENTERPRISE_PLAN_100K]: 5,
  [PLAN_TYPES.ENTERPRISE_PLAN_1M]: 6,
};

export const PLAN_CHARGE_TYPES = {
  month: {
    [PLAN_TYPES.TRIAL_PLAN]: 0,
    [PLAN_TYPES.LAUNCH_PLAN]: 29,
    [PLAN_TYPES.GROWTH_PLAN]: 109,
    [PLAN_TYPES.SCALE_PLAN]: 199,
    [PLAN_TYPES.ENTERPRISE_PLAN]: 329,
  },
};

export const STRIKETHROUGH_PLAN_PRICE = {
  month: {
    [PLAN_TYPES.TRIAL_PLAN]: 0,
    [PLAN_TYPES.LAUNCH_PLAN]: 49,
    [PLAN_TYPES.GROWTH_PLAN]: 159,
    [PLAN_TYPES.SCALE_PLAN]: 249,
    [PLAN_TYPES.ENTERPRISE_PLAN]: 389,
  },
};

export const PLAN_FEATURES = {
  MONTHLY_OUTBOUND_CAPACITY: {
    label: 'Monthly Outbound Capacity',
    type: 'text',
    ouboundCapacity: true,
    tooltip: 'The maximum number of emails your workspace can send each month across all mailboxes.',
    [PLAN_TYPES.LAUNCH_PLAN]: '20,000 Emails',
    [PLAN_TYPES.GROWTH_PLAN]: '100,000 Emails',
    [PLAN_TYPES.SCALE_PLAN]: '250,000 Emails',
    [PLAN_TYPES.ENTERPRISE_PLAN]: '500,000+ Emails',
  },

  MAILBOXES: {
    label: 'Connected Mailboxes',
    type: 'text',
    fup: true,
    tooltip: 'Connect and manage sending mailboxes without any platform-imposed limits.',
    [PLAN_TYPES.LAUNCH_PLAN]: 'Unlimited',
    [PLAN_TYPES.GROWTH_PLAN]: 'Unlimited',
    [PLAN_TYPES.SCALE_PLAN]: 'Unlimited',
    [PLAN_TYPES.ENTERPRISE_PLAN]: 'Unlimited',
  },

  CONTACTS: {
    label: 'Contacts & Leads',
    type: 'text',
    fup: true,
    tooltip: 'Store and manage unlimited prospects and customers within Outreach.',
    [PLAN_TYPES.LAUNCH_PLAN]: 'Unlimited',
    [PLAN_TYPES.GROWTH_PLAN]: 'Unlimited',
    [PLAN_TYPES.SCALE_PLAN]: 'Unlimited',
    [PLAN_TYPES.ENTERPRISE_PLAN]: 'Unlimited',
  },

  TEAM_MEMBERS: {
    label: 'Team Members',
    type: 'text',
    tooltip: 'Invite your entire team to collaborate without per-user restrictions.',
    [PLAN_TYPES.LAUNCH_PLAN]: 'Unlimited',
    [PLAN_TYPES.GROWTH_PLAN]: 'Unlimited',
    [PLAN_TYPES.SCALE_PLAN]: 'Unlimited',
    [PLAN_TYPES.ENTERPRISE_PLAN]: 'Unlimited',
  },

  WARMUP: {
    label: 'Email Warmup',
    type: 'text',
    tooltip: 'Automatically builds and maintains sender reputation through continuous inbox engagement.',
    [PLAN_TYPES.LAUNCH_PLAN]: 'Unlimited',
    [PLAN_TYPES.GROWTH_PLAN]: 'Unlimited',
    [PLAN_TYPES.SCALE_PLAN]: 'Unlimited',
    [PLAN_TYPES.ENTERPRISE_PLAN]: 'Unlimited',
  },

  AI_REPLY_CATEGORIZATION: {
    label: 'AI Reply Categorization',
    type: 'text',
    tooltip: 'Automatically classifies replies such as Interested, Not Interested, Meeting Booked, Out of Office, and more.',
    [PLAN_TYPES.LAUNCH_PLAN]: 'Unlimited',
    [PLAN_TYPES.GROWTH_PLAN]: 'Unlimited',
    [PLAN_TYPES.SCALE_PLAN]: 'Unlimited',
    [PLAN_TYPES.ENTERPRISE_PLAN]: 'Unlimited',
  },

  API_ACCESS: {
    label: 'API Access',
    type: 'boolean',
    tooltip: 'Access Outreach programmatically to automate workflows and integrate with other systems.',
    [PLAN_TYPES.LAUNCH_PLAN]: true,
    [PLAN_TYPES.GROWTH_PLAN]: true,
    [PLAN_TYPES.SCALE_PLAN]: true,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  BLACKLIST_MONITORING: {
    label: 'Blacklist Monitoring',
    type: 'boolean',
    tooltip: 'Continuously monitors your domains and infrastructure against major email blacklists.',
    [PLAN_TYPES.LAUNCH_PLAN]: true,
    [PLAN_TYPES.GROWTH_PLAN]: true,
    [PLAN_TYPES.SCALE_PLAN]: true,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  UNIBOX: {
    label: 'Unibox (Unified Inbox)',
    type: 'boolean',
    tooltip: 'Manage conversations from all connected mailboxes in a single shared inbox.',
    [PLAN_TYPES.LAUNCH_PLAN]: true,
    [PLAN_TYPES.GROWTH_PLAN]: true,
    [PLAN_TYPES.SCALE_PLAN]: true,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  COLLABORATION: {
    label: 'Slack-style Collaboration',
    type: 'boolean',
    tooltip: 'Collaborate with teammates using internal notes, assignments, and conversation sharing.',
    [PLAN_TYPES.LAUNCH_PLAN]: true,
    [PLAN_TYPES.GROWTH_PLAN]: true,
    [PLAN_TYPES.SCALE_PLAN]: true,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  ISOLATED_INFRASTRUCTURE: {
    label: 'Isolated Infrastructure',
    type: 'boolean',
    tooltip: 'Your deliverability is protected from activity generated by other Outreach customers.',
    [PLAN_TYPES.LAUNCH_PLAN]: true,
    [PLAN_TYPES.GROWTH_PLAN]: true,
    [PLAN_TYPES.SCALE_PLAN]: true,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  IP_ROTATION: {
    label: 'IP Rotation',
    type: 'boolean',
    tooltip: 'Automatically rotates sending IPs to distribute traffic and support deliverability.',
    [PLAN_TYPES.LAUNCH_PLAN]: true,
    [PLAN_TYPES.GROWTH_PLAN]: true,
    [PLAN_TYPES.SCALE_PLAN]: true,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  MAILBOX_ROTATION: {
    label: 'Mailbox Rotation',
    type: 'boolean',
    tooltip: 'Distributes sending volume across multiple mailboxes to reduce risk and increase scale.',
    [PLAN_TYPES.LAUNCH_PLAN]: true,
    [PLAN_TYPES.GROWTH_PLAN]: true,
    [PLAN_TYPES.SCALE_PLAN]: true,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  WHITE_LABEL: {
    label: 'White Label',
    type: 'boolean',
    tooltip: 'Replace Outreach branding with your own branding for a fully customized experience.',
    [PLAN_TYPES.LAUNCH_PLAN]: false,
    [PLAN_TYPES.GROWTH_PLAN]: false,
    [PLAN_TYPES.SCALE_PLAN]: true,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  CUSTOM_SCRIPTS: {
    label: 'Custom Scripts',
    type: 'boolean',
    tooltip: 'Run custom automation and business-specific workflows within Outreach.',
    [PLAN_TYPES.LAUNCH_PLAN]: false,
    [PLAN_TYPES.GROWTH_PLAN]: false,
    [PLAN_TYPES.SCALE_PLAN]: true,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  CUSTOM_API_LIMITS: {
    label: 'Custom API Rate Limits',
    type: 'boolean',
    tooltip: 'Receive higher or customized API limits based on your integration requirements.',
    [PLAN_TYPES.LAUNCH_PLAN]: false,
    [PLAN_TYPES.GROWTH_PLAN]: false,
    [PLAN_TYPES.SCALE_PLAN]: true,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  DEDICATED_ACCOUNT_MANAGER: {
    label: 'Dedicated Account Manager',
    type: 'boolean',
    tooltip: 'Get a dedicated point of contact for onboarding, strategy, and ongoing support.',
    [PLAN_TYPES.LAUNCH_PLAN]: false,
    [PLAN_TYPES.GROWTH_PLAN]: false,
    [PLAN_TYPES.SCALE_PLAN]: true,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  PREMIUM_INFRASTRUCTURE: {
    label: 'Enterprise Infrastructure',
    type: 'boolean',
    tooltip: 'Access advanced infrastructure configurations tailored to high-volume sending environments.',
    [PLAN_TYPES.LAUNCH_PLAN]: false,
    [PLAN_TYPES.GROWTH_PLAN]: false,
    [PLAN_TYPES.SCALE_PLAN]: false,
    [PLAN_TYPES.ENTERPRISE_PLAN]: true,
  },

  SUPPORT: {
    label: 'Support Level',
    type: 'text',
    tooltip: 'The level of assistance and response priority available for your workspace.',
    [PLAN_TYPES.LAUNCH_PLAN]: 'Standard',
    [PLAN_TYPES.GROWTH_PLAN]: 'Priority',
    [PLAN_TYPES.SCALE_PLAN]: 'Premium',
    [PLAN_TYPES.ENTERPRISE_PLAN]: 'Dedicated',
  },
};

export const MAX_FILE_SIZE_IN_MB = 15;

export const TOTAL_ATTACHMENTS_SIZE_RESTRICTION = 25;

export const EMAIL_THREAD_TYPE = {
  INBOX: 'INBOX',
  SENT: 'SENT',
  BOUNCED: 'BOUNCED',
  IMPORTANT: 'IMPORTANT',
  SPAM: 'SPAM',
};

export const SKYBOX_EMAIL_TYPE = {
  SENT: 'SENT',
  REPLY: 'REPLY',
};

export const FOLDER_RULE_TYPES = [
  { label: 'From', value: 'FROM' },
  { label: 'To', value: 'TO' },
  { label: 'CC', value: 'CC' },
  { label: 'BCC', value: 'BCC' },
  { label: 'Message ID', value: 'MESSAGE_ID' },
  { label: 'Subject Line', value: 'SUBJECT' },
  { label: 'Body Message', value: 'BODY' },
];

export const DEFAULT_FOLDER_RULE_TYPE = 'BODY';

export const FOLDER_PATTERN_TYPES = [
  { label: 'Contains', value: 'CONTAINS' },
  { label: 'Starts With', value: 'STARTS_WITH' },
  { label: 'Matches Regex', value: 'REGEX' },
];

export const DEFAULT_FOLDER_PATTERN_TYPE = 'CONTAINS';

export const FOLDER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const SLA_TIMINGS_FOR_CHAT = {
  [PLAN_TYPES.TRIAL_PLAN]: 300, // 5 minutes -> 5 * 60
  [PLAN_TYPES.LAUNCH_PLAN]: 480, // 8 minutes -> 8 * 60
  [PLAN_TYPES.GROWTH_PLAN]: 480, // 8 minutes -> 8 * 60
  [PLAN_TYPES.SCALE_PLAN]: 180, // 3 minutes -> 3 * 60
  [PLAN_TYPES.ENTERPRISE_PLAN]: 180, // 3 minutes -> 3 * 60
  [PLAN_TYPES.ENTERPRISE_PLAN_100K]: 180, // 3 minutes -> 3 * 60
  [PLAN_TYPES.ENTERPRISE_PLAN_1M]: 180, // 3 minutes -> 3 * 60
};

export const USD_TO_INR_VALUE = 95.22;

export const IS_PRIMARY_PLATFORM = !!process.env.DEV_MODE;

export const ENTERPRISE_OUTBOUND_CAPACITY = {
  min: 500000,
  max: 10000000, // 10M
};

export const ENTERPRISE_OUTBOUND_PRICING = {
  EVERY_100K: 59,
  EVERY_1M: 540,
};

export const SCRIPT_PLACEMENT_OPTIONS = [
  { label: '<head>', value: '<head>' },
  { label: '<body>', value: '<body>' },
];

export const SCRIPT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const API_CALLS_MAX_LIMIT = 15;

export const INFINITE_SCROLL_MAX_LIMIT = 10;

export const SKYBOX_CLICK_EVENTS_SEC_SIDEBAR = {
  REFRESH_SKYBOX: 'REFRESH_SKYBOX',
  COMPOSE_EMAIL: 'COMPOSE_EMAIL',
};
