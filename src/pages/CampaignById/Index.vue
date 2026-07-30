<template>
  <div class="campaign-by-id-page">
    <!-- Api loader -->
    <ApiLoader :show="fetchCampaignByIdApiLoading" />

    <!-- Header -->
    <CampaignByIdHeader
      v-if="campaignByIdJson.id"
      :campaignByIdJson="campaignByIdJson"
    />

    <!-- Campaign by ID -->
    <router-view
      v-if="campaignByIdJson.id"

      :campaignByIdJson="campaignByIdJson"
    />
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, onMounted, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// router
import { useRoute, useRouter } from 'vue-router';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { convertStringToNumber } from 'src/utils/numbers';

// pinia
import { storeExclusions } from 'src/stores/storeExclusions.js';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import CampaignByIdHeader from 'components/CampaignById/Header.vue';

export default defineComponent({
  name: 'CampaignById',

  components: {
    ApiLoader,
    CampaignByIdHeader,
  },

  setup() {
    // current instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // router
    const $route = useRoute();
    const $router = useRouter();

    // pinia
    const storeExclusionsPinia = storeExclusions();

    // metadata
    useMeta(generateMetadata('Campaign By ID'));

    // state
    const state = reactive({
      campaignByIdJson: {
        id: convertStringToNumber($route.params.campaignId),
      },
      fetchCampaignByIdApiLoading: false,
    });

    // computed
    const campaignId = computed(() => convertStringToNumber($route.params.campaignId));
    const campaignByIdJsonFromStore = computed(() => storeExclusionsPinia.campaignByIdJson);

    // methods
    const makeApiCallOnMounted = async () => {
      if (true) {
        return;
      }
      try {
        state.fetchCampaignByIdApiLoading = true;

        // make api call
        const response = await getApiCall({
          endpoint: `/campaigns/${campaignId.value}`,
        });

        if (isEmpty(response)) {
          // show error warning
          appContext.config.globalProperties.$toast({
            warning: true,
            message: 'Sequence Not Found',
          });

          // Push to error page
          $router.push('/outreach/campaign-not-found');
        } else {
          state.campaignByIdJson = response;

          // update store
          storeExclusionsPinia.setMultipleFields({
            campaignByIdJson: response,
          });

          // metadata
          useMeta(generateMetadata(state.campaignByIdJson.name));
        }
      } catch (error) {
        // show error warning
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });

        // Push to error page
        $router.push('/outreach/campaign-not-found');
      } finally {
        state.fetchCampaignByIdApiLoading = false;
      }
    };

    // lifecycle hooks
    onMounted(() => {
      if (campaignByIdJsonFromStore.value?.id === campaignId.value) {
        state.campaignByIdJson = campaignByIdJsonFromStore.value;
      }

      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-by-id-page {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
