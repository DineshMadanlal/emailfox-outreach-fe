<template>
  <div class="list-by-id-page">
    <!-- Api Loader -->
    <ApiLoader :show="showApiLoader" />

    <!-- Dialog -->
    <q-dialog
      v-model="modals.showSaveListName"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveListName
        :listJson="listByJson"

        @onUpdateList="onListNameUpdated"
      />
    </q-dialog>

    <!-- Delete Contacts -->
    <q-dialog
      v-model="modals.showDeleteContacts"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteContacts
        :listId="listByJson.id"
        :deleteAllContactsForAList="true"

        :filters="{}"
        :multiSelectOptionJson="{}"

        @onSuccessfulDelete="onSuccessfulDeleteContacts"
      />
    </q-dialog>

    <!-- Delete List -->
    <q-dialog
      v-model="modals.showDeleteList"

      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteList
        :listId="listByJson.id"

        @onSuccessfulDelete="onSuccessfulDeleteList"
      />
    </q-dialog>

    <!-- Import History -->
    <q-dialog
      v-model="modals.showContactsImportHistory"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"
      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ContactImportHistory
        :listId="listId"
      />
    </q-dialog>

    <template
      v-if="listByJson.id"
    >
      <!-- Header -->
      <ListByIdHeader
        :listByJson="listByJson"

        @deleteList="modals.showDeleteList = true"
        @updateListName="modals.showSaveListName = true"
        @deleteContacts="modals.showDeleteContacts = true"
        @importHistory="modals.showContactsImportHistory = true"
      />

      <router-view
        :listId="listId"
        :key="routerViewKey"
        :listByJson="listByJson"

        @refetchListById="fetchListById"
      />
    </template>
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, getCurrentInstance,
} from 'vue';

// vue router
import { useRoute, useRouter } from 'vue-router';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import ListByIdHeader from 'components/ListById/Header.vue';

// modals
import DeleteList from 'components/Lists/Modals/DeleteList.vue';
import SaveListName from 'components/Lists/Modals/SaveListName.vue';
import DeleteContacts from 'components/Contacts/Modals/DeleteContacts.vue';
import ContactImportHistory from 'components/ListById/Modals/ContactImportHistory.vue';

// utils
import { getListById } from 'src/utils/listsApi';
import { convertStringToNumber } from 'src/utils/numbers';

// store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

export default defineComponent({
  name: 'ListById',

  components: {
    ApiLoader,
    ListByIdHeader,

    // modals
    DeleteList,
    SaveListName,
    DeleteContacts,
    ContactImportHistory,
  },

  setup() {
    // store
    const userStore = useUserPreferencesStore();

    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // app context
    const { appContext } = getCurrentInstance();

    // route
    const $route = useRoute();
    const $router = useRouter();

    // computed
    const listId = computed(() => convertStringToNumber($route.params.listId));

    // state
    const state = reactive({
      listByJson: {},
      isMounted: false,
      routerViewKey: 1,
      fetchListByIdApiLoading: false,

      modals: {
        showDeleteList: false,
        showSaveListName: false,
        showDeleteContacts: false,
        showContactsImportHistory: false,
      },
    });

    // computed
    const showApiLoader = computed(() => state.fetchListByIdApiLoading);

    // methods
    const fetchListById = async () => {
      try {
        state.fetchListByIdApiLoading = isEmpty(state.listByJson);

        const response = await getListById(listId.value);

        state.listByJson = response;

        //
        userStore.setMultipleFields({
          listByIdContactsState: {
            ...userStore.listByIdContactsState,
            listDetails: response,
          },
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          type: 'negative',
          message: error.message || 'Failed to fetch list details',
        });

        // list not found, redirect to lists page
        if (error?.response?.status === 404) {
          $router.push('/outreach/lists/all');
        }
      } finally {
        state.fetchListByIdApiLoading = false;
      }
    };

    const onListNameUpdated = (updatedListJson) => {
      state.listByJson = {
        ...state.listByJson,
        ...updatedListJson,
      };

      state.modals.showSaveListName = false;
    };

    const onSuccessfulDeleteContacts = () => {
      state.modals.showDeleteContacts = false;

      state.routerViewKey += 1;
    };

    const onSuccessfulDeleteList = () => {
      state.modals.showDeleteList = false;

      // move to all lists page
      $router.push('/outreach/lists/all');
    };

    onMounted(() => {
      fetchListById();

      state.isMounted = true;
    });

    return {
      // state
      ...toRefs(state),

      // computed
      listId,
      showApiLoader,
      isMobileDevice,

      // methods
      fetchListById,
      onListNameUpdated,
      onSuccessfulDeleteContacts,
      onSuccessfulDeleteList,
    };
  },
});
</script>

<style lang="scss" scoped>
.list-by-id-page {
  width: 100%;

  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
