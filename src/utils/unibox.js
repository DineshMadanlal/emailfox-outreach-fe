/**
 * Unibox API Utilities
 * Centralized service functions for fetching Unibox threads, messages, and filter data
 */

// utils
import { getApiCall, patchApiCall } from 'src/utils/apiRequests';

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

/**
 * Fetches parsed message details for an untracked email reply
 * @param {Object} options
 * @param {number|string} options.id - ID of the untracked email
 * @returns {Promise<Object>} Parsed email details
 */
export const fetchUniboxUntrackedParsedMessage = async ({ id }) => {
  if (!id) {
    throw new Error('Untracked email ID is required');
  }

  return getApiCall({
    endpoint: `/unibox/untracked/${id}/parsed`,
    includeWorkspace: true,
  });
};

/**
 * Updates the important / starred status of an inbox conversation
 * @param {Object} options
 * @param {string} options.contactMappingId - UUID of the contact mapping
 * @param {boolean} options.isImportant - Whether the conversation is marked important
 * @returns {Promise<Object>} API response
 */
export const updateUniboxThreadImportantStatus = async ({
  contactMappingId,
  isImportant = true,
}) => {
  if (!contactMappingId) {
    throw new Error('Contact mapping ID is required to update important status');
  }

  return patchApiCall({
    endpoint: `/unibox/inbox/${contactMappingId}/important`,
    payload: {
      is_important: isImportant,
    },
    includeWorkspace: true,
  });
};

/**
 * Updates the read status of an inbox conversation
 * @param {Object} options
 * @param {string} options.contactMappingId - UUID of the contact mapping
 * @param {boolean} options.isRead - Whether the conversation is marked as read
 * @returns {Promise<Object>} API response
 */
export const updateUniboxThreadReadStatus = async ({
  contactMappingId,
  isRead = true,
}) => {
  if (!contactMappingId) {
    throw new Error('Contact mapping ID is required to update read status');
  }

  return patchApiCall({
    endpoint: `/unibox/inbox/${contactMappingId}/read`,
    payload: {
      is_read: isRead,
    },
    includeWorkspace: true,
  });
};

/**
 * Updates the read status of an untracked email
 * @param {Object} options
 * @param {number|string} options.id - ID of the untracked email
 * @param {boolean} options.isRead - Whether the email is marked as read
 * @returns {Promise<Object>} API response
 */
export const updateUniboxUntrackedReadStatus = async ({
  id,
  isRead = true,
}) => {
  if (!id) {
    throw new Error('Untracked email ID is required to update read status');
  }

  return patchApiCall({
    endpoint: `/unibox/untracked/${id}/read`,
    payload: {
      is_read: isRead,
    },
    includeWorkspace: true,
  });
};

/**
 * Updates the AI reply category of an inbox conversation
 * @param {Object} options
 * @param {string} options.contactMappingId - UUID of the contact mapping
 * @param {number|null} [options.replyCategoryId] - ID of the selected reply category
 * @param {boolean} [options.clearReplyCategory] - Whether to clear the assigned category
 * @returns {Promise<Object>} API response
 */
export const updateUniboxThreadReplyCategory = async ({
  contactMappingId,
  replyCategoryId = null,
  clearReplyCategory = false,
}) => {
  if (!contactMappingId) {
    throw new Error('Contact mapping ID is required to update reply category');
  }

  return patchApiCall({
    endpoint: `/unibox/inbox/${contactMappingId}/reply-category`,
    payload: {
      reply_category_id: replyCategoryId,
      clear_reply_category: clearReplyCategory,
    },
    includeWorkspace: true,
  });
};
