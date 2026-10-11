// pinia
import { defineStore } from 'pinia';

// vue
import { computed, reactive, toRefs } from 'vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';

export const useTagsStore = defineStore('storeTags', () => {
  // state
  const state = reactive({
    tagsList: [],
    totalCount: 0,
    isApiLoading: false,
    hasFetchedOnce: false,
  });

  // computed / getters
  const getTagsList = computed(() => state.tagsList);
  const getIsApiLoading = computed(() => state.isApiLoading);
  const getTotalCount = computed(() => state.totalCount);

  // Getter functions for lookups by ID(s)
  const getTagById = computed(() => (id) => {
    if (!id) return null;
    return state.tagsList.find((tag) => String(tag.id) === String(id)) || null;
  });

  const getTagsByIds = computed(() => (idsArray = []) => {
    if (!Array.isArray(idsArray) || idsArray.length === 0) return [];
    return idsArray
      .map((id) => getTagById.value(id))
      .filter(Boolean);
  });

  // methods
  const setField = ({ field, value }) => {
    if (field in state) {
      state[field] = value;
    }
  };

  /**
   * Fetches all workspace tags in batches of 50 and stores them in Pinia.
   * Caches in memory unless `force: true` is passed.
   */
  const fetchTags = async ({ force = false } = {}) => {
    if (state.hasFetchedOnce && !force) {
      return state.tagsList;
    }

    try {
      state.isApiLoading = true;

      const limit = 50;
      let offset = 0;
      let hasNext = true;
      let allTags = [];
      let totalCount = 0;

      // eslint-disable-next-line no-await-in-loop
      while (hasNext) {
        // eslint-disable-next-line no-await-in-loop
        const response = await getApiCall({
          endpoint: '/tags',
          params: {
            limit,
            offset,
          },
          includeWorkspace: true,
        });

        const batch = response?.data || [];
        allTags = [...allTags, ...batch];
        totalCount = response?.count || allTags.length;
        hasNext = !!response?.has_next;

        offset += limit;

        // Safety break if batch is empty or exceeds total count
        if (batch.length === 0 || allTags.length >= totalCount) {
          break;
        }
      }

      state.tagsList = allTags;
      state.totalCount = totalCount;
      state.hasFetchedOnce = true;

      return state.tagsList;
    } catch (error) {
      return state.tagsList;
    } finally {
      state.isApiLoading = false;
    }
  };

  const addTagToList = (newTag) => {
    if (!newTag || !newTag.id) return;
    const exists = state.tagsList.some((t) => t.id === newTag.id);
    if (!exists) {
      state.tagsList.unshift(newTag);
      state.totalCount += 1;
    }
  };

  const updateTagInList = (updatedTag) => {
    if (!updatedTag || !updatedTag.id) return;
    const index = state.tagsList.findIndex((t) => t.id === updatedTag.id);
    if (index !== -1) {
      state.tagsList[index] = {
        ...state.tagsList[index],
        ...updatedTag,
      };
    } else {
      addTagToList(updatedTag);
    }
  };

  const deleteTagFromList = (tagId) => {
    if (!tagId) return;
    state.tagsList = state.tagsList.filter((t) => String(t.id) !== String(tagId));
    state.totalCount = Math.max(0, state.totalCount - 1);
  };

  const resetTagsState = () => {
    state.tagsList = [];
    state.totalCount = 0;
    state.isApiLoading = false;
    state.hasFetchedOnce = false;
  };

  return {
    // state
    ...toRefs(state),

    // computed / getters
    getTagsList,
    getIsApiLoading,
    getTotalCount,
    getTagById,
    getTagsByIds,

    // methods
    setField,
    fetchTags,
    addTagToList,
    updateTagInList,
    deleteTagFromList,
    resetTagsState,
  };
});
