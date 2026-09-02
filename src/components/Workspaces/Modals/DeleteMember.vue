<template lang="">
  <q-card flat class="app-modal-card delete-member-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Delete {{ isClient ? 'Client' : 'Team' }} Member
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
        Are you sure you want to delete this member? This action cannot be undone.
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToDelete"

        color="negative"
        label="I understand the consequences of deleting the member"
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="negative"
        label="Delete Member"

        :loading="isApiLoading"
        :disabled="!agreeToDelete"

        @click="onDeleteMember"
      />

      <!-- Delete -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        :loading="isApiLoading"

        color="negative"
        label="Cancel"

        class="light-negative-btn"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// Utils
import { deleteApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'DeleteMember',

  emits: ['memberDeleted'],

  props: {
    isClient: {
      type: Boolean,
      default: false,
    },
    selectedTableDataJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      agreeToDelete: false,

      isApiLoading: false,
    });

    // methods
    const onDeleteMember = async () => {
      try {
        state.isApiLoading = true;

        let endpoint = `/users/members/${props.selectedTableDataJson.user_id}`;

        if (props.isClient) {
          endpoint = `/clients/${props.selectedTableDataJson.user_id}`;
        }

        await deleteApiCall({
          endpoint,
          includeWorkspace: props.isClient,
        });

        appContext.config.globalProperties.$toast({
          message: 'Member deleted successfully',
        });

        emit('memberDeleted');
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // methods
      onDeleteMember,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-member-card {
  max-width: 440px;

  .light-negative-btn {
    margin-left: 12px;
  }

  .delete-warning-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;

    margin-bottom: 20px;

    .permanent-delete-text {
      color: $negative;
    }
  }
}
</style>
