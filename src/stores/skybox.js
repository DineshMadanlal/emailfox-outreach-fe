// pinia
import { defineStore } from 'pinia';

// vue
import { computed, reactive, toRefs } from 'vue';

export const useSkyboxStore = defineStore('storeSkybox', () => {
  // state
  const state = reactive({
    preferencesMiniState: false,

    allFolders: [],
    baseMailFolders: [],

    selectedFolderJson: {},

    secondarySiderbarClickEvent: null,
  });

  // computed
  const getAllFolders = computed(() => state.allFolders);
  const getSelectedFolderJson = computed(() => state.selectedFolderJson);
  const getBaseMailFolders = computed(() => state.baseMailFolders || []);
  const getPreferencesMiniState = computed(() => state.preferencesMiniState);
  const getSecondarySiderbarClickEvent = computed(() => state.secondarySiderbarClickEvent);

  // methods
  const setField = ({ field, value }) => {
    state[field] = value;
  };

  const setMultipleFields = (fields) => {
    Object.keys(fields).forEach((field) => {
      state[field] = fields[field];
    });
  };

  const togglePreferencesMiniState = () => {
    state.preferencesMiniState = !state.preferencesMiniState;
  };

  return {
    // state
    ...toRefs(state),

    // computed
    getAllFolders,
    getBaseMailFolders,
    getSelectedFolderJson,
    getPreferencesMiniState,
    getSecondarySiderbarClickEvent,

    // methods
    setField,
    setMultipleFields,
    togglePreferencesMiniState,
  };
});
