// boot file
import { api } from 'boot/axios';

// Stores
import { useAuthStore } from 'stores/auth';

const getWorkspaceEndpoint = (endpoint, includeWorkspace = false) => {
  if (!includeWorkspace) {
    return endpoint;
  }

  const authStore = useAuthStore();
  const workspaceId = authStore.activeWorkspaceData?.id;

  if (!workspaceId) {
    return endpoint;
  }

  return `/workspace/${workspaceId}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

const handleErrorMessage = (error) => error.response?.data?.message || error?.data?.message || error?.data?.error || 'Unexpected Error Occurred';

export const postApiCall = async ({
  endpoint, payload, otherParams, includeWorkspace = false,
}) => {
  try {
    const url = getWorkspaceEndpoint(endpoint, includeWorkspace);

    let config = {
      url,
      method: 'post',
      data: payload,
    };

    if (otherParams) {
      config = { ...config, ...otherParams };
    }

    const response = await api(config);
    return response.data;
  } catch (error) {
    const errorMessage = handleErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const patchApiCall = async ({ endpoint, payload, includeWorkspace = false }) => {
  try {
    // url
    const url = getWorkspaceEndpoint(endpoint, includeWorkspace);

    const response = await api({
      url,
      method: 'patch',
      data: payload,
    });
    return response.data;
  } catch (error) {
    const errorMessage = handleErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const putApiCall = async ({ endpoint, payload, includeWorkspace = false }) => {
  try {
    // url
    const url = getWorkspaceEndpoint(endpoint, includeWorkspace);

    const response = await api({
      url,
      method: 'put',
      data: payload,
    });
    return response.data;
  } catch (error) {
    const errorMessage = handleErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const getApiCall = async ({ endpoint, params, includeWorkspace = false }) => {
  try {
    // url
    const url = getWorkspaceEndpoint(endpoint, includeWorkspace);

    const response = await api({
      url,
      method: 'get',
      params,
    });
    return response.data;
  } catch (error) {
    const errorMessage = handleErrorMessage(error);
    throw new Error(errorMessage);
  }
};

export const deleteApiCall = async ({ endpoint, payload, includeWorkspace = false }) => {
  try {
    // url
    const url = getWorkspaceEndpoint(endpoint, includeWorkspace);

    const response = await api({
      url,
      method: 'delete',
      data: payload,
    });
    return response.data;
  } catch (error) {
    const errorMessage = handleErrorMessage(error);
    throw new Error(errorMessage);
  }
};
