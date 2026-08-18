<template>
  <div
    id="sequenceByIdHeader"
    class="sequence-by-id-header"
  >
    <!-- Dialog -->
    <q-dialog
      v-model="showSaveCampaignDetailsModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveCampaignDetails
        :isUpdateName="isUpdateName"
        :campaignJson="campaignByIdJson"

        @onUpdateCampaign="onUpdateCampaign"
      />
    </q-dialog>

    <!-- Dialog -->
    <q-dialog
      v-model="showArchiveCampaignModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ArchiveCampaign
        :selectedCampaignJson="campaignByIdJson"

        @onSuccess="onSuccessfulArchiveCampaign"
      />
    </q-dialog>

    <!-- top header -->
    <div class="sequence-id-top-header">
      <!-- Campaigns route -->
      <router-link
        :to="`/outreach/campaigns-all`"
        class="sequence-route-link-text"
      >
        Campaign
      </router-link>

      <LocalSvgIcon
        image="plain-down-arrow"
        classes="plain-down-arrow-icon"
      />

      <p class="overview-text">
        Overview
      </p>
    </div>

    <!-- bottom header -->
    <div class="sequence-id-bottom-header">
      <!-- left -->
      <div>
        <h6 class="sequence-name-text ellipsis">
          {{ campaignByIdJson.name }}
        </h6>

        <div class="sequence-details-grid">
          <!-- Status -->
          <CampaignProgress
            :status="campaignByIdJson.status"
          />

          <!-- Dot -->
          <LocalSvgIcon
            image="circle-dot"
            classes="dot-icon"
          />

          <div
            class="campaign-channel-block"
          >
            <LocalSvgIcon
              v-for="(iconData, index) in campaignChannelJson.icons"
              :key="`${campaignByIdJson.id}-channel-icon-${index}`"

              :image="iconData.image"
              classes="each-detail-icon"
            />

            <div class="channel-value-text">
              {{ campaignChannelJson.label }}
            </div>
          </div>

          <!-- Dot -->
          <LocalSvgIcon
            image="circle-dot"
            classes="dot-icon"
          />

          <!-- Number of contacts -->
          <div
            class="flex item-center no-wrap"
            :title="`Number of contacts: ${numberOfContacts}`"
          >
            <LocalSvgIcon
              image="contacts"
              classes="seq-contact-icon"
            />

            <p
              class="seq-value-text"
            >
              {{ numberOfContacts }}
            </p>
          </div>
        </div>
      </div>

      <q-space />

      <!-- right -->
      <div class="sequence-by-id-actions">
        <!-- More -->
        <q-btn
          dense
          outlined
          unelevated
          @click.stop.prevent

          class="sequence-more-btn"
        >
          <!-- more -->
          <LocalSvgIcon
            image="more"
            classes="sequence-more-icon"
          />

          <CampaignMoreOptions
            :campaignStatus="campaignByIdJson.status"

            @cloneCampaign="onCloneCampaign"
            @renameCampaign="onRenameCampaign"
            @pauseCampaign="onPauseCampaign"
            @archiveCampaign="showArchiveCampaignModal = true"
          />
        </q-btn>

        <!-- Edit Button -->
        <q-btn
          flat
          no-caps
          unelevated

          color="black"
          class="edit-sequence-btn"

          :to="`/outreach/campaigns/${campaignByIdJson.id}/edit`"
        >
          <LocalSvgIcon
            image="edit"
            classes="edit-icon"
          />

          <p class="q-ml-xs">
            Edit Campaign
          </p>
        </q-btn>

        <!-- Add Contacts Button -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          class="add-contacts-btn"

          :to="`/outreach/campaigns/${campaignByIdJson.id}/edit/contacts`"
        >
          <div class="flex no-wrap items-center">
            <LocalSvgIcon
              image="contacts"
              classes="contacts-icon"
            />
            <p class="text-weight-medium q-ml-xs">
              Add Contacts
            </p>
          </div>
        </q-btn>
      </div>
    </div>

    <!-- Tabs -->
    <!-- Tab components -->
    <q-tabs
      dense
      mobile-arrows
      narrow-indicator
      :breakpoint="0"

      align="left"
      class="app-tabs"
      active-color="primary"
      indicator-color="primary"
    >
      <q-route-tab
        no-caps

        v-for="(page, index) in sequenceByIdRoutes"

        :key="`sequence-id-${index}-${page.name}`"
        :to="page.path"
      >
        <!-- page label -->
        <p class="route-label-text">
          {{ page.name }}
        </p>
      </q-route-tab>
    </q-tabs>
  </div>
</template>

<script>
// vue
import {
  computed, defineComponent, toRefs, reactive, getCurrentInstance,
} from 'vue';

// vue-router
import { useRouter } from 'vue-router';

// components
import CampaignProgress from 'components/Campaigns/CampaignProgress.vue';
import CampaignMoreOptions from 'components/Menu/CampaignMoreOptions.vue';

import ArchiveCampaign from 'components/Campaigns/Modals/ArchiveCampaign.vue';
import SaveCampaignDetails from 'components/Campaigns/Modals/SaveCampaignDetails.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { getNumeralAmount } from 'src/utils/numbers.js';
import { pauseCampaignById, cloneCampaignById } from 'src/utils/campaignApi.js';

