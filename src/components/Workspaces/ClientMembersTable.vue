<template>
  <div class="client-members-rows">
    <!-- Delete Member -->
    <q-dialog
      v-model="showDeleteMemberModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteMember
        isClient
        :selectedTableDataJson="selectedTableDataJson"

        @memberDeleted="onSuccessfulDeleteRow"
      />
    </q-dialog>

    <!-- Loader -->
    <ApiLoader
      show

      v-if="showApiLoader"
    />

    <div
      v-else
      class="client-members-table-container"
    >
      <!-- Illustration -->
      <ClientMembersIllustration
        @create="$emit('inviteMember')"

        v-if="showEmptyState"
      />

      <!-- Show Filters -->
      <div
        v-if="showTableFilters && isMounted"
        class="members-table-filters-section"
      >
        <!-- search input -->
        <AppSearchInput
          :debounce="500"
          v-model="searchInput"

          class="member-filter-input"
          placeholder="Search client members"

          @update:modelValue="onSearchInput"
        />
      </div>

      <!-- Whenever pagination is needed. Add the below line in q-table
      v-model:pagination="pagination"
      and remove the below line
      :pagination="TABLE_PAGINATION" -->
      <q-table
        hide-pagination
        :pagination="TABLE_PAGINATION"

        class="app-table app-table-rows-fixed client-members-table app-paginated-table"

        :rows="tableData"
        :columns="tableColumns"
        :loading="isApiProcessing"
        v-model:selected="selectedData"

        @request="onRequest"

        v-if="!showEmptyState"
      >
        <!-- bottom -->
        <template
          v-if="false"
          v-slot:bottom="scope"
        >
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

                @update:model-value="onFetchTableData"

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
        <!-- Email -->
        <template v-slot:body-cell-email="props">
          <q-td :props="props">
            <div class="email-and-action-cell">
              <div class="email-text">
                {{ props.row.email }}
              </div>

              <q-space />

              <!-- more options -->
              <q-btn
                dense
                outlined
                unelevated
                @click.stop.prevent

                class="more-action-btn"
              >
                <!-- more -->
                <LocalSvgIcon
                  image="more"
                  classes="more-menu-icon"
                />

                <ClientMemberMoreOptions
                  :tableRow="props.row"

                  @deleteClient="onDeleteClient"
                />
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- name -->
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div class="name-cell">
              <div class="name-text">
                {{ props.row.name || 'NA' }}
              </div>
            </div>
          </q-td>
        </template>

        <!-- Role -->
        <template v-slot:body-cell-role="props">
          <q-td :props="props">
            <div>
              {{ CLIENT_MEMBER_ROLES[props.row.role].label }}
            </div>
          </q-td>
        </template>

        <!-- Date Created -->
        <template v-slot:body-cell-date_created="props">
          <q-td :props="props">
            <div>
              {{ formatDateTimeWithYear(props.row.created_at) }}
            </div>
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <!-- Active -->
            <div
              class="status-text"
              :class="{
                active: props.row.status === CLIENT_MEMBER_STATUS.active.value,
              }"
            >
              {{ props.row.status }}
            </div>
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
  defineComponent, reactive, toRefs, computed, getCurrentInstance, onMounted,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import DeleteMember from 'components/Workspaces/Modals/DeleteMember.vue';
import ClientMemberMoreOptions from 'components/Menu/ClientMemberMoreOptions.vue';
import ClientMembersIllustration from 'components/Illustrations/ClientMembers.vue';

// Utils
import { getApiCall } from 'src/utils/apiRequests';
import { getNumeralAmount } from 'src/utils/numbers';
import { formatDateTimeWithYear } from 'src/utils/dates';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import {
  DEFAULT_TABLE_PAGINATION,
  TABLE_MULTI_SELECT_OPTIONS, TABLE_PAGINATION,
} from 'boot/constants';
import { CLIENT_MEMBER_STATUS, CLIENT_MEMBER_ROLES } from 'boot/workspace-constants';

