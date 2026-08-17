export const VARIABLE_REGEX = /\{\{[^{}]+\}\}/g;
export const SPINTAX_REGEX = /\{[^{}]+\|[^{}]+\}/g;

export const CAMPAIGN_STATUS = {
  DRAFTED: {
    color: 'var(--grey-rgb)',
    icon: 'seq-drafted',
    label: 'Drafted',
    value: 'DRAFTED',
  },
  ACTIVE: {
    color: 'var(--positive-rgb)',
    icon: 'seq-inprogress',
    label: 'Active',
    value: 'ACTIVE',
  },
  // STOPPED: {
  //   color: 'var(--negative-rgb)',
  //   icon: 'seq-stopped',
  //   label: 'Stopped',
  //   value: 'STOPPED',
  // },
  COMPLETED: {
    color: 'var(--primary-rgb)',
    icon: 'seq-completed',
    label: 'Completed',
    value: 'COMPLETED',
  },
  PAUSED: {
    color: 'var(--warning-rgb)',
    icon: 'seq-paused',
    label: 'Paused',
    value: 'PAUSED',
  },
  AUTO_PAUSED: {
    color: 'var(--warning-rgb)',
    icon: 'seq-paused',
    label: 'Auto Paused',
    value: 'AUTO_PAUSED',
  },
  PAUSED_SUB_FAILED: {
    color: 'var(--negative-rgb)',
    icon: 'seq-paused',
    label: 'Paused - Subscription Failed',
    value: 'PAUSED_SUB_FAILED',
  },
  ARCHIVED: {
    color: 'var(--grey-rgb)',
    icon: 'delete',
    label: 'Archived',
    value: 'ARCHIVED',
  },
};

export const SEQUENCE_FORM_STEPS = {
  SETUP_SEQUENCE: {
    step: 1,
    label: 'Sequence',
    value: 'setup_sequence',
    previousStep: null,
    routePath: '/sequence',
  },
  SAVE_CONTACTS: {
    step: 2,
    label: 'Contacts',
    value: 'save_contacts',
    previousStep: 'setup_sequence',
    routePath: '/contacts',
  },
  SETTINGS: {
    step: 3,
    label: 'Settings',
    value: 'settings',
    previousStep: 'save_contacts',
    routePath: '/settings',
    lastStep: true,
  },
};

export const SEQUENCE_VARIANTS_MAX_LIMIT = 5;

export const SEQUENCE_VARIANT_NAME = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
};

export const VARIANT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
};

// Aliases for matching system fields
export const SYSTEM_FIELD_ALIASES = {
  first_name: ['first name', 'firstname', 'given name'],
  last_name: ['last name', 'lastname', 'surname'],

  email: ['email', 'emails', 'email address'],
  phone: ['phone', 'phone number', 'telephone', 'telephones'],

  job_title: ['job title', 'title', 'role'],

  linkedin_url: ['linkedin', 'linkedin url'],

  company_name: ['company', 'company name'],

  city: ['city'],
  state: ['state'],
  country: ['country'],
};

export const DEFAULT_SYSTEM_FIELDS = [
  // personal
  { label: 'First Name', value: 'first_name' },
  { label: 'Last Name', value: 'last_name' },
  { label: 'Email', value: 'email' },
  { label: 'Phone Number', value: 'phone' },

  // job
  { label: 'Job Title', value: 'job_title' },

  // social urls
  { label: 'LinkedIn URL', value: 'linkedin_url' },

  // company
  { label: 'Company Name', value: 'company_name' },

  // location
  { label: 'City', value: 'city' },
  { label: 'State', value: 'state' },
  { label: 'Country', value: 'country' },
];

