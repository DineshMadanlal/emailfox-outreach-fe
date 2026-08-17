<template>
  <div class="all-lists-container">
    <!-- Dialog -->
    <q-dialog
      v-model="showSaveListNameModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveListName
        @newCreatedList="onNewCreatedList"
      />
    </q-dialog>

    <!-- Header -->
    <AppHeader
      title="Lists"
    >
      <template v-slot:headerRightSection>
        <div class="all-lists-header-filter-section">
          <!-- search input -->
          <AppSearchInput
            :debounce="500"
            v-model="searchListInput"

            class="list-filter-input"
            placeholder="Search list..."
            v-if="showListsFilters"

            @update:modelValue="onSearchInput"
          />

          <!-- New List -->
          <q-btn
            no-caps
            unelevated

            color="primary"
            label="+ New List"
            class="new-list-btn"

            @click="onCreateNewList"

            v-if="!showAllListsIllustration"
          >
          </q-btn>
        </div>
      </template>
    </AppHeader>

    <!-- Loader -->
    <ApiLoader
      :show="true"

      v-if="showApiLoader"
    />

    <div
      v-else
      class="lists-table-content-container"
    >
      <AllListsIllustration
        v-if="showAllListsIllustration"

        @createList="onCreateNewList"
      >
      </AllListsIllustration>

      <!--  -->
      <q-table
        v-else

        v-model:pagination="pagination"

        separator="cell"
        class="app-table all-lists-table app-paginated-table no-border-left"

        :rows="tableData"
        :columns="tableColumns"
        :loading="isApiProcessing"
        v-model:selected="selectedLists"

        @request="onRequest"
      >
        <!-- bottom -->
        <template v-slot:bottom="scope">
          <div class="table-bottom-block">
            <!-- Records per page -->
            <div class="flex no-wrap items-center">
              <p class="records-per-page-label">
                Show
              </p>

              <!-- Select Dropdown -->
              <q-select
                dense
                outlined
                options-dense
                hide-bottom-space

                behavior="menu"
                dropdown-icon="keyboard_arrow_down"

                :options="[5, 10, 20, 30, 50]"
                v-model="pagination.rowsPerPage"

                @update:model-value="onFetchAllLists"

                class="records-per-page-select"
              >
              </q-select>

              <p class="records-per-page-label">
                per page
              </p>
            </div>

            <q-space />

            <div class="flex no-wrap items-center">
              <!-- left arrow button -->
              <q-btn
                flat
                no-caps
                unelevated

                color="primary"
                class="pagination-btn"

                :disable="scope.isFirstPage"
                :class="{ 'btn-disabled': scope.isFirstPage }"

                @click="scope.prevPage"
              >
                <!-- Left Arrow -->
                <div class="pagination-btn-content">
                  <LocalSvgIcon
                    image="plain-down-arrow"
                    classes="pagination-icon left-arrow"
                  />
                </div>
              </q-btn>

              <p class="table-pagination-label">
                {{ tablePaginationLabel }}
              </p>

              <!-- right arrow button -->
              <q-btn
                flat
                no-caps
                unelevated

                color="primary"
                class="pagination-btn"

                :disable="scope.isLastPage"
                :class="{ 'btn-disabled': scope.isLastPage }"

                @click="scope.nextPage"
              >
                <!-- Right Arrow -->
                <div class="pagination-btn-content">
                  <LocalSvgIcon
                    image="plain-down-arrow"
                    classes="pagination-icon right-arrow"
                  />
                </div>
              </q-btn>
            </div>
          </div>
        </template>

        <!-- Content -->
        <!-- Name -->
        <template v-slot:body-cell-name="props">
          <q-td
            :props="props"
            class="list-table-td"
          >
            <router-link
              :to="`/outreach/lists/view/${props.row.id}`"
              class="list-contacts-route-link"
            >
              <div class="flex no-wrap">
                <LocalSvgIcon
                  image="folder"
                  classes="folder-icon"
                />

                <div>
                  <div class="list-name-text">
                    {{ props.row.name }}
                  </div>

                  <div class="list-time-text">
                    Created on {{ formatDateWithTime(props.row.created_at) }}
                  </div>
                </div>
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Contacts Count -->
        <template v-slot:body-cell-contactsCount="props">
          <q-td :props="props">
            <router-link
              :to="`/outreach/lists/view/${props.row.id}`"
              class="list-contacts-route-link"
            >
              110
            </router-link>
          </q-td>
        </template>

        <!-- Updated at -->
        <template v-slot:body-cell-updatedAt="props">
          <q-td :props="props">
            <router-link
              :to="`/outreach/lists/view/${props.row.id}`"
              class="list-contacts-route-link"
            >
              {{ formatDateWithTime(props.row.updated_at) }}
            </router-link>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
