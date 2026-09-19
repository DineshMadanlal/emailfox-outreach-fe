<template>
  <div class="warmup-profiles-settings custom-scrollbar">
    <!-- save warmup profile -->
    <q-dialog
      v-model="showSaveWarmupProfileModal"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveWarmupProfile
        :readOnly="isReadOnly || selectedWarmupProfileDetails?.is_public || isProfileReadOnly"
        :warmupProfileId="selectedWarmupProfileDetails?.id"
        :warmupProfileDetails="selectedWarmupProfileDetails"

        @createdWarmupProfileDetails="onWarmupProfilesChange"
        @updatedWarmupProfileDetails="onWarmupProfilesChange"
      />
    </q-dialog>

    <!-- Delete warmup profile -->
    <q-dialog
      v-model="showDeleteWarmupProfileModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteWarmupProfile
        :selectedTableDataJson="selectedWarmupProfileDetails"

        @deleteSuccess="onSuccessfulDeleteProfile"
      />
    </q-dialog>

    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          Warmup Profiles
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Create and manage warm-up preferences to improve deliverability.
        </p>
      </div>

      <div class="settings-header-right-side">
        <!-- Create -->
        <q-btn
          no-caps
          unelevated

          class="h-fit"
          color="primary"
          label="Create New Profile"
          :disable="isReadOnly"

          @click="onCreateNewProfile"
        >
          <AppTooltip
            v-if="isReadOnly"
            content="You have read-only access in this workspace"
          />
        </q-btn>
      </div>
    </div>

    <!-- content -->
    <div class="settings-section-content">
      <!-- filter options -->
      <div class="table-filter-options">
        <!--  -->
        <AppSearchInput
          :debounce="500"
          v-model="filters.searchText"

          class="search-filter-input"
          moreClasses="dead-small"
          placeholder="Search profile"

          @update:modelValue="onSearchInput"
        />
      </div>

      <!-- Table -->
      <q-table
        hide-pagination
        :pagination="TABLE_PAGINATION"

        class="app-table app-table-rows-fixed wamrup-profiles-table app-paginated-table"

        :rows="tableData"
        :columns="tableColumns"
        :loading="isApiProcessing"
      >
        <!-- name -->
        <template v-slot:body-cell-name="props">
          <q-td
            :props="props"
          >
            <div class="name-and-action-cell">
              <div>
                {{ props.row.name }}
              </div>

              <InfoTooltip
                v-if="props.row.is_public"

                iconName="info-circle"
                tooltipText="This profile is managed by the system and cannot be modified.
                Create a custom warmup profile to configure
                your own settings and assign it to your mailboxes."
              />

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

                <WarmupMoreOptions
                  :isReadOnly="isReadOnly"
                  :tableRow="props.row"

                  @viewProfile="onViewWarmupProfile"
                  @editProfile="onEditWarmupProfile"
                  @deleteProfile="onRequestDeleteProfile"
                />
              </q-btn>
            </div>
          </q-td>
        </template>
        <!-- Sending Schedule -->
        <template v-slot:body-cell-sendingSchedule="props">
          <q-td
            :props="props"
          >
            <div>
              {{ WARMUP_SENDING_SCHEDULE_LABLES[props.row.sending_schedule]?.label }}
            </div>
          </q-td>
        </template>

        <!-- Reply Rate -->
        <template v-slot:body-cell-replyRate="props">
          <q-td
            :props="props"
          >
            <div>
              {{ props.row.reply_rate }}%
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
// quasar
import { useMeta } from 'quasar';

// vue
import {
  defineComponent, getCurrentInstance, reactive, toRefs, computed,
  onMounted,
} from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';
import InfoTooltip from 'components/General/InfoTooltip.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import WarmupMoreOptions from 'components/Menu/WarmupMoreOptions.vue';
import SaveWarmupProfile from 'components/Warmup/Modals/SaveWarmupProfile.vue';
import DeleteWarmupProfile from 'components/Warmup/Modals/DeleteWarmupProfile.vue';

// utils
import { fetchWarmupProfiles } from 'src/utils/warmupApi';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';
import { usePermissions } from 'src/composables/usePermissions';

// constants
import { TABLE_PAGINATION } from 'boot/constants';
import { WARMUP_SENDING_SCHEDULE_LABLES } from 'boot/warmup-constants';