export const CONTACTS_TABLE_SUPPORTED_COLUMNS = [
  // personal
  // {
  //   name: 'first_name',
  //   label: 'First Name',
  //   value: 'first_name',
  //   align: 'left',
  //   field: 'first_name',
  // },
  // {
  //   name: 'last_name',
  //   label: 'Last Name',
  //   value: 'last_name',
  //   align: 'left',
  //   field: 'last_name',
  // },

  // job
  {
    name: 'job_title',
    label: 'Job Title',
    value: 'job_title',
    align: 'left',
    field: 'job_title',
  },

  // social urls
  {
    name: 'linkedin_url',
    label: 'LinkedIn URL',
    value: 'linkedin_url',
    align: 'left',
    field: 'linkedin_url',
  },

  // company
  {
    name: 'company_name',
    label: 'Company Name',
    value: 'company_name',
    align: 'left',
    field: 'company_name',
  },

  // location
  {
    name: 'city',
    label: 'City',
    value: 'city',
    align: 'left',
    field: 'city',
  },
  {
    name: 'state',
    label: 'State',
    value: 'state',
    align: 'left',
    field: 'state',
  },
  {
    name: 'country',
    label: 'Country',
    value: 'country',
    align: 'left',
    field: 'country',
  },
];

export const IGNORE_FIELD = {
  label: 'Ignore Field',
  value: 'ignore_field',
};

export const CUSTOM_FIELD = {
  label: 'Custom Field',
  value: 'custom_field',
};

export const CONTACT_IMPORT_CONFLICT_ACTION = {
  SKIP: {
    label: 'Skip',
    value: 'SKIP',
    description: 'Skip the contact and do not import it.',
  },
  MERGE: {
    label: 'Merge',
    value: 'MERGE',
    description: 'Merge the new information with the existing contact.',
  },
};

export const CONTACTS_IMPORT_SOURCE_TYPE = {
  CSV_UPLOAD: 'CSV_UPLOAD',
};

export const CONTACT_STATUS_LABELS = {
  ACTIVE: {
    label: 'Active',
    value: 'ACTIVE',
  },
  UNSUBSCRIBED: {
    label: 'Unsubscribed',
    value: 'UNSUBSCRIBED',
  },
  BOUNCED: {
    label: 'Bounced',
    value: 'BOUNCED',
  },
  BLOCKED: {
    label: 'Blocked',
    value: 'BLOCKED',
  },
};

export const SENDER_VARIABLES = [
  { label: 'Name', value: 'sender_name' },
  { label: 'Email', value: 'sender_email' },
  { label: 'Signature', value: 'sender_signature' },
];

export const PRODUCT_VARIABLES_VALUES = [...DEFAULT_SYSTEM_FIELDS,
  ...SENDER_VARIABLES].flatMap((field) => field.value);

export const CONTEXT_VARIABLES = [
  // ------------------------------------
  // TIME PERIOD (Morning, Afternoon, Evening)
  // ------------------------------------
  {
    label: 'Time Period (Lowercase)',
    value: 'time_period "today"',
    example: 'morning',
  },
  {
    label: 'Time Period (Capitalized)',
    value: 'capitalize (time_period "today")',
    example: 'Morning',
  },

  // ------------------------------------
  // ACTUAL TIME
  // ------------------------------------
  {
    label: 'Current Time',
    value: 'time_of_day "today" "hh:mm a"',
    example: '03:30 PM',
  },

  // ------------------------------------
  // DAY OF WEEK
  // ------------------------------------
  {
    label: 'Day of Week',
    value: 'day_of_week "today"',
    example: 'Friday',
  },
  {
    label: 'Day of Week (Lowercase)',
    value: 'lower (day_of_week "today")',
    example: 'friday',
  },

  // ------------------------------------
  // MONTH & YEAR
  // ------------------------------------
  {
    label: 'Current Month',
    value: 'format_date "today" "MMMM"',
    example: 'August',
  },
  {
    label: 'Current Year',
    value: 'format_date "today" "yyyy"',
    example: '2026',
  },

  // ------------------------------------
  // COMMON DATES (Now utilizing our new defaults!)
  // ------------------------------------
  {
    label: 'Today\'s Date',
    value: 'format_date "today"', // Uses the 'dd MMM yyyy' default
    example: '14 Aug 2026',
  },
  {
    label: 'Next Working Day (Date)',
    value: 'next_working_day "today"', // No more nested format_date!
    example: '17 Aug 2026',
  },
  {
    label: 'Next Working Day (Name)',
    value: 'next_working_day "today" "EEEE"', // Passing the format directly
    example: 'Monday',
  },

  // ------------------------------------
  // DATE MATH
  // ------------------------------------
  {
    label: 'Add 3 Days',
    value: 'add_date "today" 3 "days"',
    example: '17 Aug 2026',
  },
  {
    label: 'Subtract 1 Month',
    value: 'subtract_date "today" 1 "months"',
    example: '14 Jul 2026',
  },
];

