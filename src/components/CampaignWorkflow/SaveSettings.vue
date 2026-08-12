<template>
  <div class="campaign-settings-section">

    <!-- Dialog -->
    <q-dialog
      v-model="modals.showDailyLimitDialog"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveDailyNewContactsLimit
        :campaignId="campaignById.id"
        :campaignSettings="campaignSettings"

        @updateSettingsJson="updateSettingsJson"
      />
    </q-dialog>

    <!-- container -->
    <div class="campaign-settings-container">
      <!-- sending schedule -->
      <SendingScheduleCard
        :campaignId="campaignById.id"
        :campaignSettings="campaignSettings"

        @updateCampaignSettings="updateCampaignSettings"

        @editDailyLimit="modals.showDailyLimitDialog = true"
      />

      <!-- sequence configuration -->
      <SequenceConfigurationsCard
        :campaignId="campaignById.id"
        :campaignSettings="campaignSettings"

        @updateCampaignSettings="updateCampaignSettings"
      />

      <!-- smart ai -->
      <SmartAiCategorizationCard
        :campaignId="campaignById.id"
        :campaignSettings="campaignSettings"

        @updateCampaignSettings="updateCampaignSettings"
      />

      <!-- Collapsible Advanced Configurations Toggle -->
      <div class="advanced-config-toggle">
        <div
          class="advance-toggle-btn"
          @click="toggleAdvanced"
          role="button"
          tabindex="0"
        >
          <LocalSvgIcon
            image="settings"
            class="settings-icon"
          />

          <span>
            {{ showAdvanced ? 'Hide Advanced Configurations' : 'Show Advanced Configurations' }}
          </span>
        </div>
      </div>

      <!-- Advanced Configuration Cards (Collapsible) -->
      <q-slide-transition>
        <div
          v-show="showAdvanced"
          class="advanced-configs"
        >
          <DeliverabilitySafetyCard
            :campaignId="campaignById.id"
            :campaignSettings="campaignSettings"

            @updateCampaignSettings="updateCampaignSettings"
          />

          <RiskControlCard
            :campaignId="campaignById.id"
            :campaignSettings="campaignSettings"

            @updateCampaignSettings="updateCampaignSettings"
          />
        </div>
      </q-slide-transition>
    </div>

    <!-- Footer -->
    <div class="edit-sequence-footer">
      <!-- Back -->
      <q-btn
        flat
        no-caps

        label="Back"
        color="primary"
        class="light-primary-btn"

        @click="onGoBack"
      />

      <!-- Next Button -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        :label="campaignCtaJson.label"
        :disable="campaignCtaJson.disable"

        :loading="loaders.isSaving"
      />
    </div>
  </div>
</template>
<script>
// vue
import {
  defineComponent, computed, reactive, toRefs, getCurrentInstance, onMounted,
} from 'vue';

// router
import { useRouter } from 'vue-router';

// Components
import RiskControlCard from 'components/CampaignWorkflow/Settings/RiskControlCard.vue';
import SendingScheduleCard from 'components/CampaignWorkflow/Settings/SendingScheduleCard.vue';
import DeliverabilitySafetyCard from 'components/CampaignWorkflow/Settings/DeliverabilitySafetyCard.vue';
import SmartAiCategorizationCard from 'components/CampaignWorkflow/Settings/SmartAiCategorizationCard.vue';
import SequenceConfigurationsCard from 'components/CampaignWorkflow/Settings/SequenceConfigurationsCard.vue';

import SaveDailyNewContactsLimit from 'src/components/CampaignWorkflow/Settings/Modals/SaveDailyNewContactsLimit.vue';

// Utils
import { getApiCall } from 'src/utils/apiRequests';
import { saveCampaignSettingsById } from 'src/utils/campaignApi';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { CAMPAIGN_STATUS, DEFAULT_CAMPAIGN_SETTINGS } from 'boot/campaign-constants';

