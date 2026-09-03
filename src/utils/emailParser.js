/**
 * Email Parser Utilities
 * Centralized utility functions for parsing email contents, separating fresh replies
 * from quoted thread history, and handling cross-provider quote formats (Gmail, Outlook, etc.)
 */

// Common CSS selectors used by email clients to wrap quoted history
const QUOTE_SELECTORS = [
  '.gmail_quote',
  '.gmail_quote_container',
  'blockquote.gmail_quote',
  '#divRplyFwdMsg',
  '#appendonsend',
  '.yahoo_quoted',
  '.zmail_extra',
  'blockquote[type="cite"]',
  'blockquote',
];

/**
 * Splits an email HTML string into the main reply content and quoted thread history
 * @param {string} htmlString - Raw HTML content from the email
 * @returns {{ mainHtml: string, quotedHtml: string, hasQuoted: boolean }}
 */
export const splitEmailQuotedHtml = (htmlString = '') => {
  if (!htmlString || typeof htmlString !== 'string') {
    return { mainHtml: '', quotedHtml: '', hasQuoted: false };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Search for any quote container element
    let quoteElement = null;

    for (let i = 0; i < QUOTE_SELECTORS.length; i += 1) {
      const match = doc.body.querySelector(QUOTE_SELECTORS[i]);
      if (match) {
        quoteElement = match;
        break;
      }
    }

    // Special check for standalone Gmail attribution header (<div class="gmail_attr">)
    if (!quoteElement) {
      const gmailAttr = doc.body.querySelector('.gmail_attr');
      if (gmailAttr) {
        quoteElement = gmailAttr;
      }
    }

    if (quoteElement) {
      // Extract the quoted block
      const quotedHtml = quoteElement.outerHTML;

      // Remove the quoted element from the document to keep only the fresh reply
      quoteElement.remove();
      const mainHtml = doc.body.innerHTML.trim();

      return {
        mainHtml,
        quotedHtml,
        hasQuoted: true,
      };
    }

    return {
      mainHtml: htmlString.trim(),
      quotedHtml: '',
      hasQuoted: false,
    };
  } catch (err) {
    return {
      mainHtml: htmlString,
      quotedHtml: '',
      hasQuoted: false,
    };
  }
};

/**
 * Splits plain text email content into main message and quoted history
 * @param {string} textString - Plain text email content
 * @returns {{ mainText: string, quotedText: string, hasQuoted: boolean }}
 */
export const splitEmailQuotedText = (textString = '') => {
  if (!textString || typeof textString !== 'string') {
    return { mainText: '', quotedText: '', hasQuoted: false };
  }

  const quotePatterns = [
    /\n\s*(On\s+.+?wrote:[\s\S]*)/i,
    /\n\s*(-----Original Message-----[\s\S]*)/i,
    /\n\s*(_{3,}[\s\S]*)/,
    /\n\s*(-{3,}[\s\S]*)/,
    /\n\s*(From:\s+.+[\s\S]*)/i,
  ];

  for (let i = 0; i < quotePatterns.length; i += 1) {
    const match = textString.match(quotePatterns[i]);
    if (match && match.index !== undefined) {
      const mainText = textString.slice(0, match.index).trim();
      const quotedText = textString.slice(match.index).trim();
      return {
        mainText,
        quotedText,
        hasQuoted: true,
      };
    }
  }

  return {
    mainText: textString.trim(),
    quotedText: '',
    hasQuoted: false,
  };
};

/**
 * Extracts only the fresh reply text from message_preview without quoted headers
 * @param {string} textString - Raw preview text
 * @returns {string} Cleaned single message preview
 */
export const cleanEmailPreviewText = (textString = '') => {
  if (!textString || typeof textString !== 'string') return '';
  const { mainText } = splitEmailQuotedText(textString);
  return mainText || textString.trim();
};

/**
 * Unified helper that parses either HTML or plain text and separates quoted history
 * @param {Object} options
 * @param {string} [options.html] - HTML email content
 * @param {string} [options.text] - Plain text email content
 * @returns {{ mainContent: string, quotedContent: string, hasQuoted: boolean, isHtml: boolean }}
 */
export const parseEmailContentWithQuotes = ({ html = '', text = '' } = {}) => {
  if (html && html.trim()) {
    const { mainHtml, quotedHtml, hasQuoted } = splitEmailQuotedHtml(html);
    return {
      mainContent: mainHtml,
      quotedContent: quotedHtml,
      hasQuoted,
      isHtml: true,
    };
  }

  if (text && text.trim()) {
    const { mainText, quotedText, hasQuoted } = splitEmailQuotedText(text);
    return {
      mainContent: mainText,
      quotedContent: quotedText,
      hasQuoted,
      isHtml: false,
    };
  }

  return {
    mainContent: '',
    quotedContent: '',
    hasQuoted: false,
    isHtml: false,
  };
};
