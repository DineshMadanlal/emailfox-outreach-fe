<template>
  <!--  -->
  <q-card
    flat
    class="config-card"
  >
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
        <!-- Unsubscribe message -->
        <ToggleInput
          v-model="riskControlSettings.includeUnsubscribeMessage"

          @update:modelValue="onUpdateCampaignSettings"
        />
      </div>
    </div>

    <!-- Unsubscribe Message Input (when toggle enabled) -->
    <div
      v-if="riskControlSettings.includeUnsubscribeMessage"
      class="config-row"
    >
      <div class="config-row-left">
        <div class="flex no-wrap q-gutter-sm items-center">
          <p class="config-label-line">
            Unsubscribe Text
          </p>

          <InfoTooltip
            iconName="circle-question"
            tooltipText="This text will be added as a link for leads to click and unsubscribe"
          />
        </div>
      </div>

      <!-- right -->
      <div class="config-row-right">
        <q-input
          v-model="riskControlSettings.unsubscribeMessage"
          dense
          outlined

          :debounce="500"
          class="unsubscribe-input"
          placeholder="e.g. Unsubscribe"

          @update:model-value="onUpdateUnsubscribeMessage"
        />
      </div>
    </div>

    <!-- Row 3: Include Unsubscribe Header -->
    <div class="config-row">
      <!-- left -->
      <div class="config-row-left">
        <p class="config-label-line">
          Include Unsubscribe Header
        </p>
      </div>

      <!-- right -->
      <div class="config-row-right">
        <ToggleInput
          v-model="riskControlSettings.includeUnsubscribeHeaders"

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
import InfoTooltip from 'src/components/General/InfoTooltip.vue';

// Constants
import { DEFAULT_UNSUBSCRIBE_MESSAGE } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'RiskControlCard',

  emits: [
    'updateCampaignSettings',
    'showPauseCampaignBounceRateDialog',
  ],

  components: {
    ToggleInput,
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
      riskControlSettings: {
        pauseCampaignWhenBounceRateAt: 5,
        includeUnsubscribeMessage: false,
        includeUnsubscribeHeaders: false,
        unsubscribeMessage: DEFAULT_UNSUBSCRIBE_MESSAGE,
      },
    });

    // methods
    const loadSettingsState = () => {
      state.riskControlSettings = {
        pauseCampaignWhenBounceRateAt:
          props.campaignSettings.pause_campaign_when_bounce_rate_at ?? 5,

        includeUnsubscribeMessage:
          props.campaignSettings.include_unsubscribe_message ?? false,

        includeUnsubscribeHeaders:
          props.campaignSettings.include_unsubscribe_headers ?? false,

        unsubscribeMessage:
          props.campaignSettings.unsubscribe_message,
      };
    };

    const onUpdateCampaignSettings = () => {
      emit('updateCampaignSettings', {
        include_unsubscribe_message: state.riskControlSettings.includeUnsubscribeMessage,
        include_unsubscribe_headers: state.riskControlSettings.includeUnsubscribeHeaders,
      });
    };

    const onUpdateUnsubscribeMessage = (val) => {
      emit('updateCampaignSettings', {
        unsubscribe_message: val,
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
      // constants
      DEFAULT_UNSUBSCRIBE_MESSAGE,

      // state
      ...toRefs(state),

      // methods
      onUpdateCampaignSettings,
      onUpdateUnsubscribeMessage,
    };
  },
});
</script>

<style lang="scss" scoped>
.config-card {
  .unsubscribe-input {
    width: 240px;
  }
}
</style>
