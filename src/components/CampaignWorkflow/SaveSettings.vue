<template>
  <div class="campaign-settings-section">
    <!-- container -->
    <div class="campaign-settings-container">
      <!-- sending schedule -->
      <SendingScheduleCard />

      <!-- sequence configuration -->
      <SequenceConfigurationsCard />

      <!-- smart ai -->
      <SmartAiCategorizationCard />

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
          <DeliverabilitySafetyCard />

          <RiskControlCard />
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

// constants
import { CAMPAIGN_STATUS } from 'boot/campaign-constants';

export default defineComponent({
  name: 'CampaignWorkflowSaveSettings',

  components: {
    RiskControlCard,
    SendingScheduleCard,
    DeliverabilitySafetyCard,
    SequenceConfigurationsCard,
    SmartAiCategorizationCard,
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

    // router
    const $router = useRouter();

    // state
    const state = reactive({
      showAdvanced: false,

      campaignSettings: {},

      loaders: {
        isFetchApi: false,
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

    const fetchCampaignSettings = () => {
      try {
        state.loaders.isFetchApi = true;

        // fetch campaign settings
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isFetchApi = false;
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
      campaignCtaJson,

      // methods
      onGoBack,
      toggleAdvanced,
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

    overflow-y: auto;

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
