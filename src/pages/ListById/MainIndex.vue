<template>
  <div class="list-by-id-page">
    <!-- Api Loader -->
    <ApiLoader :show="showApiLoader" />

    <!-- Dialog -->
    <q-dialog
      v-model="modals.showListByIdContactHistory"

      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"
      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ContactImportHistory
        :listId="listId"
        :listByJson="listByJson"
      />
    </q-dialog>

    <template
      v-if="listByJson.id"
    >
      <!-- Header -->
      <ListByIdHeader
        :listByJson="listByJson"

        @importHistory="modals.showListByIdContactHistory = true"
      />

      <router-view
        :listId="listId"
        :listByJson="listByJson"
      />
    </template>
  </div>
</template>

<script>
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
      fetchListByIdApiLoading: false,

      modals: {
        showListByIdContactHistory: false,
      },
    });

    // computed
    const showApiLoader = computed(() => state.fetchListByIdApiLoading);

    // methods
    const fetchListById = async () => {
      try {
        state.fetchListByIdApiLoading = true;

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
