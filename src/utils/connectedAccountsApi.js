// utils
import {
  getApiCall, putApiCall, patchApiCall, deleteApiCall,
} from 'src/utils/apiRequests';

// LinkedIn Account APIs
export const getLinkedInAccountById = async (accountId) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/connected-accounts/linkedin/${accountId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchLinkedInOverallStats = async (accountId) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/stats/linkedin/${accountId}/overall-stats`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateLinkedInLimits = async ({ accountId, payload }) => {
  try {
    const response = await putApiCall({
      payload,
      includeWorkspace: true,
      endpoint: `/connected-accounts/linkedin/${accountId}/limits`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateLinkedInProxy = async ({ accountId, payload }) => {
  try {
    const response = await patchApiCall({
      payload,
      includeWorkspace: true,
      endpoint: `/connected-accounts/linkedin/${accountId}/proxy`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteLinkedInAccount = async (accountId) => {
  try {
    const response = await deleteApiCall({
      includeWorkspace: true,
      endpoint: `/connected-accounts/linkedin/${accountId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};
