/**
 * Email Parser Utilities
 * Centralized utility functions for parsing email contents, separating fresh replies
 * from quoted thread history, and handling cross-provider quote formats (Gmail, Outlook, etc.)
 * using the First Quote Boundary Rule.
 */

// Common CSS selectors used by email clients to identify the start of quoted history
const QUOTE_SELECTORS = [
  '.gmail_quote',
  '.gmail_quote_container',
  'blockquote.gmail_quote',
  '#divRplyFwdMsg',
  '#appendonsend',
  '.yahoo_quoted',
  '.zmail_extra',
  'blockquote[type="cite"]',
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

    // Search for any primary quote container element
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

    // Fallback check for genuine quote blockquotes (avoiding body blockquotes)
    if (!quoteElement) {
      const blockquotes = doc.body.querySelectorAll('blockquote');
      for (let b = 0; b < blockquotes.length; b += 1) {
        const bq = blockquotes[b];
        const bqText = (bq.textContent || '').trim();
        const bqType = bq.getAttribute('type');
        const bqClass = bq.className || '';
        const bqStyle = bq.getAttribute('style') || '';

        const hasQuoteHeader = /^(?:On\s+.+?wrote:|From:\s+|-----Original|Le\s+.+?a)/im
          .test(bqText);
        const isQuoteBlock = (
          bqType === 'cite'
          || /quote/i.test(bqClass)
          || bq.querySelector('.gmail_attr')
          || hasQuoteHeader
          || /border-left/i.test(bqStyle)
        );

        if (isQuoteBlock) {
          quoteElement = bq;
          break;
        }
      }
    }

    if (quoteElement) {
      // Find top-level container of the quote boundary under body
      let topQuoteNode = quoteElement;
      while (
        topQuoteNode.parentElement
        && topQuoteNode.parentElement !== doc.body
        && topQuoteNode.parentElement.children.length === 1
      ) {
        topQuoteNode = topQuoteNode.parentElement;
      }

      // Collect topQuoteNode and all its subsequent sibling elements into the quoted block
      const quotedNodes = [];
      let curr = topQuoteNode;
      while (curr) {
        quotedNodes.push(curr);
        curr = curr.nextElementSibling;
      }

      // Remove preceding <hr> divider if present (e.g. Outlook reply divider)
      const prev = topQuoteNode.previousElementSibling;
      if (prev && prev.tagName === 'HR') {
        prev.remove();
      }

      // Extract the quoted HTML block
      const quotedHtml = quotedNodes.map((n) => n.outerHTML).join('').trim();

      // Remove all quoted nodes from the document to keep only the fresh reply
      quotedNodes.forEach((n) => n.remove());

      const mainHtml = doc.body.innerHTML.trim();

      return {
        mainHtml,
        quotedHtml,
        hasQuoted: Boolean(quotedHtml),
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
    // 1. Standard: On <date>, <sender> wrote: (English, French, German, Spanish)
    /(?:^|\n)\s*(On\s+.+?wrote:[\s\S]*)/i,
    /(?:^|\n)\s*(Le\s+.+?a écrit\s*:[\s\S]*)/i,
    /(?:^|\n)\s*(Am\s+.+?schrieb\s*:[\s\S]*)/i,
    /(?:^|\n)\s*(El\s+.+?escribió\s*:[\s\S]*)/i,

    // 2. Outlook / Exchange original message or forward headers
    /(?:^|\n)\s*(-{3,}\s*(?:Original Message|Forwarded message|Original Email)\s*-{3,}[\s\S]*)/i,

    // 3. Divider line followed immediately by email header fields (From/Sent/Date/To/Subject)
    /(?:^|\n)\s*([-_]{3,}\s*\n\s*(?:From|Sent|To|Subject|Date):\s*[\s\S]*)/i,

    // 4. Standard header block starting with From: followed by Sent/Date/To/Subject
    /(?:^|\n)\s*(From:\s*.+\n\s*(?:Sent|Date|To|Subject):\s*[\s\S]*)/i,

    // 5. Outlook Web header block starting with Sent: followed by To: and Subject:
    /(?:^|\n)\s*(Sent:\s*.+\n\s*To:\s*.+\n\s*Subject:\s*[\s\S]*)/i,
  ];

  for (let i = 0; i < quotePatterns.length; i += 1) {
    const match = textString.match(quotePatterns[i]);
    if (match && match.index !== undefined) {
      const mainText = textString.slice(0, match.index).trim();
      const quotedText = textString.slice(match.index).trim();

      return {
        mainText,
        quotedText,
        hasQuoted: Boolean(quotedText),
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
