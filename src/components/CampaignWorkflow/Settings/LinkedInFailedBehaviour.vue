<template>
  <q-card
    flat
    class="config-card"
  >
    <!-- Card Header -->
    <div class="config-card-header">
      <div class="config-card-icon-wrap">
        <LocalSvgIcon
          image="linkedin-1"
          classes="config-card-icon"
        />
      </div>

      <div class="config-card-title">
        LinkedIn Outreach Settings
      </div>
    </div>

    <!-- Row 1: Failure Behavior -->
    <div class="config-row">
      <!-- Left -->
      <div class="config-row-left">
        <p class="config-label-line">
          LinkedIn Step Failure Behavior
        </p>
      </div>

      <!-- Right -->
      <div class="config-row-right">
        <div class="row items-center q-gutter-md">
          <q-radio
            v-for="option in failureBehaviorOptions"
            :key="`failure-behavior-${option.value}`"
            v-model="linkedinSettings.failureBehavior"
            :val="option.value"
            dense
            color="primary"
            @update:modelValue="onUpdateCampaignSettings"
          >
            <div class="flex no-wrap items-center q-gutter-xs">
              <p class="radio-label-text">
                {{ option.label }}
              </p>

              <InfoTooltip
                v-if="option.tooltip"
                iconName="info-circle"
                :tooltipText="option.tooltip"
              />
            </div>
          </q-radio>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, onMounted, watch, computed,
} from 'vue';

// components
import InfoTooltip from 'src/components/General/InfoTooltip.vue';

// constants
import {
  LINKEDIN_FAILURE_BEHAVIOR,
  DEFAULT_CAMPAIGN_SETTINGS,
} from 'boot/campaign-constants';

export default defineComponent({
  name: 'LinkedInFailedBehaviour',

  emits: ['updateCampaignSettings'],

  components: {
    InfoTooltip,
  },

  props: {
    campaignSettings: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      linkedinSettings: {
        failureBehavior: DEFAULT_CAMPAIGN_SETTINGS.linkedin_failure_behavior,
      },
    });

    // computed
    const failureBehaviorOptions = computed(() => Object.values(LINKEDIN_FAILURE_BEHAVIOR));

    // methods
    const onUpdateCampaignSettings = () => {
      emit('updateCampaignSettings', {
        linkedin_failure_behavior: state.linkedinSettings.failureBehavior,
      });
    };

    const loadSettingsState = () => {
      const campaignSettings = props.campaignSettings || {};

      state.linkedinSettings.failureBehavior = campaignSettings.linkedin_failure_behavior
        || DEFAULT_CAMPAIGN_SETTINGS.linkedin_failure_behavior;
    };

    // lifecycle hooks
    onMounted(() => {
      loadSettingsState();
    });

    // watchers
    watch(
      () => props.campaignSettings,
      () => {
        loadSettingsState();
      },
      { deep: true },
    );

    return {
      // state
      ...toRefs(state),

      // computed
      failureBehaviorOptions,

      // methods
      onUpdateCampaignSettings,
    };
  },
});
</script>

<style lang="scss" scoped>
.config-card {
  .radio-label-text {
    font-size: 14px;
    color: $black;
    font-weight: 400;
  }
}
</style>
