// utils
import {
  getApiCall,
} from 'src/utils/apiRequests';

// md5
import md5 from 'blueimp-md5';

export const fetchEmailList = async ({ apiEndPoint, apiParams }) => {
  try {
    const emailList = await getApiCall({
      endpoint: apiEndPoint,
      params: apiParams,
    });

    return emailList;
  } catch (error) {
    throw new Error(error);
  }
};

export const fetchThreadById = async (threadId) => {
  try {
    const response = await getApiCall({
      endpoint: `/master-inbox/threads/${threadId}/messages`,
    });

    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const getFromAndEmailJson = (inputString) => {
  // Match pattern: Name <email@domain.com>
  const match = inputString.match(/^(.*?)\s*<(.+?)>$/);

  if (match) {
    return {
      from: match[1].trim(),
      email: match[2].trim(),
    };
  }

  const email = inputString.trim();

  return {
    from: email.split('@')[0],
    email: inputString.trim(),
  };
};

export const parseEmailFields = (input) => {
  // Remove escape sequences like \n, \t, \r, \xA0, etc.
  const cleaned = input.replace(/\\[a-zA-Z0-9]+/g, '');

  // Split by comma and trim each entry
  const entries = cleaned.split(',').map((s) => s.trim()).filter(Boolean);

  // Extract name and email from each entry
  return entries.map((entry) => {
    const emailMatch = entry.match(/<([^>]+)>/);
    if (emailMatch) {
      return {
        name: entry.replace(emailMatch[0], '').trim(),
        email: emailMatch[1],
      };
    }
    return {
      name: '',
      email: entry,
    };
  });
};

export const getGravatarUrl = (email, size = 40) => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404&r=pg`;
};
