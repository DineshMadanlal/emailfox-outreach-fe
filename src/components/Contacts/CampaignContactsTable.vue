<template>
  <div class="campaign-contacts-table-container">
    <!-- Loader -->
    <ApiLoader
      :show="true"
      v-if="showApiLoader"
    />

    <div
      v-else
      class="contacts-table-content-container"
    >
      <!-- Illustration -->
      <AllContactsIllustration
        v-if="showAllContactsIllustration"
        :campaignId="campaignId"
      />

      <div
        v-else
        class="contacts-table-filters-section"
      >
        <!-- search input -->
        <AppSearchInput
          v-if="showContactFilters"
          :debounce="500"
          v-model="filters.searchText"
          class="dead-small contact-filter-input"
          placeholder="Search contacts"
          @update:modelValue="onSearchContactInput"
        />
      </div>

      <!-- Table -->
      <q-table
        virtual-scroll
        v-model:pagination="pagination"
        v-model:selected="selectedContacts"
        separator="cell"
        class="app-table app-table-rows-fixed all-contacts-table app-paginated-table no-border-left"
        :rows="tableData"
        :columns="tableColumns"
        :loading="isApiProcessing"
        @request="onRequest"
        v-if="!showAllContactsIllustration"
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
                @update:model-value="onFetchAllContacts"
                class="records-per-page-select"
              />

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

        <!-- Full Name Cell -->
        <template v-slot:body-cell-full_name="props">
          <q-td :props="props">
            <div class="flex items-center no-wrap contact-name-cell">
              <div class="contact-avatar-box">
                {{ getContactInitial(props.row) }}
              </div>
              <span class="contact-name-text ellipsis">
                {{ getContactName(props.row) }}
              </span>
            </div>
          </q-td>
        </template>

        <!-- Email Cell -->
        <template v-slot:body-cell-email="props">
          <q-td :props="props">
            <div class="email-and-action-cell">
              <div class="email-cell-text ellipsis">
                {{ props.row.contact_email || '-' }}
              </div>

              <q-space />

              <div
                class="actions-cell"
                v-if="false"
              >
                <!-- more options -->
                <q-btn
                  dense
                  outlined
                  unelevated
                  @click.stop.prevent
                  class="more-action-btn"
                >
                  <LocalSvgIcon
                    image="more"
                    classes="more-menu-icon"
                  />

                  <ContactsMoreOptions
                    :contactJson="props.row"
                  />
                </q-btn>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Sequence Step Cell -->
        <template v-slot:body-cell-sequence="props">
          <q-td :props="props">
            <div class="step-cell-text">
              {{ props.row.current_step_number !== null
  && props.row.current_step_number !== undefined
  ? props.row.current_step_number : '-' }}
            </div>
          </q-td>
        </template>

        <!-- Status Cell -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <div
              class="status-badge-pill"
              :class="`status-${(props.row.status || '').toLowerCase()}`"
            >
              {{ getStatusLabel(props.row.status) }}
            </div>
          </q-td>
        </template>

        <!-- Last Activity Cell -->
        <template v-slot:body-cell-last_activity="props">
          <q-td :props="props">
            {{ formatLastActivity(props.row) }}
          </q-td>
        </template>

        <!-- Replies Cell -->
        <template v-slot:body-cell-replies="props">
          <q-td :props="props">
            {{ formatLastReply(props.row) }}
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
  defineComponent, reactive, toRefs, computed,
  onMounted, getCurrentInstance,
} from 'vue';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import ContactsMoreOptions from 'components/Menu/ContactsMoreOptions.vue';
import AllContactsIllustration from 'components/Illustrations/AllContacts.vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { getNumeralAmount } from 'src/utils/numbers';
import { formatDateWithTime } from 'src/utils/dates';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// constants
import { DEFAULT_TABLE_PAGINATION, TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';
import { CONTACT_STATUS } from 'boot/campaign-constants';

export default defineComponent({
  name: 'CampaignContactsTable',

  components: {
    ApiLoader,
    AppSearchInput,
    ContactsMoreOptions,
    AllContactsIllustration,
  },

  props: {
    campaignId: {
      type: Number,
      default: null,
    },
  },

  setup(props) {
    const contactFilters = {
      searchText: '',
      status: '',
    };

    const userStore = useUserPreferencesStore();
    const { appContext } = getCurrentInstance();
    const { isMobileDevice } = useAppHelpersApi();

    const state = reactive({
      tableDataMenu: {},
      isMounted: false,
      filters: { ...contactFilters },
      isApiProcessing: false,
      areResultsFetchedOnce: false,
      tableData: [],

      // pagination
      pagination: {},

      // multi select contacts
      selectedContacts: [],
      multiSelectOptionJson: {},
      showTableMultiSelectMenu: false,

      selectedContactJson: null,
      showDeleteContactModal: false,

      visibleColumns: [],
      showColumnsVisibilityModal: false,
    });

    const showApiLoader = computed(() => {
      if (state.areResultsFetchedOnce) {
        return false;
      }
      return state.isApiProcessing;
    });

    const isFilterApplied = computed(() => {
      const filterKeys = Object.keys(state.filters);
      return !filterKeys.every((key) => isEmpty(state.filters[key]));
    });

    const showContactFilters = computed(() => {
      if (isFilterApplied.value) {
        return true;
      }
      return state.pagination.rowsNumber !== 0;
    });

    const showAllContactsIllustration = computed(() => {
      if (state.isApiProcessing || !state.areResultsFetchedOnce || isFilterApplied.value) {
        return false;
      }
      return state.pagination.rowsNumber === 0;
    });

    const tablePaginationLabel = computed(() => {
      const { page, perPage, rowsNumber } = state.pagination;
      const start = (page - 1) * perPage + 1;
      const end = Math.min(page * perPage, rowsNumber || 0);
      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    const selectedContactsLength = computed(() => size(state.selectedContacts));

    const baseColumns = [
      {
        name: 'email',
        label: 'Email',
        align: 'left',
        field: 'contact_email',
      },
      {
        name: 'full_name',
        label: 'Full Name',
        align: 'left',
        field: 'contact_email',
      },
      {
        name: 'sequence',
        label: 'Sequence',
        align: 'left',
        field: 'current_step_number',
      },
      {
        name: 'status',
        label: 'Status',
        align: 'left',
        field: 'status',
      },
      {
        name: 'last_activity',
        label: 'Last Activity',
        align: 'left',
        field: 'last_sent_at',
      },
      {
        name: 'replies',
        label: 'Last Reply At',
        align: 'left',
        field: 'last_reply_at',
      },
    ];

    const tableColumns = computed(() => [
      ...baseColumns,
    ]);

    const getContactInitial = (row) => {
      const name = row.contact_name || row.name || row.contact_email || '';
      return (name.charAt(0) || '').toUpperCase() || 'C';
    };

    const getContactName = (row) => {
      if (row.contact_name || row.name) {
        return row.contact_name || row.name;
      }
      if (row.contact_email?.includes('@')) {
        const username = row.contact_email.split('@')[0];
        return username.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      }
      return '-';
    };

    const getStatusLabel = (status) => CONTACT_STATUS[status]?.label || status || 'Not Started';

    const formatLastActivity = (row) => {
      const date = row.last_sent_at || row.last_reply_at || row.updated_at;
      if (!date) return '-';
      return formatDateWithTime(date);
    };

    const formatLastReply = (row) => {
      const date = row.last_reply_at;
      if (!date) return '-';
      return formatDateWithTime(date);
    };

    const updateMultiSelect = (multiSelectOptionJson) => {
      state.multiSelectOptionJson = multiSelectOptionJson;

      if (multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST
        || multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        state.selectedContacts = state.tableData;
      } else {
        state.selectedContacts = state.tableData
          .slice(0, multiSelectOptionJson.limitNumber);
      }

      state.showTableMultiSelectMenu = false;
    };

    const updateDataToStore = () => {
      const dataToStore = {
        filters: state.filters,
        pagination: state.pagination,
        tableData: state.tableData,
        visibleColumns: state.visibleColumns,
      };

      userStore.setMultipleFields({
        campaignByIdContactsState: {
          ...userStore.campaignByIdContactsState,
          ...dataToStore,
        },
      });
    };

    // API Calls
    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.isApiProcessing = true;

        const params = {
          limit: perPage,
          offset: (page - 1) * perPage,
        };

        if (state.filters.searchText) {
          params.search_text = state.filters.searchText;
        }

        if (state.filters.status) {
          params.status = state.filters.status;
        }

        const response = await getApiCall({
          params,
          endpoint: `/sequences/${props.campaignId}/contacts`,
          includeWorkspace: true,
        });

        const { data, count } = response;

        state.tableData = data || [];
        state.selectedContacts = [];
        state.multiSelectOptionJson = {};
        state.pagination.rowsNumber = count || 0;

        updateDataToStore();
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occurred. Unable to fetch contacts.',
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
        state.areResultsFetchedOnce = true;
      }
    };

    const onFetchAllContacts = () => {
      onRequest({
        pagination: state.pagination,
      });
    };

    const onUpdateFiltersModelValue = (filterKey, value) => {
      state.filters[filterKey] = value;
      onFetchAllContacts();
    };

    const clearAllFilters = () => {
      state.filters = { ...contactFilters };
      updateDataToStore();
      onFetchAllContacts();
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
      state.selectedContacts = [];
    };

    const onDeleteContact = (propsRow) => {
      state.selectedContactJson = propsRow;
      state.showDeleteContactModal = true;
    };

    const onSuccessfulDeleteContact = () => {
      state.showDeleteContactModal = false;
      onFetchAllContacts();
    };

    const onSearchContactInput = () => {
      onFetchAllContacts();
    };

    const makeApiCallOnMounted = () => {
      const loadFromStoreJson = userStore.campaignByIdContactsState;

      const {
        filters, pagination, tableData, visibleColumns,
      } = loadFromStoreJson || {};

      state.filters = filters || contactFilters;
      state.pagination = pagination || DEFAULT_TABLE_PAGINATION;
      state.tableData = tableData || [];
      state.visibleColumns = visibleColumns || [];

      state.areResultsFetchedOnce = !isEmpty(state.tableData);

      onRequest({
        pagination: state.pagination,
      });
    };

    const openPopover = ($event, tableProp) => {
      state.tableDataMenu = {
        show: true,
        target: $event.target,
        label: tableProp.col.label,
        content: tableProp.value,
      };
    };

    const onUpdateVisibleColumns = () => {
      updateDataToStore();
      onFetchAllContacts();
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
      showContactFilters,
      selectedContactsLength,
      tablePaginationLabel,
      showAllContactsIllustration,

      // methods
      getContactInitial,
      getContactName,
      getStatusLabel,
      formatLastActivity,
      formatLastReply,
      onRequest,
      onDeleteContact,
      onTableRowSelect,
      onSuccessfulDeleteContact,
      resetTableMultiSelect,
      updateMultiSelect,
      onSearchContactInput,
      onFetchAllContacts,
      openPopover,
      clearAllFilters,
      onUpdateVisibleColumns,
      onUpdateFiltersModelValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-contacts-table-container {
  width: 100%;
  flex: 1;
  display: flex;
  min-height: 0;

  .contacts-table-content-container {
    width: 100%;
    position: relative;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .contacts-table-filters-section {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 16px 20px;
      gap: 12px;
      min-height: max-content;

      .contact-filter-input {
        width: 240px;
      }

      .dd-filter {
        min-width: 140px;
      }

      @media (max-width: $breakpoint-xs-max) {
        padding: 12px;

        .contact-filter-input {
          min-width: 180px;
        }
      }
    }

    .all-contacts-table {
      width: 100%;
      border-top: 0px;
      min-height: 0;

      :deep(.q-table__middle) {
        height: 100%;
        overflow-x: auto;
        overflow-y: auto;
      }

      .contact-name-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        .contact-avatar-box {
          width: 26px;
          height: 26px;
          border-radius: 4px;
          background: rgba(var(--primary-rgb), 0.1);
          color: $primary;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .contact-name-text {
          color: $black;
          font-size: 13px;
          font-weight: 500;
          margin: 0;
        }
      }

      .email-and-action-cell {
        display: flex;
        align-items: center;
        gap: 12px;

        .email-cell-text {
          color: rgba($color: var(--black-rgb), $alpha: 0.8);
          font-size: 13px;
          font-weight: 400;
          line-height: 16px;
        }

        .actions-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      .step-cell-text {
        font-size: 13px;
        font-weight: 500;
        color: $black;
      }

      .activity-date-text {
        font-size: 13px;
        color: $grey;
      }

      .replies-count-text {
        font-size: 13px;
        color: $black;
        font-weight: 500;
      }

      .status-badge-pill {
        padding: 3px 12px;
        border-radius: 99px;
        font-size: 12px;
        font-weight: 500;
        display: inline-flex;
        width: fit-content;
        align-items: center;
        justify-content: center;
        line-height: 16px;

        &.status-not_started {
          background: rgba(var(--grey-50-rgb), 0.8);
          color: $grey-700;
          border: 1px solid $grey-200;
        }

        &.status-active {
          background: rgba(var(--primary-rgb), 0.12);
          color: $primary;
        }

        &.status-replied {
          background: rgba(var(--positive-rgb), 0.15);
          color: $positive;
        }

        &.status-paused {
          background: rgba(var(--grey-rgb), 0.12);
          color: $grey-700;
        }

        &.status-stopped {
          background: rgba(var(--warning-rgb), 0.15);
          color: $warning;
        }

        &.status-completed {
          background: rgba(var(--primary-rgb), 0.12);
          color: $primary;
        }

        &.status-failed,
        &.status-bounced {
          background: rgba(var(--negative-rgb), 0.12);
          color: $negative;
        }

        &.status-unsubscribed {
          background: rgba(var(--negative-rgb), 0.1);
          color: $negative;
        }
      }
    }
  }
}
</style>
