<template>
  <div class="team-members-rows">
    <!-- Edit Member -->
    <q-dialog
      v-model="showEditMemberModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <EditMember
        :editMemberData="editMemberData"

        @onMemberUpdated="onUpdateMemberDetails"
      />
    </q-dialog>

    <!-- Delete Member -->
    <q-dialog
      v-model="showDeleteMemberModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteMember
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
      class="team-members-table-container"
    >
      <!-- Illustration -->
      <TeamMembersIllustration
        @invite="$emit('inviteMember')"

        v-if="showEmptyState"
      />

      <!-- Show Filters -->
      <div
        v-if="showTableFilters && isMounted"
        class="team-members-table-filters"
      >
        <!-- search input -->
        <AppSearchInput
          :debounce="500"
          v-model="searchInput"

          class="member-filter-input"
          placeholder="Search members"

          @update:modelValue="onSearchInput"
        />

        <!-- Filter button -->
        <MoreFilters
          :buttonLabel="moreFilterLabel"
          :isFilterApplied="moreFilterAppliedCount > 0"

          class="member-more-filter-btn"
        >
          <FilterTeamMembers
            v-model:selectedRoles="selectedRoles"
            v-model:selectedStatuses="selectedStatuses"

            @update:selectedRoles="onFetchTableData"
            @update:selectedStatuses="onFetchTableData"
          />
        </MoreFilters>

        <!-- Reset Filter Button -->
        <ResetFiltersButton
          v-if="moreFilterAppliedCount > 0"

          @click="onResetFilters"
        />
      </div>

      <!-- Whenever pagination is needed. Add the below line in q-table
      v-model:pagination="pagination"
      and remove the below line
      :pagination="TABLE_PAGINATION" -->
      <q-table
        hide-pagination
        :pagination="TABLE_PAGINATION"

        class="app-table app-table-rows-fixed team-members-table app-paginated-table"

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

                v-if="props.row.role !== TEAM_MEMBER_ROLES.SUPER_ADMIN.value"
              >
                <!-- more -->
                <LocalSvgIcon
                  image="more"
                  classes="more-menu-icon"
                />

                <TeamMembersMoreOptions
                  :tableRow="props.row"

                  @editMember="onEditMember"
                  @deleteMember="onDeleteMember"
                  @reinviteMember="onReinviteMember"
                  @resendInvitation="onResendInvitation"
                  @deactivateMember="onUpdateMemberActiveStatus"
                  @reactivateMember="onUpdateMemberActiveStatus"
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
              {{ TEAM_MEMBER_ROLES[props.row.role]?.label }}
            </div>
          </q-td>
        </template>

        <!-- Date Joined -->
        <template v-slot:body-cell-date_joined="props">
          <q-td :props="props">
            <div
              class="invited-date-text"
              v-if="props.row.status === TEAM_MEMBER_STATUS.invitation_pending.value"
            >
              Invited on {{ formatDateTimeWithYear(props.row.joined_at) }}
            </div>
            <div v-else>
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
              :style="getStatusStyle(TEAM_MEMBER_STATUS[props.row.status])"

              v-if="props.row.is_active"
            >
              {{ TEAM_MEMBER_STATUS[props.row.status]?.label }}
            </div>

            <!-- Inactive -->
            <div
              class="status-text"
              :style="getStatusStyle({ color: 'grey' })"

              v-else
            >
              Inactive
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
import MoreFilters from 'components/Buttons/MoreFilters.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import EditMember from 'components/Workspaces/Modals/EditMember.vue';
import DeleteMember from 'components/Workspaces/Modals/DeleteMember.vue';
import TeamMembersMoreOptions from 'components/Menu/TeamMembersMoreOptions.vue';
import TeamMembersIllustration from 'components/Illustrations/TeamMembers.vue';
import FilterTeamMembers from 'components/Menu/FilterTeamMembers.vue';
import ResetFiltersButton from 'components/Buttons/ResetFilters.vue';

// Utils
import { getApiCall, patchApiCall, postApiCall } from 'src/utils/apiRequests';
import { getNumeralAmount } from 'src/utils/numbers';
import { formatDateTimeWithYear } from 'src/utils/dates';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { TEAM_MEMBER_ROLES, TEAM_MEMBER_STATUS } from 'boot/workspace-constants';
import { DEFAULT_TABLE_PAGINATION, TABLE_MULTI_SELECT_OPTIONS, TABLE_PAGINATION } from 'boot/constants';

