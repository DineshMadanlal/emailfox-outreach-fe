import { getApiCall } from 'src/utils/apiRequests';

/**
 * GET /lists/{list_id}
 * Fetch details of a list by ID
 */
export const getListById = async (listId) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/lists/${listId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * GET /lists/{list_id}/import-jobs
 * Fetch list import jobs with pagination and optional search
 */
export const getListImportJobs = async (listId, params = {}) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/lists/${listId}/import-jobs`,
      params,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * GET /lists/{list_id}/import-jobs/{job_id}
 * Fetch a specific list import job by ID
 */
export const getListImportJobById = async (listId, jobId) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/lists/${listId}/import-jobs/${jobId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};
