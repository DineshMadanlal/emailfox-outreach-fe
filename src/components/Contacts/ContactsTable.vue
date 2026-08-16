<template>
  <div class="contacts-table-container">
    <!-- Column Visibility -->
    <q-dialog
      v-model="showColumnsVisibilityModal"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ColumnsVisibility
        :debounceDelay="500"
        :baseColumns="baseColumns"
        :dynamicColumns="dynamicColumns"
        v-model:visibleColumns="visibleColumns"

        @update:visible-columns="onUpdateVisibleColumns"
      />
    </q-dialog>

    <Teleport
      v-if="isMounted && !hideHeader"
      to="#mainContactsRightHeader"
    >
      <div class="all-contacts-header-filter-section">
        <!-- Upload Button -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          class="upload-contact-button"

          to="/outreach/contacts/upload"

          v-if="!showAllContactsIllustration"
        >
          <div class="flex no-wrap items-center">
            <LocalSvgIcon image="download" classes="download-icon" />

            <p class="upload-button-text">
              Upload
            </p>
          </div>
        </q-btn>
      </div>
    </Teleport>

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

        :listId="listId"
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

        <!-- Provider -->
        <SelectProvider
          :clearable="true"
          isContactEsp
          v-model="filters.provider"

          class="dead-small dd-filter"

          @update:modelValue="onFetchAllContacts"
        />

        <!-- Contact Status -->
        <SelectContactStatus
          :clearable="true"
          v-model="filters.status"

          class="dead-small dd-filter"

          @update:modelValue="onFetchAllContacts"
        />

        <!-- List ID -->
        <SelectList
          v-if="!listId"
          :clearable="true"
          v-model="filters.listJson"

          class="dead-small dd-filter"

          @update:modelValue="onFetchAllContacts"
        />

        <!-- More Filters -->
        <MoreFilters
          :isFilterApplied="isFilterApplied"
          class="table-more-filters-btn"
        >
          <ContactsMoreFilters
            :canFilterList="!listId"
            v-model:filterStatus="filters.status"
            v-model:filterProvider="filters.provider"
            v-model:filterList="filters.listJson"

            @update:filterStatus="onUpdateFiltersModelValue('status', $event)"
            @update:filterList="onUpdateFiltersModelValue('listJson', $event)"
            @update:filterProvider="onUpdateFiltersModelValue('provider', $event)"
          />
        </MoreFilters>

        <!-- Reset Filter -->
        <ResetFiltersButton
          v-if="isFilterApplied"
          @click="clearAllFilters"
        />

        <q-space />

        <ColumnsVisibilityButton
          @click="showColumnsVisibilityModal = true"
        />
      </div>

      <!--  -->
      <q-table
        virtual-scroll
        v-model:pagination="pagination"

        separator="cell"
        class="app-table app-table-rows-fixed all-contacts-table app-paginated-table"

        :rows="tableData"
        :columns="tableColumns"
        :loading="isApiProcessing"
        v-model:selected="selectedContacts"

        @request="onRequest"

        v-if="!showAllContactsIllustration"
      >
        <!--  -->
        <template v-slot:body-cell="props">
          <!-- Email -->
          <q-td
            :props="props"
            v-if="props.col.name === 'email'"
          >
            <div class="email-and-action-cell">
              <div class="email-cell-text">
                {{ props.value || '-' }}
              </div>

              <q-space />

              <div class="actions-cell">
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

                  <ContactsMoreOptions
                    :contactJson="props.row"
                  />
                </q-btn>
              </div>
            </div>
          </q-td>

          <!-- Base Columns: First Name, Last Name, Email -->
          <q-td
            :props="props"
            v-else-if="['first_name', 'last_name'].includes(props.col.name)"
          >
            <div>
              {{ props.value || '-' }}
            </div>
          </q-td>

          <!-- ESP -->
          <q-td
            :props="props"
            v-else-if="props.col.name === 'esp_provider'"
          >
            <MailboxEsp :esp="props.value" />
          </q-td>

          <!-- Campaigns Added -->
          <q-td
            :props="props"
            v-else-if="props.col.name === 'campaigns_added'"
          >
            <div>
              {{ props.value || '0' }}
            </div>
          </q-td>

          <!-- Dynamic Columns -->
          <q-td
            v-else
            :props="props"
            class="truncate-cell"
          >
            <div
              class="cell-content"
              @click="($event) => openPopover($event, props)"
            >
              {{ props.value || '-' }}
            </div>
          </q-td>
        </template>

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

        <template v-slot:item="props">
          <ContactItemMobileView
            :contactTableProps="props"

            @deleteContact="onDeleteContact(props.row)"
          />
        </template>
      </q-table>

      <!-- Menu -->
      <q-menu
        v-model="tableDataMenu.show"
        :target="tableDataMenu.target"

        @hide="tableDataMenu = {}"

        v-if="tableDataMenu.target"

        fit
        self="top left"
        transition-show="scale"
        transition-hide="scale"
        class="fulltext-popover"
      >
        <ContactCellCard :contact="tableDataMenu" />
      </q-menu>
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
import MailboxEsp from 'components/Contacts/MailboxEsp.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import ContactCellCard from 'components/Contacts/ContactCellCard.vue';
import ContactsMoreOptions from 'components/Menu/ContactsMoreOptions.vue';
import ContactItemMobileView from 'components/Contacts/ContactItemMobileView.vue';
import ColumnsVisibility from 'src/components/Modals/ColumnsVisibility.vue';
import ResetFiltersButton from 'components/Buttons/ResetFilters.vue';
import AllContactsIllustration from 'components/Illustrations/AllContacts.vue';
import ColumnsVisibilityButton from 'components/Buttons/ColumnsVisibility.vue';