export default defineComponent({
  name: 'WarmupProfilesSettings',

  components: {
    AppTooltip,
    InfoTooltip,
    AppSearchInput,
    SaveWarmupProfile,
    WarmupMoreOptions,
    DeleteWarmupProfile,
  },

  setup() {
    // app context
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice, generateMetadata } = useAppHelpersApi();
    const { isReadOnly } = usePermissions();

    // metadata
    useMeta(generateMetadata('Warmup Profile Settings'));

    // state
    const state = reactive({
      tableData: [],
      filters: {
        searchText: '',
      },
      //
      selectedWarmupProfileDetails: {},
      isProfileReadOnly: false,

      // modals
      showSaveWarmupProfileModal: false,
      showDeleteWarmupProfileModal: false,

      // loader boolean
      isApiProcessing: false,
      areResultsFetchedOnce: false,
    });

    // computed
    const tableColumns = computed(() => {
      const columns = [
        {
          name: 'name',
          label: 'Profile Name',
          field: 'name',
          align: 'left',
        },
        {
          name: 'dailySendCount',
          label: 'Daily Send Count',
          field: 'max_warmup_value',
          align: 'left',
        },
        {
          name: 'replyRate',
          label: 'Reply Rate',
          field: 'reply_rate',
          align: 'left',
        },
        {
          name: 'timezone',
          label: 'Timezone',
          field: 'schedule_timezone',
          align: 'left',
        },
        {
          name: 'sendingSchedule',
          label: 'Sending Schedule',
          field: 'sending_schedule',
          align: 'left',
        },
      ];

      return columns;
    });

    // methods
    const onCreateNewProfile = () => {
      state.isProfileReadOnly = false;
      state.selectedWarmupProfileDetails = {};

      state.showSaveWarmupProfileModal = true;
    };

    const onEditWarmupProfile = (tableRow) => {
      state.isProfileReadOnly = false;
      state.selectedWarmupProfileDetails = tableRow;

      state.showSaveWarmupProfileModal = true;
    };

    const onViewWarmupProfile = (tableRow) => {
      state.isProfileReadOnly = true;
      state.selectedWarmupProfileDetails = tableRow;

      state.showSaveWarmupProfileModal = true;
    };

    const onRequestDeleteProfile = (tableRow) => {
      state.selectedWarmupProfileDetails = tableRow;

      state.showDeleteWarmupProfileModal = true;
    };

    const onSuccessfulDeleteProfile = () => {
      // find and delete
      const deletedIndex = state.tableData.findIndex(
        (data) => data.id === state.selectedWarmupProfileDetails.id,
      );

      state.tableData.splice(deletedIndex, 1);

      // close the modal
      state.showDeleteWarmupProfileModal = false;
    };

    const fetchData = async () => {
      try {
        state.isApiProcessing = true;

        const params = {
          offset: 0,
          // 25 will be the max we support
          limit: 25,
        };

        // filters
        if (state.filters.searchText) {
          params.search_text = state.filters.searchText;
        }

        // api call
        const response = await fetchWarmupProfiles({
          apiEndPoint: '/warmup/profiles',
          apiParams: params,
        });

        state.tableData = response;
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

    const onRequest = async () => {
      await fetchData();

      if (!state.areResultsFetchedOnce) {
        // make it true
        state.areResultsFetchedOnce = true;
      }
    };

    const onFetchRecords = () => {
      onRequest();
    };

    const onSearchInput = async () => {
      // trim the search text before making the API call
      state.filters.searchText = state.filters.searchText.trim();

      onFetchRecords();
    };

    const onWarmupProfilesChange = () => {
      onFetchRecords();

      // close the modal
      state.showSaveWarmupProfileModal = false;
    };

    // lifecycle hook
    onMounted(() => {
      onFetchRecords();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isReadOnly,
      isMobileDevice,
      tableColumns,

      // methods
      onRequest,
      onSearchInput,
      onCreateNewProfile,
      onViewWarmupProfile,
      onEditWarmupProfile,
      onRequestDeleteProfile,
      onWarmupProfilesChange,
      onSuccessfulDeleteProfile,

      // hardcoded
      TABLE_PAGINATION,
      WARMUP_SENDING_SCHEDULE_LABLES,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-profiles-settings {
  width: 100%;
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;

  // header
  .settings-section-header {
    padding-bottom: 0px;
    border-bottom: 0px;
  }

  // content
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

    .wamrup-profiles-table {
      .name-and-action-cell {
        gap: 8px;
        display: flex;
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
