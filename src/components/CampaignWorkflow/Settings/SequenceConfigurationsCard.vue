<template>
  <q-card
    flat
    class="config-card"
  >
    <!-- Card Header -->
    <div class="config-card-header">
      <!-- Icon -->
      <div class="config-card-icon-wrap">
        <LocalSvgIcon
          image="seq-delivered"
          classes="config-row-icon stroke"
        />
      </div>

      <!-- Title -->
      <div class="config-card-title">
        Sequence Configurations
      </div>
    </div>

    <!-- Row 1: Stop Sending Trigger -->
    <div class="config-row">

      <!-- Left -->
      <div class="config-row-left">
        <p class="config-label-line">
          Stop Sending When
        </p>
      </div>

      <!-- Right -->
      <div class="config-row-right">
        <!--  -->
        <SelectContactStop
          v-model="sequenceSettings.stopContactWhen"

          :outlined="false"
          :borderless="true"
          class="campaign-settings-dd"

          @update:modelValue="onUpdateCampaignSettings"
        />
      </div>
    </div>

    <!-- Row 2: Stop Emails to Same Company -->
    <div class="config-row">
      <!-- Left -->
      <div class="config-row-left">
        <!--  -->
        <div class="flex no-wrap q-gutter-sm items-center">
          <p class="config-label-line">
            Stop Emails to the Same Company After a Reply
          </p>

          <InfoTooltip
            iconName="circle-question"
            tooltipText="Halt automated follow-ups to all contacts in a
            domain once anyone at the company replies."
          />
        </div>
      </div>

      <!-- Right -->
      <div class="config-row-right">
        <ToggleInput
          v-model="sequenceSettings.stopSameCompany"

          @update:modelValue="onUpdateCampaignSettings"
        />
      </div>
    </div>

    <!-- Row 3: Spintax Distribution Mode -->
    <div class="config-row">
      <!-- left -->
      <div class="config-row-left">
        <p class="config-label-line">
          Email Variant & Spintax Distribution Mode
        </p>
      </div>

      <!-- Right -->
      <div class="config-row-right">

        <div class="row items-center q-gutter-md">
          <q-radio
            v-for="option in variantSpintaxOptions"
            :key="`spintax-option-${option.value}`"

            v-model="sequenceSettings.spintaxMode"
            :val="option.value"
            dense

            color="primary"

            @update:modelValue="onUpdateCampaignSettings"
          >
            <div class="flex no-wrap items-center q-gutter-sm">
              <p>
                {{ option.label }}
              </p>

              <InfoTooltip
                iconName="info-circle"
                :tooltipText="option.description"
              />
            </div>
          </q-radio>
        </div>

      </div>
    </div>

    <!-- Row 4: Sending Volume -->
    <div class="config-row">

      <!-- left -->
      <div class="config-row-left">
        <div class="flex no-wrap q-gutter-sm items-center">
          <p class="config-label-line">
            Sending Volume
          </p>

          <InfoTooltip
            iconName="circle-question"
            tooltipText="Prioritize follow-up messages over new emails in your daily queue."
          />
        </div>
      </div>

      <!-- Right -->
      <div class="config-row-right">
        <SelectSendingVolume
          v-model="sequenceSettings.followUpRatio"

          :outlined="false"
          :borderless="true"
          class="campaign-settings-dd"

          @update:modelValue="onUpdateCampaignSettings"
        />
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, watch,
} from 'vue';

// components
import ToggleInput from 'components/Input/ToggleInput.vue';
import InfoTooltip from 'components/General/InfoTooltip.vue';
import SelectContactStop from 'components/Dropdown/SelectContactStop.vue';
import SelectSendingVolume from 'components/Dropdown/SelectSendingVolume.vue';

// constants
import { DEFAULT_CAMPAIGN_SETTINGS, VARIANT_SPINTAX_DISTRIBUTION } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'SequenceConfigurationsCard',

  emits: ['updateCampaignSettings'],

  components: {
    ToggleInput,
    InfoTooltip,
    SelectContactStop,
    SelectSendingVolume,
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
      sequenceSettings: {
        followUpRatio: 100,
        stopSameCompany: true,
        stopContactWhen: DEFAULT_CAMPAIGN_SETTINGS.stop_contact_when,
        spintaxMode: DEFAULT_CAMPAIGN_SETTINGS.variant_spintax_distribution,
      },
    });

    // computed
    const variantSpintaxOptions = computed(() => Object.values(VARIANT_SPINTAX_DISTRIBUTION));

    // methods
    const onUpdateCampaignSettings = () => {
      emit('updateCampaignSettings', {
        stop_contact_when: state.sequenceSettings.stopContactWhen,
        stop_contact_on_company_level_reply: state.sequenceSettings.stopSameCompany,
        variant_spintax_distribution: state.sequenceSettings.spintaxMode,
        follow_up_percent: state.sequenceSettings.followUpRatio,
      });
    };

    const loadSettingsState = () => {
      // load sequence settings from campaign settings
      const campaignSettings = props.campaignSettings || {};

      state.sequenceSettings.stopContactWhen = campaignSettings.stop_contact_when
        || DEFAULT_CAMPAIGN_SETTINGS.stop_contact_when;
      state.sequenceSettings.stopSameCompany = campaignSettings.stop_contact_on_company_level_reply
        ?? DEFAULT_CAMPAIGN_SETTINGS.stop_contact_on_company_level_reply;
      state.sequenceSettings.spintaxMode = campaignSettings.variant_spintax_distribution
        || DEFAULT_CAMPAIGN_SETTINGS.variant_spintax_distribution;
      state.sequenceSettings.followUpRatio = campaignSettings.follow_up_percent
        ?? DEFAULT_CAMPAIGN_SETTINGS.follow_up_percent;
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
    );

    return {
      // state
      ...toRefs(state),

      // computed
      variantSpintaxOptions,

      // methods
      onUpdateCampaignSettings,
    };
  },
});
</script>
