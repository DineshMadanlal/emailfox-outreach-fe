<template>
  <q-card flat class="app-modal-card reactivate-days-card">
    <q-form
      class="full-width"
      ref="saveEditReactivateDaysFormRef"

      @submit.prevent.stop="onSubmit"
    >
      <div class="app-modal-header">
        <!-- header text -->
        <h4 class="modal-header-text">
          Re-activate OOO Contact Delay
        </h4>

        <q-space />

        <!-- Close button -->
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
        <!-- input label -->
        <InputLabel
          isImportant
          label="Re-activate Delay (Days)"
        />

        <!-- input field for delay reactivation in days -->
        <q-input
          v-model.number="reactivateDays"
          dense
          outlined

          :min="0"
          :rules="[val => (
            val !== null && val !== '' && val >= 0
          ) || 'Please enter a valid number of days']"

          type="number"
          lazy-rules="ondemand"
          class="reactivate-days-input"
          placeholder="Enter number of days"

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
  name: 'SaveEditReactivateDays',

  // Emits event to update campaign settings JSON in parent component
  emits: ['updateSettingsJson'],

  components: {
    InputLabel,
  },

  props: {
    // Unique ID of the campaign being configured
    campaignId: {
      type: [String, Number],
      required: true,
    },
    // Existing campaign settings object passed from parent
    campaignSettings: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // Global app instance for accessing global properties like $toast
    const { appContext } = getCurrentInstance();

    // Component reactive state
    const state = reactive({
      // Number of days to delay OOO contact reactivation
      reactivateDays: 0,

      // Reference to the form component for resetting validation states
      saveEditReactivateDaysFormRef: null,

      // Indicates loading state during API request execution
      isSaving: false,
    });

    // Form submit handler to save updated reactivation delay setting
    const onSubmit = async () => {
      state.isSaving = true;

      // Construct API payload with updated delay_reactivation_ooo_contact field
      const payload = {
        ...props.campaignSettings,
        delay_reactivation_ooo_contact: state.reactivateDays,
      };

      // Call API helper to persist campaign settings changes
      const response = await saveCampaignSettingsById({
        payload,
        campaignId: props.campaignId,
        $toast: appContext.config.globalProperties.$toast,
      });

      // On successful API response, notify parent component to sync local settings state
      if (response) {
        emit('updateSettingsJson', {
          inputJson: payload,
          callUpdateApi: false,
        });
      }

      state.isSaving = false;
    };

    // Reset input field validation errors when user changes input value
    const onInputChange = () => {
      if (state.saveEditReactivateDaysFormRef) {
        state.saveEditReactivateDaysFormRef.resetValidation();
      }
    };

    // Lifecycle hook: initialize reactivateDays from existing campaignSettings prop
    onMounted(() => {
      state.reactivateDays = props.campaignSettings?.delay_reactivation_ooo_contact ?? 0;
    });

    return {
      // Export reactive state properties to template
      ...toRefs(state),

      // Component methods
      onSubmit,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.reactivate-days-card {
  max-width: 640px;

  .app-modal-content {
    .reactivate-days-input {
      width: 100%;
      max-width: 400px;
    }
  }
}
</style>
