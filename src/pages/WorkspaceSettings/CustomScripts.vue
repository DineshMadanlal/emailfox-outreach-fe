<template>
  <div class="custom-scripts-settings">
    <!-- Header -->
    <div class="settings-section-header">
      <div class="flex no-wrap items-center">
        <div>
          <!-- header text -->
          <p class="settings-header-text">
            Custom Scripts
          </p>

          <!-- label text -->
          <p class="settings-label-text">
            Use this to integrate tools like analytics, live chat,
            or user feedback widgets into your customer portal.
          </p>
        </div>

        <q-space />

        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Add Script"
          class="add-script-btn"

          @click="onAddNewScript"
        />
      </div>
    </div>

    <!-- Dialog -->
    <q-dialog
      v-model="showSaveScriptModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveScript
        :editScriptJson="selectedScriptJson"
        @onSuccessSaveScript="onSaveScript"
      />
    </q-dialog>

    <!-- Delete Script Dialog -->
    <q-dialog
      v-model="showDeleteScriptModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteScript
        :scriptJson="selectedScriptJson"
        @successDelete="onSuccessScriptDelete"
      />
    </q-dialog>

    <!-- Update Script Status Dialog -->
    <q-dialog
      v-model="showUpdateScriptStatusModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <UpdateScriptStatus
        :scriptJson="selectedScriptJson"
        @successStatusUpdate="onSuccessScriptUpdate"
      />
    </q-dialog>

    <!-- Content -->
    <div class="settings-section-content">
      <!-- Loader -->
      <ApiLoader
        :show="true"

        v-if="showApiLoader"
      />

      <div
        v-else
        class="full-width"
      >
        <!-- Illustration -->
        <CustomScriptsIllustration
          v-if="showCustomScriptIllustration"

          @onAddNewScript="showSaveScriptModal = true"
        />

        <!-- Table -->
        <div
          v-else
          class="full-width"
        >
          <!-- Show loader when the API is processing -->
          <ApiLoader
            :show="isApiProcessing"
          />

          <!--  -->
          <q-table
            hide-pagination
            :pagination="TABLE_PAGINATION"

            separator="cell"
            class="app-table custom-scripts-table app-paginated-table"

            :rows="tableData"
            :columns="tableColumns"

            :grid="isMobileDevice"

            :loading="isApiProcessing"
          >
            <!-- name -->
            <template v-slot:body-cell-name="props">
              <q-td
              :props="props"
              >
                <div class="flex no-wrap items-center">
                  <LocalSvgIcon
                    image="scripts"
                    class="script-icon"
                  />

                  <p
                    class="script-label-text"
                    :class="props.row.status === SCRIPT_STATUS.INACTIVE
                        ? 'inactive-script-text' : ''"
                  >
                    {{ props.row.name }}
                  </p>
                </div>
              </q-td>
            </template>

            <!-- Placement -->
            <template v-slot:body-cell-placement="props">
              <q-td
                :props="props"
              >
                <p
                  class="script-label-text"
                  :class="props.row.status === SCRIPT_STATUS.INACTIVE ? 'inactive-script-text' : ''"
                >
                  {{ props.row.placement }}
                </p>
              </q-td>
            </template>

            <!-- Script -->
            <template v-slot:body-cell-script="props">
              <q-td
                :props="props"
              >
                <p class="script-text ellipsis">
                  {{ props.row.script }}
                </p>
              </q-td>
            </template>

            <!-- Status -->
            <template v-slot:body-cell-status="props">
              <q-td
                :props="props"
              >
                <p
                  class="apptable-status-text"
                  :class="props.row.status === SCRIPT_STATUS.INACTIVE ? 'inactive' : 'active'"
                >
                  {{ props.row.status }}
                </p>
              </q-td>
            </template>

            <template v-slot:body-cell-more="props">
              <q-td
                :props="props"
                :class="{
                  'action-td': moreOptionsMenuScriptId !== props.row.id
                }"
              >
                <div>
                  <!-- more options -->
                  <q-btn
                    dense
                    outlined
                    unelevated
                    @click.stop.prevent

                    class="script-action-btn"

                    :class="{
                      'active': moreOptionsMenuScriptId === props.row.id
                    }"
                  >
                    <!-- more -->
                    <LocalSvgIcon
                      image="more"
                      classes="script-menu-icon"
                    />

                    <CustomScriptsMoreOptions
                      :show-menu="moreOptionsMenuScriptId === props.row.id"

                      :scriptJson="props.row"

                      @editScript="onEditScript"
                      @deleteScript="onDeleteScript"
                      @updateScriptStatus="onUpdateScriptStatus"
                      @update:showMenu="moreOptionsMenuScriptId = $event ? props.row.id : null"
                    />
                  </q-btn>
                </div>

              </q-td>
            </template>

            <template v-slot:item="props">
              <CustomScriptItemMobileView
                :scriptTableProps="props"
              />
            </template>
          </q-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// quasar
import { useMeta } from 'quasar';

