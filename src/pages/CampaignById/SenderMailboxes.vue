<template>
  <div class="sender-mailboxes">
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
        sourceType="mailboxes"
        :baseColumns="baseColumns"
        :dynamicColumns="dynamicColumns"
        v-model:visibleColumns="visibleColumns"
      />
    </q-dialog>

    <!-- Filters -->
    <div class="sender-mailboxes-filters">
      <q-space />

      <!-- search mailboxes -->
      <AppSearchInput
        borderless
        :outlined="false"
        :debounce="500"
        v-model="filters.searchText"

        class="mailbox-filter-input"
        placeholder="Search mailbox"

        @update:modelValue="onSearchMailboxInput"
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

    <!-- Mailboxes Table -->
    <q-table
      v-model:pagination="pagination"

      separator="cell"
      class="app-table sender-mailboxes-table app-paginated-table"

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

              :options="[5, 10, 25, 50, 75, 100]"
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

      <!-- Content -->
      <!-- Full Name -->
      <template v-slot:body-cell-nameAndEmail="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.mailbox_id}`"
            class="mailbox-route-link"
          >
            <div>
              <div class="mailbox-name-text">
                {{ props.row.mailbox_name }}
              </div>

              <div class="mailbox-email-text">
                {{ props.row.mailbox_email }}
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Sent -->
      <template v-slot:body-cell-sent="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.mailbox_id}`"
            class="mailbox-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-sent"
              />

              <div class="q-ml-sm">
                {{ getNumeralAmount(props.row.email_sent) }}
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Delivery Rate -->
      <template v-slot:body-cell-deliveryRate="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.mailbox_id}`"
            class="mailbox-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-delivered"
              />

              <div class="q-ml-sm">
                {{ getNumeralAmount(props.row.delivered) }} ({{ props.row.deliveryRate }}%)
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Opens -->
      <template v-slot:body-cell-openRate="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.mailbox_id}`"
            class="mailbox-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-opened"
              />

              <div class="q-ml-sm">
                {{ getNumeralAmount(props.row.opens) }} ({{ props.row.openRate }}%)
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Clicks -->
      <template v-slot:body-cell-clickRate="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.mailbox_id}`"
            class="mailbox-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-delivered"
              />

              <div class="q-ml-sm">
                {{ getNumeralAmount(props.row.clicks) }} ({{ props.row.clickRate }}%)
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Reply Rate -->
      <template v-slot:body-cell-replyRate="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.mailbox_id}`"
            class="mailbox-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-replied"
              />

              <div class="q-ml-sm">
                {{ getNumeralAmount(props.row.email_replies) }} ({{ props.row.replyRate }}%)
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Bounce Rate -->
      <template v-slot:body-cell-bouncedRate="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.mailbox_id}`"
            class="mailbox-route-link"
          >
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="seq-bounced"
                classes="bounced-icon"
              />

              <div class="q-ml-sm">
                {{ getNumeralAmount(props.row.email_bounces) }} ({{ props.row.bouncedRate }}%)
              </div>
            </div>
          </router-link>
        </q-td>
      </template>

      <!-- Mailbox Health -->
      <template v-slot:body-cell-mailboxHealth="props">
        <q-td
          :props="props"
        >
          <router-link
            :to="`/outreach/mailbox/${props.row.mailbox_id}`"
            class="mailbox-route-link"
          >
            <StatusBadge
              :icon="props.row.mailboxHealthJson.icon"
              :status="props.row.mailboxHealthJson.label"
              :color="props.row.mailboxHealthJson.color"
            />
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
import { getDeliverabilityRateJson, getBouncedRateJson } from 'src/utils/helperFunctions';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// components
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import StatusBadge from 'components/CampaignById/StatusBadge.vue';
import ColumnsVisibility from 'components/Modals/ColumnsVisibility.vue';

// constants
import { DEFAULT_TABLE_PAGINATION } from 'boot/constants';

// hardcoded
const mailboxFilters = {
  searchText: '',
};

export default defineComponent({
  name: 'CampaignByIdSenderMailboxes',

  components: {
    StatusBadge,
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
      filters: { ...mailboxFilters },
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
        name: 'nameAndEmail',
        label: 'Name',
        align: 'left',
      },
    ];

    const dynamicColumns = computed(() => {
      const columns = [
        {
          name: 'sent',
          label: 'Sent',
          align: 'left',
        },
        {
          name: 'deliveryRate',
          label: 'Delivery',
          align: 'left',
        },
        {
          name: 'openRate',
          label: 'Opens',
          align: 'left',
        },
        {
          name: 'clickRate',
          label: 'Clicks',
          align: 'left',
        },
        {
          name: 'replyRate',
          label: 'Replies',
          align: 'left',
        },
        {
          name: 'bouncedRate',
          label: 'Bounce',
          align: 'left',
        },
        {
          name: 'mailboxHealth',
          label: 'Mailbox Health',
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
          endpoint: `/stats/sequences/${props.campaignByIdJson.id}/mailbox-stats`,
          params,
        });

        const formattedData = (response || []).map((element) => {
          const sent = element.email_sent || 0;
          const bounces = element.email_bounces || 0;
          const replies = element.email_replies || 0;
          const opens = element.email_unique_lead_opens || element.email_opens || 0;
          const clicks = element.email_unique_lead_clicks || element.email_clicks || 0;

          const delivered = Math.max(0, sent - bounces);

          // delivery rate
          const deliveryRate = findPercentage({
            part: delivered,
            whole: sent,
          });

          // open rate
          const openRate = findPercentage({
            part: opens,
            whole: sent,
          });

          // click rate
          const clickRate = findPercentage({
            part: clicks,
            whole: sent,
          });

          // reply rate
          const replyRate = findPercentage({
            part: replies,
            whole: sent,
          });

          // bounced rate
          const bouncedRate = findPercentage({
            part: bounces,
            whole: sent,
          });

          const bouncedRateJson = getBouncedRateJson(bouncedRate);
          const deliverabilityRateJson = getDeliverabilityRateJson(deliveryRate);

          const mailboxHealthJson = (sent === 0)
            ? { icon: 'circle-star', color: 'positive', label: 'New' }
            : deliverabilityRateJson;

          // table data
          return {
            ...element,
            delivered,
            opens,
            clicks,
            deliveryRate,
            openRate,
            clickRate,
            bouncedRate,
            replyRate,

            bouncedRateJson,
            deliverabilityRateJson,
            mailboxHealthJson,
          };
        });

        state.tableData = formattedData;
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occurred. Unable to fetch mailboxes.',
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    const onSearchMailboxInput = async () => {
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
      onSearchMailboxInput,
    };
  },
});
</script>

<style lang="scss" scoped>
.sender-mailboxes {
  width: 100%;
  display: flex;
  min-height: 0;
  flex-direction: column;

  .sender-mailboxes-filters {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0px 20px;
    min-height: 40px;
    gap: 16px;

    .mailbox-filter-input {
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

  :deep(.sender-mailboxes-table) {
    min-height: 0;

    .mailbox-route-link {
      display: flex;
      align-items: center;
      height: 100%;
      width: 100%;
      text-decoration: unset;

      color: $black;

      padding: 9px 0px;
    }

    tbody {
      tr {
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
        &:hover {
          .mailbox-name-text {
            color: $primary;
          }
        }

        .bounced-icon {
          @include svg-icon-fill('path', $negative);

          circle {
            &:first-child {
              stroke: $negative;
            }

            &:last-child {
              fill: $negative;
            }
          }
        }
      }
    }
  }
}
</style>
