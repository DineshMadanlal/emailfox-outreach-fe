<template>
  <div class="sending-schedule-settings custom-scrollbar">
    <!-- save schedule -->
    <q-dialog
      v-model="showSaveScheduleModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveSchedule
        :scheduleDetails="selectedScheduleDetails"

        @newCreated="onScheduleChange"
        @existingUpdated="onScheduleChange"
      />
    </q-dialog>

    <!-- delete schedule -->
    <q-dialog
      v-model="showDeleteScheduleModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteSchedule
        :selectedTableDataJson="selectedScheduleDetails"

        @deleteSuccess="onSuccessfulDeleteSchedule"
      />
    </q-dialog>

    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          Sending Schedule
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Define when your campaigns are allowed to send emails.
        </p>
      </div>

      <div
        class="settings-header-right-side"
        v-if="!isTableEmpty"
      >
        <!-- Create -->
        <q-btn
          no-caps
          unelevated

          class="h-fit"
          color="primary"
          label="Create New Schedule"

          @click="onCreateNewSchedule"
        />
      </div>
    </div>

    <!-- Illustration -->
    <div
      v-if="isTableEmpty"
      class="settings-section-content"
    >
      <SendingScheduleIllustration
        @create="onCreateNewSchedule"
      />
    </div>

    <!-- Content -->
    <div
      v-else
      class="settings-section-content"
    >

      <!-- filter options -->
      <div
        class="table-filter-options"
      >
        <!--  -->
        <AppSearchInput
          :debounce="500"
          v-model="filters.searchText"

          class="search-filter-input"
          moreClasses="dead-small"
          placeholder="Search schedule"

          @update:modelValue="onSearchInput"
        />
      </div>

      <!-- Table -->
      <q-table
        hide-pagination
        v-model:pagination="pagination"

        separator="cell"
        class="app-table app-table-rows-fixed schedule-profiles-table app-paginated-table"

        :rows="tableData"
        :columns="tableColumns"
        :loading="isApiProcessing"

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

                @update:model-value="onFetchRecords"

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

        <!-- name -->
        <template v-slot:body-cell-name="props">
          <q-td
            :props="props"
          >
            <div class="name-and-action-cell">
              <div>
                {{ props.row.name }}
              </div>

              <q-space />

              <!-- more options -->
              <q-btn
                dense
                outlined
                unelevated

                class="more-action-btn"
              >
                <!-- more -->
                <LocalSvgIcon
                  image="more"
                  classes="more-menu-icon"
                />

                <ScheduleMoreOptions
                  :tableRow="props.row"

                  @editSchedule="onEditSchedule"
                  @deleteSchedule="onRequestDeleteSchedule"
                />
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- timezone -->
        <template v-slot:body-cell-timezone="props">
          <q-td
            :props="props"
          >
            <div v-if="props.row.timezoneDetails">
              {{ props.row.timezoneDetails.label }}
              <span
                class="text-grey"
                :style="{ fontSize: '12px' }"
              >
                ({{ props.row.timezoneDetails.gmt }})
              </span>
            </div>
          </q-td>
        </template>

        <!-- sending days -->
        <template v-slot:body-cell-sendingDays="props">
          <q-td
            :props="props"
          >
            <div>
              {{ getSendingDaysLabel(props.row.windows) }}
            </div>
          </q-td>
        </template>

        <!-- Last Updated -->
        <template v-slot:body-cell-lastUpdated="props">
          <q-td
            :props="props"
          >
            <div>
              {{ formatDateTimeWithYear(props.row.updated_at) }}
            </div>
          </q-td>
        </template>
      </q-table>

    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance, onMounted, computed,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import ScheduleMoreOptions from 'components/Menu/ScheduleMoreOptions.vue';
import SaveSchedule from 'components/SendingSchedule/Modals/SaveSchedule.vue';
import DeleteSchedule from 'components/SendingSchedule/Modals/DeleteSchedule.vue';
import SendingScheduleIllustration from 'components/Illustrations/SendingSchedule.vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers';
import { fetchWarmupProfiles } from 'src/utils/warmupApi';
import { formatDateTimeWithYear } from 'src/utils/dates';
import { getSendingDaysLabel, getTimezoneJson } from 'src/utils/campaignApi';

// constants
import { DEFAULT_TABLE_PAGINATION } from 'boot/constants';

