// utils
import { cleanEditorHtmlForSave } from 'src/utils/helperFunctions';

// constants
import { VARIABLE_REGEX, SPINTAX_REGEX, PRODUCT_VARIABLES_VALUES } from 'src/boot/campaign-constants';

export const wrapVariable = (value) => {
  const variableName = value
    .replace('{{', '')
    .replace('}}', '')
    .trim();

  return `<span class="editor-token editor-token-variable" data-token-type="variable" data-variable="${variableName}" contenteditable="false">${value}</span>&nbsp;`;
};

export const createTag = (tag, attrs, content = '') => {
  const attrString = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  return `<${tag} ${attrString}>${content}</${tag}>`;
};

export const wrapSpintax = (value = '{}') => {
  const cleanValue = value.trim();

  const innerValue = cleanValue
    .replace(/^\{/, '')
    .replace(/\}$/, '');

  let options = innerValue.split('|').map((option) => option.trim());

  if (!options.length) {
    options = [''];
  }

  const startBraceHtml = createTag('span', {
    class: 'spintax-brace spintax-brace-start',
    contenteditable: 'false',
  }, '{');

  const endBraceHtml = createTag('span', {
    class: 'spintax-brace spintax-brace-end',
    contenteditable: 'false',
  }, '}');

  const optionsHtml = options.map((option, index) => {
    const optionHtml = createTag('span', {
      class: 'spintax-option',
      contenteditable: 'true',
      spellcheck: 'false',
      'data-placeholder': index === 0 ? 'Write first variation and press Tab' : 'Write another variation and press Tab',
    }, option || '\u200B');

    if (index === options.length - 1) return optionHtml;

    const separatorHtml = createTag('span', {
      class: 'spintax-separator',
      contenteditable: 'false',
    }, '|');

    return `${optionHtml}${separatorHtml}`;
  }).join('');

  return `${createTag('span', {
    class: 'editor-token editor-token-spintax',
    'data-token-type': 'spintax',
    contenteditable: 'true',
  }, `${startBraceHtml}${optionsHtml}${endBraceHtml}`)}&nbsp;`;
};

export const highlightVariablesAndSpintax = (html = '') => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  const walker = document.createTreeWalker(
    wrapper,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;

        if (parent?.closest('[data-token-type]')) {
          return NodeFilter.FILTER_REJECT;
        }

        const text = node.nodeValue || '';

        VARIABLE_REGEX.lastIndex = 0;
        SPINTAX_REGEX.lastIndex = 0;

        if (VARIABLE_REGEX.test(text) || SPINTAX_REGEX.test(text)) {
          return NodeFilter.FILTER_ACCEPT;
        }

        return NodeFilter.FILTER_REJECT;
      },
    },
  );

  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    let text = node.nodeValue || '';

    VARIABLE_REGEX.lastIndex = 0;
    SPINTAX_REGEX.lastIndex = 0;

    text = text
      .replace(VARIABLE_REGEX, (match) => wrapVariable(match))
      .replace(SPINTAX_REGEX, (match) => wrapSpintax(match));

    const temp = document.createElement('span');
    temp.innerHTML = text;

    node.replaceWith(...Array.from(temp.childNodes));
  });

  return wrapper.innerHTML;
};

const tokenSelector = '[data-token-type="variable"], [data-token-type="spintax"]';

const isWhitespaceTextNode = (node) => (
  node
      && node.nodeType === Node.TEXT_NODE
      && /^[\s\u00A0]*$/.test(node.nodeValue)
);

const removeTokenWithSpace = (token) => {
  const next = token.nextSibling;

  if (isWhitespaceTextNode(next)) {
    next.remove();
  }

  token.remove();
};

const isCaretAtStartOfElement = (element, range) => {
  const beforeRange = document.createRange();
  beforeRange.selectNodeContents(element);
  beforeRange.setEnd(range.startContainer, range.startOffset);

  return beforeRange.toString().length === 0;
};

const isCaretAtEndOfElement = (element, range) => {
  const afterRange = document.createRange();
  afterRange.selectNodeContents(element);
  afterRange.setStart(range.startContainer, range.startOffset);

  return afterRange.toString().length === 0;
};

