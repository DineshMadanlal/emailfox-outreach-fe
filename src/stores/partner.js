// pinia
import { defineStore } from 'pinia';

// vue
import { reactive, computed, toRefs } from 'vue';

export const usePartnerStore = defineStore('storePartner', () => {
  // state
  const state = reactive({
    brandingData: {},
  });

  // computed
  const getBrandingData = computed(() => state.brandingData);

  // methods
  const setField = ({ field, value }) => {
    state[field] = value;
  };

  const setMultipleFields = (fields) => {
    Object.keys(fields).forEach((field) => {
      state[field] = fields[field];
    });
  };

  return {
    // state
    ...toRefs(state),

    // computed
    getBrandingData,

    // methods
    setField,
    setMultipleFields,
  };
});