export const SCHEDULE_DEFAULT_TIME = {
  startTime: '10:00',
  endTime: '17:00',
};

export const SCHEDULE_DAYS_LABEL = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export const SCHEDULE_DAYS_SHORT_LABEL = {
  0: 'Su',
  1: 'M',
  2: 'Tu',
  3: 'W',
  4: 'Th',
  5: 'F',
  6: 'Sa',
};

export const TIMEZONES_LIST = [
  {
    label: 'Pacific Time',
    value: 'America/Los_Angeles',
    gmt: 'GMT-8',
  },
  {
    label: 'Mountain Time',
    value: 'America/Denver',
    gmt: 'GMT-7',
  },
  {
    label: 'Central Time',
    value: 'America/Chicago',
    gmt: 'GMT-6',
  },
  {
    label: 'Eastern Time',
    value: 'America/New_York',
    gmt: 'GMT-5',
  },

  {
    label: 'Brazil',
    value: 'America/Sao_Paulo',
    gmt: 'GMT-3',
  },

  {
    label: 'London',
    value: 'Europe/London',
    gmt: 'GMT+0',
  },

  {
    label: 'Central Europe',
    value: 'Europe/Berlin',
    gmt: 'GMT+1',
  },

  {
    label: 'Eastern Europe',
    value: 'Europe/Athens',
    gmt: 'GMT+2',
  },

  {
    label: 'Dubai',
    value: 'Asia/Dubai',
    gmt: 'GMT+4',
  },

  {
    label: 'India',
    value: 'Asia/Kolkata',
    gmt: 'GMT+5:30',
  },

  {
    label: 'Singapore',
    value: 'Asia/Singapore',
    gmt: 'GMT+8',
  },

  {
    label: 'Tokyo',
    value: 'Asia/Tokyo',
    gmt: 'GMT+9',
  },

  {
    label: 'Sydney',
    value: 'Australia/Sydney',
    gmt: 'GMT+10',
  },
];

export const SUPPRESSION_LIST_TYPES = {
  EMAIL: {
    label: 'Email Address',
    value: 'EMAIL',
  },
  DOMAIN: {
    label: 'Domain',
    value: 'DOMAIN',
  },
};

export const SUPPRESSION_TYPE = {
  UNSUBSCRIBE: {
    label: 'Unsubscribe',
    value: 'UNSUBSCRIBE',
  },
  HARD_BOUNCE: {
    label: 'Hard Bounce',
    value: 'HARD_BOUNCE',
  },
  SOFT_BOUNCE: {
    label: 'Soft Bounce',
    value: 'SOFT_BOUNCE',
  },
  MANUAL_BLOCK: {
    label: 'Manual Block',
    value: 'MANUAL_BLOCK',
  },
  SPAM_COMPLAINT: {
    label: 'Spam Complaint',
    value: 'SPAM_COMPLAINT',
  },
  INVALID_EMAIL: {
    label: 'Invalid Email',
    value: 'INVALID_EMAIL',
  },
};

export const SUPPRESSION_FIELD_ALIASES = {
  email: [
    'email',
    'emails',
    'email address',
    'e-mail',
    'recipient',
    'contact email',
    'recipient email',
  ],

  domain: [
    'domain',
    'domains',
    'domain name',
    'website',
    'company website',
    'company domain',
    'url',
  ],
};

