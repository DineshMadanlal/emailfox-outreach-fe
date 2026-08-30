<template>
  <q-card flat class="app-modal-card delete-contacts-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Delete {{ deleteMultiple ? 'Multiple Contacts' : 'Contact' }}
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
        Deleting the {{ deleteMultiple ? 'selected contacts' : 'contact' }} will
        <span class="permanent-delete-text">
          permanently delete
        </span>
        all selected contacts and their associated data.
        <br />
        <br />
        This action cannot be undone. Are you sure you want to continue?
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToDelete"

        color="primary"
        label="I understand the consequences of deleting the selected contact(s)"
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

        @click="onDeleteContact"
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
  name: 'DeleteContacts',

  emits: ['onSuccessfulDelete'],

  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
    selectedContacts: {
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
    const deleteMultiple = computed(() => size(props.selectedContacts) > 1);

    const isAllSelected = computed(() => props.multiSelectOptionJson?.selectedOption
      === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL);

    // methods
    const getdeleteMultiplePayload = () => {
      const filterJson = {};

      const {
        searchText, provider, listJson,
      } = props.filters;

      // search text filter
      if (searchText) {
        filterJson.search_text = searchText;
      }

      // esp provider
      if (provider) {
        filterJson.esp_provider = provider;
      }
      // list filter
      if (listJson?.id) {
        filterJson.list_id = listJson.id;
      }

      if (isAllSelected.value) {
        filterJson.select_all = true;
      } else {
        filterJson.ids = props.selectedContacts.map((contact) => contact.id);
      }

      return filterJson;
    };

    const onDeleteContact = async () => {
      try {
        state.isApiLoading = true;

        if (size(props.selectedContacts) === 1) {
          // delete single domain
          await deleteApiCall({
            includeWorkspace: true,
            endpoint: `/contacts/${props.selectedContacts[0].id}`,
          });
        } else {
          const payload = getdeleteMultiplePayload();

          // delete multiple domains
          await deleteApiCall({
            data: payload,
            includeWorkspace: true,
            endpoint: '/contacts',
          });
        }

        appContext.config.globalProperties.$toast({
          message: `${deleteMultiple.value ? 'Contacts' : 'Contact'} deleted successfully`,
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
      deleteMultiple,

      // methods
      onDeleteContact,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-contacts-card {
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
