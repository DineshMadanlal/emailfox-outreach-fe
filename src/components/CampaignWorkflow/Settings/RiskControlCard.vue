<template>
  <q-card class="config-card" flat>
    <!-- Card Header -->
    <div class="config-card-header">
      <!-- Icon -->
      <div class="config-card-icon-wrap">
        <LocalSvgIcon
          image="more-filter"
          classes="config-card-icon"
        />
      </div>

      <p class="config-card-title">
        Risk Control
      </p>
    </div>

    <!-- Row 1: Pause Campaign Bounce Rate -->
    <div class="config-row">
      <div class="config-row-left">
        <p class="config-label-line">
          Pause Campaign When Bounce Rate Reaches
        </p>
      </div>

      <div class="config-row-right">
        <q-btn
          flat
          dense
          no-caps

          color="primary"
          class="btn-font-weight-500"

          @click="$emit('showPauseCampaignBounceRateDialog')"
        >
          {{ riskControlSettings.pauseCampaignWhenBounceRateAt }}%
        </q-btn>
      </div>
    </div>

    <!-- Row 2: Include Unsubscribe Message -->
    <div class="config-row">
      <!-- left -->
      <div class="config-row-left">
        <p class="config-label-line">
          Include Unsubscribe Message
        </p>
      </div>

      <!-- right -->
      <div class="config-row-right">
        <ToggleInput
          v-model="riskControlSettings.includeUnsubscribeMessage"

          @update:modelValue="onUpdateCampaignSettings"
        />
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, onMounted, watch,
} from 'vue';

// Components
import ToggleInput from 'components/Input/ToggleInput.vue';

export default defineComponent({
  name: 'RiskControlCard',

  emits: ['updateCampaignSettings', 'showPauseCampaignBounceRateDialog'],

  components: {
    ToggleInput,
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
      riskControlSettings: {
        pauseCampaignWhenBounceRateAt: 5,
        includeUnsubscribeMessage: false,
      },
    });

    // methods
    const loadSettingsState = () => {
      state.riskControlSettings = {
        pauseCampaignWhenBounceRateAt:
          props.campaignSettings.pause_campaign_when_bounce_rate_at ?? 5,

        includeUnsubscribeMessage: props.campaignSettings.include_unsubscribe_message ?? false,
      };
    };

    const onUpdateCampaignSettings = () => {
      emit('updateCampaignSettings', {
        include_unsubscribe_message: state.riskControlSettings.includeUnsubscribeMessage,
      });
    };

    onMounted(() => {
      loadSettingsState();
    });

    // watchers
    watch(
      () => props.campaignSettings,
      () => {
        loadSettingsState();
      },
    );

    return {
      // state
      ...toRefs(state),

      // methods
      onUpdateCampaignSettings,
    };
  },
});
</script>