export default defineComponent({
  name: 'SendingScheduleSettings',

  components: {
    AppSearchInput,
    SaveSchedule,
    DeleteSchedule,
    ScheduleMoreOptions,
    SendingScheduleIllustration,
  },

  setup() {
    // app context
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice, generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Sending Schedule Settings'));

    // state
    const state = reactive({
      pagination: DEFAULT_TABLE_PAGINATION,

      tableData: [],
      filters: {
        searchText: '',
      },
      selectedScheduleDetails: {},

      // modals
      showSaveScheduleModal: false,
      showDeleteScheduleModal: false,

      // loading
      isApiProcessing: false,
      areResultsFetchedOnce: false,
    });

    // computed
    const isFilterApplied = computed(() => !!state.filters.searchText);

    const isTableEmpty = computed(() => {
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

    const tableColumns = computed(() => {
      const columns = [
        {
          name: 'name',
          label: 'Schedule Name',
          field: 'name',
          align: 'left',
        },
        {
          name: 'timezone',
          label: 'Timezone',
          field: 'timezone',
          align: 'left',
        },
        {
          name: 'sendingDays',
          label: 'Sending Days',
          align: 'left',
        },
        {
          name: 'lastUpdated',
          label: 'Last Updated At',
          align: 'left',
        },
        // {
        //   name: 'usedBy',
        //   label: 'Used By',
        //   align: 'left',
        // },
      ];

      return columns;
    });

    // methods
    const onCreateNewSchedule = () => {
      state.selectedScheduleDetails = {};
      state.showSaveScheduleModal = true;
    };

    const onEditSchedule = (tableRow) => {
      state.selectedScheduleDetails = tableRow;

      state.showSaveScheduleModal = true;
    };

    const onRequestDeleteSchedule = (tableRow) => {
      state.selectedScheduleDetails = tableRow;

      state.showDeleteScheduleModal = true;
    };

    const onSuccessfulDeleteSchedule = () => {
      // find and delete
      const deletedIndex = state.tableData.findIndex(
        (data) => data.id === state.selectedScheduleDetails.id,
      );

      state.tableData.splice(deletedIndex, 1);

      // close the modal
      state.showDeleteScheduleModal = false;
    };

    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.isApiProcessing = true;

        const params = {
          offset: (page - 1) * perPage,
          limit: perPage,
        };

        // filters
        if (state.filters.searchText) {
          params.search_text = state.filters.searchText;
        }

        // api call
        const response = await fetchWarmupProfiles({
          apiParams: params,
          apiEndPoint: '/sending-schedules',
        });

        const { data, count } = response;

        // table data
        state.tableData = data.map((item) => ({
          ...item,
          timezoneDetails: getTimezoneJson(item.timezone),
        }));

        state.pagination.rowsNumber = count;
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
      state.pagination.page = params.pagination.page;
      state.pagination.perPage = params.pagination.rowsPerPage;

      await fetchData();

      if (!state.areResultsFetchedOnce) {
        // make it true
        state.areResultsFetchedOnce = true;
      }
    };

    const onFetchRecords = () => {
      onRequest({
        pagination: state.pagination,
      });
    };

    const onSearchInput = async () => {
      // trim the search text before making the API call
      state.filters.searchText = state.filters.searchText.trim();

      onFetchRecords();
    };

    const onScheduleChange = () => {
      // close the modal
      state.showSaveScheduleModal = false;

      // fetch the records again
      onFetchRecords();
    };

    // lifecycle hook
    onMounted(() => {
      onFetchRecords();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isTableEmpty,
      isMobileDevice,
      tableColumns,
      tablePaginationLabel,

      // methods
      onRequest,
      onFetchRecords,
      onSearchInput,
      onEditSchedule,
      onScheduleChange,
      onCreateNewSchedule,
      getSendingDaysLabel,
      formatDateTimeWithYear,
      onRequestDeleteSchedule,
      onSuccessfulDeleteSchedule,
    };
  },
});
</script>

<style lang="scss" scoped>
.sending-schedule-settings {
  width: 100%;
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;

  // header
  .settings-section-header {
    padding-bottom: 0px !important;
    border-bottom: 0px !important;
  }

  .settings-section-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .table-filter-options {
      padding-bottom: 24px;

      .search-filter-input {
        min-width: 260px;
        width: fit-content;

        @media (max-width: $breakpoint-xs-max) {
          min-width: 200px;
        }
      }
    }

    .schedule-profiles-table {
      .name-and-action-cell {
        display: flex;
        gap: 16px;
        align-items: center;

        .more-action-btn {
          .more-menu-icon {
            transform: rotate(90deg);
          }
        }
      }
    }
  }
}
</style>