// lodash
import size from 'lodash/size';
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, onMounted, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// router
import { useRouter } from 'vue-router';

// quasar
import { useMeta } from 'quasar';

// Components
import AppHeader from 'components/Headers/AppHeader.vue';
import ApiLoader from 'components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import AllListsIllustration from 'components/Illustrations/AllLists.vue';
import SaveListName from 'components/Lists/Modals/SaveListName.vue';

// utils
import { formatDateWithTime } from 'src/utils/dates';
import { getApiCall } from 'src/utils/apiRequests';
import { getNumeralAmount } from 'src/utils/numbers';

// store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { DEFAULT_TABLE_PAGINATION, TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';

export default defineComponent({
  name: 'AllLists',

  components: {
    AppHeader,
    ApiLoader,
    AppSearchInput,
    AllListsIllustration,
    SaveListName,
  },

  setup() {
    // vue router
    const $router = useRouter();

    // store
    const userStore = useUserPreferencesStore();

    // instance
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice, generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('All Lists'));

    // state
    const state = reactive({
      isMounted: false,

      searchListInput: '',

      isApiProcessing: false,
      areResultsFetchedOnce: false,

      tableData: [],

      // pagination
      pagination: {},

      // multi select lists
      selectedLists: [],
      multiSelectOptionJson: {},
      showTableMultiSelectMenu: false,

      selectedListJson: null,
      showDeleteListModal: false,

      // modals
      showSaveListNameModal: false,
    });

    // computed
    const localStoredPagination = computed(() => userStore.allListsPreferences?.pagination
      || DEFAULT_TABLE_PAGINATION);

    const showApiLoader = computed(() => {
      if (state.areResultsFetchedOnce) {
        return false;
      }

      return state.isApiProcessing;
    });

    const isFilterApplied = computed(() => {
      if (isEmpty(state.searchListInput)) {
        return false;
      }

      return true;
    });

    const showListsFilters = computed(() => {
      if (isFilterApplied.value) {
        return true;
      }

      return state.pagination.rowsNumber !== 0;
    });

    const showAllListsIllustration = computed(() => {
      if (state.isApiProcessing || !state.areResultsFetchedOnce || isFilterApplied.value) {
        return false;
      }

      return state.pagination.rowsNumber === 0;
    });

    const tablePaginationLabel = computed(() => {
      const { page, perPage, rowsNumber } = state.pagination;

      const start = (page - 1) * perPage + 1;
      const end = page * perPage;

      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    const selectedListsLength = computed(() => size(state.selectedLists));

    const tableColumns = computed(() => {
      const columns = [
        {
          name: 'name',
          label: 'Name',
          align: 'left',
        },
        // {
        //   name: 'contactsCount',
        //   label: 'Total Contacts',
        //   align: 'left',
        // },
        {
          name: 'updatedAt',
          label: 'Last Updated',
          align: 'left',
        },
      ];

      return columns;
    });

    // methods
    const updateMultiSelect = (multiSelectOptionJson) => {
      state.multiSelectOptionJson = multiSelectOptionJson;

      if (multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST
        || multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        state.selectedLists = state.tableData;
      } else {
        // limit number
        state.selectedLists = state.tableData
          .slice(0, multiSelectOptionJson.limitNumber);
      }

      state.showTableMultiSelectMenu = false;
    };

    // API Calls
    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.isApiProcessing = true;

        const params = {
          offset: (page - 1) * perPage,
          limit: perPage,
          search_text: state.searchListInput,
        };

        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: '/lists',
          params,
        });

        const { data, count } = response;

        state.tableData = data;

        state.selectedLists = [];
        state.multiSelectOptionJson = {};

        state.pagination.rowsNumber = count;

        // store in pinia
        userStore.setMultipleFields({
          allListsTableData: state.tableData,
          allListsPreferences: {
            pagination: state.pagination,
            filterDomainId: state.filterDomainId,
            searchListInput: state.searchListInput,
          },
        });
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occured. Unable to fetch lists.',
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    const onRequest = async (params) => {
      state.isApiProcessing = true;

      state.pagination.page = params.pagination.page;
      state.pagination.perPage = params.pagination.rowsPerPage;

      await fetchData(
        state.pagination.page,
        state.pagination.perPage,
      );

      if (!state.areResultsFetchedOnce) {
        // make it true
        state.areResultsFetchedOnce = true;
      }
    };

    const onFetchAllLists = () => {
      onRequest({
        pagination: state.pagination,
      });
    };

    const onTableRowSelect = () => {
      if (state.tableData.length === state.selectedLists.length) {
        state.multiSelectOptionJson = {
          limit: state.tableData.length,
          selectedOption: TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST,
        };
      } else {
        state.multiSelectOptionJson = null;
      }
    };

    const resetTableMultiSelect = () => {
      state.multiSelectOptionJson = {};

      state.selectedLists = [];
    };

    const onDeleteList = (propsRow) => {
      state.selectedListJson = propsRow;

      state.showDeleteListModal = true;
    };

    const onSuccessfulDeleteList = () => {
      state.showDeleteListModal = false;

      // remove the entry from the table
      state.tableData = state.tableData.filter(
        (list) => list.id !== state.selectedListJson.id,
      );

      state.selectedListJson = null;
    };

    const onSearchInput = async () => {
      onFetchAllLists();
    };

    const makeApiCallOnMounted = () => {
      //
      state.pagination = localStoredPagination.value;

      state.tableData = userStore.allListsTableData || [];
      state.searchListInput = userStore.allListsPreferences?.searchListInput || '';

      state.areResultsFetchedOnce = !isEmpty(state.tableData);

      onRequest({
        pagination: state.pagination,
      });
    };

    const onCreateNewList = () => {
      state.showSaveListNameModal = true;
    };

    const onNewCreatedList = (newListJson) => {
      state.showSaveListNameModal = false;

      $router.push(`/outreach/contacts/${newListJson.id}/upload`);
    };

    onMounted(() => {
      state.isMounted = true;

      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      tableColumns,
      showApiLoader,
      isFilterApplied,
      showListsFilters,
      selectedListsLength,
      localStoredPagination,
      tablePaginationLabel,
      showAllListsIllustration,

      // methods
      onRequest,
      onDeleteList,
      onTableRowSelect,
      onSuccessfulDeleteList,
      resetTableMultiSelect,
      updateMultiSelect,
      onSearchInput,
      onFetchAllLists,
      onCreateNewList,

      formatDateWithTime,
      onNewCreatedList,

      // constants
      TABLE_MULTI_SELECT_OPTIONS,
    };
  },
});
</script>

