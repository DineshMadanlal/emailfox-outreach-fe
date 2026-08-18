// utils
import {
  getApiCall, postApiCall, putApiCall, patchApiCall,
} from 'src/utils/apiRequests';

// constants
import {
  SCHEDULE_DAYS_SHORT_LABEL, TIMEZONES_LIST, DELAY_UNIT_TYPES,
} from 'boot/campaign-constants';

// update schedule by ID
export const updateScheduleById = async ({
  id, payload,
}) => {
  try {
    const response = await putApiCall({
      includeWorkspace: true,
      endpoint: `/sending-schedules/${id}`,
      payload,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// check DNS
export const createSchedule = async (payload) => {
  try {
    const response = await postApiCall({
      includeWorkspace: true,
      endpoint: '/sending-schedules',
      payload,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const getTimezoneJson = (timezone) => {
  const found = TIMEZONES_LIST.find(
    (tz) => tz.value === timezone,
  );

  return found;
};

export const getSendingDaysLabel = (windows) => {
  if (!windows?.length) {
    return '';
  }

  const days = [...new Set(
    windows.map((window) => window.day_of_week),
  )]
    .sort((a, b) => a - b);

  return days
    .map((day) => SCHEDULE_DAYS_SHORT_LABEL[day])
    .join(', ');
};

export const getDelayState = ({ unit, value }) => {
  // hours
  if (unit === DELAY_UNIT_TYPES.HOURS.value) {
    // check if hours exceeds 24 and convert to days
    if (value > 0 && value % 24 === 0) {
      return {
        delayUnit: DELAY_UNIT_TYPES.DAYS.value,
        delayValue: value / 24,
      };
    }

    return {
      delayUnit: DELAY_UNIT_TYPES.HOURS.value,
      delayValue: value,
    };
  }

  // days
  return {
    delayUnit: DELAY_UNIT_TYPES.DAYS.value,
    delayValue: value,
  };
};

export const pauseCampaignById = async ({
  campaignId, $toast,
}) => {
  try {
    // API Call
    await patchApiCall({
      includeWorkspace: true,
      endpoint: `/sequences/${campaignId}/pause`,
    });

    return true;
  } catch (error) {
    // show toast
    $toast({
      warning: true,
      message: error.message,
    });

    return false;
  }
};

export const saveCampaignSettingsById = async ({
  campaignId, payload, $toast,
}) => {
  try {
    // API Call
    const response = await putApiCall({
      includeWorkspace: true,
      endpoint: `/sequences/${campaignId}/settings`,
      payload,
    });

    return response;
  } catch (error) {
    // show toast
    $toast({
      warning: true,
      message: error.message,
    });

    return false;
  }
};

export const cloneCampaignById = async ({
  campaignId, $toast,
}) => {
  try {
    // API Call
    const response = await postApiCall({
      includeWorkspace: true,
      endpoint: `/sequences/${campaignId}/clone`,
    });

    return response;
  } catch (error) {
    // show toast
    $toast({
      warning: true,
      message: error.message,
    });

    return false;
  }
};

export const startCampaignById = async ({
  campaignId, $toast,
}) => {
  try {
    // API Call
    const response = await postApiCall({
      includeWorkspace: true,
      endpoint: `/sequences/${campaignId}/start`,
    });

    return response;
  } catch (error) {
    // show toast
    $toast({
      warning: true,
      message: error.message,
    });

    return false;
  }
};

// 1. List multiple sequence stats
// GET /api/workspace/{workspace_id}/stats/sequences/list-stats
export const getSequenceListStats = async () => getApiCall({
  includeWorkspace: true,
  endpoint: '/stats/sequences/list-stats',
});

// 2. Get overall sequence stats
// GET /api/workspace/{workspace_id}/stats/sequences/{seq_id}/overall-stats
export const getSequenceOverallStats = async (campaignId) => getApiCall({
  includeWorkspace: true,
  endpoint: `/stats/sequences/${campaignId}/overall-stats`,
});

// 3. Get date-wise sequence stats
// GET /api/workspace/{workspace_id}/stats/sequences/{seq_id}/date-stats
export const getSequenceDateStats = async (campaignId, params) => getApiCall({
  includeWorkspace: true,
  endpoint: `/stats/sequences/${campaignId}/date-stats`,
  params,
});

// 4. Get sequence ESP stats
// GET /api/workspace/{workspace_id}/stats/sequences/{seq_id}/esp-stats
export const getSequenceEspStats = async (campaignId) => getApiCall({
  includeWorkspace: true,
  endpoint: `/stats/sequences/${campaignId}/esp-stats`,
});

// 5. Get sequence step stats
// GET /api/workspace/{workspace_id}/stats/sequences/{seq_id}/step-stats
export const getSequenceStepStats = async (campaignId) => getApiCall({
  includeWorkspace: true,
  endpoint: `/stats/sequences/${campaignId}/step-stats`,
});

// 6. Get step variant stats
// GET /api/workspace/{workspace_id}/stats/sequences/{seq_id}/step-stats/{step_id}/variant-stats
export const getStepVariantStats = async (campaignId, stepId) => getApiCall({
  includeWorkspace: true,
  endpoint: `/stats/sequences/${campaignId}/step-stats/${stepId}/variant-stats`,
});

// 7. Get sequence mailbox stats
// GET /api/workspace/{workspace_id}/stats/sequences/{seq_id}/mailbox-stats
export const getSequenceMailboxStats = async (campaignId) => getApiCall({
  includeWorkspace: true,
  endpoint: `/stats/sequences/${campaignId}/mailbox-stats`,
});

// 8. Get sequence LinkedIn stats
// GET /api/workspace/{workspace_id}/stats/sequences/{seq_id}/linkedin-stats
export const getSequenceLinkedinStats = async (campaignId) => getApiCall({
  includeWorkspace: true,
  endpoint: `/stats/sequences/${campaignId}/linkedin-stats`,
});
