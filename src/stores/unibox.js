// pinia
import { defineStore } from 'pinia';

// vue
import { computed, reactive, toRefs } from 'vue';

// utils
import {
  fetchUniboxCampaigns,
  fetchUniboxReplyCategories,
} from 'src/utils/unibox';

export const useUniboxStore = defineStore('storeUnibox', () => {
  // state
  const state = reactive({
    // sidebar click event triggers (REFRESH_UNIBOX, COMPOSE_EMAIL)
    events: {
      secondarySidebarClickEvent: null,
    },

    // counters for sidebar badges
    counters: {
      inboxUnreadCount: 0,
      untrackedRepliesCount: 0,
    },

    // campaign filter dataset
    campaigns: {
      data: [],
      isLoading: false,
    },

    // reply categories filter dataset
    replyCategories: {
      data: [],
      isLoading: false,
    },
  });

  // computed
  const getSecondarySidebarClickEvent = computed(
    () => state.events.secondarySidebarClickEvent,
  );
  const getInboxUnreadCount = computed(() => state.counters.inboxUnreadCount);
  const getUntrackedRepliesCount = computed(() => state.counters.untrackedRepliesCount);

  const getCampaignsList = computed(() => state.campaigns.data);
  const getCampaignsLoading = computed(() => state.campaigns.isLoading);

  const getReplyCategoriesList = computed(() => state.replyCategories.data);
  const getReplyCategoriesLoading = computed(() => state.replyCategories.isLoading);

  // methods
  const setField = ({ field, value }) => {
    if (field in state.events) {
      state.events[field] = value;
    } else if (field in state.counters) {
      state.counters[field] = value;
    } else if (field in state) {
      state[field] = value;
    }
  };

  const setMultipleFields = (fields) => {
    Object.keys(fields).forEach((field) => {
      setField({ field, value: fields[field] });
    });
  };

  // Fetches campaigns with in-memory caching in the store
  const fetchCampaigns = async ({ force = false } = {}) => {
    if (state.campaigns.data.length > 0 && !force) {
      return state.campaigns.data;
    }

    try {
      state.campaigns.isLoading = true;
      const campaigns = await fetchUniboxCampaigns();
      state.campaigns.data = campaigns || [];
      return state.campaigns.data;
    } catch (error) {
      return state.campaigns.data;
    } finally {
      state.campaigns.isLoading = false;
    }
  };

  // Fetches reply categories with in-memory caching in the store
  const fetchReplyCategories = async ({ force = false } = {}) => {
    if (state.replyCategories.data.length > 0 && !force) {
      return state.replyCategories.data;
    }

    try {
      state.replyCategories.isLoading = true;
      const categories = await fetchUniboxReplyCategories();
      state.replyCategories.data = categories || [];
      return state.replyCategories.data;
    } catch (error) {
      return state.replyCategories.data;
    } finally {
      state.replyCategories.isLoading = false;
    }
  };

  const resetUniboxState = () => {
    state.events.secondarySidebarClickEvent = null;
    state.counters.inboxUnreadCount = 0;
    state.counters.untrackedRepliesCount = 0;
    state.campaigns.data = [];
    state.replyCategories.data = [];
  };

  return {
    // state
    ...toRefs(state),

    // computed
    getSecondarySidebarClickEvent,
    getInboxUnreadCount,
    getUntrackedRepliesCount,
    getCampaignsList,
    getCampaignsLoading,
    getReplyCategoriesList,
    getReplyCategoriesLoading,

    // methods
    setField,
    setMultipleFields,
    fetchCampaigns,
    fetchReplyCategories,
    resetUniboxState,
  };
});
