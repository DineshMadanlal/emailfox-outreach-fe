// pinia
import { defineStore } from 'pinia';

// vue
import { reactive, computed, toRefs } from 'vue';

export const storeExclusions = defineStore('storeExclusions', () => {
  // state
  const state = reactive({
    // app left drawer
    leftDrawerOpen: false,

    /** main header height of the pages */
    appHeaderHeight: 68,

    /** The field will be used in domain by ID add mailbox */
    domainByIdJson: {},
    domainByIdEngagement: {},

    domainByIdSystemStatus: {},

    /** The field will be used in customer by ID */
    customerByIdJson: {},

    //
    sequenceByIdJson: {},

    externalDomainJson: {},
  });

  // computed
  const isLeftDrawerOpen = computed(() => state.leftDrawerOpen);
  const getDomainByIdJson = computed(() => state.domainByIdJson);
  const getExternalDomainJson = computed(() => state.externalDomainJson);
  const getDomainByIdEngagement = computed(() => state.domainByIdEngagement);
  const getDomainByIdSystemStatus = computed(() => state.domainByIdSystemStatus);
  const getCustomerByIdJson = computed(() => state.customerByIdJson);

  // methods
  const setField = ({ field, value }) => {
    state[field] = value;
  };

  const setMultipleFields = (fields) => {
    Object.keys(fields).forEach((field) => {
      state[field] = fields[field];
    });
  };

  const toggleLeftDrawer = () => {
    state.leftDrawerOpen = !state.leftDrawerOpen;
  };

  return {
    // state
    ...toRefs(state),

    // computed
    isLeftDrawerOpen,
    getDomainByIdJson,
    getExternalDomainJson,
    getDomainByIdEngagement,
    getDomainByIdSystemStatus,
    getCustomerByIdJson,

    // methods
    setField,
    setMultipleFields,
    toggleLeftDrawer,
  };
});
