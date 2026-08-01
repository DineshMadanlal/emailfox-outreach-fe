<template>
  <div class="campaign-details">
    <!-- Dialog -->
    <q-dialog
      v-model="showSaveCampaignDetailsModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveCampaignDetails
        :isUpdateName="isUpdateName"
        :campaignJson="tableRowJson"

        @onUpdateCampaign="onUpdateCampaign"
      />
    </q-dialog>

    <div class="campaign-icon-container">
      <LocalSvgIcon
        image="sequence"
        classes="campaign-icon"
      />
    </div>

    <!--  -->
    <div>
      <div class="seq-name-text">
        {{ tableRowJson.name }}
      </div>

      <div class="seq-details-flex">
        <!-- Email Sequence -->
        <div
          class="each-detail-block"
        >
          <LocalSvgIcon
            v-for="(iconData, index) in campaignChannelJson.icons"
            :key="`${tableRowJson.id}-channel-icon-${index}`"

            :image="iconData.image"
            classes="each-detail-icon"
          />

          <div class="stat-value-text">
            {{ campaignChannelJson.label }}
          </div>
        </div>

        <LocalSvgIcon
          image="circle-dot"
          classes="circle-dot-icon"
        />

        <!-- Campaign Created At -->
        <div class="each-detail-block">
          <LocalSvgIcon
            image="time"
            classes="each-detail-icon"
          />

          <div class="stat-value-text">
            Created on {{ campaignCreatedAt }}
          </div>
        </div>
      </div>

    </div>

    <q-space />

    <!-- more options -->
    <q-btn
      dense
      outlined
      unelevated
      @click.stop.prevent

      class="more-action-btn"
    >
      <!-- more -->
      <LocalSvgIcon
        image="more"
        classes="more-menu-icon"
      />

      <CampaignMoreOptions
        :campaignStatus="tableRowJson.status"

        @cloneCampaign="onCloneCampaign"
        @renameCampaign="onRenameCampaign"
        @pauseCampaign="onPauseCampaign"
        @archiveCampaign="$emit('archiveCampaign')"
      />
    </q-btn>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, toRefs, getCurrentInstance,
} from 'vue';

// router
import { useRouter } from 'vue-router';

// Components
import CampaignMoreOptions from 'components/Menu/CampaignMoreOptions.vue';
import SaveCampaignDetails from 'components/Campaigns/Modals/SaveCampaignDetails.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { formatDate2 } from 'src/utils/dates';
import { pauseCampaignById, cloneCampaignById } from 'src/utils/campaignApi.js';

// constants
import { CAMPAIGN_TYPES, CAMPAIGN_STATUS } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'CampaignDetails',

  emits: ['onUpdateCampaign', 'archiveCampaign'],

  components: {
    CampaignMoreOptions,
    SaveCampaignDetails,
  },

  props: {
    tableRowJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // router
    const $router = useRouter();

    // instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { isMobileDevice, showQuasarLoader, hideQuasarLoader } = useAppHelpersApi();

    // state
    const state = reactive({
      isUpdateName: false,
      showSaveCampaignDetailsModal: false,
    });

    // computed
    const campaignCreatedAt = computed(() => formatDate2(props.tableRowJson.created_at));

    const isEmailOnlyCampaign = computed(() => props.tableRowJson.type
      === CAMPAIGN_TYPES.EMAIL.value);

    const isLinkedInOnlyCampaign = computed(() => props.tableRowJson.type
      === CAMPAIGN_TYPES.LINKEDIN.value);

    const campaignChannelJson = computed(() => {
      if (isEmailOnlyCampaign.value) {
        return {
          label: 'Single Channel',
          icons: CAMPAIGN_TYPES.EMAIL.icons,
        };
      }
      if (isLinkedInOnlyCampaign.value) {
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
    const onUpdateCampaign = (updatedCampaignJson) => {
      state.showSaveCampaignDetailsModal = false;

      emit('onUpdateCampaign', updatedCampaignJson);
    };

    const onRenameCampaign = () => {
      state.isUpdateName = true;
      state.showSaveCampaignDetailsModal = true;
    };

    const onPauseCampaign = async () => {
      const oldStatus = props.tableRowJson.status;

      // update the campaign status in the parent component
      emit('onUpdateCampaign', {
        ...props.tableRowJson,
        status: CAMPAIGN_STATUS.PAUSED.value,
      });

      // try catch is handled in the api function
      const response = await pauseCampaignById({
        campaignId: props.tableRowJson.id,
        $toast: appContext.config.globalProperties.$toast,
      });

      if (!response) {
        // update the campaign status in the parent component
        emit('onUpdateCampaign', {
          ...props.tableRowJson,
          status: oldStatus,
        });
      }
    };

    const onCloneCampaign = async () => {
      showQuasarLoader();

      const response = await cloneCampaignById({
        campaignId: props.tableRowJson.id,
        $toast: appContext.config.globalProperties.$toast,
      });

      if (response) {
        // move to campaign by ID
        const campaignId = response.id;
        $router.push(`/outreach/campaigns/${campaignId}/edit`);
      }

      hideQuasarLoader();
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      campaignCreatedAt,
      campaignChannelJson,

      // methods
      onUpdateCampaign,
      onRenameCampaign,
      onCloneCampaign,
      onPauseCampaign,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-details {
  display: flex;
  gap: 12px;

  .more-action-btn {
    height: fit-content;
    width: fit-content;
  }

  .campaign-icon-container {
    padding: 9px;
    border-radius: 8px;
    border: 1px solid $grey-50;
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .seq-name-text {
    color: $black;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px; /* 114.286% */
    max-width: 325px;

    margin-bottom: 8px;
  }

  .seq-details-flex {
    display: flex;
    align-items: center;
    gap: 8px;

    :deep(.circle-dot-icon) {
      width: 4px;
      height: 4px;

      circle {
        fill: $grey-300;
      }
    }

    .each-detail-block {
      display: flex;
      align-items: center;
      gap: 6px;

      :deep(.each-detail-icon) {
        min-height: 14px;
        min-width: 14px;

        max-height: 14px;
        max-width: 14px;

        .stat-value-text {
          color: $grey-700;
          font-size: 13px;
          font-weight: 400;
          line-height: 16px; /* 123.077% */
        }
      }
    }
  }
}
</style>
