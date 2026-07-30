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

export const WARMUP_RESPONSE = {
  warmup_growth_timeline: [
    {
      date: '2026-05-19',
      sent: 8,
      received: 3,
    },
    {
      date: '2026-05-20',
      sent: 14,
      received: 6,
    },
    {
      date: '2026-05-21',
      sent: 22,
      received: 11,
    },
    {
      date: '2026-05-22',
      sent: 30,
      received: 15,
    },
    {
      date: '2026-05-23',
      sent: 38,
      received: 19,
    },
    {
      date: '2026-05-24',
      sent: 45,
      received: 24,
    },
    {
      date: '2026-05-25',
      sent: 52,
      received: 28,
    },
    {
      date: '2026-05-26',
      sent: 60,
      received: 34,
    },
    {
      date: '2026-05-27',
      sent: 68,
      received: 40,
    },
    {
      date: '2026-05-28',
      sent: 75,
      received: 46,
    },
    {
      date: '2026-05-29',
      sent: 82,
      received: 51,
    },
    {
      date: '2026-05-30',
      sent: 90,
      received: 58,
    },
    {
      date: '2026-05-31',
      sent: 96,
      received: 63,
    },
    {
      date: '2026-06-01',
      sent: 104,
      received: 70,
    },
  ],

  inbox_vs_spam_placement_timeline: [
    {
      date: '2026-05-19',
      inbox: 82,
      spam: 18,
    },
    {
      date: '2026-05-20',
      inbox: 84,
      spam: 16,
    },
    {
      date: '2026-05-21',
      inbox: 86,
      spam: 14,
    },
    {
      date: '2026-05-22',
      inbox: 88,
      spam: 12,
    },
    {
      date: '2026-05-23',
      inbox: 89,
      spam: 11,
    },
    {
      date: '2026-05-24',
      inbox: 90,
      spam: 10,
    },
    {
      date: '2026-05-25',
      inbox: 91,
      spam: 9,
    },
    {
      date: '2026-05-26',
      inbox: 92,
      spam: 8,
    },
    {
      date: '2026-05-27',
      inbox: 93,
      spam: 7,
    },
    {
      date: '2026-05-28',
      inbox: 94,
      spam: 6,
    },
    {
      date: '2026-05-29',
      inbox: 95,
      spam: 5,
    },
    {
      date: '2026-05-30',
      inbox: 96,
      spam: 4,
    },
    {
      date: '2026-05-31',
      inbox: 97,
      spam: 3,
    },
    {
      date: '2026-06-01',
      inbox: 98,
      spam: 2,
    },
  ],
};

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