<style lang="scss" scoped>
.all-lists-header-filter-section {
  display: flex;
  gap: 12px;
  align-items: center;

  .list-filter-input {
    width: 260px;
  }

  @media (max-width: $breakpoint-xs-max) {
    gap: 8px;

    .list-filter-input {
      width: 100%;
    }

    .new-list-btn {
      white-space: nowrap;
    }
  }
}

.all-lists-container {
  width: 100%;
  flex: 1;
  display: flex;
  min-height: 0;
  flex-direction: column;

  .lists-table-content-container {
    width: 100%;
    position: relative;
    min-height: 0;

    display: flex;
    flex-direction: column;

    .all-lists-table {
      border-top: 0px;

      display: grid;
      min-height: 0;

      :deep(.q-table__middle) {
        height: 100%;
        overflow-x: auto;
        overflow-y: auto;
      }

      .list-table-td {
        padding-top: 16px;
        padding-bottom: 16px;
      }

      .list-contacts-route-link {
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
        text-decoration: unset;

        color: $black;

        :deep(.folder-icon) {
          margin-right: 8px;
          @include svg-icon-stroke('path', $primary);
        }

        .list-name-text {
          color: $black;
          font-size: 14px;
          font-weight: 500;
          line-height: 16px;

          margin-bottom: 4px;
        }

        .list-time-text {
          color: $grey-700;
          font-size: 14px;
          font-weight: 400;
          line-height: 16px; /* 114.286% */
        }
      }
    }
  }
}
</style>
