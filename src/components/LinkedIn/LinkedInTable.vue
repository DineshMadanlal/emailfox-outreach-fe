<template>
  <div class="linkedin-table-container">
    <!-- Header -->
    <AppHeader
      v-if="fromAllLinkedInPage"
      title="LinkedIn Accounts"
    >
      <template v-slot:headerRightSection>

      </template>
    </AppHeader>
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, toRefs, reactive, getCurrentInstance, onMounted,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// components
import AppHeader from 'components/Headers/AppHeader.vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';

// Import the pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// constants
import {
  TABLE_MULTI_SELECT_OPTIONS, DEFAULT_TABLE_PAGINATION,
} from 'boot/constants';

export default defineComponent({
  name: 'LinkedInTable',

  components: {
    AppHeader,
  },

  props: {
    fromAllLinkedInPage: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // store
    const userStore = useUserPreferencesStore();

    //
    const linkedInFilters = {
      searchText: '',
    };

    // instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('LinkedIn Accounts'));

    // state
    const state = reactive({
      loaders: {
        isFetchApi: false,
      },

      tableState: {
        data: [],
        pagination: {},
        areResultsFetchedOnce: false,

        // multi select
        selectedRows: [],
        multiSelectOptionJson: {},
        showTableMultiSelectMenu: false,

        //
        filters: { ...linkedInFilters },
      },

      modals: {

      },
    });

    // methods
    const updateMultiSelect = (multiSelectOptionJson) => {
      state.tableState.multiSelectOptionJson = multiSelectOptionJson;

      if (multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST
        || multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        state.tableState.selectedRows = state.tableState.data;
      } else {
        // limit number
        state.tableState.selectedRows = state.tableState.data
          .slice(0, multiSelectOptionJson.limitNumber);
      }

      state.tableState.showTableMultiSelectMenu = false;
    };

    // API Calls
    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.loaders.isFetchApi = true;

        const params = {
          offset: (page - 1) * perPage,
          limit: perPage,
        };

        const response = await getApiCall({
          params,
          endpoint: '/connected-accounts/linkedin',
          includeWorkspace: true,
        });

        console.log('response', response);
      } catch (error) {
        // Show a toaster
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isFetchApi = false;
      }
    };

    const onRequest = async (params) => {
      state.loaders.isFetchApi = true;

      state.tableState.pagination.page = params.pagination.page;
      state.tableState.pagination.perPage = params.pagination.rowsPerPage;

      await fetchData(
        state.tableState.pagination.page,
        state.tableState.pagination.perPage,
      );

      if (!state.tableState.areResultsFetchedOnce) {
        // make it true
        state.tableState.areResultsFetchedOnce = true;
      }
    };

    const makeApiCallOnMounted = async () => {
      const {
        tableData, filters, pagination,
      } = userStore.linkedInAccountsState || {};

      state.tableState.pagination = pagination || DEFAULT_TABLE_PAGINATION;

      if (props.fromAllLinkedInPage) {
        // prefill
        state.tableState.data = tableData || [];
        state.tableState.filters = filters || { ...linkedInFilters };

        state.tableState.areResultsFetchedOnce = !isEmpty(tableData);
      }

      onRequest({
        pagination: state.tableState.pagination,
      });
    };

    // lifecycle hook
    onMounted(() => {
      makeApiCallOnMounted();
    });

    //
    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      updateMultiSelect,
    };
  },
});
</script>

<style lang="scss" scoped>
.linkedin-table-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  position: relative;
}
</style>