// constants
import { CAMPAIGN_STATUS } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'CampaignByIdHeader',

  emits: ['onUpdateCampaign'],

  components: {
    CampaignProgress,
    CampaignMoreOptions,

    ArchiveCampaign,
    SaveCampaignDetails,
  },

  props: {
    campaignByIdJson: {
      type: Object,
      required: true,
    },
    campaignChannelJson: {
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
      showArchiveCampaignModal: false,
    });

    // computed
    const numberOfContacts = computed(() => getNumeralAmount(
      props.campaignByIdJson.total_no_contacts || 0,
    ));

    const sequenceByIdRoutes = computed(() => {
      const sequenceId = props.campaignByIdJson.id;

      return [
        // {
        //   name: 'Overview',
        //   path: `/outreach/campaigns/${sequenceId}/overview`,
        // },
        {
          name: 'Analytics',
          path: `/outreach/campaigns/${sequenceId}/analytics`,
        },
        // {
        //   name: 'Inbox',
        //   path: `/outreach/campaigns/${sequenceId}/inbox`,
        // },
        {
          name: 'Contacts',
          path: `/outreach/campaigns/${sequenceId}/contacts`,
        },
        {
          name: 'Sender Mailboxes',
          path: `/outreach/campaigns/${sequenceId}/sender-mailboxes`,
        },
        {
          name: 'Sequence',
          path: `/outreach/campaigns/${sequenceId}/sequence`,
        },
        // {
        //   name: 'Activity',
        //   path: `/outreach/campaigns/${sequenceId}/activity`,
        // },
      ];
    });

    // methods
    const onRenameCampaign = () => {
      state.isUpdateName = true;
      state.showSaveCampaignDetailsModal = true;
    };

    const onSuccessfulArchiveCampaign = () => {
      state.showArchiveCampaignModal = false;

      $router.push('/outreach/campaigns-all');
    };

    const onUpdateCampaign = (updatedCampaignJson) => {
      state.showSaveCampaignDetailsModal = false;

      emit('onUpdateCampaign', updatedCampaignJson);
    };

    const onCloneCampaign = async () => {
      showQuasarLoader();

      const response = await cloneCampaignById({
        campaignId: props.campaignByIdJson.id,
        $toast: appContext.config.globalProperties.$toast,
      });

      if (response) {
        // move to campaign by ID
        const campaignId = response.id;
        $router.push(`/outreach/campaigns/${campaignId}/edit`);
      }

      hideQuasarLoader();
    };

    const onPauseCampaign = async () => {
      const oldStatus = props.campaignByIdJson.status;

      // update the campaign status in the parent component
      emit('onUpdateCampaign', {
        ...props.campaignByIdJson,
        status: CAMPAIGN_STATUS.PAUSED.value,
      });

      // try catch is handled in the api function
      const response = await pauseCampaignById({
        campaignId: props.campaignByIdJson.id,
        $toast: appContext.config.globalProperties.$toast,
      });

      if (!response) {
        // update the campaign status in the parent component
        emit('onUpdateCampaign', {
          ...props.campaignByIdJson,
          status: oldStatus,
        });
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      numberOfContacts,
      sequenceByIdRoutes,

      // methods
      onCloneCampaign,
      onRenameCampaign,
      onUpdateCampaign,
      onPauseCampaign,
      onSuccessfulArchiveCampaign,
    };
  },
});
</script>

<style lang="scss" scoped>
.sequence-by-id-header {
  width: 100%;

  top: 0px;
  z-index: 2;
  position: sticky;

  background: $white;

  border-radius: 8px 8px 0px 0px;

  border-bottom: 1px solid $grey-50;

  // top header
  .sequence-id-top-header {
    width: 100%;

    padding: 24px 20px 4px 20px;

    display: flex;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 16px 4px 16px;
    }

    .sequence-route-link-text {
      color: $grey;
      font-size: 14px;
      font-weight: 400;

      text-decoration: unset;

      &:hover {
        color: $primary;
        text-decoration: underline;
      }
    }

    :deep(.plain-down-arrow-icon) {
      height: 8px;
      width: 8px;
      margin: 0px 12px;

      transform: rotate(-90deg);
    }

    .overview-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
    }
  }

  // bottom header
  .sequence-id-bottom-header {
    width: 100%;
    row-gap: 6px;
    padding: 16px 20px;

    display: flex;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px;
      flex-direction: column;
    }

    .sequence-details-grid {
      display: flex;
      align-items: center;
      gap: 12px;

      :deep(.seq-contact-icon) {
        @include svg-icon-stroke('path, circle, rect', $grey);
      }

      .campaign-channel-block {
        display: flex;
        align-items: center;
        gap: 6px;

        .channel-value-text {
          color: $grey-700;
          font-size: 13px;
          font-weight: 400;
          line-height: 16px; /* 123.077% */
        }
      }

      .seq-value-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;

        margin-left: 6px;
      }

      :deep(.dot-icon) {
        max-height: 4px;
        max-width: 4px;

        circle {
          fill: $grey-300;
          stroke-width: 2px;
        }
      }

      :deep(.sequence-progress) {
        border: 0px;
        padding: 0px;
        background: unset;

        .status-text {
          font-size: 14px;
        }
      }
    }

    .sequence-name-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;
      max-width: 380px;
      margin-bottom: 8px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        max-width: 90vw;
      }
    }

    .sequence-by-id-actions {
      display: flex;
      gap: 12px;

      .sequence-more-btn {
        width: 36px;
        height: 36px;
        border: 1px solid $blue-grey;
      }

      .edit-sequence-btn {
        height: fit-content;
        border: 1px solid $blue-grey;
      }

      .add-contacts-btn {
        height: fit-content;

        :deep(.contacts-icon) {
          @include svg-icon-stroke('path, circle, rect', $white);
        }
      }
    }
  }
}
</style>
