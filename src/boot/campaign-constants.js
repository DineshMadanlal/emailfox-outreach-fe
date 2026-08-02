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
  { label: 'First Name', value: 'sender_firstname' },
  { label: 'Last Name', value: 'sender_lastname' },
  { label: 'Email', value: 'sender_email' },
  { label: 'Signature', value: 'sender_signature' },
];

export const PRODUCT_VARIABLES_VALUES = [...DEFAULT_SYSTEM_FIELDS,
  ...SENDER_VARIABLES].flatMap((field) => field.value);

export const CONTEXT_VARIABLES = [
  // Time of day
  {
    label: 'Time of Day',
    value: 'time_of_day',
    example: 'morning',
  },
  {
    label: 'Time of Day (Capitalized)',
    value: 'time_of_day_capitalized',
    example: 'Morning',
  },

  // Day of week
  {
    label: 'Day of Week',
    value: 'day_of_week',
    example: 'monday',
  },
  {
    label: 'Day of Week (Capitalized)',
    value: 'day_of_week_capitalized',
    example: 'Monday',
  },

  // Month
  {
    label: 'Month',
    value: 'month',
    example: 'january',
  },
  {
    label: 'Month (Capitalized)',
    value: 'month_capitalized',
    example: 'January',
  },

  // Year (useful for planning / context)
  {
    label: 'Year',
    value: 'year',
    example: '2026',
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

  // [WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL]: {
  //   subTitle: 'Write LinkedIn InMail',
  //   description: `Compose a personalized InMail to send directly to the prospect.
  //   This step requires a LinkedIn account with InMail access
  //   (such as Sales Navigator or Premium).`,

  //   supportsMessage: true,
  //   supportsSubject: true,

  //   limits: {
  //     subject: 200,
  //     body: 2000,
  //   },
  // },

  [WORKFLOW_STEP_TYPES.LINKEDIN_LIKE_POST]: {
    subTitle: 'Automated LinkedIn Post Like',
    description: 'Automatically like the prospect\'s most recent LinkedIn post.',
  },

  // [WORKFLOW_STEP_TYPES.LINKEDIN_FOLLOW_PROFILE]: {
  //   subTitle: 'Automated LinkedIn Profile Follow',
  //   description: 'Automatically follow the prospect on LinkedIn.',
  // },
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