export const CAMPAIGN_TYPES = {
  EMAIL: {
    label: 'Email Outreach',
    value: 'EMAIL_ONLY',
    description: 'Reach prospects through Email only.',
    icons: [{
      image: 'mail',
      classes: 'mail-icon',
    }],
  },
  LINKEDIN: {
    label: 'LinkedIn Outreach',
    value: 'LINKEDIN_ONLY',
    description: 'Reach prospects through LinkedIn only.',
    icons: [{
      image: 'linkedin',
      classes: 'linkedin-icon',
    }],
  },
  MULTI_CHANNEL: {
    label: 'Multi-channel Outreach',
    value: 'MULTI_CHANNEL',
    description: 'Reach prospects through Email and LinkedIn.',
    icons: [{
      image: 'mail',
      classes: 'mail-icon',
    }, {
      image: 'linkedin',
      classes: 'linkedin-icon',
    }],
  },
};

export const WORKFLOW_STEP_TYPES = {
  // CONDITION branches
  CONDITION: 'CONDITION',

  // action
  EMAIL: 'EMAIL',
  LINKEDIN_VISIT_PROFILE: 'LINKEDIN_VISIT_PROFILE',
  LINKEDIN_CONNECTION_REQUEST: 'LINKEDIN_CONNECTION_REQUEST',
  LINKEDIN_MESSAGE: 'LINKEDIN_MESSAGE',
  LINKEDIN_INMAIL: 'LINKEDIN_INMAIL',
  LINKEDIN_LIKE_POST: 'LINKEDIN_LIKE_POST',
  LINKEDIN_FOLLOW_PROFILE: 'LINKEDIN_FOLLOW_PROFILE',
};

export const WORKFLOW_STEP_CATEGORIES = {
  EMAIL: 'EMAIL',
  LINKEDIN: 'LINKEDIN',
};

export const DELAY_UNIT_TYPES = {
  HOURS: {
    label: 'Hours',
    value: 'HOURS',
  },
  DAYS: {
    label: 'Days',
    value: 'DAYS',
  },
};

export const EMAIL_WORKFLOW_STEP_CATALOG = {
  [WORKFLOW_STEP_TYPES.EMAIL]: {
    stepType: WORKFLOW_STEP_TYPES.EMAIL,
    category: WORKFLOW_STEP_CATEGORIES.EMAIL,
    title: 'Email',
    description: 'Send an email from your connected mailbox',
    theme: 'warning',
    icon: 'mail',

    jsonSchema: {
      variants: [{
        subject: '',
        message: '',
        weight: 100,
      }],

      delay_value: 72,
      delay_unit: DELAY_UNIT_TYPES.HOURS.value,
    },
  },
};

export const LINKEDIN_ACTION_DETAILS = {
  [WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE]: {
    subTitle: 'Automated LinkedIn Profile Visit',
    description: 'Automatically visit the prospect\'s LinkedIn profile.',
  },

  [WORKFLOW_STEP_TYPES.LINKEDIN_CONNECTION_REQUEST]: {
    subTitle: 'Write LinkedIn Connection Request Message',
    description: 'Personalize the connection request with a message. Leave it empty to send the request without one.',
    isOptional: true,

    supportsMessage: true,

    limits: {
      body: 200,
    },
  },

  [WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE]: {
    subTitle: 'Write LinkedIn Message',
    description: 'Compose a personalized message to send to an existing LinkedIn connection.',

    supportsMessage: true,
    supportsAttachments: true,

    limits: {
      body: 8000,
    },
  },

  [WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL]: {
    subTitle: 'Write LinkedIn InMail',
    description: `Compose a personalized InMail to send directly to the prospect.
    This step requires a LinkedIn account with InMail access
    (such as Sales Navigator or Premium).`,

    supportsMessage: true,
    supportsSubject: true,

    limits: {
      subject: 200,
      body: 2000,
    },
  },

  [WORKFLOW_STEP_TYPES.LINKEDIN_LIKE_POST]: {
    subTitle: 'Automated LinkedIn Post Like',
    description: 'Automatically like the prospect\'s most recent LinkedIn post.',
  },

  [WORKFLOW_STEP_TYPES.LINKEDIN_FOLLOW_PROFILE]: {
    subTitle: 'Automated LinkedIn Profile Follow',
    description: 'Automatically follow the prospect on LinkedIn.',
  },
};

