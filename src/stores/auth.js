// pinia
import { defineStore } from 'pinia';

// vue
import { reactive, computed, toRefs } from 'vue';

// quasar
import { useQuasar, QSpinnerBars } from 'quasar';

// utils
import { isMainApp } from 'src/utils/applyBranding';
import { postApiCall } from 'src/utils/apiRequests';
import { differenceBetweenDays } from 'src/utils/dates';
import { gleapClearIdentity } from 'src/utils/externalServices';
import { primaryAppRouteToLoginPage } from 'src/utils/helperFunctions';

// constants
import { PLAN_TYPES } from 'src/boot/constants';

export const useAuthStore = defineStore('storeAuth', () => {
  // quasar
  const $q = useQuasar();

  // state
  const state = reactive({
    isMainApp: isMainApp(),

    user: null,
    token: null,

    apiKey: null,

    //
    userPlan: null,

    userDetails: null,

    userPaymentDetails: null,

    activeWorkspaceData: null,
  });

  /**
   * The method is responsible for showing Credit Card(CC) in the UI.
   * If CC is not given, then we ask for the card information.
   * @returns {boolean} - returns true if credit card is approved, false otherwise
   */
  const isCreditCardApproved = () => {
    // user plan
    const userPlan = state.userPlan || {};

    if (userPlan.plan_name === PLAN_TYPES.TRIAL_PLAN) {
      return false;
    }

    if (userPlan.is_sub_active) {
      return true;
    }

    /** If the user has an inactive subscription
     * then we check the end date of the plan and provide
     * all the features until the end date of the plan.
     * After the end date, we restrict the features and ask for the card details.
     */
    const differenceInDays = differenceBetweenDays({
      endDate: userPlan.plan_end_date,
      startDate: new Date(),
    });

    return differenceInDays > 0;
  };

  // computed
  const getUser = computed(() => state.user);
  const userId = computed(() => state.user?.id);
  const getApiKey = computed(() => state.apiKey);
  const isPrimaryPlatform = computed(() => state.isMainApp);
  const getUserPlan = computed(() => state.userPlan);
  const isAuthenticated = computed(() => !!state.token);
  const getUserDetails = computed(() => state.userDetails);
  const getUserPaymentDetails = computed(() => state.userPaymentDetails);
  const isCreditCardSubscribed = computed(() => isCreditCardApproved());
  const isStarterPlan = computed(() => state.userPlan?.plan_name === PLAN_TYPES.LAUNCH_PLAN);
  const getActiveWorkspaceData = computed(() => state.activeWorkspaceData);

  // methods
  const setField = ({ field, value }) => {
    state[field] = value;
  };

  const setMultipleFields = (fields) => {
    Object.keys(fields).forEach((field) => {
      state[field] = fields[field];
    });
  };

  const refreshSession = async () => {
    try {
      const response = await postApiCall({
        endpoint: '/users/refresh-token',
      });

      setMultipleFields({
        user: response?.user || null,
        token: response?.token?.access_token || null,
      });
    } catch (error) {
      // Handle error if needed
    }

    return true;
  };

  const onExitWorkspace = () => {
    if (isPrimaryPlatform.value) {
      // Clear Gleap identity if the user is logged out from the main app
      gleapClearIdentity();
    }

    state.user = {};
    state.token = '';
    state.activeWorkspaceData = null;

    localStorage.clear();

    // redirect to the workspace selection page on the main platform
    if (isPrimaryPlatform.value) {
      window.location.href = process.env.DEV_MODE
        ? 'http://app.skysenders.local:8080/workspace/choose'
        : 'https://app.emailfox.ai/workspace/choose';
    }
  };

  const logoutUser = async () => {
    try {
      $q.loading.show({
        size: '40px',
        spinner: QSpinnerBars,
        spinnerColor: 'primary',
      });

      // logout api call
      await postApiCall({
        endpoint: '/users/logout',
      });
    } catch (error) {
      // triggerToast({
      //   warning: true,
      //   message: error.message || 'Unexpected error occured. Unable to logout user.',
      // });
    } finally {
      $q.loading.hide();

      if (isPrimaryPlatform.value) {
        // Clear Gleap identity if the user is logged out from the main app
        gleapClearIdentity();
      }

      state.user = {};
      state.token = '';
      state.activeWorkspaceData = null;

      localStorage.clear();

      // Deflect back to the main portal login page
      if (isPrimaryPlatform.value) {
        primaryAppRouteToLoginPage();
      } else {
        // redirect to the login page
        window.location.href = '/login';
      }
    }
  };

  return {
    // state
    ...toRefs(state),

    // computed
    userId,
    getUser,
    getApiKey,
    isPrimaryPlatform,
    getUserPlan,
    isStarterPlan,
    getUserDetails,
    getUserPaymentDetails,
    isAuthenticated,
    isCreditCardSubscribed,
    getActiveWorkspaceData,

    // methods
    setField,
    logoutUser,
    refreshSession,
    setMultipleFields,
    onExitWorkspace,
  };
});
