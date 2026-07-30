// lodash
import get from 'lodash/get';

// hardcoded constant for the file
const EXTRACT_NUMBER_FROM_STRING_REGEX = /\d+/g;

// General function to handle scroll behavior
const scrollToPosition = (target, position, behavior = 'smooth') => {
  if (target) {
    target.scrollTo({ left: 0, top: position, behavior });
  }
};

// Scroll down to the bottom of the window
const scrollToTheBottom = () => {
  scrollToPosition(window, document.body.scrollHeight);
};

// Scroll up to the top of the window
const scrollToTheTop = () => {
  scrollToPosition(window, 0);
};

// Scroll down to the bottom of a specific element by its ID
const scrollToTheBottomByElementId = (elementId) => {
  const element = document.getElementById(elementId);
  scrollToPosition(element, element?.scrollHeight);
};

// Scroll to the top of a specific element by its ID
const scrollToTheTopByElementId = (elementId) => {
  const element = document.getElementById(elementId);
  scrollToPosition(element, 0);
};

// Scroll down to the bottom of a specific element using a query selector
const scrollToTheBottomByQuerySelector = (querySelector) => {
  const element = document.querySelector(querySelector);
  scrollToPosition(element, element?.scrollHeight);
};

// Scroll down to the bottom of the window based on an element's scroll position
const windowScrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  scrollToPosition(window, element?.scrollHeight);
};

const getHeightFromElementId = (elementId) => {
  const campaignPageElement = document.getElementById(elementId);

  const minHeightString = get(campaignPageElement, 'style.minHeight', '');

  const numberArray = minHeightString.match(EXTRACT_NUMBER_FROM_STRING_REGEX);

  return numberArray[0];
};

const elementScrollIntoView = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

export {
  scrollToTheTop,
  scrollToTheBottom,
  scrollToTheBottomByElementId,
  scrollToTheTopByElementId,
  scrollToTheBottomByQuerySelector,
  windowScrollToElement,
  getHeightFromElementId,
  elementScrollIntoView,
};