export default defineComponent({
  name: 'CampaignWorkflowSaveSettings',

  components: {
    RiskControlCard,
    SendingScheduleCard,
    DeliverabilitySafetyCard,
    SequenceConfigurationsCard,
    SmartAiCategorizationCard,

    // Modals
    SaveDailyNewContactsLimit,
  },

  props: {
    campaignById: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    // app context
    const { appContext } = getCurrentInstance();

    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // router
    const $router = useRouter();

    // state
    const state = reactive({
      showAdvanced: false,

      campaignSettings: {
        ...DEFAULT_CAMPAIGN_SETTINGS,
      },

      loaders: {
        isSaving: false,
        isFetching: false,
      },

      modals: {
        showDailyLimitDialog: false,
      },

      ui: {
        hasChanges: false,
      },
    });

    // computed
    const campaignCtaJson = computed(() => {
      const campaignStatus = props.campaignById?.status;

      // drafted
      if (campaignStatus === CAMPAIGN_STATUS.DRAFTED.value) {
        return {
          disable: false,
          canSchedcule: true,
          label: 'Launch Campaign',
        };
      }

      // active
      if (campaignStatus === CAMPAIGN_STATUS.ACTIVE.value) {
        return {
          disable: true,
          label: 'Campaign is Active',
        };
      }

      // Completed
      if (campaignStatus === CAMPAIGN_STATUS.COMPLETED.value) {
        return {
          disable: true,
          label: 'Campaign is Completed',
        };
      }

      // paused
      if (campaignStatus === CAMPAIGN_STATUS.PAUSED.value
        || campaignStatus === CAMPAIGN_STATUS.AUTO_PAUSED.value
        || campaignStatus === CAMPAIGN_STATUS.PAUSED_SUB_FAILED.value
      ) {
        return {
          disable: false,
          label: 'Resume Campaign',
        };
      }

      // Archived
      if (campaignStatus === CAMPAIGN_STATUS.ARCHIVED.value) {
        return {
          disable: true,
          label: 'Campaign is Archived',
        };
      }

      return {
        disable: true,
        label: 'Launch Campaign',
      };
    });

    // methods
    const onGoBack = () => {
      // route to contacts step
      $router.push(`/outreach/campaigns/${props.campaignById.id}/edit/contacts`);
    };

    const toggleAdvanced = () => {
      state.showAdvanced = !state.showAdvanced;
    };

    const fetchCampaignSettings = async () => {
      try {
        state.loaders.isFetching = true;

        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: `/sequences/${props.campaignById.id}/settings`,
        });

        state.campaignSettings = response || {};

        // fetch campaign settings
      } catch (error) {
        // dont show error for 404 status
        if (error?.response?.status !== 404) {
          //
        } else {
          appContext.config.globalProperties.$toast({
            warning: true,
            message: error.message,
          });
        }
      } finally {
        state.loaders.isFetching = false;
      }
    };

    const updateCampaignSettings = async (inputJson) => {
      state.loaders.isSaving = true;

      const { seq_id, id, ...otherCampaignSettings } = state.campaignSettings;

      const payload = {
        ...otherCampaignSettings,
        ...inputJson,
      };

      const response = await saveCampaignSettingsById({
        payload,
        campaignId: props.campaignById.id,
        $toast: appContext.config.globalProperties.$toast,
      });

      if (response) {
        state.ui.hasChanges = false;

        //
        state.campaignSettings = { ...payload };
      }

      state.loaders.isSaving = false;
    };

    const updateSettingsJson = ({ inputJson, callUpdateApi }) => {
      // close the modals
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });

      //
      if (callUpdateApi) {
        // has changes to be saved
        state.ui.hasChanges = true;

        updateCampaignSettings(inputJson);
      } else {
        state.ui.hasChanges = false;

        state.campaignSettings = {
          ...state.campaignSettings,
          ...inputJson,
        };
      }
    };

    // lifecycle hooks
    onMounted(() => {
      // fetch campaign settings
      fetchCampaignSettings();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      campaignCtaJson,

      // methods
      onGoBack,
      toggleAdvanced,
      updateSettingsJson,
      updateCampaignSettings,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-settings-section {
  width: 100%;
  min-height: 0;
  flex: 1;

  display: flex;
  flex-direction: column;

  .campaign-settings-container {
    width: 100%;
    flex: 1;
    max-width: 744px;
    display: flex;
    flex-direction: column;

    gap: 24px;
    padding: 20px 32px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }

    .advanced-configs {
      display: flex;
      flex-direction: column;

      gap: 24px;
    }

    :deep(.config-card) {
      background: $white;
      border: 1px solid $grey-50;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.2s ease-in-out;

      // header
      .config-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid $grey-50;
        background-color: $white;

        .config-card-icon-wrap {
          width: 26px;
          height: 26px;
          border-radius: 4px;
          color: $grey;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(var(--primary-rgb), 0.1);
        }

        .config-card-title {
          font-size: 16px;
          font-weight: 600;
          color: $black;
        }
      }

      // each row
      .config-row {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid $grey-50;
        padding: 20px;
        gap: 12px;

        // last child
        &:last-child {
          border-bottom: none;
        }

        // left
        .config-row-left {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .config-label-line {
            font-size: 14px;
            font-weight: 500;
            color: $black;
            line-height: 16px;
          }

          .config-subtext {
            font-size: 14px;
            color: $black;
            line-height: 16px;
          }
        }

        .config-row-right {
          .campaign-settings-dd {
            max-width: 200px;

            .q-field__control-container {
              .q-field__native {
                span {
                  color: $primary;
                  font-weight: 500;
                }
              }
            }
            .q-field__native {
              color: $primary;
              font-weight: 500;
            }

            .q-field__append {
              i {
                color: $primary;
                font-weight: 500;
              }
            }
          }
        }

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          padding: 16px 12px;
          flex-direction: column;
          align-items: flex-start;
        }
      }
    }

    .advanced-config-toggle {
      display: flex;
      align-items: center;

      .advance-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        // padding: 8px 0;
        cursor: pointer;
        user-select: none;

        :deep(.settings-icon) {
          @include svg-icon-fill('path', $primary);
        }

        span {
          color: $primary;
          font-weight: 500;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
