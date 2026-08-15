export const WARMUP_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PAUSED: 'PAUSED',
};

export const FILTER_WARMUP_STATUS = {
  ACTIVE: {
    label: 'Active',
    value: WARMUP_STATUS.ACTIVE,
  },
  INACTIVE: {
    label: 'Inactive',
    value: WARMUP_STATUS.INACTIVE,
  },
};

export const WARMUP_SENDING_SCHEDULE = {
  ONLY_WEEKDAYS: 'ONLY_WEEKDAYS',
  INCLUDE_WEEKENDS: 'INCLUDE_WEEKENDS',
};

export const WARMUP_SENDING_SCHEDULE_LABLES = {
  ONLY_WEEKDAYS: {
    recommended: true,
    label: 'Only Weekdays',
    description: 'Sends Monday to Friday to match business patterns.',
  },
  INCLUDE_WEEKENDS: {
    label: 'Including Weekends',
    description: 'Sends daily, including weekends, for steady volume.',
  },
};

export const MIN_WARMUP_DAYS = 14;

export const WARMUP_STATUS_CONTENT = {
  ACTIVE: {
    value: 'ACTIVE',
    title: 'Warm-up is Active',
    badge: 'Healthy',

    description: 'Your mailbox reputation is improving with strong engagement signals.',
  },

  IN_PROGRESS: {
    value: 'IN_PROGRESS',
    title: 'Warm-up in Progress',
    badge: 'Building Reputation',

    description: 'Your mailbox is gradually building sender trust and inbox placement.',
  },

  AT_RISK: {
    value: 'AT_RISK',
    title: 'Mailbox Health at Risk',
    badge: 'Attention Needed',

    description: 'Spam placement or bounce activity is affecting sender reputation.',
  },

  STOPPED: {
    value: 'STOPPED',
    title: 'Warm-up Stopped',
    badge: 'Inactive',

    description:
          'Warm-up is currently disabled for this mailbox.',
  },
};
