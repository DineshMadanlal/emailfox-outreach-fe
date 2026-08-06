<template>
  <q-card
    flat
    class="remove-sender-accounts-card app-modal-card custom-scrollbar"
  >
    <!-- modal header -->
    <div class="app-modal-header">
      <!-- header text -->
      <h4 class="modal-header-text">
        Remove Mailboxes
      </h4>

      <q-space />

      <!-- Close -->
      <q-btn
        flat
        round
        dense
        v-close-popup

        color="negative"
        class="app-negative-button"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <div class="app-modal-content">
      <!-- mailbox filters -->
      <div
        class="mailbox-filters-content"
      >
        <p class="remove-mailbox-desc-text">
          Select the mailboxes to remove from this campaign.
          Only mailboxes currently part of this campaign are shown.
        </p>

        <!-- search input -->
        <AppSearchInput
          :debounce="500"
          v-model="filters.searchText"

          class="mailbox-filter-input"
          moreClasses="dead-small"
          placeholder="Search email"

          @update:modelValue="onSearchMailboxInput"
        />
      </div>

      <!--  -->
      <q-table
        virtual-scroll
        v-model:pagination="pagination"

        separator="cell"
        selection="multiple"
        class="app-table remove-mailboxes-table app-paginated-table sticky-first-col"

        :rows="tableData"
        :columns="tableColumns"

        :loading="loaders.isFetchApi"

        v-model:selected="selectedAccounts"

        @request="onRequest"
      >
        <!-- Header Slots -->
        <template #header="props">
          <q-tr :props="props">
            <q-th
              auto-width
            >
              <!--  -->
              <q-checkbox
                dense
                color="primary"
                class="app-checkbox"

                v-model="props.selected"

                v-if="props.selected || props.selected === null"

                @update:modelValue="resetTableMultiSelect"
              />

              <q-checkbox
                v-else

                dense
                color="primary"
                class="header-selection-checkbox app-checkbox"

                :model-value="props.selected"
              >
                <q-menu
                  transition-show="jump-down"
                  transition-hide="jump-up"

                  v-model="showTableMultiSelectMenu"
                >
                  <!-- quasar list -->
                  <q-list style="min-width: 270px">
                    <TableMultiSelect
                      multiSelectType="mailboxes"
                      :multiSelectOptionJson="multiSelectOptionJson"

                      :totalList="pagination.rowsNumber"
                      :totalCurrentList="tableData.length"

                      @updateMultiSelect="updateMultiSelect"
                    />
                  </q-list>
                </q-menu>
              </q-checkbox>
            </q-th>

            <!-- rest of the slot -->
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              <div
                class="flex no-wrap items-center"
              >
                {{ col.label }}
              </div>
            </q-th>
          </q-tr>
        </template>

        <!-- template body checkbox -->
        <template v-slot:body-selection="scope">
          <q-checkbox
            dense
            color="primary"
            class="app-checkbox"

            v-model="scope.selected"

            @click="onTableRowSelect"
          />
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

                @update:model-value="onFetchMailboxRecords"

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
        <template v-slot:body-cell-nameAndEmail="props">
          <q-td
            :props="props"
          >
            <div>
              <div class="mailbox-name-text">
                {{ props.row.name }}
              </div>

              <div class="mailbox-email-text">
                {{ props.row.email }}
              </div>
            </div>
          </q-td>
        </template>

        <!-- Provider -->
        <template v-slot:body-cell-provider="props">
          <q-td
            :props="props"
          >
            <EspProvider
              :provider="props.row.provider || 'GMAIL'"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Save -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Remove From Campaign"
        @click="onSubmitForm"

        :loading="loaders.isSaveApi"
        :disable="!selectedAccounts.length"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  toRefs, reactive, defineComponent, computed, getCurrentInstance, onMounted,
} from 'vue';

// Components
import EspProvider from 'components/Mailboxes/EspProvider.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import TableMultiSelect from 'components/Menu/TableMultiSelect.vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers';
import { getApiCall, postApiCall } from 'src/utils/apiRequests';

