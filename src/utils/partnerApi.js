// utils
import {
  getApiCall, putApiCall,
} from 'src/utils/apiRequests';

export const getPartnerBranding = async () => {
  try {
    const response = await getApiCall({
      endpoint: 'partners/branding',
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const updatePartnerBranding = async (payload) => {
  try {
    const response = await putApiCall({
      endpoint: 'partners/branding',
      payload,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};