export const LINKEDIN_WORKFLOW_STEP_CATALOG = {
  [WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE]: {
    stepType: WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE,
    category: WORKFLOW_STEP_CATEGORIES.LINKEDIN,
    title: 'Visit Profile',
    description: 'Visit the prospect\'s LinkedIn profile',
    theme: 'primary',
    icon: 'show',

    jsonSchema: {
      delay_value: 72,
      delay_unit: DELAY_UNIT_TYPES.HOURS.value,
    },
  },

  [WORKFLOW_STEP_TYPES.LINKEDIN_CONNECTION_REQUEST]: {
    stepType: WORKFLOW_STEP_TYPES.LINKEDIN_CONNECTION_REQUEST,
    category: WORKFLOW_STEP_CATEGORIES.LINKEDIN,
    title: 'Connection Request',
    description: 'Send a LinkedIn connection request',
    theme: 'primary',
    icon: 'people',

    jsonSchema: {
      delay_value: 3,
      delay_unit: DELAY_UNIT_TYPES.HOURS.value,
    },
  },

  [WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE]: {
    stepType: WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE,
    category: WORKFLOW_STEP_CATEGORIES.LINKEDIN,
    title: 'LinkedIn Message',
    description: 'Send a LinkedIn message',
    theme: 'primary',
    icon: 'chat',

    jsonSchema: {
      variants: [{
        message: '',
        weight: 100,
      }],

      delay_value: 3,
      delay_unit: DELAY_UNIT_TYPES.HOURS.value,
    },
  },

  [WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL]: {
    stepType: WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL,
    category: WORKFLOW_STEP_CATEGORIES.LINKEDIN,
    title: 'InMail',
    description: 'Send a LinkedIn InMail',
    theme: 'primary',
    icon: 'send',

    jsonSchema: {
      variants: [{
        message: '',
        subject: '',
        weight: 100,
      }],

      delay_value: 72,
      delay_unit: DELAY_UNIT_TYPES.HOURS.value,
    },
  },

  [WORKFLOW_STEP_TYPES.LINKEDIN_LIKE_POST]: {
    stepType: WORKFLOW_STEP_TYPES.LINKEDIN_LIKE_POST,
    category: WORKFLOW_STEP_CATEGORIES.LINKEDIN,
    title: 'Like Latest Post',
    description: 'Like the prospect\'s latest LinkedIn post',
    theme: 'primary',
    icon: 'heart',

    jsonSchema: {
      delay_value: 3,
      delay_unit: DELAY_UNIT_TYPES.HOURS.value,
    },
  },
  [WORKFLOW_STEP_TYPES.LINKEDIN_FOLLOW_PROFILE]: {
    stepType: WORKFLOW_STEP_TYPES.LINKEDIN_FOLLOW_PROFILE,
    category: WORKFLOW_STEP_CATEGORIES.LINKEDIN,
    title: 'Follow Profile',
    description: 'Follow the prospect on LinkedIn',
    theme: 'primary',
    icon: 'profile',

    jsonSchema: {
      delay_value: 3,
      delay_unit: DELAY_UNIT_TYPES.HOURS.value,
    },
  },
};

export const WORKFLOW_STEP_CATALOG = {
  ...EMAIL_WORKFLOW_STEP_CATALOG,

  ...LINKEDIN_WORKFLOW_STEP_CATALOG,
};

