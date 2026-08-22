<template>
  <div class="linkedin-accounts">
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
        sourceType="linkedin"
        :baseColumns="baseColumns"
        :dynamicColumns="dynamicColumns"
        v-model:visibleColumns="visibleColumns"
      />
    </q-dialog>

    <!-- Filters -->
    <div class="linkedin-accounts-filters">
      <q-space />

      <!-- search account -->
      <AppSearchInput
        borderless
        :outlined="false"
        :debounce="500"
        v-model="filters.searchText"

        class="account-filter-input"
        placeholder="Search account"

        @update:modelValue="onSearchAccountInput"
      />

      <q-btn
        dense
        outlined
        unelevated

        @click="showColumnsVisibilityModal = true"
      >
        <LocalSvgIcon
          image="columns"
        />
      </q-btn>
    </div>

    <!-- LinkedIn Accounts Table -->
    <q-table
      v-model:pagination="pagination"

      separator="cell"
      class="app-table linkedin-accounts-table app-paginated-table"

      :rows="tableData"
      :columns="tableColumns"
      :loading="isApiProcessing"
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

      <!-- Content Slots -->
      <!-- Name -->
      <template v-slot:body-cell-name="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/linkedin/${props.row.linkedin_acc_id || props.row.id}`"
            class="linkedin-route-link"
          >
            <div class="flex no-wrap items-center">
              <div class="linkedin-avatar-box">
                <LocalSvgIcon
                  image="linkedin"
                  classes="linkedin-icon"
                />
              </div>

              <div class="q-ml-sm">
                <div class="account-name-text">
                  {{ props.row.li_provider_username || props.row.name || '-' }}
                </div>
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Profile Visits -->
      <template v-slot:body-cell-profileVisits="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/linkedin/${props.row.linkedin_acc_id || props.row.id}`"
            class="linkedin-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-opened"
              />

              <div class="q-ml-sm">
                {{ getNumeralAmount(props.row.li_view_profile) }}
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Connections Sent -->
      <template v-slot:body-cell-connectionsSent="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/linkedin/${props.row.linkedin_acc_id || props.row.id}`"
            class="linkedin-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-sent"
              />

              <div class="q-ml-sm">
                {{ getNumeralAmount(props.row.li_connections_sent) }}
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Connections Accepted -->
      <template v-slot:body-cell-connectionsAccepted="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/linkedin/${props.row.linkedin_acc_id || props.row.id}`"
            class="linkedin-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-completed"
              />

              <div class="q-ml-sm">
                {{ props.row.connectionsAcceptedRate }}%
                ({{ getNumeralAmount(props.row.li_connections_accepted) }})
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Messages Sent -->
      <template v-slot:body-cell-messagesSent="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/linkedin/${props.row.linkedin_acc_id || props.row.id}`"
            class="linkedin-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-sent"
              />

              <div class="q-ml-sm">
                {{ getNumeralAmount(props.row.li_messages_sent) }}
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Inmails Sent -->
      <template v-slot:body-cell-inmailsSent="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/linkedin/${props.row.linkedin_acc_id || props.row.id}`"
            class="linkedin-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-sent"
              />

              <div class="q-ml-sm">
                {{ getNumeralAmount(props.row.li_inmails_sent) }}
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Replies -->
      <template v-slot:body-cell-replies="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/linkedin/${props.row.linkedin_acc_id || props.row.id}`"
            class="linkedin-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-replied"
              />

              <div class="q-ml-sm">
                {{ props.row.replyRate }}% ({{ getNumeralAmount(props.row.li_replies) }})
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

    </q-table>
  </div>
</template>

<script>
// vue
import {
  defineComponent, toRefs, reactive, computed, onMounted, getCurrentInstance,
} from 'vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { findPercentage, getNumeralAmount } from 'src/utils/numbers';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// components
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import ColumnsVisibility from 'components/Modals/ColumnsVisibility.vue';

// constants
import { DEFAULT_TABLE_PAGINATION } from 'boot/constants';

// hardcoded
const accountFilters = {
  searchText: '',
};

