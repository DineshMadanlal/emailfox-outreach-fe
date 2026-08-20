// utils
import {
  getApiCall, postApiCall, putApiCall, deleteApiCall,
} from 'src/utils/apiRequests';
import { formatDate1 } from 'src/utils/dates';

// Helper to center the popup window on screen
const openOAuthPopup = (url, title = 'Connect Account', w = 600, h = 700) => {
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : window.screen.width;
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : window.screen.height;

  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft;
  const top = (height - h) / 2 / systemZoom + dualScreenTop;

  const popup = window.open(
    url,
    title,
    `scrollbars=yes,width=${w / systemZoom},height=${h / systemZoom},top=${top},left=${left}`,
  );

  if (window.focus && popup) popup.focus();
  return popup;
};

// Return a promise that resolves when postMessage signals success or rejects on close/error
// Return a promise that resolves when postMessage signals success or rejects on close/error
const handleOAuthFlow = async (authUrl) => new Promise((resolve, reject) => {
  const popup = openOAuthPopup(authUrl);

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    reject(new Error('Popup blocked. Please allow popups for this site.'));
    return;
  }

  let checkClosedInterval = null;

  const messageHandler = (event) => {
    if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
      if (checkClosedInterval) clearInterval(checkClosedInterval);
      window.removeEventListener('message', messageHandler);
      // 🔥 Force browser focus back to your main window / iframe!
      if (window.top && window.top.focus) {
        window.top.focus();
      } else if (window.focus) {
        window.focus();
      }
      if (popup && !popup.closed) popup.close();
      resolve(event.data.payload);
    } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
      if (checkClosedInterval) clearInterval(checkClosedInterval);
      window.removeEventListener('message', messageHandler);
      if (window.top && window.top.focus) {
        window.top.focus();
      }
      if (popup && !popup.closed) popup.close();
      reject(new Error(event.data.error || 'Authentication failed'));
    }
  };

  // 1. Listen for postMessage from popup
  window.addEventListener('message', messageHandler);

  // 2. Poll every 500ms to detect if user manually closes popup tab
  checkClosedInterval = setInterval(() => {
    if (popup.closed) {
      if (checkClosedInterval) clearInterval(checkClosedInterval);
      window.removeEventListener('message', messageHandler);
      reject(new Error('Authentication window closed. Please try again.'));
    }
  }, 500);
});

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
      endpoint: `/mailboxes/connect/outlook?redirect_uri=${redirectUrl}&return_auth_url=${true}`,
    });

    return await handleOAuthFlow(response.auth_url);
  } catch (error) {
    throw new Error(error);
  }
};

export const connectNewLinkedInAccount = async (redirectUrl) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/connected-accounts/linkedin/connect?redirect_uri=${redirectUrl}`,
    });

    return await handleOAuthFlow(response.auth_url);
  } catch (error) {
    throw new Error(error);
  }
};

export const reconnectLinkedInAccount = async ({ linkedInId, redirectUrl }) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/connected-accounts/linkedin/${linkedInId}/reconnect?redirect_uri=${redirectUrl}`,
    });

    return await handleOAuthFlow(response.auth_url);
  } catch (error) {
    throw new Error(error);
  }
};

export const connectGoogleAccount = async (redirectUrl) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/mailboxes/connect/gmail?redirect_uri=${redirectUrl}&return_auth_url=${true}`,
    });

    return await handleOAuthFlow(response.auth_url);
  } catch (error) {
    throw new Error(error);
  }
};

export const connectSmtpAccount = async (payload) => {
  try {
    const response = await postApiCall({
      includeWorkspace: true,
      endpoint: '/mailboxes/connect/smtp',
      payload,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// POST /mailboxes/connect/smtp/bulk
// payload: { mailboxes: [ { name, email, smtp_host, ... } ] }
// Returns: { id: jobId, ... }
export const connectSmtpBulkImport = async (payload) => {
  try {
    const response = await postApiCall({
      includeWorkspace: true,
      endpoint: '/mailboxes/connect/smtp/bulk',
      payload,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// GET /mailboxes/bulk-import-jobs/{id}
// Returns job status + progress stats
export const getSmtpBulkImportJob = async (jobId) => {
  try {
    const response = await getApiCall({
      includeWorkspace: true,
      endpoint: `/mailboxes/bulk-import-jobs/${jobId}`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
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
