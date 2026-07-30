// utils
import {
  postApiCall, putApiCall,
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
