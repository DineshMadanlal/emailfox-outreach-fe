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

// Normalize any header (CSV column)
export const normalizeString = (str = '') => (str || '')
  .toString()
  .trim()
  .toLowerCase()
  .replace(/[-_]/g, ' ')
  .replace(/[^a-z0-9 ]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

export const backendApiUrl = () => {
  let baseURL = process.env.AUTHENTICATION_API;

  if (!isPrimaryApp) {
    baseURL = 'https://outreach-api.apiruntime.com/api';
  }

  return baseURL;
};

export const cleanEditorHtmlForSave = (html = '') => {
  if (!html || typeof html !== 'string') return '';

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  // 1. Unwrap variable tokens
  wrapper
    .querySelectorAll('[data-token-type="variable"], .editor-token-variable')
    .forEach((chip) => {
      const value = chip.textContent || '';
      chip.replaceWith(document.createTextNode(value));
    });

  // 2. Unwrap spintax tokens
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

  // 3. Remove dirty attributes & inline webkit/clipboard junk
  wrapper.querySelectorAll('*').forEach((el) => {
    el.removeAttribute('data-pasted');
    el.removeAttribute('fr-original-style');

    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-fr-')) {
        el.removeAttribute(attr.name);
      }
    });

    if (el.hasAttribute('style')) {
      const rawStyle = el.getAttribute('style') || '';
      const cleanedStyle = rawStyle
        .replace(/-webkit-tap-highlight-color:\s*[^;]+;?/gi, '')
        .replace(/box-sizing:\s*inherit;?/gi, '')
        .replace(/font-family:\s*unset;?/gi, '')
        .replace(/line-height:\s*unset;?/gi, '')
        .trim();

      if (!cleanedStyle || cleanedStyle === ';') {
        el.removeAttribute('style');
      } else {
        el.setAttribute('style', cleanedStyle);
      }
    }
  });

  // 4. Clean list items: remove leading non-breaking space / whitespace
  wrapper.querySelectorAll('li').forEach((li) => {
    const { firstChild } = li;
    if (firstChild && firstChild.nodeType === 3 /* Node.TEXT_NODE */) {
      firstChild.nodeValue = firstChild.nodeValue.replace(/^[\s\u00A0]+/, '');
    }
  });

  // 5. Remove empty <ul> or <ol> elements
  wrapper.querySelectorAll('ul, ol').forEach((list) => {
    if (!list.querySelector('li') || !list.textContent.trim()) {
      list.remove();
    }
  });

  // 6. Normalize trailing <br> inside block elements (div, p)
  // When pasted, Froala often creates: <div>Hi hi<br><br></div>
  const blockElements = Array.from(wrapper.children);
  blockElements.forEach((block) => {
    if (['DIV', 'P'].includes(block.tagName)) {
      const hasContent = Array.from(block.childNodes).some(
        (node) => (node.nodeType === 3 ? !!node.nodeValue.trim() : node.tagName !== 'BR'),
      );

      if (hasContent) {
        let trailingBrCount = 0;
        while (
          block.lastChild
          && (block.lastChild.tagName === 'BR'
            || (block.lastChild.nodeType === 3 && !block.lastChild.nodeValue.trim()))
        ) {
          if (block.lastChild.tagName === 'BR') {
            trailingBrCount += 1;
          }
          block.removeChild(block.lastChild);
        }

        // If it had 2 or more trailing <br> tags, preserve the intentional empty lines
        // (1 trailing <br> is normal line end; each extra <br> represents a blank line)
        if (trailingBrCount >= 2) {
          for (let i = 0; i < trailingBrCount - 1; i += 1) {
            const br = document.createElement('br');
            block.after(br);
          }
        }
      }
    }
  });

  // 7. Convert each empty block element (<div><br></div> or empty div/p) into a standalone <br>
  // In Froala with ENTER_DIV, each intentional empty line is represented by <div><br></div>.
  // Converting each one to a <br> preserves the
  // exact number of blank lines the user created in the editor.
  const children = Array.from(wrapper.children);
  children.forEach((child) => {
    const isBrOnly = child.children.length === 1 && child.children[0].tagName === 'BR' && !child.textContent.trim();
    const isEmpty = !child.textContent.trim() && !child.querySelector('img, iframe, table');
    const isEmptyBlock = ['DIV', 'P'].includes(child.tagName) && (isBrOnly || isEmpty);

    if (isEmptyBlock) {
      const br = document.createElement('br');
      child.replaceWith(br);
    }
  });

  // 8. Clean root boundaries (remove leading and trailing <br> from top/bottom of email)
  while (wrapper.firstChild) {
    if (wrapper.firstChild.tagName === 'BR') {
      wrapper.firstChild.remove();
    } else if (wrapper.firstChild.nodeType === 3 && !wrapper.firstChild.nodeValue.trim()) {
      wrapper.firstChild.remove();
    } else {
      break;
    }
  }

  while (wrapper.lastChild) {
    if (wrapper.lastChild.tagName === 'BR') {
      wrapper.lastChild.remove();
    } else if (wrapper.lastChild.nodeType === 3 && !wrapper.lastChild.nodeValue.trim()) {
      wrapper.lastChild.remove();
    } else {
      break;
    }
  }

  return wrapper.innerHTML;
};

export const isSupportedThemeColor = (color = '') => Object.values(SUPPORTED_THEMES)
  .some((theme) => theme.value.toLowerCase() === color.toLowerCase());

export const getWorkspaceSlugFromUrl = () => {
  const { hostname } = window.location;

  const rootDomain = getRootDomain();

  let primaryDomain = rootDomain;

  if (process.env.DEV_MODE) {
    primaryDomain = 'skysenders.local';

    if (window.location.hostname.includes('emailfox')) {
      primaryDomain = 'emailfox.skysenders.local';
    }
  }

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

export const formatLinkedinDisplayUrl = (url, fallback = '-') => {
  if (!url || url === '-') return fallback;
  const inMatch = url.match(/linkedin\.com\/in\/([^/?#]+)/i) || url.match(/^in\/([^/?#]+)/i);
  if (inMatch) {
    return `in/${inMatch[1]}`;
  }
  const companyMatch = url.match(/linkedin\.com\/company\/([^/?#]+)/i);
  if (companyMatch) {
    return `company/${companyMatch[1]}`;
  }
  return url.split('?')[0].split('#')[0].replace(/^https?:\/\//i, '').replace(/^www\./i, '');
};

export const formatLinkedinHref = (url) => {
  if (!url || url === '-') return '#';
  if (url.match(/^(in|company)\//i)) {
    return `https://www.linkedin.com/${url}`;
  }
  return url.startsWith('http') ? url : `https://${url}`;
};
