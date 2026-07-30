// utils
import {
  getApiCall, deleteApiCall, postApiCall, putApiCall,
} from 'src/utils/apiRequests';

export const getAllIntegrationsByType = async (integrationType) => {
  try {
    const integrations = await getApiCall({
      endpoint: 'integrations/fetch-all',
      params: {
        integration_type: integrationType,
      },
    });

    return integrations;
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteIntegrationById = async (integrationId) => {
  try {
    const response = await deleteApiCall({
      endpoint: `integrations/${integrationId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const createNewIntegration = async (payload) => {
  try {
    const response = await postApiCall({
      endpoint: 'integrations/create',
      payload,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateIntegrationById = async ({ integrationId, payload }) => {
  try {
    const response = await putApiCall({
      endpoint: `integrations/${integrationId}`,
      payload,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchIntegrationsCount = async () => {
  try {
    const response = await getApiCall({
      endpoint: 'integrations/fetch-count',
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const pushMailboxesToIntegration = async (payload) => {
  try {
    const response = await postApiCall({
      endpoint: 'mailboxes/push-to-integration',
      payload,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchActivityById = async (activityId) => {
  try {
    const response = await getApiCall({
      endpoint: `activity-logs/fetch/${activityId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};
