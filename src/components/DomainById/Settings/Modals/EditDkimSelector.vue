<template>
  <q-card flat class="app-modal-card edit-dkim-selector-card">
    <q-form
      class="full-width"
      ref="dkimFormRef"
      @submit.prevent.stop="onSubmitForm"
    >
      <!-- header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          DKIM Selector
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
          <p class="instruction-desc">
            Configure the DKIM selector used to look up your domain's
            DKIM public key in DNS records.
          </p>

          <!-- Input field -->
          <div class="selector-input-section q-mb-md">
            <InputLabel
              label="DKIM Selector"
              tooltip="The selector is the prefix before ._domainkey
              in your DNS TXT record name (e.g. google._domainkey.yourdomain.com uses 'google')"
            />

            <q-input
              dense
              outlined
              autofocus
              hide-bottom-space
              v-model.trim="dkimSelector"
              placeholder="e.g. google, s1, default"
              lazy-rules="ondemand"
              @update:modelValue="onInputChange"
            />
          </div>

          <!-- Tip Card -->
          <TipCard
            class="full-width q-mb-lg"
            tipText="Common selectors include 'google' for
            Google Workspace, 'selector1' or 's1' for Microsoft 365, and
            'default' or custom names for other providers."
          />

          <!-- Authentication Reports -->
          <div class="auth-reports-section">
            <AuthenticationReports
              :dnsErrors="dnsErrors"
              :authReports="authReports"
              :domainId="domainByJson.id"
              :isApiLoading="isCheckDnsLoading"
              @updateAuthReports="onUpdateAuthReports"
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
          label="Save & Check DNS"
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
  defineComponent, reactive, toRefs, onMounted, computed, getCurrentInstance,
} from 'vue';

// components
import InputLabel from 'components/Form/InputLabel.vue';
import TipCard from 'components/General/TipCard.vue';
import AuthenticationReports from 'components/MailboxById/Authentication.vue';

// utils
import { bulkUpdateDomains, checkDnsByDomainId } from 'src/utils/domainMailboxesApi';

export default defineComponent({
  name: 'EditDkimSelector',

  components: {
    InputLabel,
    TipCard,
    AuthenticationReports,
  },

  props: {
    domainByJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  emits: ['onSuccessfulUpdate'],

  setup(props, { emit }) {
    const { appContext } = getCurrentInstance();

    const state = reactive({
      dkimSelector: '',

      isApiLoading: false,
      isCheckDnsLoading: false,

      dkimFormRef: null,

      domainData: {},
    });

    const authReports = computed(() => ({
      spf_pass: state.domainData?.spf_pass || false,
      dkim_pass: state.domainData?.dkim_pass || false,
      dmarc_pass: state.domainData?.dmarc_pass || false,
      mx_pass: state.domainData?.mx_pass || false,
    }));

    const dnsErrors = computed(() => state.domainData?.dns_errors || {});

    const onInputChange = () => {
      state.dkimFormRef?.resetValidation();
    };

    const onUpdateAuthReports = (response) => {
      const updatedDomainData = response?.domain || response || {};
      state.domainData = {
        ...state.domainData,
        ...updatedDomainData,
      };
    };

    const onSubmitForm = async () => {
      try {
        state.isApiLoading = true;

        const cleanSelector = state.dkimSelector ? state.dkimSelector.trim() : '';

        const updateFields = {};

        if (cleanSelector) {
          updateFields.dkim_selector = cleanSelector;
        } else {
          updateFields.clear_dkim_selector = true;
        }

        const payload = {
          filter: {
            ids: [props.domainByJson.id],
          },
          update_fields: updateFields,
        };

        // 1. Update DKIM selector via PUT /domains/:id/details
        await bulkUpdateDomains(payload);

        // 2. Run DNS check via POST /domains/:id/check-dns
        let checkDnsResponse = null;
        try {
          checkDnsResponse = await checkDnsByDomainId(props.domainByJson.id);
        } catch (_) {
          // ignore DNS check network error if any
        }

        const domainFromCheck = checkDnsResponse?.domain || {};

        const updatedDomain = {
          ...props.domainByJson,
          ...state.domainData,
          ...domainFromCheck,
          dkim_selector: cleanSelector,
        };

        state.domainData = { ...updatedDomain };

        appContext.config.globalProperties.$toast({
          message: 'DKIM selector updated successfully',
        });

        emit('onSuccessfulUpdate', updatedDomain);
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
      state.dkimSelector = props.domainByJson.dkim_selector || '';
      state.domainData = { ...props.domainByJson };
    });

    return {
      // state
      ...toRefs(state),

      // computed
      authReports,
      dnsErrors,

      // methods
      onInputChange,
      onUpdateAuthReports,
      onSubmitForm,
    };
  },
});
</script>

<style lang="scss" scoped>
.edit-dkim-selector-card {
  max-width: 710px;
  width: 100%;

  .app-modal-content {
    .modal-content-container {
      width: 100%;
      display: flex;
      flex-direction: column;

      .instruction-desc {
        color: rgba($color: var(--black-rgb), $alpha: 0.8);
        font-size: 14px;
        line-height: 1.5;
        margin: 0 0 16px 0;
      }

      .selector-input-section {
        width: 100%;
      }

      .auth-reports-section {
        width: 100%;
      }
    }
  }
}
</style>
