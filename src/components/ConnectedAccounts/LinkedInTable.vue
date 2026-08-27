<template>
  <div class="account-table-container">
    <!-- Column Visibility -->
    <q-dialog
      v-model="modals.showColumnsVisibilityModal"
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
        v-model:visibleColumns="tableState.visibleColumns"

        @update:visible-columns="onUpdateVisibleColumns"
      />
    </q-dialog>

    <!-- Update Sending Limits -->
    <q-dialog
      v-model="modals.showUpdateLinkedInLimitsModal"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <UpdateLinkedInLimits
        :editLinkedInJson="editLinkedInJson"

        @sendingLimitsUpdated="onUpdateLinkedInById"
      />
    </q-dialog>

    <!-- LinkedIn Proxy Settings -->
    <q-dialog
      v-model="modals.showLinkedInProxySettingsModal"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <LinkedInProxySettings
        :editLinkedInJson="editLinkedInJson"

        @proxySettingsUpdated="onUpdateLinkedInById"
      />
    </q-dialog>

    <!-- Delete LinkedIn -->
    <q-dialog
      v-model="modals.showDeleteLinkedInModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteLinkedIn
        :editLinkedInJson="editLinkedInJson"

        @onSuccessfulDelete="onDeleteLinkedInAccount"
      />
    </q-dialog>

    <!-- Header -->
    <AppHeader
      v-if="fromAllLinkedInPage"
      title="LinkedIn Accounts"
    >
      <template v-slot:headerRightSection>
        <!-- Connect LinkedIn -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Connect LinkedIn"

          :loading="loaders.isConnectApi"

          @click="onConnectLinkedInAccount"

          v-if="!showLinkedInIllustration"
        />
      </template>
    </AppHeader>

    <!-- Loader -->
    <ApiLoader
      :show="true"

      v-if="showApiLoader"
    />

    <div
      v-else
      class="account-table-content-container"
    >
      <!-- Show loader when the API is processing -->
      <ApiLoader
        :show="showApiLoader"

        v-if="!showLinkedInIllustration"
      />

      <LinkedInAccountsIllustration
        v-if="showLinkedInIllustration"

        :loading="loaders.isConnectApi"

        @connectAccount="onConnectLinkedInAccount"
      />

      <!-- Filter Header -->
      <div
        v-else
        class="filter-header"
      >
        <!-- search input -->
        <AppSearchInput
          :debounce="500"
          v-model="tableState.filters.searchText"

          class="account-filter-input"
          moreClasses="dead-small"
          placeholder="Search account"

          @update:modelValue="onSearchAccounts"
        />

        <q-space />

        <!--  -->
        <ColumnsVisibilityButton
          @click="modals.showColumnsVisibilityModal = true"
        />
      </div>

      <!-- Table -->
      <q-table
        virtual-scroll

        v-if="!showLinkedInIllustration"
        v-model:pagination="tableState.pagination"

        separator="cell"
        class="app-table all-accounts-table app-table-rows-fixed app-paginated-table no-border-left"

        :rows="tableState.data"
        :columns="tableColumns"

        :loading="loaders.isFetchApi"

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
                v-model="tableState.pagination.rowsPerPage"

                @update:model-value="onFetchLinkedInRecords"

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
        <!-- Account Name -->
        <template v-slot:body-cell-accountName="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <div class="name-and-action-cell">
                <q-img
                  :src="props.row.picture_url"
                  :alt="props.row.name"
                  class="account-profile-image"
                />

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

                  @click.stop.prevent
                >
                  <!-- more -->
                  <LocalSvgIcon
                    image="more"
                    classes="more-menu-icon"
                  />

                  <!-- menu -->
                  <q-menu
                    auto-close
                    transition-show="jump-down"
                    transition-hide="jump-up"
                    content-class="bg-white text-dark"
                  >
                    <LinkedInMoreOptions
                      :tableRow="props.row"

                      @editSendingLimits="editSendingLimits"
                      @updateProxySettings="updateProxySettings"
                      @deleteAccount="deleteLinkedInAccount"
                    />
                  </q-menu>
                </q-btn>
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-status="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <!--  -->
              <ConnectionStatus
                :status="props.row.status"
              />
            </router-link>
          </q-td>
        </template>

        <!-- Proxy & Location -->
        <template v-slot:body-cell-proxyAndLocation="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <div>
                {{ props.row.proxy_country || '-' }}
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Total Actions -->
        <template v-slot:body-cell-totalActions="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <div>
                {{ getNumeralAmount(props.row.limits?.LINKEDIN_TOTAL_ACTIONS?.used || 0) }}
                / {{ props.row.limits?.LINKEDIN_TOTAL_ACTIONS?.max || 0 }}
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Profile Views -->
        <template v-slot:body-cell-profileViews="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <div>
                {{ getNumeralAmount(props.row.limits?.LINKEDIN_VISIT_PROFILE?.used || 0) }}
                / {{ props.row.limits?.LINKEDIN_VISIT_PROFILE?.max || 0 }}
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Follow Profiles -->
        <template v-slot:body-cell-followProfiles="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <div>
                {{ getNumeralAmount(props.row.limits?.LINKEDIN_FOLLOW_PROFILE?.used || 0) }}
                / {{ props.row.limits?.LINKEDIN_FOLLOW_PROFILE?.max || 0 }}
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Latest Post Likes -->
        <template v-slot:body-cell-latestPostLikes="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <div>
                {{ getNumeralAmount(props.row.limits?.LINKEDIN_LIKE_POST?.used || 0) }}
                / {{ props.row.limits?.LINKEDIN_LIKE_POST?.max || 0 }}
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Connection Requests -->
        <template v-slot:body-cell-connectionRequests="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <div>
                {{ getNumeralAmount(props.row.limits?.LINKEDIN_CONNECTION_REQUEST?.used || 0) }}
                / {{ props.row.limits?.LINKEDIN_CONNECTION_REQUEST?.max || 0 }}
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Messages -->
        <template v-slot:body-cell-messages="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <div>
                {{ getNumeralAmount(props.row.limits?.LINKEDIN_MESSAGE?.used || 0) }}
                / {{ props.row.limits?.LINKEDIN_MESSAGE?.max || 0 }}
              </div>
            </router-link>
          </q-td>
        </template>

        <!-- Inmails -->
        <template v-slot:body-cell-inmails="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/outreach/linkedin/${props.row.id}`"
              class="account-route-link"
            >
              <div>
                {{ getNumeralAmount(props.row.limits?.LINKEDIN_INMAIL?.used || 0) }}
                / {{ props.row.limits?.LINKEDIN_INMAIL?.max || 0 }}
              </div>
            </router-link>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, toRefs, reactive, getCurrentInstance, onMounted, computed,
} from 'vue';

