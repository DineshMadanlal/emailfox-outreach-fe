<template>
  <q-card class="config-card" flat>
    <!-- Card Header -->
    <div class="config-card-header">
      <!-- Icon -->
      <div class="config-card-icon-wrap">
        <!--  -->
        <LocalSvgIcon
          image="inbox"
          classes="config-card-icon"
        />
      </div>

      <!-- title -->
      <p class="config-card-title">
        Deliverability & Safety
      </p>
    </div>

    <!-- Row 1: Send Emails in Plain Text -->
    <div class="config-row">
      <!-- left -->
      <div class="config-row-left">
        <p class="config-label-line">
          Send Emails in Plain Text (No HTML)
        </p>
      </div>

      <!-- right -->
      <div class="config-row-right">
        <ToggleInput
          v-model="deliverabilitySafetySettings.plainTextOnly"

          @update:modelValue="onUpdateCampaignSettings"
        />
      </div>
    </div>

    <!-- Row 2: Auto-Match Leads ESP -->
    <div class="config-row">
      <!-- Left -->
      <div class="config-row-left">
        <div class="flex no-wrap q-gutter-sm items-center">
          <p class="config-label-line">
            Auto-Match Leads ESP (e.g., Gmail &rarr; Gmail)
          </p>

          <InfoTooltip
            iconName="circle-question"
            tooltipText="Automatically pair senders and leads on matching email service providers
            (e.g. Gmail to Gmail, Outlook to Outlook) for better inbox placement."
          />
        </div>
      </div>

      <!-- right -->
      <div class="config-row-right">
        <ToggleInput
          v-model="deliverabilitySafetySettings.autoMatchEsp"

          @update:modelValue="onUpdateCampaignSettings"
        />
      </div>
    </div>

    <!-- Row 3: Avoid sending to bounced accounts -->
    <div class="config-row">
      <!-- Left -->
      <div class="config-row-left">
        <p class="config-label-line">
          Avoid sending emails to email accounts previously bounced.
        </p>
      </div>

      <!-- Right -->
      <div class="config-row-right">
        <ToggleInput
          v-model="deliverabilitySafetySettings.avoidBounced"

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
import InfoTooltip from 'components/General/InfoTooltip.vue';

export default defineComponent({
  name: 'DeliverabilitySafetyCard',

  emits: ['updateCampaignSettings'],

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
      deliverabilitySafetySettings: {
        plainTextOnly: true,
        autoMatchEsp: true,
        avoidBounced: true,
      },
    });

    // computed

    // methods
    const loadSettingsState = () => {
      state.deliverabilitySafetySettings = {
        plainTextOnly: props.campaignSettings.send_plain_text ?? true,
        autoMatchEsp: props.campaignSettings.match_esp_contact ?? true,
        avoidBounced: props.campaignSettings.block_previously_bounced_contact ?? true,
      };
    };

    const onUpdateCampaignSettings = () => {
      emit('updateCampaignSettings', {
        send_plain_text: state.deliverabilitySafetySettings.plainTextOnly,
        match_esp_contact: state.deliverabilitySafetySettings.autoMatchEsp,
        block_previously_bounced_contact: state.deliverabilitySafetySettings.avoidBounced,
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
