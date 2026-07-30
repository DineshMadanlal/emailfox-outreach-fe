<template>
  <ApiLoader
    show
    v-if="isFetchByIdApiLoading"
  />

  <EmailThreadList
    v-else-if="showEmailThreadList"
  />
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, computed, onMounted, reactive, toRefs, getCurrentInstance, watch,
  nextTick,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// route
import { useRoute, useRouter } from 'vue-router';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import EmailThreadList from 'components/MasterInbox/EmailThreadList.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// store pinia
import { useSkyboxStore } from 'src/stores/skybox.js';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { convertStringToNumber } from 'src/utils/numbers';

// constants
import { EMAIL_THREAD_TYPE } from 'boot/constants';

export default defineComponent({
  name: 'SkyBoxFolderByIdEmails',

  components: {
    ApiLoader,
    EmailThreadList,
  },

  setup() {
    const { appContext } = getCurrentInstance();

    // store
    const skyboxPinia = useSkyboxStore();

    // composables
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Unibox Inbox'));

    // route
    const $route = useRoute();
    const $router = useRouter();

    // state
    const state = reactive({
      isFetchByIdApiLoading: false,
      showEmailThreadList: false,
    });

    // computed
    const baseMailFoldersFromStore = computed(() => skyboxPinia.getBaseMailFolders);

    const folderId = computed(() => convertStringToNumber($route.params.folderId));

    // methods
    const fetchFolderById = async () => {
      try {
        state.isFetchByIdApiLoading = true;

        const response = await getApiCall({
          endpoint: `skybox/mail-folders/${folderId.value}`,
        });

        skyboxPinia.setMultipleFields({
          selectedFolderJson: response,
        });

        if (size(response)) {
          state.showEmailThreadList = true;
        } else {
          $router.push('/unibox/folder/error');
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error,
        });
      } finally {
        state.isFetchByIdApiLoading = false;
      }
    };

    const checkFolderByIdStatus = () => {
      // check if folderId exists in the store
      // folder json value
      const folderJson = baseMailFoldersFromStore.value.find(
        (folder) => folder.id === folderId.value,
      );

      if (size(folderJson)) {
        state.showEmailThreadList = true;

        skyboxPinia.setMultipleFields({
          selectedFolderJson: folderJson,
        });
      } else {
        // fetch folder by ID
        fetchFolderById();
      }
    };

    // onMounted
    onMounted(() => {
      checkFolderByIdStatus();
    });

    watch(
      () => folderId.value,
      (newFolderId) => {
        if (newFolderId) {
          state.showEmailThreadList = false;
          state.isFetchByIdApiLoading = false;

          nextTick(() => {
            checkFolderByIdStatus();
          });
        }
      },
    );

    return {
      // state
      ...toRefs(state),

      // constant
      threadType: EMAIL_THREAD_TYPE.INBOX,
    };
  },
});
</script>