export default defineComponent({
  name: 'CampaignByIdLinkedInAccounts',

  components: {
    AppSearchInput,
    ColumnsVisibility,
  },

  props: {
    campaignByIdJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      tableData: [],
      filters: { ...accountFilters },
      visibleColumns: [],

      pagination: {
        ...DEFAULT_TABLE_PAGINATION,
      },

      isApiProcessing: false,
      areResultsFetchedOnce: false,

      // boolean
      showColumnsVisibilityModal: false,
    });

    // computed
    const baseColumns = [
      {
        name: 'name',
        label: 'Name',
        align: 'left',
      },
    ];

    const dynamicColumns = computed(() => {
      const columns = [
        {
          name: 'profileVisits',
          label: 'Profile Visits',
          align: 'left',
        },
        {
          name: 'connectionsSent',
          label: 'Connections Sent',
          align: 'left',
        },
        {
          name: 'connectionsAccepted',
          label: 'Connections Accepted',
          align: 'left',
        },
        {
          name: 'messagesSent',
          label: 'Messages Sent',
          align: 'left',
        },
        {
          name: 'inmailsSent',
          label: 'Inmails Sent',
          align: 'left',
        },
        {
          name: 'replies',
          label: 'Replies',
          align: 'left',
        },
      ];

      return columns;
    });

    const tablePaginationLabel = computed(() => {
      const { page, rowsPerPage } = state.pagination;
      const rowsNumber = state.tableData.length;

      if (!rowsNumber) return '0 to 0 of 0';

      const start = (page - 1) * rowsPerPage + 1;
      const end = Math.min(page * rowsPerPage, rowsNumber);

      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
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

    // API Calls
    const fetchData = async () => {
      try {
        state.isApiProcessing = true;

        const params = {};

        if (state.filters.searchText) {
          params.search_text = state.filters.searchText;
        }

        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: `/stats/sequences/${props.campaignByIdJson.id}/linkedin-stats`,
          params,
        });

        const list = Array.isArray(response) ? response : (response?.data || []);

        const formattedData = list.map((element) => {
          // connections accepted percentage
          const connectionsAcceptedRate = findPercentage({
            part: element.li_connections_accepted || 0,
            whole: element.li_connections_sent || 0,
          });

          // reply percentage
          const totalOutreachMessages = (element.li_messages_sent || 0)
            + (element.li_inmails_sent || 0);
          const replyRate = findPercentage({
            part: element.li_replies || 0,
            whole: totalOutreachMessages || element.li_connections_sent || 0,
          });

          return {
            ...element,
            connectionsAcceptedRate,
            replyRate,
          };
        });

        state.tableData = formattedData;
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occurred. Unable to fetch LinkedIn accounts.',
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    const onSearchAccountInput = async () => {
      state.pagination.page = 1;
      await fetchData();
    };

    const makeApiCallOnMounted = async () => {
      // set default visible columns
      state.visibleColumns = dynamicColumns.value.map((col) => col.name);

      await fetchData();
      state.areResultsFetchedOnce = true;
    };

    onMounted(() => {
      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      baseColumns,
      dynamicColumns,
      tableColumns,
      isMobileDevice,
      tablePaginationLabel,

      // methods
      getNumeralAmount,
      onSearchAccountInput,
    };
  },
});
</script>

<style lang="scss" scoped>
.linkedin-accounts {
  width: 100%;
  display: flex;
  min-height: 0;
  flex-direction: column;

  .linkedin-accounts-filters {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0px 20px;
    min-height: 40px;
    gap: 16px;

    .account-filter-input {
      width: 240px;
      border-radius: 0;
      padding: 0px 12px;

      margin-right: 8px;
      // xs max
      @media (max-width: $breakpoint-xs-max) {
        width: 100%;
      }
    }
  }

  :deep(.linkedin-accounts-table) {
    min-height: 0;

    .linkedin-route-link {
      display: flex;
      align-items: center;
      height: 100%;
      width: 100%;
      text-decoration: unset;

      color: $black;

      padding: 9px 0px;
    }

    .linkedin-avatar-box {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      background: rgba(var(--primary-rgb), 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .linkedin-icon {
        width: 16px;
        height: 16px;
      }
    }

    tbody {
      tr {
        .account-name-text {
          color: $black;
          font-size: 14px;
          font-weight: 500;
        }

        &:hover {
          .account-name-text {
            color: $primary;
          }
        }
      }
    }
  }
}
</style>
