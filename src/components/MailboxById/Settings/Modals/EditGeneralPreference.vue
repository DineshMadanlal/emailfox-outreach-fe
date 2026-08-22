<template>
  <q-card flat class="app-modal-card edit-general-preference-card">
    <q-form
      class="full-width"
      ref="generalPreferenceFormRef"
      @submit.prevent.stop="onSubmitForm"
    >
      <!-- header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          Edit General Preference
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
        <div class="modal-content-container">
          <!-- Maximum Emails/Day -->
          <div class="form-item">
            <InputLabel
              label="Maximum Emails/Day"
              isImportant
            />

            <q-input
              dense
              outlined
              autofocus
              hide-bottom-space
              type="number"
              v-model.number="formData.sending_limit_per_day"
              placeholder="e.g. 30"
              lazy-rules="ondemand"
              :rules="[
                (val) => (val !== null && val !== '') || 'Maximum Emails/Day is required',
                (val) => val >= 1 || 'Must be at least 1',
                (val) => val <= 50 || 'Daily limit cannot exceed 50',
              ]"
              @update:modelValue="onInputChange"
            />
          </div>

          <!-- Minimum Time Gap (mins) -->
          <div class="form-item">
            <InputLabel
              label="Minimum Time Gap (mins)"
              isImportant
              tooltip="Minimum delay between consecutive emails sent from this mailbox"
            />

            <q-input
              dense
              outlined
              hide-bottom-space
              type="number"
              v-model.number="formData.minimum_time_gap_mins"
              placeholder="e.g. 5"
              lazy-rules="ondemand"
              :rules="[
                (val) => (val !== null && val !== '') || 'Minimum Time Gap is required',
                (val) => val >= 0 || 'Must be at least 0',
              ]"
              @update:modelValue="onInputChange"
            />
          </div>
        </div>
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <q-btn
          no-caps
          unelevated
          color="primary"
          label="Save Changes"
          :loading="isApiLoading"
          type="submit"
        />

        <!-- Cancel -->
        <q-btn
          flat
          no-caps
          unelevated
          v-close-popup
          label="Cancel"
          class="q-ml-md light-primary-btn"
          color="primary"
          :disable="isApiLoading"
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

// components
import InputLabel from 'components/Form/InputLabel.vue';

// utils
import { bulkUpdateMailboxes } from 'src/utils/domainMailboxesApi';

export default defineComponent({
  name: 'EditGeneralPreference',

  components: {
    InputLabel,
  },

  props: {
    mailboxByJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  emits: ['onSuccessfulUpdate'],

  setup(props, { emit }) {
    const { appContext } = getCurrentInstance();

    const state = reactive({
      isApiLoading: false,
      generalPreferenceFormRef: null,

      formData: {
        sending_limit_per_day: null,
        minimum_time_gap_mins: null,
      },
    });

    const onInputChange = () => {
      state.generalPreferenceFormRef?.resetValidation();
    };

    const onSubmitForm = async () => {
      try {
        const isValidated = await state.generalPreferenceFormRef?.validate();
        if (!isValidated) {
          return;
        }

        state.isApiLoading = true;

        const payload = {
          filter: {
            mailbox_ids: [props.mailboxByJson.id],
          },
          update_fields: {
            sending_limit_per_day: Number(state.formData.sending_limit_per_day),
            minimum_time_gap_mins: Number(state.formData.minimum_time_gap_mins),
          },
        };

        await bulkUpdateMailboxes(payload);

        appContext.config.globalProperties.$toast({
          message: 'General preference updated successfully',
        });

        const updatedMailbox = {
          ...props.mailboxByJson,
          sending_limit_per_day: Number(state.formData.sending_limit_per_day),
          minimum_time_gap_mins: Number(state.formData.minimum_time_gap_mins),
        };

        emit('onSuccessfulUpdate', updatedMailbox);
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    onMounted(() => {
      state.formData = {
        sending_limit_per_day: props.mailboxByJson.sending_limit_per_day ?? 30,
        minimum_time_gap_mins: props.mailboxByJson.minimum_time_gap_mins ?? 5,
      };
    });

    return {
      ...toRefs(state),
      onSubmitForm,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.edit-general-preference-card {
  max-width: 480px;
  width: 100%;

  .app-modal-content {
    .modal-content-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;

      .form-item {
        width: 100%;
      }
    }
  }
}
</style>