export default defineComponent({
  name: 'ClientMembersTable',

  emits: ['inviteMember'],

  components: {
    ApiLoader,
    AppSearchInput,
    DeleteMember,
    ClientMemberMoreOptions,
    ClientMembersIllustration,
  },

  setup() {
    // instance
    const { appContext } = getCurrentInstance();

    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      searchInput: '',

      isApiProcessing: false,
      areResultsFetchedOnce: false,

      tableData: [],

      // pagination
      pagination: {},

      // multi select contacts
      selectedData: [],
      multiSelectOptionJson: {},
      showTableMultiSelectMenu: false,

      selectedTableDataJson: null,
      showDeleteMemberModal: false,

      isMounted: false,
    });

    // computed
    const localStoredPagination = computed(() => DEFAULT_TABLE_PAGINATION);

    const showApiLoader = computed(() => {
      if (state.areResultsFetchedOnce) {
        return false;
      }

      return state.isApiProcessing;
    });

    const isFilterApplied = computed(() => {
      if (isEmpty(state.searchInput)) {
        return false;
      }

      return true;
    });

    const showTableFilters = computed(() => {
      if (isFilterApplied.value) {
        return true;
      }

      return state.pagination.rowsNumber !== 0;
    });

    const showEmptyState = computed(() => {
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

    const selectedTableDataCount = computed(() => size(state.selectedData));

    const tableColumns = computed(() => {
      const columns = [
        {
          name: 'email',
          label: 'Email',
          field: 'email',
          align: 'left',
        },
        {
          name: 'name',
          label: 'Name',
          field: 'name',
          align: 'left',
        },
        {
          name: 'role',
          label: 'Role',
          field: 'role',
          align: 'left',
        },
        {
          name: 'date_created',
          label: 'Date Joined',
          field: 'date_created',
          align: 'left',
        },
        {
          name: 'status',
          label: 'Status',
          field: 'status',
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
        state.selectedContacts = state.tableData;
      } else {
        // limit number
        state.selectedContacts = state.tableData
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
        };

        if (state.searchInput) {
          params.search_text = state.searchInput;
        }

        const response = await getApiCall({
          params,
          endpoint: '/clients',
          includeWorkspace: true,
        });

        state.tableData = response;

        state.selectedData = [];
        state.multiSelectOptionJson = {};

        // state.pagination.rowsNumber = response.total_count || 0;
        state.pagination.rowsNumber = size(response) || 0;
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
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

    const onFetchTableData = () => {
      onRequest({
        pagination: state.pagination,
      });
    };

    const onTableRowSelect = () => {
      if (state.tableData.length === state.selectedContacts.length) {
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

      state.selectedData = [];
    };

    const onDeleteClient = (propsRow) => {
      state.selectedTableDataJson = propsRow;

      state.showDeleteMemberModal = true;
    };

    const onSuccessfulDeleteRow = () => {
      state.showDeleteMemberModal = false;

      // remove the entry from the table
      state.tableData = state.tableData.filter(
        (contact) => contact.user_id !== state.selectedTableDataJson.user_id,
      );

      state.selectedTableDataJson = null;
    };

    const onSearchInput = () => {
      onFetchTableData();
    };

    const makeApiCallOnMounted = () => {
      state.pagination = localStoredPagination.value;

      onRequest({
        pagination: state.pagination,
      });
    };

    onMounted(() => {
      state.isMounted = true;

      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      showApiLoader,
      showTableFilters,
      localStoredPagination,
      showEmptyState,
      tablePaginationLabel,
      selectedTableDataCount,
      tableColumns,
      isMobileDevice,

      // methods
      onRequest,
      formatDateTimeWithYear,
      onDeleteClient,
      onSearchInput,
      onFetchTableData,
      onTableRowSelect,
      updateMultiSelect,
      onSuccessfulDeleteRow,
      resetTableMultiSelect,

      // hardcoded
      TABLE_PAGINATION,
      CLIENT_MEMBER_ROLES,
      CLIENT_MEMBER_STATUS,
    };
  },
});
</script>

<style lang="scss" scoped>
.client-members-rows {
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;

  position: relative;

  .client-members-table-container {
    width: 100%;
    position: relative;
    min-height: 0;

    display: flex;
    flex-direction: column;

    // because it is teleported to another div
    .members-table-filters-section {
      gap: 12px;
      display: flex;
      align-items: center;

      flex-wrap: wrap;

      // variable
      $filterHeight: 28px;
      margin-bottom: 16px;

      .member-filter-input {
        width: 262px;

        :deep(.q-field__inner) {
          .q-field__control,
          .q-field__marginal {
            height: $filterHeight;
          }

          .search-icon {
            height: calc($filterHeight / 2);
            width: calc($filterHeight / 2);
          }
        }
      }

      .member-more-filter-btn {
        height: $filterHeight;
      }
    }

    :deep(.client-members-table) {
      min-height: 0;
      color: $black;
      border: 0px;

      // sm min
      @media (min-width: $breakpoint-sm-min) {
        thead tr th, tbody tr td {
          border-right: 0;
        }
      }

      .name-cell {
        display: flex;
        gap: 12px;
      }

      .email-and-action-cell {
        display: flex;
        gap: 16px;
        align-items: center;

        .more-action-btn {
          .more-menu-icon {
            transform: rotate(90deg);
          }
        }
      }

      .status-text {
        width: fit-content;
        border-radius: 4px;

        padding: 0px 6px;

        font-size: 12px;
        font-weight: 500;
        line-height: 14px;
        text-transform: capitalize;

        color: $grey;
        background-color: rgba(var(--grey-rgb), 0.1);
        border: 1px solidrgba(var(--grey-rgb), 0.1);

        &.active {
          color: $positive;
          background-color: rgba(var(--positive-rgb), 0.1);
          border: 1px solidrgba(var(--positive-rgb), 0.1);
        }
      }
    }
  }
}
</style>
