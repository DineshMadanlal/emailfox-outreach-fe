// pinia
import { defineStore } from 'pinia';

// vue
import { computed, reactive, toRefs } from 'vue';

// constants
import { APP_MODE, SUPPORTED_THEMES } from 'src/boot/constants';

export const useUserPreferencesStore = defineStore('storeUserPreferences', () => {
  // state
  const state = reactive({
    // app drawer mini state
    drawerMiniState: false,

    appThemeColor: '',
    appMode: APP_MODE.LIGHT_MODE,
    appTheme: SUPPORTED_THEMES.DEFAULT.value,

    // all mailboxes
    allMailboxesState: {
      filters: {},
      pagination: null,
      tableData: [],
      visibleColumns: [],

      overallStatus: {},
    },

    // all domains
    allDomainsState: {
      filters: {},
      pagination: null,
      tableData: [],
      visibleColumns: [],

      overallStatus: {},
    },

    // all contacts
    allContactsState: {
      filters: {},
      pagination: null,
      tableData: [],
      visibleColumns: [],
    },

    listByIdContactsState: {
      filters: {},
      pagination: null,
      tableData: [],
      visibleColumns: [],

      listDetails: {},
    },

    campaignByIdContactsState: {
      filters: {},
      pagination: null,
      tableData: [],
      visibleColumns: [],
    },

    // all sequences
    allCampaignsState: {
      tablePreferences: {
        pagination: null,
        searchInput: '',
      },
      tableData: [],
      visibleColumns: [],
    },
    // linkedin accounts
    linkedInAccountsState: {
      filters: {},
      pagination: null,
      tableData: [],
      visibleColumns: [],
    },

    integrationsCount: {},

    allWorkspaces: [],
  });

  // computed
  const getAppMode = computed(() => state.appMode);
  const getAppTheme = computed(() => state.appTheme);
  const getAppThemeColor = computed(() => state.appThemeColor);
  const getDrawerMiniState = computed(() => state.drawerMiniState);

  const getAllWorkspaces = computed(() => state.allWorkspaces);

  // methods
  const setField = ({ field, value }) => {
    state[field] = value;
  };

  const setMultipleFields = (fields) => {
    Object.keys(fields).forEach((field) => {
      state[field] = fields[field];
    });
  };

  const setAppMode = (mode) => {
    state.appMode = mode;
  };

  const toggleDrawerMiniState = () => {
    state.drawerMiniState = !state.drawerMiniState;
  };

  return {
    // state
    ...toRefs(state),

    // computed
    getAppMode,
    getAppTheme,
    getAppThemeColor,
    getDrawerMiniState,
    getAllWorkspaces,

    // methods
    setField,
    setMultipleFields,
    setAppMode,
    toggleDrawerMiniState,
  };
});
