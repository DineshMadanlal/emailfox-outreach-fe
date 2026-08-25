// constants
import { SUPPORTED_THEMES } from 'boot/constants';

// utils
import { isMainApp, getRootDomain } from 'src/utils/applyBranding';

const isPrimaryApp = isMainApp();

/**
 * Generates random email addresses based on the provided first name, last name,
 * number of mailboxes, and domains.
 *
 * @param {Object} options
 * @param {string} options.firstName - First name
 * @param {string} options.lastName - Last name
 * @param {number} options.numMailboxes - Number of mailboxes to generate
 * @param {Array<Object>} options.domains - Array of domain objects ({ domain: string })
 * @returns {Object} Emails organized by domain
 */

export const generateRandomPassword = () => {
  const length = 8;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; i += 1) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

export const generateCustomEmails = ({
  firstName, lastName, mailboxName, domains,
}) => {
  // Object to store emails by domain
  const emailsByDomain = {};

  // Generate emails for each domain
  domains.forEach((domain) => {
    // Initialize domain emails array if not exists
    emailsByDomain[domain] = emailsByDomain[domain] || [];
    const password = generateRandomPassword();

    // Generate emails
    emailsByDomain[domain].push({
      first_name: firstName,
      last_name: lastName,
      email: `${mailboxName}@${domain}`,
      password,
    });
  });

  return emailsByDomain; // Return the object with emails organized by domain
};

export const getDeliverabilityRateJson = (deliverabilityRate) => {
  if (deliverabilityRate > 90) {
    return {
      icon: 'circle-star',
      color: 'positive',
      label: 'Excellent',
      tooltip: 'A delivery rate over 90% reflects excellent list hygiene and a strong sender reputation, ensuring optimal email deliverability.',
    };
  } if (deliverabilityRate >= 81) {
    return {
      icon: 'circle-tick',
      color: 'primary',
      label: 'Good',
      tooltip: 'A good delivery rate shows strong email practices, although there may be slight room for improvement in sender reputation or list management.',
    };
  } if (deliverabilityRate >= 71) {
    return {
      icon: 'info-circle',
      color: 'warning',
      label: 'Average',
      tooltip: 'An average delivery rate suggests moderate issues with email bounces or potential blocks, which may affect your overall deliverability.',
    };
  } if (deliverabilityRate === 0) {
    return {
      icon: 'circle-star',
      color: 'positive',
      label: 'New',
      tooltip: 'No emails have been sent yet. Your deliverability rate is in perfect condition as no bounces or failures have occurred.',
    };
  }

  //
  return {
    icon: 'circle-close',
    color: 'negative',
    label: 'Bad',
    tooltip: 'A low delivery rate indicates serious issues with bounces or email blocks, significantly impacting your sender reputation and deliverability.',
  };
};

export const getBouncedRateJson = (bouncedRate) => {
  if (bouncedRate <= 2) {
    return {
      icon: 'circle-star',
      color: 'positive',
      label: 'Excellent',
      tooltip: 'A very low bounce rate signifies excellent email list hygiene, effective sender practices, and optimal email deliverability.',
    };
  } if (bouncedRate <= 5) {
    return {
      icon: 'circle-tick',
      color: 'primary',
      label: 'Good',
      tooltip: 'A low bounce rate indicates good sender reputation, proper list management, and high deliverability, but there may still be room for improvement.',
    };
  } if (bouncedRate <= 10) {
    return {
      icon: 'info-circle',
      color: 'warning',
      label: 'Average',
      tooltip: 'An average bounce rate suggests moderate issues with email list quality or sender reputation. Consider reviewing your list hygiene and sending practices to improve deliverability.',
    };
  }

  //
  return {
    icon: 'circle-close',
    color: 'negative',
    label: 'Bad',
    tooltip: 'A high bounce rate is a sign of poor email list hygiene, a damaged sender reputation, or potential blocks by email providers, severely affecting deliverability.',
  };
};

export const getSoftBounceRateJson = (softBounceRate) => {
  if (softBounceRate <= 3) {
    return {
      icon: 'circle-star',
      color: 'positive',
      label: 'Excellent',
      tooltip:
        'A very low soft bounce rate indicates strong sender reputation, proper sending velocity, and healthy recipient mail servers.',
    };
  }

  if (softBounceRate <= 7) {
    return {
      icon: 'circle-tick',
      color: 'primary',
      label: 'Good',
      tooltip:
        'A low soft bounce rate suggests minor temporary delivery issues, such as brief server delays or occasional mailbox limits, with no major impact on deliverability.',
    };
  }

  if (softBounceRate <= 15) {
    return {
      icon: 'info-circle',
      color: 'warning',
      label: 'Average',
      tooltip:
        'An average soft bounce rate points to recurring temporary issues like throttling, rate limits, or sending volume spikes. Adjusting send rates and schedules can help.',
    };
  }

  //
  return {
    icon: 'circle-close',
    color: 'negative',
    label: 'Bad',
    tooltip:
      'A high soft bounce rate signals persistent delivery problems such as aggressive throttling, poor sending patterns, or early reputation issues that can escalate into hard bounces.',
  };
};