import MoreFilters from 'components/Buttons/MoreFilters.vue';
import SelectList from 'components/Dropdown/SelectList.vue';
import SelectProvider from 'components/Dropdown/SelectProvider.vue';
import SelectContactStatus from 'components/Dropdown/SelectContactStatus.vue';
import ContactsMoreFilters from 'components/Menu/ContactsMoreFilters.vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { getNumeralAmount } from 'src/utils/numbers';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';
import useAppHelpersApi from 'src/composables/app-helpers.js';

// store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// constants
import { CONTACTS_TABLE_SUPPORTED_COLUMNS } from 'boot/campaign-constants';
import { DEFAULT_TABLE_PAGINATION, TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';

export default defineComponent({
  name: 'ContactsTable',

  components: {
    ApiLoader,
    MailboxEsp,

    AppSearchInput,
    ContactCellCard,
    ColumnsVisibility,
    ResetFiltersButton,
    ContactsMoreOptions,
    ContactItemMobileView,

    AllContactsIllustration,
    ColumnsVisibilityButton,

    SelectList,
    SelectProvider,
    SelectContactStatus,

    MoreFilters,
    ContactsMoreFilters,
  },

  props: {
    listId: {
      type: Number,
      default: null,
    },
    campaignId: {
      type: Number,
      default: null,
    },
    hideHeader: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // hardcoded
    const contactFilters = {
      searchText: '',
      provider: '',
      listJson: null,
      status: '',
    };

    // store
    const userStore = useUserPreferencesStore();

    // instance
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice } = useAppHelpersApi();
    const { getWorkspaceCustomFields } = useWorkspace();

    // state
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
      // take the keys of filters and check if all are values are empty
      const filterKeys = Object.keys(state.filters);
      const areAllFiltersEmpty = filterKeys.every((key) => isEmpty(state.filters[key]));

      return !areAllFiltersEmpty;
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
      const end = page * perPage;

      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    const isCampaignByIdPage = computed(() => !!props.campaignId);

    const selectedContactsLength = computed(() => size(state.selectedContacts));

    const baseColumns = [
      {
        name: 'email',
        label: 'Email',
        align: 'left',
        field: 'email',
      },
      {
        name: 'esp_provider',
        label: 'ESP',
        align: 'left',
        field: 'esp_provider',
      },
      // {
      //   name: 'campaigns_added',
      //   label: 'Campaigns Added',
      //   align: 'left',
      //   field: 'campaigns_added',
      // },
    ];

    const workspaceCustomFields = computed(() => userStore.workspaceCustomFields || []);

    const dynamicColumns = computed(() => {
      const otherColumns = [
        {
          name: 'first_name',
          label: 'First Name',
          align: 'left',
          field: 'first_name',
        },
        {
          name: 'last_name',
          label: 'Last Name',
          align: 'left',
          field: 'last_name',
        },
      ];

      const customFieldColumns = workspaceCustomFields.value.map((field) => ({
        name: `custom_fields.${field.value}`,
        label: field.label,
        field: `custom_fields.${field.value}`,
        align: 'left',
      }));

      return [
        ...otherColumns,
        ...CONTACTS_TABLE_SUPPORTED_COLUMNS,
        ...customFieldColumns,
      ];
    });

    const tableColumns = computed(() => {
      const filteredColumns = dynamicColumns.value.filter(
        (col) => state.visibleColumns.includes(col.name),
      );

      return [
        ...baseColumns,
        ...filteredColumns,
      ];
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

    const updateDataToStore = () => {
      if (isCampaignByIdPage.value) {
        return;
      }
      const dataToStore = {
        filters: state.filters,
        pagination: state.pagination,
        tableData: state.tableData,
        visibleColumns: state.visibleColumns,
      };

      if (props.listId) {
        userStore.setMultipleFields({
          listByIdContactsState: {
            ...userStore.listByIdContactsState,
            ...dataToStore,
          },
        });
      } else if (props.campaignId) {
        userStore.setMultipleFields({
          campaignByIdContactsState: {
            ...userStore.campaignByIdContactsState,
            ...dataToStore,
          },
        });
      } else {
        userStore.setMultipleFields({
          allContactsState: {
            ...userStore.allContactsState,
            ...dataToStore,
          },
        });
      }
    };

    // API Calls
    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.isApiProcessing = true;

        const attributes = [
          ...baseColumns.map((col) => col.name),
          ...state.visibleColumns,
        ];

        const params = {
          limit: perPage,
          offset: (page - 1) * perPage,
          attributes,
        };

        // search contact input
        if (state.filters.searchText) {
          params.search_text = state.filters.searchText;
        }

        // provider filter
        if (state.filters.provider) {
          params.esp_provider = state.filters.provider;
        }

        // list filter
        if (state.filters.listJson?.id) {
          params.list_id = state.filters.listJson.id;
        }

        let endpoint = '/contacts';
        if (props.listId) {
          endpoint = `/lists/${props.listId}/contacts`;
        } else if (props.campaignId) {
          endpoint = `/sequences/${props.campaignId}/contacts`;
        }

        const response = await getApiCall({
          params,
          endpoint,
          includeWorkspace: true,
        });

        const { data, count } = response;

        state.tableData = data;

        state.selectedContacts = [];
        state.multiSelectOptionJson = {};

        state.pagination.rowsNumber = count;

        // store in pinia
        updateDataToStore();
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occured. Unable to fetch contacts.',
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

      // refetch data
      onFetchAllContacts();
    };

    const onSearchContactInput = () => {
      onFetchAllContacts();
    };

    const makeApiCallOnMounted = () => {
      let loadFromStoreJson = userStore.allContactsState;

      if (props.listId) {
        loadFromStoreJson = userStore.listByIdContactsState;
      } else if (props.campaignId) {
        loadFromStoreJson = userStore.campaignByIdContactsState;
      }

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
      getWorkspaceCustomFields();

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
      baseColumns,
      dynamicColumns,
      isFilterApplied,
      showContactFilters,
      selectedContactsLength,
      tablePaginationLabel,
      showAllContactsIllustration,

      // methods
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
// not scoped because of teleport
.all-contacts-header-filter-section {
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: $breakpoint-xs-max) {
    gap: 8px;
  }

  .upload-contact-button {
    :deep(.download-icon) {
      path {
        stroke: $white;
      }
    }

    .upload-button-text {
      color: $white;
      font-size: 14px;
      font-weight: 500;
      margin-left: 8px;
    }
  }
}

.contacts-table-container {
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
      padding: 20px;
      gap: 12px;
      min-height: max-content;

      .contact-filter-input {
        width: 240px;
      }

      .dd-filter {
        min-width: 135px;
        max-width: 140px;
      }

      .table-more-filters-btn {
        height: 28px;
        display: none;
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        flex-wrap: nowrap;
        padding: 12px;

        .contact-filter-input {
          min-width: 200px;
        }

        .table-more-filters-btn {
          display: flex;
        }

        .dd-filter {
          display: none;
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

      .email-and-action-cell {
        display: flex;
        align-items: center;

        gap: 12px;
      }

      .actions-cell {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .email-cell-text {
        color: $primary;
        font-size: 14px;
        font-weight: 500;
        line-height: 16px;
      }

      .truncate-cell {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        max-width: 150px;
        height: 48px;
        // cursor: zoom-in;

        .cell-content {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