export const WORKFLOW_CONDITION_TYPES = {
  LINKEDIN_CONNECTION_ACCEPTED: 'LINKEDIN_CONNECTION_ACCEPTED',
};

export const WORKFLOW_BRANCH_KEYS = {
  ACCEPTED: 'ACCEPTED',
  NOT_ACCEPTED: 'NOT_ACCEPTED',
};

export const WORKFLOW_BRANCH_CATALOG = {
  [WORKFLOW_BRANCH_KEYS.ACCEPTED]: {
    label: 'Accepted',
    value: WORKFLOW_BRANCH_KEYS.ACCEPTED,
  },
  [WORKFLOW_BRANCH_KEYS.NOT_ACCEPTED]: {
    label: 'Not Accepted',
    value: WORKFLOW_BRANCH_KEYS.NOT_ACCEPTED,
  },
};

export const WORKFLOW_CONDITION_CATALOG = {
  [WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED]: {
    stepType: WORKFLOW_STEP_TYPES.CONDITION,

    title: 'Connection Accepted',
    description: 'Check if the LinkedIn connection request was accepted',
    theme: 'primary',

    category: WORKFLOW_STEP_CATEGORIES.LINKEDIN,

    jsonSchema: {
      condition_type: WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED,

      // timeout
      timeout_value: 72,
      timeout_unit: DELAY_UNIT_TYPES.HOURS.value,

      // branches
      branches: [
        {
          branch_key: WORKFLOW_BRANCH_KEYS.ACCEPTED,
          steps: [],
        },
        {
          branch_key: WORKFLOW_BRANCH_KEYS.NOT_ACCEPTED,
          steps: [],
        },
      ],
    },
  },
};

export const LINKEDIN_WORKFLOW_CONDITION_OPTIONS = [
  {
    category: WORKFLOW_STEP_CATEGORIES.LINKEDIN,
    value: WORKFLOW_CONDITION_TYPES.LINKEDIN_CONNECTION_ACCEPTED,
    label: 'When the lead accepts your LinkedIn connection request',
  },
];

export const EMAIL_METRICS = {
  REPLY_RATE: {
    label: 'Reply Rate',
    value: 'REPLY_RATE',
  },
};

export const IMPORT_PREFERENCES_DEFAULTS = {
  allow_blocklist_contacts: false,
  include_unsubscribed_contacts: false,
  skip_contact_already_in_other_sequence: true,
};

export const STOP_CONTACT_WHEN = {
  ON_REPLY: {
    label: 'Lead Replies',
    value: 'ON_REPLY',
  },
  ON_CLICK: {
    label: 'Lead Clicks Link',
    value: 'ON_CLICK',
  },
  ON_OPEN: {
    label: 'Lead Opens Email',
    value: 'ON_OPEN',
  },
};

export const VARIANT_SPINTAX_DISTRIBUTION = {
  RANDOM: {
    label: 'Randomized',
    value: 'RANDOM',
    description: 'Randomly select a variant for each lead.',
  },
  PATTERN: {
    label: 'Pattern-Based',
    value: 'PATTERN',
    description: 'Variants are sent in a round-robin pattern.',
  },
};

export const SENDING_VOLUME_OPTIONS = {
  FOLLOW_UPS_FIRST: {
    label: 'Follow-ups First',
    value: 100,
    description: 'Clear follow-up backlogs first.',
  },
  BALANCED: {
    label: 'Balanced',
    value: 50,
    description: 'Equal weights to follow-up and new sends.',
  },
  NEW_LEADS_FIRST: {
    label: 'New Leads First',
    value: 0,
    description: 'Prioritize new leads first, then continue with follow-ups.',
  },
};