export const bindTokenDelete = (editor) => {
  editor.el.addEventListener('keydown', (e) => {
    if (e.key !== 'Backspace' && e.key !== 'Delete') return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!range.collapsed) return;

    const node = range.startContainer;
    const offset = range.startOffset;

    const currentToken = (
      node.nodeType === Node.TEXT_NODE
        ? node.parentElement?.closest?.(tokenSelector)
        : node.closest?.(tokenSelector)
    );

    // If cursor is inside spintax, allow normal character editing.
    if (currentToken?.dataset.tokenType === 'spintax') {
      const isAtStart = isCaretAtStartOfElement(currentToken, range);
      const isAtEnd = isCaretAtEndOfElement(currentToken, range);

      if (
        (e.key === 'Backspace' && (isAtStart || isAtEnd)) || (e.key === 'Delete' && isAtEnd)
      ) {
        e.preventDefault();

        removeTokenWithSpace(currentToken);

        editor.events.trigger('contentChanged');

        return;
      }

      return;
    }

    let targetToken = null;

    if (e.key === 'Backspace') {
      // Case: cursor is in whitespace right after token
      if (
        node.nodeType === Node.TEXT_NODE
        && isWhitespaceTextNode(node)
      ) {
        const previousNode = node.previousSibling;

        if (
          previousNode?.nodeType === Node.ELEMENT_NODE
          && previousNode.matches(tokenSelector)
        ) {
          targetToken = previousNode;
        }
      }

      // Case: cursor directly after token
      if (
        !targetToken
        && node.nodeType === Node.TEXT_NODE
        && offset === 0
      ) {
        const previousNode = node.previousSibling;

        if (
          previousNode?.nodeType === Node.ELEMENT_NODE
          && previousNode.matches(tokenSelector)
        ) {
          targetToken = previousNode;
        }
      }

      if (
        !targetToken
        && node.nodeType === Node.ELEMENT_NODE
        && offset > 0
      ) {
        const previousNode = node.childNodes[offset - 1];

        if (
          previousNode?.nodeType === Node.ELEMENT_NODE
          && previousNode.matches(tokenSelector)
        ) {
          targetToken = previousNode;
        }
      }
    }

    if (e.key === 'Delete') {
      // Case: cursor is in whitespace before token
      if (
        node.nodeType === Node.TEXT_NODE
        && isWhitespaceTextNode(node)
      ) {
        const nextNode = node.nextSibling;

        if (
          nextNode?.nodeType === Node.ELEMENT_NODE
          && nextNode.matches(tokenSelector)
        ) {
          targetToken = nextNode;
        }
      }

      // Case: cursor directly before token
      if (
        !targetToken
        && node.nodeType === Node.TEXT_NODE
        && offset === node.nodeValue.length
      ) {
        const nextNode = node.nextSibling;

        if (
          nextNode?.nodeType === Node.ELEMENT_NODE
          && nextNode.matches(tokenSelector)
        ) {
          targetToken = nextNode;
        }
      }

      if (
        !targetToken
        && node.nodeType === Node.ELEMENT_NODE
      ) {
        const nextNode = node.childNodes[offset];

        if (
          nextNode?.nodeType === Node.ELEMENT_NODE
          && nextNode.matches(tokenSelector)
        ) {
          targetToken = nextNode;
        }
      }
    }

    if (!targetToken) return;

    e.preventDefault();
    removeTokenWithSpace(targetToken);
    editor.events.trigger('contentChanged');
  });
};

export const bindPlainPasteShortcut = (editor) => {
  editor.el.addEventListener('keydown', async (e) => {
    const isPlainPaste = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v';

    if (!isPlainPaste) return;

    e.preventDefault();

    try {
      const text = await navigator.clipboard.readText();
      editor.selection.restore();
      editor.html.insert(text.replace(/\n/g, '<br>'));
    } catch (err) {
      console.error(err);
    }
  });
};

export const bindEditorCopy = (editor) => {
  editor.el.addEventListener('copy', (e) => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const clonedContent = range.cloneContents();

    const div = document.createElement('div');
    div.appendChild(clonedContent);

    const html = div.innerHTML;
    const text = div.textContent || '';

    // Clean up the temporary div
    div.remove();

    e.clipboardData.setData('text/html', cleanEditorHtmlForSave(html));
    e.clipboardData.setData('text/plain', text);
    e.preventDefault();
  }, true);
};

// wrap spintax
export const placeCursorInsideElement = (element) => {
  if (!element) return;

  const range = document.createRange();
  const selection = window.getSelection();

  range.selectNodeContents(element);
  range.collapse(false);

  selection.removeAllRanges();
  selection.addRange(range);
};

export const focusLatestSpintaxOption = (editor) => {
  const editorEl = editor.el || editor.$el?.get?.(0);

  if (!editorEl) return;

  const spintaxes = editorEl.querySelectorAll('.editor-token-spintax');
  const latestSpintax = spintaxes[spintaxes.length - 1];

  if (!latestSpintax) return;

  const firstOption = latestSpintax.querySelector('.spintax-option');

  placeCursorInsideElement(firstOption);
};

export const bindSpintaxTabHandler = (editor, onChange) => {
  const editorEl = editor.el || editor.$el?.get?.(0);

  if (!editorEl) return;

  editorEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const selection = window.getSelection();

    if (!selection || !selection.rangeCount) return;

    const activeOption = selection.anchorNode?.parentElement?.closest?.('.spintax-option');

    if (!activeOption) return;

    e.preventDefault();

    const separator = document.createElement('span');
    separator.className = 'spintax-separator';
    separator.contentEditable = 'false';
    separator.innerText = '|';

    const newOption = document.createElement('span');
    newOption.className = 'spintax-option';
    newOption.contentEditable = 'true';
    newOption.spellcheck = false;

    activeOption.after(separator, newOption);

    placeCursorInsideElement(newOption);

    editor.events.trigger('contentChanged');

    if (onChange) {
      onChange();
    }
  });
};

