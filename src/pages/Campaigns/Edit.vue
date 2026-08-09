<template>
  <div class="edit-sequence-page">
    <!-- Discard confirmation popup -->
    <q-dialog
      v-model="showDiscardConfirmationModal"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"

      class="app-modal-dialog"
    >
      <DiscardConfirmation
        @onExit="onExitPage"
      />
    </q-dialog>

    <!-- Api loader -->
    <ApiLoader
      :show="fetchCampaignByIdApiLoading && !campaignByIdJson.id"
    />

    <!--  -->
    <div
      class="edit-sequence-container"

      v-if="campaignByIdJson.id"
    >
      <!-- header -->
      <div class="edit-sequence-header">
        <CampaignFormHeader
          :campaignById="campaignByIdJson"

          @closeCampaignForm="closeCampaignForm"
          @onUpdateCampaignJson="onUpdateCampaignJson"
        />
      </div>

      <!-- content -->
      <div class="edit-sequence-content">
        <router-view
          :campaignById="campaignByIdJson"

          @updateFormChanged="onUpdateFormChanged"
        />

        <!--  -->
      </div>
    </div>
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, onMounted, reactive, toRefs, computed, getCurrentInstance, provide,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// router
import { useRoute, useRouter } from 'vue-router';

// pinia
import { storeExclusions } from 'src/stores/storeExclusions.js';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { convertStringToNumber } from 'src/utils/numbers';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import CampaignFormHeader from 'components/CampaignForm/Header.vue';
import DiscardConfirmation from 'components/Modals/DiscardConfirmation.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { SEQUENCE_FORM_STEPS, CAMPAIGN_TYPES } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'EditCampaign',

  components: {
    ApiLoader,
    DiscardConfirmation,
    CampaignFormHeader,
  },

  setup() {
    // router
    const $route = useRoute();
    const $router = useRouter();

    // app cntext
    const { appContext } = getCurrentInstance();

    // composition API
    const { isMobileDevice, generateMetadata } = useAppHelpersApi();

    // pinia
    const storeExclusionsPinia = storeExclusions();

    // metadata
    useMeta(generateMetadata('Campaign Editor'));

    // state
    const state = reactive({
      campaignByIdJson: {},
      fetchCampaignByIdApiLoading: false,

      //
      formChanged: false,
      leaveRoutePath: '',
      previousRoutePath: '',
      showDiscardConfirmationModal: false,
    });

    // computed
    const campaignId = computed(() => convertStringToNumber($route.params.campaignId));
    const campaignByIdJsonFromStore = computed(() => storeExclusionsPinia.campaignByIdJson);

    // computed
    const isEmailOutreachCampaign = computed(
      () => state.campaignByIdJson.type === CAMPAIGN_TYPES.EMAIL.value,
    );
    const isLinkedInOutreachCampaign = computed(
      () => state.campaignByIdJson.type === CAMPAIGN_TYPES.LINKEDIN.value,
    );
    const isMultiChannelOutreachCampaign = computed(
      () => state.campaignByIdJson.type === CAMPAIGN_TYPES.MULTI_CHANNEL.value,
    );

    // methods
    const onExitPage = () => {
      state.formChanged = false;
      state.showDiscardConfirmationModal = false;

      $router.push({ path: state.leaveRoutePath });
    };

    const closeCampaignForm = () => {
      if (state.formChanged) {
        state.leaveRoutePath = state.previousRoutePath;

        state.showDiscardConfirmationModal = true;
      } else {
        // No changes, go back to previous route
        $router.push({ path: state.previousRoutePath || '/outreach/campaigns-all' });
      }
    };

    const onUpdateCampaignJson = (updatedCampaignJson) => {
      state.campaignByIdJson = updatedCampaignJson;

      // update store
      storeExclusionsPinia.setMultipleFields({
        campaignByIdJson: updatedCampaignJson,
      });
    };

    const getCampaignById = async () => {
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

    const onComponentMounted = async () => {
      state.previousRoutePath = $router?.options?.history?.state?.back;

      if (campaignByIdJsonFromStore.value?.id === campaignId.value) {
        state.campaignByIdJson = campaignByIdJsonFromStore.value;
      }

      getCampaignById();
    };

    const onUpdateFormChanged = (changed) => {
      state.formChanged = changed;
    };

    // Hook to prevent route change if unsaved changes exist
    $router.beforeEach((to, from, next) => {
      if (state.formChanged) {
        state.leaveRoutePath = to.fullPath;
        state.showDiscardConfirmationModal = true;

        next(false);
      } else {
        next();
      }
    });

    onMounted(() => {
      onComponentMounted();
    });

    const editCampaignContext = {
      //
      isEmailOutreachCampaign,
      isLinkedInOutreachCampaign,
      isMultiChannelOutreachCampaign,
    };

    // provide
    provide('editCampaignContext', editCampaignContext);

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      onExitPage,
      closeCampaignForm,
      onUpdateCampaignJson,
      onUpdateFormChanged,

      // hardcoded
      SEQUENCE_FORM_STEPS,
    };
  },
});
</script>

<style lang="scss" scoped>
.edit-sequence-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;

  .edit-sequence-container {
    width: 100%;
    flex: 1;
    display: flex;
    min-height: 0;
    flex-direction: column;

    // header
    .edit-sequence-header {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;

      position: sticky;
      top: 0px;
      z-index: 3;
      background: $white;

      padding: 13.5px 24px;
      border-bottom: 1px solid $grey-50;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        flex-direction: column;
        padding: 12px 16px;
      }
    }

    // content
    .edit-sequence-content {
      width: 100%;
      flex: 1;
      display: flex;
      min-height: 0;

      // include custom scrollbar
      @include custom-scrollbar;
    }

    // css names added in parent components
    :deep(.edit-workflow-section) {
      width: 100%;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    :deep(.edit-sequence-footer) {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 16px;

      position: sticky;
      bottom: 0px;
      z-index: 3;
      background: $white;

      padding: 20px 16px;
      border-top: 1px solid $grey-50;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 12px 16px;
      }
    }
  }
}
</style>
