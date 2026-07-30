<template>
  <div class="list-by-id-page">
    <!-- Api Loader -->
    <ApiLoader :show="showApiLoader" />

    <template
      v-if="listByJson.id"
    >
      <!-- Header -->
      <ListByIdHeader
        :listByJson="listByJson"
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

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import ListByIdHeader from 'components/ListById/Header.vue';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { convertStringToNumber } from 'src/utils/numbers';

// store
import { useUserPreferencesStore } from 'src/stores/userPreferences';

export default defineComponent({
  name: 'ListById',

  components: {
    ApiLoader,
    ListByIdHeader,
  },

  setup() {
    // store
    const userStore = useUserPreferencesStore();

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
    });

    // computed
    const showApiLoader = computed(() => state.fetchListByIdApiLoading);

    // methods
    const fetchListById = async () => {
      try {
        state.fetchListByIdApiLoading = true;

        const response = await getApiCall({
          endpoint: `/lists/${listId.value}`,
          includeWorkspace: true,
        });

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
