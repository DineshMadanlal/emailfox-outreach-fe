<template>
  <div class="campaign-form-header">
    <!-- Dialog -->
    <q-dialog
      v-model="showSaveCampaignDetailsModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveCampaignDetails
        :campaignJson="campaignByIdJson"

        @onUpdateCampaignName="onUpdateCampaignName"
      />
    </q-dialog>

    <!-- Left side content -->
    <div class="campaign-left-side-content">
      <h6 class="header-name-text ellipsis">
        {{ campaignName }}
      </h6>

      <!-- edit -->
      <q-btn
        flat
        dense
        color="primary"

        @click="showSaveCampaignDetailsModal = true"
      >
        <LocalSvgIcon
          image="edit"
          classes="edit-icon"
        />
      </q-btn>
    </div>

    <q-space />

    <!-- Right side content -->
    <CampaignSteps
      :campaignByIdJson="campaignByIdJson"
    />

    <!-- Close -->
    <q-btn
      flat
      round
      dense

      color="negative"
      class="app-negative-button"

      @click="$emit('closeCampaignForm')"
    >
      <LocalSvgIcon
        image="close"
        classes="app-negative-icon"
      />
    </q-btn>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed, toRefs, reactive,
} from 'vue';

// Components
import CampaignSteps from 'components/CampaignForm/CampaignSteps.vue';
import SaveCampaignDetails from 'components/Campaigns/Modals/SaveCampaignDetails.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'CampaignFormHeader',

  emits: ['closeCampaignForm', 'onUpdateCampaignJson'],

  components: {
    CampaignSteps,
    SaveCampaignDetails,
  },

  props: {
    campaignByIdJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      showSaveCampaignDetailsModal: false,
    });

    // computed
    const campaignName = computed(() => props.campaignByIdJson.name);

    // methods
    const onUpdateCampaignName = (updatedCampaignJson) => {
      emit('onUpdateCampaignJson', updatedCampaignJson);

      state.showSaveCampaignDetailsModal = false;
    };

    return {
      // state
      ...toRefs(state),

      // computed
      campaignName,
      isMobileDevice,

      // methods
      onUpdateCampaignName,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-form-header {
  width: 100%;

  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 8px;
  position: relative;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    flex-direction: column;
    align-items: flex-start;
  }

  .campaign-left-side-content {
    display: flex;
    align-items: center;

    .header-name-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;

      max-width: 280px;

      // md min
      @media (min-width: $breakpoint-lg-min) {
        max-width: 300px;
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        font-size: 16px;
        max-width: 240px;
      }
    }

    :deep(.edit-icon) {
      width: 16px;

      @include svg-icon-stroke('path', $primary);
    }
  }

  .app-negative-button {
    min-height: unset;
    min-width: unset;
    padding: 4px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      position: absolute;

      top: 0px;
      right: 0px;
    }
  }
}
</style>
