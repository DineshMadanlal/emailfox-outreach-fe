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
        <!-- <div
          class="each-detail-block"
        >
          <LocalSvgIcon
            image="mail"
            classes="each-detail-icon"
          />
        </div> -->

        <!-- <LocalSvgIcon
          image="circle-dot"
          classes="circle-dot-icon"
        /> -->

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
import { postApiCall } from 'src/utils/apiRequests';

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

    // methods
    const onUpdateCampaign = (updatedCampaignJson) => {
      state.showSaveCampaignDetailsModal = false;

      emit('onUpdateCampaign', updatedCampaignJson);
    };

    const onRenameCampaign = () => {
      state.isUpdateName = true;
      state.showSaveCampaignDetailsModal = true;
    };

    const onCloneCampaign = async () => {
      try {
        showQuasarLoader();

        // API Call
        const response = await postApiCall({
          includeWorkspace: true,
          endpoint: `/sequences/${props.tableRowJson.id}/clone`,
        });

        // move to campaign by ID
        const campaignId = response.id;
        $router.push(`/outreach/campaigns/${campaignId}/edit`);
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        // Hide the loader after the operation is complete
        hideQuasarLoader();
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      campaignCreatedAt,

      // methods
      onUpdateCampaign,
      onRenameCampaign,
      onCloneCampaign,
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
