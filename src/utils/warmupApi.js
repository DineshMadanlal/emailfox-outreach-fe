// utils
import {
  getApiCall, postApiCall, putApiCall, deleteApiCall,
} from 'src/utils/apiRequests';

// constants
import { MIN_WARMUP_DAYS } from 'boot/warmup-constants';

export const fetchWarmupProfiles = async ({ apiEndPoint, apiParams }) => {
  try {
    const warmupProfiles = await getApiCall({
      includeWorkspace: true,
      endpoint: apiEndPoint,
      params: apiParams,
    });

    return warmupProfiles;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchWarmupProfileById = async (profileId) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/warmup/profiles/${profileId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const createWarmupProfile = async (profileData) => {
  try {
    const response = await postApiCall({
      includeWorkspace: true,
      endpoint: '/warmup/profiles',
      payload: profileData,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateWarmupProfile = async (profileId, profileData) => {
  try {
    const response = await putApiCall({
      includeWorkspace: true,
      endpoint: `/warmup/profiles/${profileId}`,
      payload: profileData,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteWarmupProfile = async (profileId) => {
  try {
    const response = await deleteApiCall({
      includeWorkspace: true,
      endpoint: `/warmup/profiles/${profileId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateSingleMailboxWarmupProfile = async (profileData) => {
  try {
    const response = await postApiCall({
      includeWorkspace: true,
      endpoint: '/warmup',
      payload: profileData,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const bulkUpdateMailboxesWarmupProfiles = async (profilesData) => {
  try {
    const response = await postApiCall({
      includeWorkspace: true,
      endpoint: '/warmup/bulk-update',
      payload: profilesData,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const getMailboxWarmupDetails = async ({ mailboxId }) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/warmup/${mailboxId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// warmup stats api by mailbox
export const getMailboxWarmupStats = async ({ mailboxId }) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/warmup/${mailboxId}/stats`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const getMailboxWarmupDailyStats = async ({ mailboxId }) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/warmup/${mailboxId}/daily-stats`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const getMailboxWarmupHealthMetrics = async ({ mailboxId }) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/warmup/${mailboxId}/email-health`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const getMailboxWarmupEspBreakdown = async ({ mailboxId }) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/warmup/${mailboxId}/esp-breakdown`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// This is for UI and not backend API call
// This is used in the mailboxes table to show the warmup status
// of each mailbox based on the warmupStartedAt date
export const getWarmupStatus = (warmupStartedAt) => {
  if (!warmupStartedAt) {
    return {
      completed: false,
      days: 0,
      daysLeft: MIN_WARMUP_DAYS,
      label: `0 / ${MIN_WARMUP_DAYS}`,
    };
  }

  const startDate = new Date(warmupStartedAt);
  const today = new Date();

  const daysElapsed = Math.max(
    0,
    Math.floor((today - startDate) / (1000 * 60 * 60 * 24)),
  );

  const days = Math.min(daysElapsed, MIN_WARMUP_DAYS);
  const completed = daysElapsed >= MIN_WARMUP_DAYS;

  return {
    completed,
    days,
    daysLeft: Math.max(0, MIN_WARMUP_DAYS - daysElapsed),
    label: completed
      ? '✓ Warmed Up'
      : `${days} / ${MIN_WARMUP_DAYS} left`,
  };
};
