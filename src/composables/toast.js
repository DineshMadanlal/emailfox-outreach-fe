// vue
import { reactive } from 'vue';

// hardcoded constant
const DEFAULT_TIMEOUT = 5000;
const DEFAULT_MAX_WIDTH = '560px';

// Define the reactive state for the toast
const toastState = reactive({
  showToast: false,
  toastMessage: '',
  warningToast: false,
  maxWidth: DEFAULT_MAX_WIDTH,
});

const hideToast = () => {
  toastState.showToast = false;
};

// Define the function to trigger the toast
const triggerToast = ({ message, warning = false, maxWidth }) => {
  toastState.toastMessage = message;
  toastState.warningToast = !!warning;
  toastState.showToast = true;
  toastState.maxWidth = maxWidth || DEFAULT_MAX_WIDTH;

  // Auto-close after 5 seconds for non-warning toasts
  if (!warning) {
    setTimeout(() => {
      toastState.showToast = false;
    }, DEFAULT_TIMEOUT);
  }
};

export const useToast = () => ({
  toastState,

  // methods
  hideToast,
  triggerToast,
});
