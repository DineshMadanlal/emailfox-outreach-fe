<template>
  <q-card flat class="app-modal-card set-signature-card">
    <q-form
      class="full-width"
      ref="actionConfigFormRef"
      @submit.prevent.stop="onSubmitForm"
    >
      <!-- header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          Edit Signature
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
        <div class="modal-content-container no-max-width">
          <SignatureEditor
            showSignatureText
            autofocusEditor
            v-model="signatureHtml"
          />

          <!-- Signature Preview -->
          <SignaturePreview
            :signatureHtml="signatureHtml"

            :senderName="mailboxByJson.name"
            :senderEmail="mailboxByJson.email"
          />
        </div>
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <q-btn
          no-caps
          unelevated
          color="primary"
          label="Save Signature"
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
  defineComponent, reactive, toRefs, onMounted, defineAsyncComponent, getCurrentInstance,
} from 'vue';

// utils
import { bulkUpdateMailboxes } from 'src/utils/domainMailboxesApi';
import { cleanEditorHtmlForSave } from 'src/utils/helperFunctions';

export default defineComponent({
  name: 'SetSignature',

  components: {
    SignatureEditor: defineAsyncComponent(() => import('components/Editor/SignatureEditor.vue')),
    SignaturePreview: defineAsyncComponent(() => import('components/Mailboxes/SignaturePreview.vue')),
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
      signatureHtml: '',
      isApiLoading: false,
      actionConfigFormRef: null,
    });

    const onSubmitForm = async () => {
      try {
        state.isApiLoading = true;

        const cleanSignature = cleanEditorHtmlForSave(state.signatureHtml);
        const isSignatureEmpty = !cleanSignature || cleanSignature.trim() === '';

        const updateFields = {};

        if (isSignatureEmpty) {
          updateFields.clear_signature = true;
        } else {
          updateFields.signature = cleanSignature;
        }

        const payload = {
          filter: {
            mailbox_ids: [props.mailboxByJson.id],
          },
          update_fields: updateFields,
        };

        await bulkUpdateMailboxes(payload);

        appContext.config.globalProperties.$toast({
          message: 'Signature updated successfully',
        });

        const updatedMailbox = {
          ...props.mailboxByJson,
          signature: isSignatureEmpty ? '' : cleanSignature,
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
      state.signatureHtml = props.mailboxByJson.signature || '';
    });

    return {
      ...toRefs(state),
      onSubmitForm,
    };
  },
});
</script>

<style lang="scss" scoped>
.set-signature-card {
  max-width: 640px;
  width: 100%;

  .app-modal-content {
    .modal-content-container {
      width: 100%;
    }
  }
}
</style>
