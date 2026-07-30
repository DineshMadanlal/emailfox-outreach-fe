// pinia
import { defineStore } from 'pinia';

// vue
import { reactive, computed, toRefs } from 'vue';

export const useCustomerStore = defineStore('storeCustomer', () => {
  // state
  const state = reactive({
    brandingData: {},

    //
    allCustomersTableData: [],
    allCustomersPreference: {},

    customScripts: [],
  });

  // computed
  const getBrandingData = computed(() => state.brandingData);
  const getCustomScripts = computed(() => state.customScripts);

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
    getCustomScripts,

    // methods
    setField,
    setMultipleFields,
  };
});
