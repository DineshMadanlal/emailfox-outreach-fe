<template>
  <q-card flat class="app-modal-card edit-bcc-to-crm-card">
    <q-form
      class="full-width"
      ref="bccFormRef"
      @submit.prevent.stop="onSubmitForm"
    >
      <!-- header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          BCC to CRM
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
          <InputLabel
            label="Email Address"
          />

          <q-input
            dense
            outlined
            autofocus
            hide-bottom-space
            v-model.trim="email"
            placeholder="e.g. crm@yourcompany.com"
            lazy-rules="ondemand"
            :rules="emailRules"
            @update:modelValue="onInputChange"
          />
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

// constants
import { EMAIL_REGEX } from 'boot/constants';

export default defineComponent({
  name: 'EditBccToCrm',

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
      email: '',
      isApiLoading: false,
      bccFormRef: null,
    });

    const emailRules = [
      (val) => !val || EMAIL_REGEX.test(val) || 'Please enter a valid email address',
    ];

    const onInputChange = () => {
      state.bccFormRef?.resetValidation();
    };

    const onSubmitForm = async () => {
      try {
        const isValidated = await state.bccFormRef?.validate();
        if (!isValidated) {
          return;
        }

        state.isApiLoading = true;

        const cleanEmail = state.email ? state.email.trim() : '';

        const isEmailEmpty = !cleanEmail || cleanEmail.trim() === '';

        const updateFields = {};

        if (isEmailEmpty) {
          updateFields.clear_bcc_to_crm = true;
        } else {
          updateFields.bcc_to_crm = cleanEmail;
        }

        const payload = {
          filter: {
            mailbox_ids: [props.mailboxByJson.id],
          },
          update_fields: updateFields,
        };

        await bulkUpdateMailboxes(payload);

        appContext.config.globalProperties.$toast({
          message: 'BCC to CRM updated successfully',
        });

        const updatedMailbox = {
          ...props.mailboxByJson,
          bcc_to_crm: cleanEmail,
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
      state.email = props.mailboxByJson.bcc_to_crm || '';
    });

    return {
      ...toRefs(state),
      emailRules,
      onInputChange,
      onSubmitForm,
    };
  },
});
</script>

<style lang="scss" scoped>
.edit-bcc-to-crm-card {
  max-width: 480px;
  width: 100%;

  .app-modal-content {
    .modal-content-container {
      width: 100%;
    }
  }
}
</style>
