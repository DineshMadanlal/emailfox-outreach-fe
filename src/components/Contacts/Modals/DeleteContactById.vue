<template>
  <q-card flat class="app-modal-card delete-contact-by-id-card">
    <!-- header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        Delete Contact
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

    <!-- Content -->
    <div class="app-modal-content">
      <p class="delete-warning-text">
        This will permanently delete
        <strong>{{ contactTargetText }}</strong>
        across your entire workspace.
        <br />
        <br />
        This action is irreversible. Are you sure you want to proceed?
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToDelete"

        color="negative"
        label="I understand the consequences of deleting this contact."
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Permanently Delete -->
      <q-btn
        no-caps
        unelevated

        color="negative"
        label="Permanently Delete"

        :loading="isApiLoading"
        :disabled="!agreeToDelete"

        @click="onDeleteContact"
      />

      <!-- Cancel -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        :loading="isApiLoading"

        label="Cancel"
        color="negative"

        class="light-negative-btn"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// Utils
import { deleteApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'DeleteContactById',

  emits: ['onSuccessfulDelete'],

  props: {
    contactId: {
      type: [String, Number],
      required: true,
    },
    contactName: {
      type: String,
      default: '',
    },
  },

  setup(props, { emit }) {
    const { appContext } = getCurrentInstance();

    const state = reactive({
      agreeToDelete: false,
      isApiLoading: false,
    });

    const contactTargetText = computed(() => {
      if (props.contactName && props.contactName !== '-') {
        return `"${props.contactName}"`;
      }
      return 'this contact';
    });

    const onDeleteContact = async () => {
      try {
        state.isApiLoading = true;

        await deleteApiCall({
          endpoint: `/contacts/${props.contactId}`,
          includeWorkspace: true,
        });

        appContext.config.globalProperties.$toast({
          message: 'Contact deleted successfully',
        });

        emit('onSuccessfulDelete');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to delete contact. Please try again.',
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    return {
      ...toRefs(state),
      contactTargetText,
      onDeleteContact,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-contact-by-id-card {
  max-width: 600px;

  .light-negative-btn {
    margin-left: 12px;
  }

  .delete-warning-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    margin-bottom: 20px;
  }
}
</style>
