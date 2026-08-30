/**
 * Unibox API Utilities
 * Centralized service functions for fetching Unibox threads, messages, and filter data
 */

// utils
import { getApiCall } from 'src/utils/apiRequests';

// constants
import { UNIBOX_THREAD_TYPE } from 'boot/unibox-constants';

/**
 * Maps thread type to the corresponding backend Unibox endpoint path
 * @param {string} threadType - Thread type from UNIBOX_THREAD_TYPE
 * @returns {string} Endpoint path
 */
export const getUniboxEndpointByThreadType = (threadType) => {
  switch (threadType) {
    case UNIBOX_THREAD_TYPE.UNTRACKED_REPLIES:
      return '/unibox/untracked';

    case UNIBOX_THREAD_TYPE.IMPORTANT:
      return '/unibox/important';

    case UNIBOX_THREAD_TYPE.BOUNCED:
      return '/unibox/bounced';

    case UNIBOX_THREAD_TYPE.INBOX:
    default:
      return '/unibox/inbox';
  }
};

/**
 * Sanitizes and cleans filter parameters before making the API request
 * @param {Object} rawParams - Raw query parameters from component state
 * @returns {Object} Cleaned parameter object
 */
export const sanitizeUniboxQueryParams = (rawParams = {}) => {
  const cleaned = {};

  // Pagination parameters
  if (typeof rawParams.offset === 'number') {
    cleaned.offset = rawParams.offset;
  }
  if (typeof rawParams.limit === 'number') {
    cleaned.limit = rawParams.limit;
  }

  // Search text filter
  if (rawParams.search_text && rawParams.search_text.trim()) {
    cleaned.search_text = rawParams.search_text.trim();
  }

  // Domain filter
  if (rawParams.domain && rawParams.domain.trim()) {
    cleaned.domain = rawParams.domain.trim();
  }

  // Mailbox sender filter
  if (rawParams.mailbox && rawParams.mailbox.trim()) {
    cleaned.mailbox = rawParams.mailbox.trim();
  }

  // Sequence / Campaign filter
  if (rawParams.seq_id) {
    cleaned.seq_id = rawParams.seq_id;
  }

  // AI Reply Category filter
  if (rawParams.reply_category_id) {
    cleaned.reply_category_id = rawParams.reply_category_id;
  }

  // Outreach Channel filter (EMAIL, LINKEDIN, MULTI_CHANNEL)
  if (rawParams.channel) {
    cleaned.channel = rawParams.channel;
  }

  return cleaned;
};

/**
 * Fetches the list of email threads for a given Unibox tab with pagination and filters
 * @param {Object} options
 * @param {string} options.threadType - Thread category (INBOX, UNTRACKED_REPLIES, etc.)
 * @param {Object} options.params - Query parameters including offset, limit, and filters
 * @returns {Promise<Object>} API response with { count, offset, limit, has_next, has_prev, data }
 */
export const fetchUniboxThreadList = async ({
  threadType = UNIBOX_THREAD_TYPE.INBOX,
  params = {},
}) => {
  const endpoint = getUniboxEndpointByThreadType(threadType);
  const sanitizedParams = sanitizeUniboxQueryParams(params);

  return getApiCall({
    endpoint,
    params: sanitizedParams,
    includeWorkspace: true,
  });
};

/**
 * Fetches conversation messages and contact metadata for a specific contact mapping ID
 * @param {Object} options
 * @param {string} options.contactMappingId - UUID of the sequence contact mapping
 * @returns {Promise<Object>} Contact conversation details and messages array
 */
export const fetchUniboxConversationMessages = async ({ contactMappingId }) => {
  if (!contactMappingId) {
    throw new Error('Contact mapping ID is required to fetch conversation messages');
  }

  return getApiCall({
    endpoint: `/unibox/messages/${contactMappingId}`,
    includeWorkspace: true,
  });
};

/**
 * Fetches available campaigns/sequences for Unibox filter dropdown
 * @returns {Promise<Array>} List of campaigns
 */
export const fetchUniboxCampaigns = async () => {
  const response = await getApiCall({
    endpoint: '/sequences/fetch-all-basic-details',
    params: {
      limit: 100,
      offset: 0,
    },
    includeWorkspace: true,
  });

  return response?.data || response?.sequences_list || response || [];
};

/**
 * Fetches reply categories for Unibox filter dropdown
 * @returns {Promise<Array>} List of reply categories
 */
export const fetchUniboxReplyCategories = async () => {
  const response = await getApiCall({
    endpoint: '/reply-categories/',
    params: {
      limit: 100,
      offset: 0,
    },
    includeWorkspace: true,
  });

  return response?.data || response || [];
};
