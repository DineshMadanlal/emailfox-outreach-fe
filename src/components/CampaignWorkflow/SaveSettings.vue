<template>
  <div class="campaign-settings-section">
    <ApiLoader
      :show="loaders.isFetching"
    />

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

    <q-dialog
      v-model="modals.showPauseCampaignBounceRateDialog"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SavePauseCampaignBounceRate
        :campaignId="campaignById.id"
        :campaignSettings="campaignSettings"

        @updateSettingsJson="updateSettingsJson"
      />
    </q-dialog>

    <q-dialog
      v-model="modals.showManageCategoriesDialog"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <ManageCampaignCategories
        :campaignId="campaignById.id"
        :campaignSettings="campaignSettings"

        @updateSettingsJson="updateSettingsJson"
      />
    </q-dialog>

    <q-dialog
      v-model="modals.showEditReactivateDaysDialog"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveEditReactivateDays
        :campaignId="campaignById.id"
        :campaignSettings="campaignSettings"

        @updateSettingsJson="updateSettingsJson"
      />
    </q-dialog>

    <!-- container -->
    <div
      class="campaign-settings-container"
    >
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
        @manageCategories="modals.showManageCategoriesDialog = true"
        @editReactivateDays="modals.showEditReactivateDaysDialog = true"
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
            @showPauseCampaignBounceRateDialog="modals.showPauseCampaignBounceRateDialog = true"
          />

          <div ref="riskControlCardRef" />
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
  defineComponent, computed, reactive, toRefs, getCurrentInstance, onMounted, onUnmounted,
} from 'vue';

// quasar
import { debounce } from 'quasar';

// router
import { useRouter } from 'vue-router';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';

import RiskControlCard from 'components/CampaignWorkflow/Settings/RiskControlCard.vue';
import SendingScheduleCard from 'components/CampaignWorkflow/Settings/SendingScheduleCard.vue';
import DeliverabilitySafetyCard from 'components/CampaignWorkflow/Settings/DeliverabilitySafetyCard.vue';
import SmartAiCategorizationCard from 'components/CampaignWorkflow/Settings/SmartAiCategorizationCard.vue';
import SequenceConfigurationsCard from 'components/CampaignWorkflow/Settings/SequenceConfigurationsCard.vue';

import SaveDailyNewContactsLimit from 'src/components/CampaignWorkflow/Settings/Modals/SaveDailyNewContactsLimit.vue';
import SavePauseCampaignBounceRate from 'src/components/CampaignWorkflow/Settings/Modals/SavePauseCampaignBounceRate.vue';
import ManageCampaignCategories from 'src/components/CampaignWorkflow/Settings/Modals/ManageCampaignCategories.vue';
import SaveEditReactivateDays from 'src/components/CampaignWorkflow/Settings/Modals/SaveEditReactivateDays.vue';

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
    ApiLoader,

    RiskControlCard,
    SendingScheduleCard,
    DeliverabilitySafetyCard,
    SequenceConfigurationsCard,
    SmartAiCategorizationCard,

    // Modals
    ManageCampaignCategories,
    SaveEditReactivateDays,
    SaveDailyNewContactsLimit,
    SavePauseCampaignBounceRate,
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

      // ref
      riskControlCardRef: null,

      campaignSettings: {
        ...DEFAULT_CAMPAIGN_SETTINGS,
      },

      loaders: {
        isSaving: false,
        isFetching: false,
      },

      modals: {
        showDailyLimitDialog: false,
        showPauseCampaignBounceRateDialog: false,

        showManageCategoriesDialog: false,
        showEditReactivateDaysDialog: false,
      },

      ui: {
        hasChanges: false,
      },
    });

    // computed
    const campaignCtaJson = computed(() => {
      const campaignStatus = props.campaignById?.status;

      if (campaignStatus === CAMPAIGN_STATUS.DRAFTED.value) {
        return {
          disable: false,
          canSchedcule: true,
          label: 'Launch Campaign',
        };
      }

      if (campaignStatus === CAMPAIGN_STATUS.ACTIVE.value) {
        return {
          disable: true,
          label: 'Campaign is Active',
        };
      }

      if (campaignStatus === CAMPAIGN_STATUS.COMPLETED.value) {
        return {
          disable: true,
          label: 'Campaign is Completed',
        };
      }

      if (campaignStatus === CAMPAIGN_STATUS.PAUSED.value
        || campaignStatus === CAMPAIGN_STATUS.AUTO_PAUSED.value
        || campaignStatus === CAMPAIGN_STATUS.PAUSED_SUB_FAILED.value
      ) {
        return {
          disable: false,
          label: 'Resume Campaign',
        };
      }

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

    // --- API Save Execution ---
    const executeSaveApi = async () => {
      state.loaders.isSaving = true;

      try {
        const { seq_id, id, ...otherCampaignSettings } = state.campaignSettings;

        const payload = {
          ...otherCampaignSettings,
          categories: otherCampaignSettings.categories || {},
        };

        const response = await saveCampaignSettingsById({
          payload,
          campaignId: props.campaignById.id,
          $toast: appContext.config.globalProperties.$toast,
        });

        if (response) {
          state.ui.hasChanges = false;
        }
      } catch (error) {
        // handle error
      } finally {
        state.loaders.isSaving = false;
      }
    };

    // Create debounced version of API save (500ms delay)
    const debouncedSaveSettings = debounce(executeSaveApi, 500);

    // --- Centralized Settings Updater ---
    const updateCampaignSettings = (inputJson, options = {}) => {
      // 1. Instantly update local state so UI fields respond immediately
      state.campaignSettings = {
        ...state.campaignSettings,
        ...inputJson,
      };

      state.ui.hasChanges = true;

      // 2. Immediate save (e.g. from modals) vs Debounced save (inputs/toggles)
      if (options?.immediate) {
        debouncedSaveSettings.cancel();
        executeSaveApi();
      } else {
        debouncedSaveSettings();
      }
    };

    const updateSettingsJson = ({ inputJson, callUpdateApi }) => {
      // close modals
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });

      if (callUpdateApi) {
        updateCampaignSettings(inputJson, { immediate: true });
      } else {
        state.ui.hasChanges = false;
        state.campaignSettings = {
          ...state.campaignSettings,
          ...inputJson,
        };
      }
    };

    const onGoBack = () => {
      $router.push(`/outreach/campaigns/${props.campaignById.id}/edit/contacts`);
    };

    const toggleAdvanced = () => {
      state.showAdvanced = !state.showAdvanced;

      if (state.showAdvanced) {
        setTimeout(() => {
          state.riskControlCardRef?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 500);
      }
    };

    const fetchCampaignSettings = async () => {
      try {
        state.loaders.isFetching = true;

        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: `/sequences/${props.campaignById.id}/settings`,
        });

        state.campaignSettings = response || {};
      } catch (error) {
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

    // lifecycle hooks
    onMounted(() => {
      fetchCampaignSettings();
    });

    onUnmounted(() => {
      // Cancel pending timers when navigating away
      debouncedSaveSettings.cancel();
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

        .config-row-icon {
          &.stroke {
            @include svg-icon-stroke('path', $grey);
          }

          &.fill {
            @include svg-icon-fill('path', $grey);
          }
        }

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
