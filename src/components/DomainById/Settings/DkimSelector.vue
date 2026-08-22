<template>
  <div class="settings-full-section dkim-selector-section">
    <div class="section-heading-row">
      <LocalSvgIcon
        image="badge-tick"
        classes="section-header-icon"
      />
      <h6 class="section-title">
        DKIM Selector
      </h6>
    </div>

    <p class="section-description">
      DKIM (DomainKeys Identified Mail) provides an
      encryption key and digital signature that
      verifies email sender authenticity and prevents spoofing.
    </p>

    <!-- Configured Value or Add Button -->
    <div v-if="domainByJson.dkim_selector" class="configured-item-box">
      <div class="flex items-center no-wrap">
        <span class="configured-value-text">
          {{ domainByJson.dkim_selector }}
        </span>
      </div>

      <!-- Edit -->
      <q-btn
        flat
        dense
        no-caps
        color="primary"
        class="edit-btn"
        @click="$emit('editDkimSelector')"
      >
        <LocalSvgIcon
          image="edit"
          classes="edit-icon"
        />
        <span>Edit</span>
      </q-btn>
    </div>

    <q-card
      v-else
      flat
      class="action-box-card"
      @click="$emit('editDkimSelector')"
    >
      <p class="action-box-text">
        + Add DKIM Selector
      </p>
    </q-card>

    <!-- Authentication & Reputation Reports -->
    <div class="auth-reports-wrapper q-mt-lg">
      <AuthenticationReports
        :dnsErrors="dnsErrors"
        :authReports="authReports"
        :domainId="domainByJson.id"
        @updateAuthReports="onUpdateAuthReports"
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import AuthenticationReports from 'components/MailboxById/Authentication.vue';

export default defineComponent({
  name: 'DkimSelector',

  components: {
    AuthenticationReports,
  },

  props: {
    domainByJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  emits: ['editDkimSelector', 'updateDomainByIdJson'],

  setup(props, { emit }) {
    const authReports = computed(() => ({
      spf_pass: props.domainByJson?.spf_pass || false,
      dkim_pass: props.domainByJson?.dkim_pass || false,
      dmarc_pass: props.domainByJson?.dmarc_pass || false,
      mx_pass: props.domainByJson?.mx_pass || false,
    }));

    const dnsErrors = computed(() => props.domainByJson?.dns_errors || {});

    const onUpdateAuthReports = (response) => {
      const updatedDomain = {
        ...props.domainByJson,
        ...(response?.domain || response || {}),
      };
      emit('updateDomainByIdJson', updatedDomain);
    };

    return {
      authReports,
      dnsErrors,
      onUpdateAuthReports,
    };
  },
});
</script>

<style lang="scss" scoped>
.settings-full-section {
  display: flex;
  flex-direction: column;

  .section-heading-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  :deep(.section-header-icon) {
    width: 16px;
    height: 16px;

    @include svg-icon-stroke('circle, path, rect', $grey);
  }

  .section-title {
    color: $black;
    font-size: 16px;
    font-weight: 600;
  }

  .section-description {
    color: rgba($color: var(--black-rgb), $alpha: 0.7);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;
    margin: 0 0 16px 0;
    max-width: 780px;
  }

  .configured-item-box {
    border: 1px solid $grey-50;
    border-radius: 6px;
    background: $white;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 600px;

    .configured-value-text {
      color: $black;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .action-box-card {
    border: 1px solid $grey-50;
    border-radius: 6px;
    background: $white;
    padding: 14px 16px;
    cursor: pointer;
    max-width: 600px;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: rgba($color: var(--primary-rgb), $alpha: 0.4);
    }

    .action-box-text {
      color: $primary;
      font-size: 13px;
      font-weight: 600;
      margin: 0;
    }
  }

  .edit-btn {
    font-size: 14px;
    font-weight: 500;
    padding: 2px 6px;

    :deep(.edit-icon) {
      width: 14px;
      height: 14px;
      margin-right: 4px;

      @include svg-icon-stroke('path', $primary);
    }
  }

  .auth-reports-wrapper {
    max-width: 600px;
  }
}
</style>
