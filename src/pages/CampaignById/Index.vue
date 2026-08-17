<template>
  <div class="campaign-by-id-page">
    <!-- Api loader -->
    <ApiLoader
      :show="fetchCampaignByIdApiLoading && !campaignByIdJson.id"
    />

    <!-- Header -->
    <CampaignByIdHeader
      v-if="campaignByIdJson.id"
      :campaignByIdJson="campaignByIdJson"
      :campaignChannelJson="campaignChannelJson"

      @onUpdateCampaign="onUpdateCampaign"
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
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import CampaignByIdHeader from 'components/CampaignById/Header.vue';

// constants
import { CAMPAIGN_TYPES } from 'src/boot/campaign-constants';

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
    const userPreferencesStore = useUserPreferencesStore();

    // metadata
    useMeta(generateMetadata('Campaign By ID'));

    // state
    const state = reactive({
      campaignByIdJson: {},
      fetchCampaignByIdApiLoading: false,
    });

    // computed
    const campaignId = computed(() => convertStringToNumber($route.params.campaignId));
    const campaignByIdJsonFromStore = computed(() => userPreferencesStore.campaignByIdJson);

    const isEmailOutreachCampaign = computed(
      () => state.campaignByIdJson.type === CAMPAIGN_TYPES.EMAIL.value,
    );
    const isLinkedInOutreachCampaign = computed(
      () => state.campaignByIdJson.type === CAMPAIGN_TYPES.LINKEDIN.value,
    );
    const isMultiChannelOutreachCampaign = computed(
      () => state.campaignByIdJson.type === CAMPAIGN_TYPES.MULTI_CHANNEL.value,
    );

    const campaignChannelJson = computed(() => {
      if (isEmailOutreachCampaign.value) {
        return {
          label: 'Single Channel',
          icons: CAMPAIGN_TYPES.EMAIL.icons,
        };
      }
      if (isLinkedInOutreachCampaign.value) {
        return {
          label: 'Single Channel',
          icons: CAMPAIGN_TYPES.LINKEDIN.icons,
        };
      }

      return {
        label: 'Multi Channel',
        icons: CAMPAIGN_TYPES.MULTI_CHANNEL.icons,
      };
    });

    // methods
    const makeApiCallOnMounted = async () => {
      try {
        state.fetchCampaignByIdApiLoading = true;

        // make api call
        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: `/sequences/${campaignId.value}`,
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
          userPreferencesStore.setMultipleFields({
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

    const onUpdateCampaign = (updatedCampaignJson) => {
      state.campaignByIdJson = updatedCampaignJson;

      // update store
      userPreferencesStore.setMultipleFields({
        campaignByIdJson: updatedCampaignJson,
      });
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
      campaignChannelJson,

      isEmailOutreachCampaign,
      isLinkedInOutreachCampaign,
      isMultiChannelOutreachCampaign,

      // methods
      onUpdateCampaign,
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
