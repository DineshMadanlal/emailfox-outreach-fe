<template>
  <div
    class="preferences-folder"
  >
    <!-- Modals -->
    <q-dialog
      v-model="showDeleteFolderModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteFolder
        :folderJson="selectedFolderJson"
        @successDelete="onSuccessDeleteFolder"
      />
    </q-dialog>

    <q-dialog
      v-model="showUpdateFolderStatusModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <UpdateFolderStatus
        :folderJson="selectedFolderJson"
        @successFolderUpdate="onSuccessFolderUpdate"
      />
    </q-dialog>

    <q-dialog
      v-model="showApplyToExistingInboxModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ApplyToExistingInbox
        :folderJson="selectedFolderJson"
        @onClose="onCloseModalByState('showApplyToExistingInboxModal')"
      />
    </q-dialog>

    <!-- Header -->
    <div class="preferences-folder-header">
      <!-- Left Section -->
      <div class="folder-left-section">
        <h4 class="header-title-text">
          Folders
        </h4>

        <p class="header-desc-text">
          Manage your folders to customize your email experience.
        </p>
      </div>

      <q-space />

      <!-- Right Section -->
      <div class="folder-right-section">
        <!-- search input -->
        <AppSearchInput
          v-if="false"

          :debounce="500"
          v-model="searchInput"

          class="view-input"
          placeholder="Search by folder name"
        />

        <!-- New folder -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="+ New Folder"
          class="new-folder-btn"
          to="/unibox/preferences/folder/add"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="preferences-folder-content">
      <SkyBoxFoldersIllustration
        v-if="showAllSkyBoxFoldersIllustration"
      />

      <!--  -->
      <q-table
        v-else

        separator="cell"
        class="app-table all-folders-table app-paginated-table"

        hide-pagination
        :rows="tableData"
        :grid="isMobileDevice"
        :columns="tableColumns"

        :loading="isApiProcessing"
        :pagination="TABLE_PAGINATION"
        :style="{ maxHeight: tableMaxHeight }"

        v-model:selected="selectedFolders"
      >
        <!-- template header checkbox -->
        <template v-slot:header-selection="scope">
          <q-checkbox
            dense

            v-model="scope.selected"

            color="primary"
            class="app-checkbox"
          />
        </template>

        <!-- template body checkbox -->
        <template v-slot:body-selection="scope">
          <q-checkbox
            dense
            color="primary"
            class="app-checkbox"

            v-model="scope.selected"
          />
        </template>

        <!-- Content -->
        <!-- Folder name -->
        <template v-slot:body-cell-name="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/unibox/preferences/folder/${props.row.id}/edit`"
              class="folder-route-link"
            >
              <p class="table-label-text">
                {{ props.row.name }}
              </p>
            </router-link>
          </q-td>
        </template>

        <!-- Rules -->
        <template v-slot:body-cell-rules="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/unibox/preferences/folder/${props.row.id}/edit`"
              class="folder-route-link"
            >
              <p class="table-label-text">
                {{ props.row.rules?.length }} {{ $pluralize('Rule', props.row.rules?.length) }}
              </p>
            </router-link>
          </q-td>
        </template>

        <!-- Status -->
        <template v-slot:body-cell-status="props">
          <q-td
            :props="props"
          >
            <router-link
              :to="`/unibox/preferences/folder/${props.row.id}/edit`"
              class="folder-route-link"
            >
              <p
                class="apptable-status-text"

                :class="{
                  'active': props.row.status === FOLDER_STATUS.ACTIVE,
                  'inactive': props.row.status === FOLDER_STATUS.INACTIVE,
                }"
              >
                {{ props.row.status }}
              </p>
            </router-link>
          </q-td>
        </template>

        <!-- more -->
        <template v-slot:body-cell-more="props">
          <q-td
            key="more"
            :props="props"
            :class="{
              'action-td': moreOptionsMenuFolderId !== props.row.id
            }"
          >
            <div>
              <router-link
                :to="`/unibox/preferences/folder/${props.row.id}/edit`"
                class="folder-route-link justify-end"
              >
                <!-- more options -->
                <q-btn
                  dense
                  outlined
                  unelevated
                  @click.stop.prevent

                  class="folder-action-btn"

                  :class="{
                    'active': moreOptionsMenuFolderId === props.row.id
                  }"
                >
                  <!-- more -->
                  <LocalSvgIcon
                    image="more"
                    classes="folder-menu-icon"
                  />

                  <!-- Menu -->
                  <FoldersMoreOptions
                    :folderJson="props.row"

                    :showMenu="moreOptionsMenuFolderId === props.row.id"

                    @deleteFolder="onDeleteFolder"
                    @updateFolderStatus="onUpdateFolderStatus"
                    @applyToExistingInbox="onApplyToExistingInbox"
                    @update:showMenu="moreOptionsMenuFolderId = $event ? props.row.id : null"
                  />
                </q-btn>
              </router-link>
            </div>
          </q-td>
        </template>

        <template v-slot:item="props">
          <FolderItemMobileView
            :folderTableProps="props"

            @deleteFolder="onDeleteFolder"
            @updateFolderStatus="onUpdateFolderStatus"
            @applyToExistingInbox="onApplyToExistingInbox"
          />
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import {
  defineComponent, toRefs, reactive, computed, getCurrentInstance,
  onMounted,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// components
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import FoldersMoreOptions from 'components/Menu/FoldersMoreOptions.vue';
import SkyBoxFoldersIllustration from 'components/Illustrations/SkyBoxFolders.vue';
import FolderItemMobileView from 'components/SkyBoxFolders/FolderItemMobileView.vue';

import DeleteFolder from 'components/SkyBoxFolders/Modals/DeleteFolder.vue';
import UpdateFolderStatus from 'components/SkyBoxFolders/Modals/UpdateFolderStatus.vue';
import ApplyToExistingInbox from 'components/SkyBoxFolders/Modals/ApplyToExistingInbox.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { getApiCall } from 'src/utils/apiRequests';

// store pinia
import { useSkyboxStore } from 'src/stores/skybox.js';

// constants
import { FOLDER_STATUS, TABLE_PAGINATION } from 'boot/constants';

export default defineComponent({
  name: 'SkyBoxFolders',

  components: {
    AppSearchInput,
    FoldersMoreOptions,
    SkyBoxFoldersIllustration,
    FolderItemMobileView,

    // modals
    DeleteFolder,
    UpdateFolderStatus,
    ApplyToExistingInbox,
  },

  setup() {
    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Unibox Folders'));

    //
    const { appContext } = getCurrentInstance();

    // store
    const skyboxPinia = useSkyboxStore();

    // state
    const state = reactive({
      searchInput: '',

      isApiProcessing: false,
      areResultsFetchedOnce: false,

      // table ref
      tableMaxHeight: '100%',

      tableData: [],
      selectedFolders: [],

      selectedFolderJson: {},

      // modals
      showDeleteFolderModal: false,
      showUpdateFolderStatusModal: false,
      showApplyToExistingInboxModal: false,

      moreOptionsMenuFolderId: null,
    });

    // computed
    const allFoldersFromStore = computed(() => skyboxPinia.getAllFolders);

    const showAllSkyBoxFoldersIllustration = computed(() => {
      if (state.isApiProcessing || !state.areResultsFetchedOnce || state.searchInput) {
        return false;
      }

      return state.tableData.length === 0;
    });

    const tableColumns = computed(() => {
      const columns = [
        {
          name: 'name',
          label: 'Folder Name',
          align: 'left',
          field: 'name',
        },
        {
          name: 'rules',
          label: 'Rules',
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

    // methods

    const updateFoldersInSkyBoxStore = () => {
      skyboxPinia.setMultipleFields({
        allFolders: state.tableData,
      });
    };

    const fetchData = async () => {
      try {
        state.isApiProcessing = true;

        const response = await getApiCall({
          endpoint: 'skybox/mail-folders/folder-with-rules',
        });

        state.tableData = response?.folders || [];

        updateFoldersInSkyBoxStore();
      } catch (error) {
        // Show error toaster
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Unexpected error occured. Unable to fetch folders',
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

    const onDeleteFolder = (folderJson) => {
      state.selectedFolderJson = folderJson;
      state.showDeleteFolderModal = true;
    };

    const onUpdateFolderStatus = (folderJson) => {
      state.selectedFolderJson = folderJson;
      state.showUpdateFolderStatusModal = true;
    };

    const onApplyToExistingInbox = (folderJson) => {
      state.selectedFolderJson = folderJson;
      state.showApplyToExistingInboxModal = true;
    };

    const onCloseModalByState = (stateName) => {
      state[stateName] = false;
      state.selectedFolderJson = {};
    };

    const onSuccessDeleteFolder = () => {
      // remove folder from table data
      state.tableData = state.tableData.filter(
        (folder) => folder.id !== state.selectedFolderJson.id,
      );

      updateFoldersInSkyBoxStore();

      // update state
      onCloseModalByState('showDeleteFolderModal');
    };

    const onSuccessFolderUpdate = (updatedFolderJson) => {
      // find the index matching to the folder ID and update
      const folderIndex = state.tableData.findIndex(
        (folder) => folder.id === updatedFolderJson.id,
      );

      state.tableData[folderIndex] = updatedFolderJson;

      updateFoldersInSkyBoxStore();

      // update state
      onCloseModalByState('showUpdateFolderStatusModal');
    };

    onMounted(() => {
      state.tableData = allFoldersFromStore.value || [];

      onRequest();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      tableColumns,
      isMobileDevice,
      showAllSkyBoxFoldersIllustration,

      // methods
      onRequest,
      onDeleteFolder,
      onSuccessFolderUpdate,
      onUpdateFolderStatus,
      onApplyToExistingInbox,

      onCloseModalByState,
      onSuccessDeleteFolder,

      // constants
      FOLDER_STATUS,
      TABLE_PAGINATION,
    };
  },
});
</script>

<style lang="scss" scoped>
.preferences-folder {
  width: 100%;
  height: inherit;

  .preferences-folder-header {
    width: 100%;
    background-color: $white;

    position: sticky;
    top: 0;
    z-index: 2;

    padding: 20px;

    display: flex;
    align-items: center;
    border-bottom: 1px solid $grey-50;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
      flex-direction: column;
      align-items: flex-start;

      gap: 8px;
    }

    .folder-left-section {
      .header-title-text {
        color: $black;
        font-size: 18px;
        font-weight: 600;
      }

      .header-desc-text {
        color: rgba($color: var(--black-rgb), $alpha: 0.8);
        font-size: 14px;
        font-weight: 400;
        line-height: 16px; /* 114.286% */

        margin-top: 6px;
      }
    }

    .folder-right-section {
      display: flex;
      align-items: center;

      gap: 12px;
    }
  }

  .preferences-folder-content {
    width: 100%;

    padding: 20px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
      flex-direction: column;
    }

    .all-folders-table {
      width: 100%;

      .folder-route-link {
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
        text-decoration: unset;

        color: $black;
      }

      .table-label-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;
      }

      .folder-action-btn {
        &:hover, &.active {
          border-radius: 6px;
          background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);

          :deep(.folder-menu-icon) {
            @include svg-icon-stroke('path, circle, rect', $primary);
          }
        }
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        border: 0px;

        :deep(.q-table__middle),
        :deep(.q-table__bottom) {
          display: none;
          border-bottom: 0px;
        }

        :deep(.q-table__grid-content) {
          display: grid;
          grid-row-gap: 16px;
        }
      }
    }
  }
}
</style>
