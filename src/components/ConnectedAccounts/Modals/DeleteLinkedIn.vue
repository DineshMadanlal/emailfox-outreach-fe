<template>
  <q-card flat class="app-modal-card delete-accounts-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Delete {{ deleteMultipleAccounts ? 'Multiple Accounts' : 'Account' }}
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
        Deleting the {{ deleteMultipleAccounts ? 'selected accounts' : 'account' }} will
        <span class="permanent-delete-text">
          permanently delete
        </span>
        all associated data.
        <br />
        <br />
        This action cannot be undone. Are you sure you want to continue?
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToDelete"

        color="primary"
        label="I understand the consequences of deleting the selected account(s)"
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Cancel -->
      <q-btn
        no-caps
        unelevated

        color="negative"
        label="Permanently Delete"

        :loading="isApiLoading"
        :disabled="!agreeToDelete"

        @click="onDeleteAccount"
      />

      <!-- Delete -->
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
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// Utils
import { deleteApiCall } from 'src/utils/apiRequests';

// constants
import { TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';

export default defineComponent({
  name: 'DeleteDomains',

  emits: ['onSuccessfulDelete'],

  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
    selectedRows: {
      type: Array,
      default: () => [],
    },
    multiSelectOptionJson: {
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

    // computed
    const deleteMultipleAccounts = computed(() => size(props.selectedRows) > 1);

    const isAllSelected = computed(() => props.multiSelectOptionJson?.selectedOption
      === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL);

    // methods
    const getAccountsPayload = () => {
      const filterJson = {};

      const {
        searchText,
      } = props.filters;

      if (searchText) {
        filterJson.search_text = searchText;
      }

      if (isAllSelected.value) {
        filterJson.select_all = true;
      } else {
        filterJson.ids = props.selectedRows.map((domain) => domain.id);
      }

      return filterJson;
    };

    const onDeleteAccount = async () => {
      try {
        state.isApiLoading = true;

        if (size(props.selectedRows) === 1) {
          // delete single domain
          await deleteApiCall({
            includeWorkspace: true,
            endpoint: `/connected-accounts/linkedin/${props.selectedRows[0].id}`,
          });
        } else {
          const payload = getAccountsPayload();

          // delete multiple domains
          await deleteApiCall({
            data: payload,
            includeWorkspace: true,
            endpoint: '/connected-accounts/linkedin/bulk-delete',
          });
        }

        appContext.config.globalProperties.$toast({
          message: `${deleteMultipleAccounts.value ? 'Accounts' : 'Account'} deleted successfully`,
        });

        emit('onSuccessfulDelete');
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

      // computed
      deleteMultipleAccounts,

      // methods
      onDeleteAccount,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-accounts-card {
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

    .permanent-delete-text {
      color: $negative;
    }
  }
}
</style>