// router
import { useRoute, useRouter } from 'vue-router';

// quasar
import { useMeta } from 'quasar';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import AppHeader from 'components/Headers/AppHeader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import ConnectionStatus from 'components/ConnectedAccounts/ConnectionStatus.vue';
import ColumnsVisibility from 'components/Modals/ColumnsVisibility.vue';
import ColumnsVisibilityButton from 'components/Buttons/ColumnsVisibility.vue';
import LinkedInAccountsIllustration from 'components/Illustrations/LinkedInAccounts.vue';

import LinkedInMoreOptions from 'components/Menu/LinkedInMoreOptions.vue';
import DeleteLinkedIn from 'components/ConnectedAccounts/Modals/DeleteLinkedIn.vue';
import UpdateLinkedInLimits from 'components/ConnectedAccounts/Modals/UpdateLinkedInLimits.vue';
import LinkedInProxySettings from 'components/ConnectedAccounts/Modals/LinkedInProxySettings.vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { getNumeralAmount } from 'src/utils/numbers';
import { connectNewLinkedInAccount } from 'src/utils/domainMailboxesApi.js';

// Import the pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// constants
import { DEFAULT_TABLE_PAGINATION } from 'boot/constants';

export default defineComponent({
  name: 'LinkedInTable',

  components: {
    ApiLoader,
    AppHeader,
    ConnectionStatus,
    AppSearchInput,
    ColumnsVisibility,
    ColumnsVisibilityButton,
    LinkedInAccountsIllustration,
    UpdateLinkedInLimits,
    DeleteLinkedIn,
    LinkedInMoreOptions,
    LinkedInProxySettings,
  },

  props: {
    fromAllLinkedInPage: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // store
    const userStore = useUserPreferencesStore();

    //
    const linkedInFilters = {
      searchText: '',
    };

    // instance
    const { appContext } = getCurrentInstance();

    // route
    const $route = useRoute();
    const $router = useRouter();

    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('LinkedIn Accounts'));

    // state
    const state = reactive({
      loaders: {
        isFetchApi: false,
        isConnectApi: false,
      },

      tableState: {
        data: [],
        pagination: {},
        areResultsFetchedOnce: false,

        // multi select
        showTableMultiSelectMenu: false,

        //
        filters: { ...linkedInFilters },

        // columns visibility
        visibleColumns: [],
      },

      modals: {
        showDeleteLinkedInModal: false,
        showColumnsVisibilityModal: false,
        showUpdateLinkedInLimitsModal: false,
        showLinkedInProxySettingsModal: false,
      },

      editLinkedInJson: {},
    });

    const showApiLoader = computed(() => {
      if (state.tableState.areResultsFetchedOnce) {
        return false;
      }

      return state.loaders.isFetchApi;
    });

    const isFilterApplied = computed(() => {
      // take the keys of filters and check if all are values are empty
      const filterKeys = Object.keys(state.tableState.filters);
      const areAllFiltersEmpty = filterKeys.every((key) => isEmpty(state.tableState.filters[key]));

      return !areAllFiltersEmpty;
    });

    const showLinkedInIllustration = computed(() => {
      if (state.loaders.isFetchApi
        || !state.tableState.areResultsFetchedOnce || isFilterApplied.value) {
        return false;
      }

      return state.tableState.pagination.rowsNumber === 0;
    });

    const showLinkedInFilters = computed(() => {
      if (isFilterApplied.value) {
        return true;
      }

      return state.tableState.pagination.rowsNumber !== 0;
    });

    const tablePaginationLabel = computed(() => {
      const { page, perPage, rowsNumber } = state.tableState.pagination;

      const start = (page - 1) * perPage + 1;
      const end = page * perPage;

      return `${start} to ${end} of ${getNumeralAmount(rowsNumber)}`;
    });

    const baseColumns = [
      {
        name: 'accountName',
        label: 'Account Name',
        align: 'left',
      },
      // status
      {
        name: 'status',
        label: 'Status',
        align: 'left',
      },
    ];

    const dynamicColumns = computed(() => {
      const columns = [
        // Proxy and location
        {
          name: 'proxyAndLocation',
          label: 'Proxy & Location',
          align: 'left',
        },
        // total actions
        {
          name: 'totalActions',
          label: 'Total Actions',
          align: 'left',
        },
        // profile views
        {
          name: 'profileViews',
          label: 'Profile Views',
          align: 'left',
        },
        // follow profiles
        {
          name: 'followProfiles',
          label: 'Follow Profiles',
          align: 'left',
        },
        // like latest post
        {
          name: 'latestPostLikes',
          label: 'Latest Post Likes',
          align: 'left',
        },
        // Connection Request
        {
          name: 'connectionRequests',
          label: 'Connection Requests',
          align: 'left',
        },
        // Messages
        {
          name: 'messages',
          label: 'Messages',
          align: 'left',
        },
        // Inmails
        {
          name: 'inmails',
          label: 'Inmails',
          align: 'left',
        },
      ];

      return columns;
    });

    const tableColumns = computed(() => {
      const filteredColumns = dynamicColumns.value.filter(
        (col) => state.tableState.visibleColumns.includes(col.name),
      );

      return [
        ...baseColumns,
        ...filteredColumns,
      ];
    });

    // methods
    const updateDataToStore = (inputObject) => {
      if (props.fromAllLinkedInPage) {
        userStore.setMultipleFields({
          linkedInAccountsState: {
            ...userStore.linkedInAccountsState,
            ...inputObject,
          },
        });
      }
    };

    // API Calls
    const fetchData = async (page = 1, perPage = 10) => {
      try {
        state.loaders.isFetchApi = true;

        const params = {
          offset: (page - 1) * perPage,
          limit: perPage,
        };

        if (state.tableState.filters.searchText) {
          params.search_text = state.tableState.filters.searchText;
        }

        const response = await getApiCall({
          params,
          endpoint: '/connected-accounts/linkedin',
          includeWorkspace: true,
        });

        // response data
        state.tableState.data = response.data;
        state.tableState.pagination.rowsNumber = response.count;

        // store in pinia
        updateDataToStore({
          tableData: response.data,
          pagination: state.tableState.pagination,
          filters: state.tableState.filters,
        });
      } catch (error) {
        // Show a toaster
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isFetchApi = false;
      }
    };

    const onRequest = async (params) => {
      state.loaders.isFetchApi = true;

      state.tableState.pagination.page = params.pagination.page;
      state.tableState.pagination.perPage = params.pagination.rowsPerPage;

      await fetchData(
        state.tableState.pagination.page,
        state.tableState.pagination.perPage,
      );

      if (!state.tableState.areResultsFetchedOnce) {
        // make it true
        state.tableState.areResultsFetchedOnce = true;
      }
    };

    const onFetchLinkedInRecords = () => {
      onRequest({
        pagination: state.tableState.pagination,
      });
    };

    const onUpdateVisibleColumns = () => {
      // store in pinia
      updateDataToStore({
        visibleColumns: state.tableState.visibleColumns,
      });
    };

    const onSearchAccounts = (searchText) => {
      state.tableState.filters.searchText = searchText?.trim();

      onFetchLinkedInRecords();
    };

    const editSendingLimits = (linkedInJson) => {
      state.editLinkedInJson = { ...linkedInJson };
      state.modals.showUpdateLinkedInLimitsModal = true;
    };

    const updateProxySettings = (linkedInJson) => {
      state.editLinkedInJson = { ...linkedInJson };
      state.modals.showLinkedInProxySettingsModal = true;
    };

    const deleteLinkedInAccount = (linkedInJson) => {
      state.editLinkedInJson = { ...linkedInJson };
      state.modals.showDeleteLinkedInModal = true;
    };

    const onUpdateLinkedInById = (updatedLinkedInJson) => {
      state.editLinkedInJson = {};

      // close the modals
      state.modals.showUpdateLinkedInLimitsModal = false;
      state.modals.showLinkedInProxySettingsModal = false;

      // update the table data
      const updatedData = state.tableState.data.map((row) => {
        if (row.id === updatedLinkedInJson.id) {
          return {
            ...row,
            ...updatedLinkedInJson,
          };
        }

        return row;
      });

      state.tableState.data = [...updatedData];
    };

    const onDeleteLinkedInAccount = () => {
      state.modals.showDeleteLinkedInModal = false;

      // find the deleted account and remove it from the table data
      const updatedData = state.tableState.data.filter(
        (row) => row.id !== state.editLinkedInJson.id,
      );
      state.tableState.data = [...updatedData];

      state.tableState.pagination.rowsNumber -= 1;

      state.editLinkedInJson = {};

      updateDataToStore({
        tableData: state.tableState.data,
        pagination: state.tableState.pagination,
      });
    };

    const makeApiCallOnMounted = async () => {
      const {
        tableData, filters, pagination, visibleColumns,
      } = userStore.linkedInAccountsState || {};

      state.tableState.pagination = pagination || DEFAULT_TABLE_PAGINATION;

      if (props.fromAllLinkedInPage) {
        // prefill
        state.tableState.data = tableData || [];
        state.tableState.filters = filters || { ...linkedInFilters };

        state.tableState.areResultsFetchedOnce = !isEmpty(tableData);

        // set from store
        state.tableState.visibleColumns = [...visibleColumns];
      }

      if (isEmpty(state.tableState.visibleColumns)) {
        state.tableState.visibleColumns = dynamicColumns.value.map((col) => col.name);
      }

      onRequest({
        pagination: state.tableState.pagination,
      });
    };

    const onConnectLinkedInAccount = async () => {
      try {
        state.loaders.isConnectApi = true;

        const currentOrigin = window.location.origin;

        const redirectUrl = encodeURIComponent(`${currentOrigin}/outreach/linkedin/accounts`);

        await connectNewLinkedInAccount(redirectUrl);

        appContext.config.globalProperties.$toast({
          message: 'Account connected successfully.',
        });

        //
        // $router.push(`/outreach/linkedin/${response.account_id}`);
        $router.push('/outreach/linkedin/accounts');
        onFetchLinkedInRecords();
      } catch (error) {
        // Show a toaster
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isConnectApi = false;
      }
    };

    // lifecycle hook
    onMounted(() => {
      const {
        connectionSuccess, account_id, error,
      } = $route.query;

      if (error || (connectionSuccess && account_id)) {
        if (window.opener) {
          // 1. Focus back to the main app tab
          try {
            window.opener.focus();
          } catch (e) {
            // ignore cross-origin focus errors
          }
          // 2. Post error or success message
          // if (error) {
          //   window.opener.postMessage({
          //     type: 'OAUTH_AUTH_ERROR',
          //     error: error || 'Authentication failed',
          //   }, '*');
          // } else if (connectionSuccess && account_id) {
          //   window.opener.postMessage({
          //     type: 'OAUTH_AUTH_SUCCESS',
          //     payload: {
          //       account_id,
          //     },
          //   }, '*');
          // }

          if (connectionSuccess && account_id) {
            window.opener.postMessage({
              type: 'OAUTH_AUTH_SUCCESS',
              payload: {
                account_id,
              },
            }, '*');
          }
        }
        // 3. CLOSE THE POPUP TAB NOW!
        window.close();
      } else {
        // make api call
        makeApiCallOnMounted();
      }
    });

    //
    return {
      // state
      ...toRefs(state),

      // computed
      baseColumns,
      dynamicColumns,
      isMobileDevice,
      tableColumns,
      showApiLoader,
      showLinkedInIllustration,
      showLinkedInFilters,
      tablePaginationLabel,
      isFilterApplied,

      // utils
      getNumeralAmount,

      // methods
      onRequest,
      onSearchAccounts,

      editSendingLimits,
      updateProxySettings,
      deleteLinkedInAccount,

      onUpdateLinkedInById,
      onFetchLinkedInRecords,
      onUpdateVisibleColumns,
      onConnectLinkedInAccount,
      onDeleteLinkedInAccount,
    };
  },
});
</script>

<style lang="scss" scoped>
.account-table-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  position: relative;

  :deep(.app-header) {
    padding-bottom: 0;
  }

  .account-table-content-container {
    width: 100%;
    position: relative;
    min-height: 0;
    flex: 1;

    display: flex;
    flex-direction: column;

    .filter-header {
      padding: 20px;

      display: flex;
      gap: 8px;
      align-items: center;

      overflow-x: auto;
      overflow-y: hidden;

      .account-filter-input {
        min-width: 260px;
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 12px;

        .account-filter-input {
          min-width: 200px;
        }
      }
    }

    :deep(.all-accounts-table) {
      display: grid;
      min-height: 0;
      border-top: 0px;

      .name-and-action-cell {
        width: 100%;
        gap: 8px;
        display: flex;
        align-items: center;

        .account-profile-image {
          height: 32px;
          width: 32px;
          border-radius: 5px;
        }

        .more-action-btn {
          .more-menu-icon {
            transform: rotate(90deg);
          }
        }
      }

      .account-route-link {
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
        text-decoration: unset;

        padding: 2px 0px;

        color: $black;
      }
    }
  }
}
</style>
