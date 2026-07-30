// utils
import {
  getApiCall, postApiCall, putApiCall, deleteApiCall,
} from 'src/utils/apiRequests';
import { formatDate1 } from 'src/utils/dates';

// domain by ID
export const getDomainById = async (domainId) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/domains/${domainId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// mailbox by ID
export const getMailboxById = async (mailboxId) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/mailboxes/${mailboxId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// check DNS
export const checkDnsByDomainId = async (domainId) => {
  try {
    const response = await postApiCall({
      includeWorkspace: true,
      endpoint: `/domains/${domainId}/check-dns`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const connectOutlookAccount = async (redirectUrl) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/mailboxes/connect/outlook?redirect_uri=${redirectUrl}`,
    });

    window.location.href = response.auth_url;
  } catch (error) {
    throw new Error(error);
  }

  return true;
};

export const connectGoogleAccount = async (redirectUrl) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/mailboxes/connect/gmail?redirect_uri=${redirectUrl}`,
    });

    window.location.href = response.auth_url;
  } catch (error) {
    throw new Error(error);
  }

  return true;
};

export const bulkUpdateMailboxes = async (payload) => {
  try {
    const response = await putApiCall({
      includeWorkspace: true,
      endpoint: '/mailboxes/bulk-update',
      payload,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const bulkDeleteMailboxes = async (payload) => {
  try {
    const response = await deleteApiCall({
      includeWorkspace: true,
      endpoint: '/mailboxes/bulk-delete',
      payload,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchSequenceDateStats = async ({ endpoint, params }) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint,
      params,
    });

    const emailsSent = [];
    const replies = [];
    const hardBounced = [];
    const softBounced = [];
    const xAxisCategories = [];

    response.forEach((eachResult) => {
      emailsSent.push(eachResult.sent_count);
      replies.push(eachResult.received_count);
      hardBounced.push(eachResult.hard_bounce_count);
      softBounced.push(eachResult.bounce_count - eachResult.hard_bounce_count);

      // const date = new Date(eachResult.stat_date);

      // const options = { day: '2-digit', month: 'short' };
      // const formattedDate = date.toLocaleDateString('en-GB', options);

      xAxisCategories.push(formatDate1(eachResult.stat_date));
    });

    // update the value
    const dataSeries = [
      {
        name: 'Emails Sent',
        data: emailsSent,
      },
      {
        name: 'Replies',
        data: replies,
      },
      {
        name: 'Hard Bounced',
        data: hardBounced,
      },
      {
        name: 'Soft Bounced',
        data: softBounced,
      },
    ];

    return { dataSeries, xAxisCategories };
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchSequenceOverallStats = async ({ endpoint }) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint,
    });

    return response || {};
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchSequenceEspStats = async ({ endpoint }) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint,
    });

    return response || {};
  } catch (error) {
    throw new Error(error);
  }
};

export const getDnsAuthResultByDomainId = async (domainId) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/domains/${domainId}/dns-auth-result`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const getMailboxesOverallStatus = async () => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: '/mailboxes/overall-status',
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const getDomainsOverallStatus = async () => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: '/domains/overall-status',
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};