export const DEFAULT_CAMPAIGN_SETTINGS = {
  // sending schedule configuration
  new_contacts_per_day: 1000,
  sending_schedule_id: null,
  scheduled_date: null,

  // sequence configuration
  stop_contact_when: STOP_CONTACT_WHEN.ON_REPLY.value,
  variant_spintax_distribution: VARIANT_SPINTAX_DISTRIBUTION.RANDOM.value,
  stop_contact_on_company_level_reply: true,
  follow_up_percent: 100,

  // smart AI categorization configuration
  ai_categorisation: true,
  categories: {
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
  },
  ignore_ooo_category_reply: false,
  delay_reactivation_ooo_contact: null,

  // deliverability configuration
  send_plain_text: true,
  match_esp_contact: true,
  block_previously_bounced_contact: true,

  // risk management configuration
  pause_campaign_when_bounce_rate_at: 5,
  include_unsubscribe_message: false,
};

export const CONNECTED_ACCOUNT_STATUS = {
  ACTIVE: {
    label: 'Connected',
    value: 'ACTIVE',
    color: 'positive',
  },

  CREDENTIALS: {
    label: 'Reconnect Required',
    value: 'CREDENTIALS',
    color: 'warning',
    canReconnect: true,
  },

  ERROR: {
    label: 'Error',
    value: 'ERROR',
    color: 'negative',
  },

  STOPPED: {
    label: 'Stopped',
    value: 'STOPPED',
    color: 'warning',
  },

  INITIALIZING: {
    label: 'Initializing',
    value: 'INITIALIZING',
    color: 'primary',
  },

  DELETED: {
    label: 'Deleted',
    value: 'DELETED',
    color: 'negative',
  },
};

export const WEBHOOK_EVENT_TYPE = {
  'email.reply': {
    label: 'Email Reply',
    value: 'email.reply',
  },
  'linkedin.connection_accepted': {
    label: 'LinkedIn Connection Accepted',
    value: 'linkedin.connection_accepted',
  },
  'linkedin.reply': {
    label: 'LinkedIn Reply',
    value: 'linkedin.reply',
  },
  'email.reply_sent': {
    label: 'Email Reply Sent',
    value: 'email.reply_sent',
  },
  'email.sent': {
    label: 'Email Sent',
    value: 'email.sent',
  },
  'email.opened': {
    label: 'Email Opened',
    value: 'email.opened',
  },
  'email.link_clicked': {
    label: 'Email Link Clicked',
    value: 'email.link_clicked',
  },
  'email.bounced': {
    label: 'Email Bounced',
    value: 'email.bounced',
  },
  'email.unsubscribed': {
    label: 'Email Unsubscribed',
    value: 'email.unsubscribed',
  },
  'campaign.status_changed': {
    label: 'Campaign Status Changed',
    value: 'campaign.status_changed',
  },
  'linkedin.connection_sent': {
    label: 'LinkedIn Connection Sent',
    value: 'linkedin.connection_sent',
  },
  'linkedin.message_sent': {
    label: 'LinkedIn Message Sent',
    value: 'linkedin.message_sent',
  },
  'linkedin.inmail_sent': {
    label: 'LinkedIn InMail Sent',
    value: 'linkedin.inmail_sent',
  },
};

export const WEBHOOK_TYPES = {
  HTTP: 'Http',
  SLACK: 'Slack',
};

export const REPLY_SENTIMENT = {
  Positive: {
    label: 'Positive',
    value: 'Positive',
    color: 'positive',
  },
  Negative: {
    label: 'Negative',
    value: 'Negative',
    color: 'negative',
  },
  Neutral: {
    label: 'Neutral',
    value: 'Neutral',
    color: 'warning',
  },
};

export const CONTACT_ESP_PROVIDERS = {
  GMAIL: {
    label: 'Gmail',
    value: 'GMAIL',
  },
  OUTLOOK: {
    label: 'Outlook',
    value: 'OUTLOOK',
  },
  ZOHO: {
    label: 'Zoho',
    value: 'ZOHO',
  },
  YAHOO: {
    label: 'Yahoo',
    value: 'YAHOO',
  },
  OTHERS: {
    label: 'Others',
    value: 'OTHERS',
  },
};

export const MAX_AI_CATEGORIES_ALLOWED = 15;
