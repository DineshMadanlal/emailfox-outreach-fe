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

    <div class="edit-sequence-container">
      <!-- header -->
      <div class="edit-sequence-header">
        <CampaignFormHeader
          :campaignByIdJson="campaignByIdJson"

          @closeCampaignForm="closeCampaignForm"
          @onUpdateCampaignJson="onUpdateCampaignJson"
        />
      </div>

      <!-- content -->
      <div class="edit-sequence-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, onMounted, reactive, toRefs, computed,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// router
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';

// components
import CampaignFormHeader from 'components/CampaignForm/Header.vue';
import DiscardConfirmation from 'components/Modals/DiscardConfirmation.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { SEQUENCE_FORM_STEPS } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'EditCampaign',

  components: {
    DiscardConfirmation,
    CampaignFormHeader,
  },

  setup() {
    // router
    const $route = useRoute();
    const $router = useRouter();

    // composition API
    const { isMobileDevice, generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Campaign Editor'));

    // computed
    const currentCampaignId = computed(() => $route.params.campaignId);

    // state
    const state = reactive({
      campaigns: [],
      isFetchApiLoading: false,

      campaignByIdJson: {
        id: currentCampaignId.value,
        name: 'Cold Email Sequence: 3 Follow-ups',
      },

      //
      formChanged: false,
      leaveRoutePath: '',
      previousRoutePath: '',
      showDiscardConfirmationModal: false,
    });

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
    };

    const onComponentMounted = async () => {
      state.previousRoutePath = $router?.options?.history?.state?.back;
    };

    onMounted(() => {
      onComponentMounted();
    });

    // Hook to prevent route change if unsaved changes exist
    onBeforeRouteLeave((to, from, next) => {
      if (state.formChanged) {
        state.leaveRoutePath = to.fullPath;
        state.showDiscardConfirmationModal = true;
      } else {
        // No changes, allow route change
        next();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      onExitPage,
      closeCampaignForm,
      onUpdateCampaignJson,

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

      position: sticky;
      bottom: 0px;
      z-index: 3;
      background: $white;

      padding: 20px 16px;
      border-top: 1px solid $grey-50;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        flex-direction: column;
        padding: 12px 16px;
      }
    }
  }
}
</style>