export const removePreviousOpeningBrace = () => {
  const selection = window.getSelection();

  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);

  if (!range.collapsed) return;

  const node = range.startContainer;
  const offset = range.startOffset;

  // TEXT NODE
  if (node.nodeType === Node.TEXT_NODE) {
    const textBeforeCursor = node.nodeValue.slice(0, offset);

    const lastBraceIndex = textBeforeCursor.lastIndexOf('{');

    if (lastBraceIndex !== -1) {
      node.deleteData(lastBraceIndex, 1);
      return;
    }
  }

  // ELEMENT NODE
  if (node.nodeType === Node.ELEMENT_NODE) {
    const previousNode = node.childNodes[offset - 1];

    if (
      previousNode
      && previousNode.nodeType === Node.TEXT_NODE
    ) {
      const lastBraceIndex = previousNode.nodeValue.lastIndexOf('{');

      if (lastBraceIndex !== -1) {
        previousNode.deleteData(lastBraceIndex, 1);
      }
    }
  }
};

export const getCleanText = (html) => {
  if (!html) return '';

  // 1. Insert newlines before extracting text to prevent block merging
  //    <div>Hello</div><div>World</div> becomes "Hello\nWorld" instead of "HelloWorld"
  const formattedHtml = html
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n');

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = formattedHtml;

  // 2. Extract text (now containing newlines)
  const text = tempDiv.textContent || tempDiv.innerText || '';

  return text;
};

export const findTemplateIssues = (html = '', variableMenuOptions = []) => {
  const issues = [];

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  const text = wrapper.textContent || '';

  const allOptions = [
    ...variableMenuOptions,
    ...PRODUCT_VARIABLES_VALUES,
  ];

  // -------------------------
  // 1. Validate variables
  // -------------------------
  const variableMatches = [...text.matchAll(/{{([\s\S]*?)}}/g)];

  variableMatches.forEach((match) => {
    const fullValue = match[0];
    const variableName = match[1].trim();

    if (!variableName) {
      issues.push({
        type: 'EMPTY_VARIABLE',
        severity: 'error',
        message: 'Variable name is empty',
        value: fullValue,
        index: match.index,
      });

      return;
    }

    if (!allOptions.includes(variableName)) {
      issues.push({
        type: 'UNKNOWN_VARIABLE',
        severity: 'warning',
        message: `Unknown variable "${variableName}"`,
        value: fullValue,
        variableName,
        index: match.index,
      });
    }
  });

  [...text.matchAll(/{{/g)].forEach((match) => {
    const startIndex = match.index;
    const closeIndex = text.indexOf('}}', startIndex + 2);

    if (closeIndex === -1) {
      issues.push({
        type: 'UNCLOSED_VARIABLE',
        severity: 'error',
        message: 'This variable is incomplete',
        value: text.slice(startIndex, startIndex + 30),
        index: startIndex,
      });
    }
  });

  // -------------------------
  // 2. Validate DOM spintax tokens
  // -------------------------
  const spintaxTokens = wrapper.querySelectorAll('[data-token-type="spintax"]');

  spintaxTokens.forEach((token, tokenIndex) => {
    const tokenText = token.textContent.trim();

    const options = [...token.querySelectorAll('.spintax-option')]
      .map((option) => option.textContent.trim());

    const separatorCount = token.querySelectorAll('.spintax-separator').length;

    if (options.length < 2 || separatorCount < 1) {
      issues.push({
        type: 'SPINTAX_MIN_OPTIONS',
        severity: 'error',
        message: 'Spintax needs at least 2 variations',
        value: tokenText,
        tokenIndex,
      });
    }

    if (tokenText.includes('|}')) {
      issues.push({
        type: 'EMPTY_SPINTAX_OPTION',
        severity: 'error',
        message: 'One spintax variation is empty',
        value: tokenText,
        tokenIndex,
      });
    }

    options.forEach((option, optionIndex) => {
      if (!option) {
        issues.push({
          type: 'EMPTY_SPINTAX_OPTION',
          severity: 'error',
          message: 'One spintax variation is empty',
          value: tokenText,
          tokenIndex,
          optionIndex,
        });
      }
    });
  });

  // -------------------------
  // 3. Fallback raw text spintax validation
  // -------------------------
  const rawSpintaxMatches = [...text.matchAll(/{([^{}]*\|[^{}]*)}/g)];

  rawSpintaxMatches.forEach((match) => {
    const fullValue = match[0]; // {dedede|}
    const inside = match[1]; // dedede|

    const parts = inside.split('|').map((part) => part.trim());

    if (parts.length < 2) {
      issues.push({
        type: 'SPINTAX_MIN_OPTIONS',
        severity: 'error',
        message: 'Spintax needs at least 2 variations',
        value: fullValue,
        index: match.index,
      });
    }

    if (parts.some((part) => !part)) {
      issues.push({
        type: 'EMPTY_SPINTAX_OPTION',
        severity: 'error',
        message: 'One spintax variation is empty',
        value: fullValue,
        index: match.index,
      });
    }
  });

  wrapper.remove();

  return issues;
};
