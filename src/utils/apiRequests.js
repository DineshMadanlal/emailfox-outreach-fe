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

const throwApiError = (error) => {
  const errorMessage = handleErrorMessage(error);
  const customError = new Error(errorMessage);

  const status = error?.status || error?.response?.status;
  const responseObj = error?.response || (error?.status ? error : null);

  if (status) {
    customError.status = status;
  }
  if (responseObj) {
    customError.response = responseObj;
  }

  throw customError;
};

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
    return throwApiError(error);
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
    return throwApiError(error);
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
    return throwApiError(error);
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
    return throwApiError(error);
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
    return throwApiError(error);
  }
};