export default defineComponent({
  name: 'TeamMembersTable',

  emits: ['inviteMember'],

  components: {
    ApiLoader,
    MoreFilters,
    EditMember,
    DeleteMember,
    AppSearchInput,
    FilterTeamMembers,
    TeamMembersMoreOptions,
    TeamMembersIllustration,
    ResetFiltersButton,
  },

  setup() {
    // instance
    const { appContext } = getCurrentInstance();

    const { isMobileDevice, showQuasarLoader, hideQuasarLoader } = useAppHelpersApi();

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

      // modal
      editMemberData: {},
      showEditMemberModal: false,

      // filters
      selectedRoles: [],
      selectedStatuses: [],

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
      if (isEmpty(state.searchInput)
        && isEmpty(state.selectedRoles)
        && isEmpty(state.selectedStatuses)
      ) {
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

    const moreFilterAppliedCount = computed(() => {
      if (isFilterApplied.value) {
        return size(state.selectedRoles) + size(state.selectedStatuses);
      }

      return 0;
    });

    const moreFilterLabel = computed(() => {
      if (moreFilterAppliedCount.value) {
        return `${moreFilterAppliedCount.value} Filter${moreFilterAppliedCount.value > 1 ? 's' : ''} Applied`;
      }

      return 'Filters';
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
          name: 'date_joined',
          label: 'Date Joined',
          field: 'date_joined',
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

        if (state.selectedRoles.length) {
          params.role = state.selectedRoles;
        }

        if (state.selectedStatuses.length) {
          params.status = state.selectedStatuses;
        }

        const response = await getApiCall({
          endpoint: '/users/members',
          params,
        });

        state.tableData = response;

        state.selectedData = [];
        state.multiSelectOptionJson = {};

        state.pagination.rowsNumber = size(response);
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

    const onDeleteMember = (propsRow) => {
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

    const getStatusStyle = (status) => {
      const color = status.color || 'positive';
      const rgbVar = `--${color}-rgb`;

      return {
        color: `rgb(var(${rgbVar}))`,
        backgroundColor: `rgba(var(${rgbVar}), 0.1)`,
        border: `1px solid rgba(var(${rgbVar}), 0.2)`,
      };
    };

    const onEditMember = (inputJson) => {
      state.editMemberData = inputJson;
      state.showEditMemberModal = true;
    };

    const onReinviteMember = async (inputJson) => {
      try {
        showQuasarLoader();

        await postApiCall({
          endpoint: '/invite-members',
          payload: {
            email: inputJson.email,
            role: inputJson.role,
            name: inputJson.name || '',
            re_invite: true,
          },
        });

        appContext.config.globalProperties.$toast({
          message: 'Invitation resent successfully',
        });

        onFetchTableData();
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        hideQuasarLoader();
      }
    };

    const onResendInvitation = async (inputJson) => {
      try {
        showQuasarLoader();

        const endpoint = `/members/${inputJson.user_id}/resend-invitation`;

        await postApiCall({ endpoint });

        appContext.config.globalProperties.$toast({
          message: 'Invitation resent successfully',
        });

        onFetchTableData();
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        hideQuasarLoader();
      }
    };

    const onUpdateMemberActiveStatus = async (inputJson) => {
      try {
        showQuasarLoader();

        const endpoint = `/members/${inputJson.user_id}`;

        await patchApiCall({
          endpoint,
          payload: {
            is_active: !inputJson.is_active,
          },
        });

        appContext.config.globalProperties.$toast({
          message: 'Member deactivated successfully',
        });

        onFetchTableData();
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        hideQuasarLoader();
      }
    };

    const makeApiCallOnMounted = () => {
      state.pagination = localStoredPagination.value;

      onRequest({
        pagination: state.pagination,
      });
    };

    const onUpdateMemberDetails = (updatedMemberData) => {
      // update the table data with the updated member data
      state.tableData = state.tableData.map((member) => {
        if (member.user_id === updatedMemberData.user_id) {
          return {
            ...member,
            ...updatedMemberData,
          };
        }

        return member;
      });

      state.showEditMemberModal = false;
    };

    const onResetFilters = () => {
      state.selectedRoles = [];
      state.selectedStatuses = [];

      onFetchTableData();
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
      isFilterApplied,
      moreFilterLabel,
      moreFilterAppliedCount,
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
      onDeleteMember,
      onSearchInput,
      onFetchTableData,
      onTableRowSelect,
      updateMultiSelect,
      onSuccessfulDeleteRow,
      resetTableMultiSelect,
      getStatusStyle,
      onEditMember,
      onUpdateMemberDetails,
      onResetFilters,

      onReinviteMember,
      onResendInvitation,
      onUpdateMemberActiveStatus,

      // hardcoded
      TEAM_MEMBER_ROLES,
      TEAM_MEMBER_STATUS,
      TABLE_PAGINATION,
    };
  },
});
</script>

<style lang="scss" scoped>
.team-members-rows {
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;

  position: relative;

  .team-members-table-container {
    width: 100%;
    position: relative;
    min-height: 0;

    display: flex;
    flex-direction: column;

    .team-members-table-filters {
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

    :deep(.team-members-table) {
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

      .invited-date-text {
        color: $grey;
        font-size: 14px;
        font-style: italic;
        font-weight: 400;
        line-height: 16px; /* 114.286% */
      }

      .status-text {
        width: fit-content;
        border-radius: 4px;

        padding: 0px 6px;

        font-size: 12px;
        font-weight: 500;
        line-height: 14px;
      }
    }
  }
}
</style>
