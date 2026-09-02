<template>
  <q-card flat class="app-modal-card delete-domains-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Delete {{ deleteMultipleDomains ? 'Multiple Domains' : 'Domain' }}
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
        Deleting the {{ deleteMultipleDomains ? 'selected domains' : 'domain' }} will
        <span class="permanent-delete-text">
          permanently delete
        </span>
        all associated data,
        including mailboxes linked to the domain.
        <br />
        <br />
        This action cannot be undone. Are you sure you want to continue?
      </p>

      <!-- Agree to delete -->
      <q-checkbox
        dense
        v-model="agreeToDelete"

        color="negative"
        label="I understand the consequences of deleting the selected domain(s)"
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

        @click="onDeleteDomain"
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

  emits: ['onSuccessfulDeleteDomains'],

  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
    selectedDomains: {
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
    const deleteMultipleDomains = computed(() => size(props.selectedDomains) > 1);

    const isAllSelected = computed(() => props.multiSelectOptionJson?.selectedOption
      === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL);

    // methods
    const getDeleteMultipleDomainsPayload = () => {
      const filterJson = {};

      const {
        searchText, provider,
      } = props.filters;

      if (searchText) {
        filterJson.search_text = searchText;
      }

      if (provider) {
        filterJson.provider = provider;
      }

      if (isAllSelected.value) {
        filterJson.select_all = true;
      } else {
        filterJson.ids = props.selectedDomains.map((domain) => domain.id);
      }

      return filterJson;
    };

    const onDeleteDomain = async () => {
      try {
        state.isApiLoading = true;

        if (size(props.selectedDomains) === 1) {
          // delete single domain
          await deleteApiCall({
            includeWorkspace: true,
            endpoint: `/domains/${props.selectedDomains[0].id}`,
          });
        } else {
          const payload = getDeleteMultipleDomainsPayload();

          // delete multiple domains
          await deleteApiCall({
            data: payload,
            includeWorkspace: true,
            endpoint: '/domains/bulk-delete',
          });
        }

        appContext.config.globalProperties.$toast({
          message: `${deleteMultipleDomains.value ? 'Domains' : 'Domain'} deleted successfully`,
        });

        emit('onSuccessfulDeleteDomains');
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
      deleteMultipleDomains,

      // methods
      onDeleteDomain,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-domains-card {
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
