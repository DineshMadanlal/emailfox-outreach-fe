// utils
import { cleanEditorHtmlForSave } from 'src/utils/helperFunctions';

// constants
import { PRODUCT_VARIABLES_VALUES } from 'src/boot/campaign-constants';

export const bindPlainPasteShortcut = (editor) => {
  let isPlainPasteRequested = false;

  // Detect plain paste shortcut (Cmd+Shift+V or Ctrl+Shift+V)
  editor.el.addEventListener('keydown', (e) => {
    const isPlainPaste = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v';
    if (isPlainPaste) {
      isPlainPasteRequested = true;
    }
  });

  // Handle paste event using standard synchronous clipboardData
  editor.el.addEventListener('paste', async (e) => {
    if (!isPlainPasteRequested) return;
    isPlainPasteRequested = false;

    e.preventDefault();

    let text = '';

    if (e.clipboardData) {
      text = e.clipboardData.getData('text/plain');
    } else if (window.clipboardData) {
      text = window.clipboardData.getData('Text');
    } else if (navigator.clipboard?.readText) {
      try {
        text = await navigator.clipboard.readText();
      } catch (err) {
        // clipboard read exception fallback
      }
    }

    if (text) {
      const cleanText = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n');

      const formattedHtml = cleanText
        .split('\n')
        .map((line) => {
          const escaped = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          return escaped ? `<div>${escaped}</div>` : '<div><br></div>';
        })
        .join('');

      editor.selection.restore();
      editor.html.insert(formattedHtml);
      editor.events.trigger('contentChanged');
    }
  }, true);
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

    // Clean up temporary div
    div.remove();

    e.clipboardData.setData('text/html', cleanEditorHtmlForSave(html));
    e.clipboardData.setData('text/plain', text);
    e.preventDefault();
  }, true);
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

  // 3. Collapse multiple consecutive newlines (max 2 newlines = 1 blank line)
  return text.replace(/\n{3,}/g, '\n\n').trim();
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
  // 2. Validate spintax (raw text)
  // -------------------------
  const rawSpintaxMatches = [...text.matchAll(/{([^{}]*\|[^{}]*)}/g)];

  rawSpintaxMatches.forEach((match) => {
    const fullValue = match[0];
    const inside = match[1];

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