export const waitForTimeInSeconds = (seconds) => new Promise((resolve) => {
  const timer = setTimeout(() => {
    resolve();
    clearTimeout(timer);
  }, seconds * 1000);
});

export const stripHtmlTags = (htmlString) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  tempDiv.remove(); // Explicitly remove the temporary div
  return text;
};

export const trimMessageId = (messageId) => {
  if (!messageId) return null;

  return messageId
    .replace(/^[\s\r\n\t]+/, '') // trim from start
    .replace(/[\s\r\n\t]+$/, ''); // trim from end
};

export const generateEmailHTML = (subject, bodyContent) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #ffffff; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="left" style="padding: 20px;">
          <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; max-width: 600px;">
            <tr>
              <td style="color: #111111; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; text-align: left;">
                ${bodyContent}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

// Normalize any header (CSV column)
export const normalizeString = (str) => str
  .toString()
  .trim()
  .toLowerCase()
  .replace(/_/g, ' ')
  .replace(/[^a-z0-9 ]/g, '');

export const backendApiUrl = () => {
  let baseURL = process.env.AUTHENTICATION_API;

  if (!isPrimaryApp) {
    baseURL = 'https://api.boltapi.ai/api';
  }

  return baseURL;
};

export const cleanEditorHtmlForSave = (html = '') => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  wrapper
    .querySelectorAll('[data-token-type="variable"], .editor-token-variable')
    .forEach((chip) => {
      const value = chip.textContent || '';
      chip.replaceWith(document.createTextNode(value));
    });

  wrapper
    .querySelectorAll('[data-token-type="spintax"], .editor-token-spintax')
    .forEach((chip) => {
      const text = (chip.textContent || '')
        .replace(/\u200B/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      let value = text;

      if (!value.startsWith('{')) {
        value = `{${value}`;
      }

      if (!value.endsWith('}')) {
        value = `${value}}`;
      }

      value = value
        .replace(/\{\s+/g, '{')
        .replace(/\s+\}/g, '}')
        .replace(/\s*\|\s*/g, '|');

      chip.replaceWith(document.createTextNode(value));
    });

  return wrapper.innerHTML;
};

export const isSupportedThemeColor = (color = '') => Object.values(SUPPORTED_THEMES)
  .some((theme) => theme.value.toLowerCase() === color.toLowerCase());

export const getWorkspaceSlugFromUrl = () => {
  const { hostname } = window.location;

  const rootDomain = getRootDomain();

  const primaryDomain = process.env.DEV_MODE
    ? 'skysenders.local'
    : rootDomain;

  // Remove port if present
  const cleanHost = hostname.split(':')[0];

  const rootAppDomain = `app.${primaryDomain}`;

  /**
   * app.${rootDomain}
   * app.skysenders.global
   */
  if (cleanHost === rootAppDomain) {
    return '';
  }

  /**
   * Must end with:
   * .app.${rootDomain}
   * .app.skysenders.global
   */
  if (!cleanHost.endsWith(`.${rootAppDomain}`)) {
    return '';
  }

  /**
   * outreach.app.${rootDomain}
   * outreach.app.skysenders.global
   */
  const workspaceSlug = cleanHost.replace(`.${rootAppDomain}`, '');

  // Prevent malformed cases
  if (
    !workspaceSlug
    || workspaceSlug.includes('.')
  ) {
    return '';
  }

  return workspaceSlug;
};

export const primaryAppRouteToLoginPage = () => {
  const rootDomain = getRootDomain();

  window.location.href = process.env.DEV_MODE
    ? 'http://app.skysenders.local:8080/login'
    : `https://app.${rootDomain}/login`;
};

export const isSlackWebhookUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsedUrl = new URL(url);

    return (
      parsedUrl.protocol === 'https:'
      && parsedUrl.hostname.toLowerCase() === 'hooks.slack.com'
      && parsedUrl.pathname.startsWith('/services/')
    );
  } catch {
    return false;
  }
};