// vue
import {
  defineComponent, onMounted, reactive, toRefs, getCurrentInstance, computed,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import SaveScript from 'components/CustomScripts/Modals/SaveScript.vue';
import DeleteScript from 'components/CustomScripts/Modals/DeleteScript.vue';
import CustomScriptsIllustration from 'components/Illustrations/CustomScripts.vue';
import CustomScriptsMoreOptions from 'components/Menu/CustomScriptsMoreOptions.vue';
import UpdateScriptStatus from 'components/CustomScripts/Modals/UpdateScriptStatus.vue';
import CustomScriptItemMobileView from 'components/CustomScripts/CustomScriptItemMobileView.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { getApiCall } from 'src/utils/apiRequests';

// constants
import { TABLE_PAGINATION, SCRIPT_STATUS } from 'boot/constants';

export default defineComponent({
  name: 'CustomScripts',

  components: {
    ApiLoader,
    SaveScript,
    DeleteScript,
    UpdateScriptStatus,
    CustomScriptsMoreOptions,
    CustomScriptItemMobileView,
    CustomScriptsIllustration,
  },

  setup() {
    // instance
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice, generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Custom Scripts'));

    // state
    const state = reactive({
      tableData: [],

      isApiProcessing: false,
      areResultsFetchedOnce: false,

      selectedScriptJson: {},
      moreOptionsMenuScriptId: null,

      // modals
      showSaveScriptModal: false,
      showDeleteScriptModal: false,
      showUpdateScriptStatusModal: false,
    });

    // computed
    const showCustomScriptIllustration = computed(() => {
      if (state.isApiProcessing || !state.areResultsFetchedOnce) {
        return false;
      }

      return isEmpty(state.tableData);
    });

    const tableColumns = computed(() => {
      const columns = [
        {
          name: 'name',
          label: 'Name',
          align: 'left',
        },
        {
          name: 'placement',
          label: 'Placement',
          align: 'left',
        },
        {
          name: 'script',
          label: 'Script',
          align: 'left',
        },
        {
          name: 'status',
          label: 'Status',
          align: 'left',
        },
        {
          name: 'more',
          label: '',
          align: 'right',
        },
      ];

      return columns;
    });

    const showApiLoader = computed(() => {
      if (state.areResultsFetchedOnce) {
        return false;
      }

      return state.isApiProcessing;
    });

    // methods
    const onRequest = async () => {
      try {
        state.isApiProcessing = true;

        const response = await getApiCall({
          endpoint: '/partners/custom-scripts',
        });

        state.tableData = response.scripts;

        if (!state.areResultsFetchedOnce) {
        // make it true
          state.areResultsFetchedOnce = true;
        }
      } catch (error) {
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occured. Unable to fetch custom scripts.',
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    const makeApiCallOnMounted = async () => {
      onRequest();
    };

    const onAddNewScript = () => {
      state.selectedScriptJson = {};
      state.showSaveScriptModal = true;
    };

    const onEditScript = (scriptJson) => {
      state.selectedScriptJson = scriptJson;
      state.showSaveScriptModal = true;
    };

    const onDeleteScript = (scriptJson) => {
      state.selectedScriptJson = scriptJson;
      state.showDeleteScriptModal = true;
    };

    const onUpdateScriptStatus = (scriptJson) => {
      state.selectedScriptJson = scriptJson;
      state.showUpdateScriptStatusModal = true;
    };

    const updateScriptTableData = (updatedScriptJson) => {
      const scriptIndex = state.tableData.findIndex((script) => script.id === updatedScriptJson.id);

      if (scriptIndex >= 0) {
        // update the existing script
        state.tableData[scriptIndex] = updatedScriptJson;
      } else {
        // add new script
        state.tableData.push(updatedScriptJson);
      }
    };

    const onSuccessScriptUpdate = (updatedScriptJson) => {
      updateScriptTableData(updatedScriptJson);

      // close the modal
      state.showUpdateScriptStatusModal = false;
    };

    const onSuccessScriptDelete = (scriptJson) => {
      state.tableData = state.tableData.filter((script) => script.id !== scriptJson.id);

      // close the modal
      state.showDeleteScriptModal = false;
    };

    const onSaveScript = (updatedScriptJson) => {
      updateScriptTableData(updatedScriptJson);

      state.showSaveScriptModal = false;
    };

    onMounted(() => {
      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      showApiLoader,
      tableColumns,
      showCustomScriptIllustration,

      // methods
      onSaveScript,
      onEditScript,
      onDeleteScript,
      onAddNewScript,
      onSuccessScriptUpdate,
      onUpdateScriptStatus,
      onSuccessScriptDelete,

      // constants
      SCRIPT_STATUS,
      TABLE_PAGINATION,
    };
  },
});
</script>

<style lang="scss" scoped>
.custom-scripts-settings {
  width: 100%;

  .settings-section-header {
    .add-script-btn {
      margin-left: 16px;
      white-space: nowrap;
    }
  }

  .settings-section-content {
    position: relative;
    min-height: 300px;

    :deep(.custom-scripts-table) {
      .script-icon {
        margin-right: 8px;
      }

      .script-label-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px; /* 114.286% */

        &.inactive-script-text {
          color: $grey;
        }
      }

      .script-text {
        color: $grey;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px; /* 114.286% */

        max-width: 250px;
        white-space: nowrap;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          max-width: unset;
          width: 100%;
        }
      }

      .script-action-btn {
        &:hover, &.active {
          border-radius: 6px;
          background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);

          :deep(.script-menu-icon) {
            @include svg-icon-stroke('path, circle, rect', $primary);
          }
        }
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        border: 0px;

        .q-table__middle {
          display: none;
          border-bottom: 0px;
        }
      }

      .q-table__grid-content {
        display: grid;
        grid-row-gap: 8px;
      }
    }
  }
}
</style>
