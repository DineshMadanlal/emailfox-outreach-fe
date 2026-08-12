<template>
  <q-card flat class="app-modal-card daily-limit-card">
    <q-form
      class="full-width"
      ref="saveDailyLimitFormRef"

      @submit.prevent.stop="onSubmit"
    >
      <div class="app-modal-header">
        <!-- header text -->
        <h4 class="modal-header-text">
          Daily New Contacts Limit
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
          label="Daily New Contacts Limit"
        />

        <q-input
          v-model.number="dailyLimit"
          dense
          outlined

          :min="0"
          :rules="[val => !!val || 'Please enter a valid number']"

          type="number"
          lazy-rules="ondemand"
          class="daily-limit-input"
          placeholder="Enter daily new contacts limit"

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
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, onMounted,
} from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';

// utils
import { saveCampaignSettingsById } from 'src/utils/campaignApi';

export default defineComponent({
  name: 'SaveDailyNewContactsLimit',

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
    // state
    const state = reactive({
      // 1000 is default
      dailyLimit: 1000,

      saveDailyLimitFormRef: null,
    });

    // methods
    const onSubmit = async () => {
      const payload = {
        ...props.campaignSettings,
        new_contacts_per_day: state.dailyLimit,
      };

      const response = await saveCampaignSettingsById({
        payload,
        campaignId: props.campaignId,
      });

      if (response) {
        emit('updateSettingsJson', {
          inputJson: payload,
          callUpdateApi: false,
        });
      }
    };

    const onInputChange = () => {
      state.saveDailyLimitFormRef.resetValidation();
    };

    // lifecycle hooks
    onMounted(() => {
      state.dailyLimit = props.campaignSettings.new_contacts_per_day;
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
.daily-limit-card {
  max-width: 520px;

  .app-modal-content {
    .daily-limit-input {
      width: 100%;
      max-width: 400px;
    }
  }
}
</style>