// constants
import { WARMUP_STATUS } from 'src/boot/warmup-constants';
import { DEFAULT_TABLE_PAGINATION, TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';

// hardcoded
const mailboxFilters = {
  searchText: '',
  provider: '',
  warmupStatus: '',
  status: '',
};

export default defineComponent({
  name: 'RemoveSenderMailboxes',

  emits: ['onMailboxesRemoved'],

  components: {
    EspProvider,
    AppSearchInput,
    TableMultiSelect,
  },

  props: {
    campaignId: {
      type: [String, Number],
      required: true,
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      tableData: [],
      selectedAccounts: [],

      loaders: {
        isFetchApi: false,
        isSaveApi: false,
      },

      filters: {
        ...mailboxFilters,
      },

      // pagination
      pagination: {
        ...DEFAULT_TABLE_PAGINATION,
      },

      multiSelectOptionJson: {},
      showTableMultiSelectMenu: false,
    });

    // computed
    const tableColumns = computed(() => {
      const columns = [
        // name & email
        {
          name: 'nameAndEmail',
          label: 'Name',
          align: 'left',
        },

        // Provider
        {
          name: 'provider',
          label: 'Provider',
          align: 'left',
        },

        // Campaign In Use
        // {
        //   name: 'campaignInUse',
        //   label: 'Campaign In Use',
        //   align: 'left',
        // },
      ];

      return columns;
    });

    const tablePaginationLabel = computed(() => {
      const { page, perPage, rowsNumber } = state.pagination;

      const start = (page - 1) * perPage + 1;
      const end = page * perPage;

      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    // methods
    // API Calls
    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.loaders.isFetchApi = true;

        const params = {
          offset: (page - 1) * perPage,
          limit: perPage,
          seq_id_eq: props.campaignId,
        };

        // filters
        const {
          searchText, provider, warmupStatus, status,
        } = state.filters || {};

        // search text
        if (searchText) {
          params.search_text = searchText;
        }

        // provider
        if (provider) {
          params.provider = provider;
        }

        // warmup status
        if (warmupStatus) {
          params.warmup_enabled = warmupStatus === WARMUP_STATUS.ACTIVE;
        }

        // status
        if (status) {
          params.status = status;
        }

        const response = await getApiCall({
          params,
          endpoint: '/mailboxes',
          includeWorkspace: true,
        });

        const { data, count } = response;

        // table data
        state.tableData = [...data];

        state.selectedAccounts = [];
        state.multiSelectOptionJson = {};

        state.pagination.rowsNumber = count;
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occured. Unable to fetch mailboxes.',
        });
      } finally {
        state.loaders.isFetchApi = false;
      }
    };

    const onRequest = async (params) => {
      state.loaders.isFetchApi = true;

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

    const onFetchMailboxRecords = () => {
      onRequest({
        pagination: state.pagination,
      });
    };

    const onTableRowSelect = () => {
      if (state.tableData.length === state.selectedAccounts.length) {
        state.multiSelectOptionJson = {
          limit: state.tableData.length,
          selectedOption: TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST,
        };
      } else {
        state.multiSelectOptionJson = {};
      }
    };

    const resetTableMultiSelect = () => {
      state.multiSelectOptionJson = {};

      state.selectedAccounts = [];
    };

    const updateMultiSelect = (multiSelectOptionJson) => {
      state.multiSelectOptionJson = multiSelectOptionJson;

      if (multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST
        || multiSelectOptionJson.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        state.selectedAccounts = state.tableData;
      } else {
        // limit number
        state.selectedAccounts = state.tableData
          .slice(0, multiSelectOptionJson.limitNumber);
      }

      state.showTableMultiSelectMenu = false;
    };

    const onSearchMailboxInput = async () => {
      // trim white spaces
      state.filters.searchText = state.filters.searchText?.trim();

      onFetchMailboxRecords();
    };

    const onSubmitForm = async () => {
      try {
        state.loaders.isSaveApi = true;

        // mailbox IDs
        const mailboxIds = state.selectedAccounts.map((account) => account.id);

        await postApiCall({
          payload: {
            mailbox_ids: mailboxIds,
          },
          includeWorkspace: true,
          endpoint: `sequences/${props.campaignId}/mailboxes/remove`,
        });

        emit('onMailboxesRemoved');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occured. Unable to add mailboxes.',
        });
      } finally {
        state.loaders.isSaveApi = false;
      }
    };

    // lifecycle hook
    onMounted(() => {
      onFetchMailboxRecords();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      tableColumns,
      tablePaginationLabel,

      // methods
      onSubmitForm,
      onRequest,
      onSearchMailboxInput,
      updateMultiSelect,
      onTableRowSelect,
      resetTableMultiSelect,
      onFetchMailboxRecords,
    };
  },
});
</script>

<style lang="scss" scoped>
.remove-sender-accounts-card {
  position: relative;
  max-width: 650px;
  $modalHeaderHeight: 68px;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 650px;
    min-height: 100%;

    display: flex;
    flex-direction: column;
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  @media (min-width: 601px) and (max-width: 649px) {
    // For medium screens, we can set a specific width or use a percentage
    width: calc(100vw - 32px);
  }

  .app-modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 0px;

    .mailbox-filters-content {
      width: 100%;
      padding: 20px;

      display: flex;
      flex-direction: column;
      gap: 12px;

      .remove-mailbox-desc-text {
        color: $grey;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;

        max-width: 520px;
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 20px 12px;
      }
    }

    .remove-mailboxes-table {
      .mailbox-name-text {
        color: $black;
        font-size: 14px;
        font-weight: 500;
      }
      .mailbox-email-text {
        margin-top: 4px;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;

        color: $grey-800;
      }
    }
  }
}
</style>
