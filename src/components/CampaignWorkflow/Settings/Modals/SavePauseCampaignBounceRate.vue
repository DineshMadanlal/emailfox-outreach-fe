<template>
  <q-card flat class="app-modal-card campaign-bounce-card">
    <q-form
      class="full-width"
      ref="savePauseCampaignBounceRateFormRef"

      @submit.prevent.stop="onSubmit"
    >
      <div class="app-modal-header">
        <!-- header text -->
        <h4 class="modal-header-text">
          Pause Campaign When Bounce Rate Reaches
        </h4>

        <q-space />

        <!-- Close -->
        <q-btn
          flat
          round
          dense
          v-close-popup

          color="negative"
          class="app-negative-button"
        >
          <LocalSvgIcon
            image="close"
            classes="app-negative-icon"
          />
        </q-btn>
      </div>

      <!-- content -->
      <div class="app-modal-content">
        <InputLabel
          isImportant
          label="Bounce Rate Threshold (%)"
        />

        <q-input
          v-model.number="bounceRateThreshold"
          dense
          outlined

          :min="0"
          :rules="[val => !!val || 'Please enter a valid number']"

          type="number"
          lazy-rules="ondemand"
          class="campaign-bounce-input"
          placeholder="Enter bounce rate threshold"

          @update:model-value="onInputChange"
        />
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <q-btn
          no-caps
          unelevated

          label="Save"
          type="submit"
          color="primary"

          :loading="isSaving"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, onMounted, getCurrentInstance,
} from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';

// utils
import { saveCampaignSettingsById } from 'src/utils/campaignApi';

export default defineComponent({
  name: 'SavePauseCampaignBounceRate',

  emits: ['updateSettingsJson'],

  components: {
    InputLabel,
  },

  props: {
    campaignId: {
      type: [String, Number],
      required: true,
    },
    campaignSettings: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      // 5 is default
      bounceRateThreshold: 5,

      savePauseCampaignBounceRateFormRef: null,

      isSaving: false,
    });

    // methods
    const onSubmit = async () => {
      state.isSaving = true;

      const payload = {
        ...props.campaignSettings,
        pause_campaign_when_bounce_rate_at: state.bounceRateThreshold,
      };

      const response = await saveCampaignSettingsById({
        payload,
        campaignId: props.campaignId,
        $toast: appContext.config.globalProperties.$toast,
      });

      if (response) {
        emit('updateSettingsJson', {
          inputJson: payload,
          callUpdateApi: false,
        });
      }

      state.isSaving = false;
    };

    const onInputChange = () => {
      state.savePauseCampaignBounceRateFormRef.resetValidation();
    };

    // lifecycle hooks
    onMounted(() => {
      state.bounceRateThreshold = props.campaignSettings.pause_campaign_when_bounce_rate_at;
    });

    return {
      // state
      ...toRefs(state),

      // methods
      onSubmit,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-bounce-card {
  max-width: 640px;

  .app-modal-content {
    .campaign-bounce-input {
      width: 100%;
      max-width: 400px;
    }
  }
}
</style>
