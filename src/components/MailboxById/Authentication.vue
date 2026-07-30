<template>
  <q-card flat class="authentication-reports">
    <ApiLoader
      show
      v-if="isApiLoading"
    />

    <div class="flex no-wrap items-center">
      <p class="authentication-header-text">
        Authentication & Reputation
      </p>

      <q-space />

      <q-btn
        flat
        dense
        no-caps
        unelevated

        color="primary"
        :loading="checkDnsRecordsLoading"

        @click="onCheckDnsRecords"
      >
        <div class="flex no-wrap items-center">
          <LocalSvgIcon
            image="reload"
            classes="reload-icon"
          />

          <p class="text-weight-medium q-ml-sm text-no-wrap">
            Check Status
          </p>
        </div>
      </q-btn>
    </div>

    <div class="reports-display-grid">
      <div
        v-for="(report, index) of authenticationReports"
        :key="`authentication-report-${index}`"
        class="each-report-block"
      >
        <PassFailBadge
          :isConnected="report.isConnected"
          passText="Pass"
          failText="Fail"
        />

        <p class="report-status-text">
          {{ report.label }} Status
        </p>

        <div
          v-if="!report.isConnected && !!report.error"
          class="flex no-wrap items-center"
        >
          <LocalSvgIcon
            image="circle-question"
            class="question-circle-icon"
          />

          <AppTooltip
            :content="report.error"
          />
        </div>

      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, toRefs, getCurrentInstance,
} from 'vue';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import AppTooltip from 'components/General/AppTooltip.vue';
import PassFailBadge from 'components/Mailboxes/PassFailBadge.vue';

// utils
import { checkDnsByDomainId } from 'src/utils/domainMailboxesApi';

export default defineComponent({
  name: 'AuthenticationReports',

  emits: ['updateAuthReports'],

  components: {
    ApiLoader,
    AppTooltip,
    PassFailBadge,
  },

  props: {
    domainId: {
      type: Number,
      default: null,
    },
    authReports: {
      type: Object,
      default: () => ({}),
    },
    dnsErrors: {
      type: Object,
      default: () => ({}),
    },
    isApiLoading: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      checkDnsRecordsLoading: false,
    });

    // computed
    const authenticationReports = computed(() => {
      const reports = [
        {
          label: 'SPF',
          isConnected: props.authReports?.spf_pass,
          error: props.dnsErrors?.spf,
        },
        {
          label: 'DKIM',
          isConnected: props.authReports?.dkim_pass,
          error: props.dnsErrors?.dkim,
        },
        {
          label: 'DMARC',
          isConnected: props.authReports?.dmarc_pass,
          error: props.dnsErrors?.dmarc,
        },
        {
          label: 'MX',
          isConnected: props.authReports?.mx_pass,
          error: props.dnsErrors?.mx,
        },
      ];

      return reports;
    });

    // methods
    const onCheckDnsRecords = async () => {
      try {
        state.checkDnsRecordsLoading = true;

        const response = await checkDnsByDomainId(props.domainId);

        emit('updateAuthReports', response);
      } catch (error) {
        // show error warning
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.checkDnsRecordsLoading = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      authenticationReports,

      // methods
      onCheckDnsRecords,
    };
  },
});
</script>

<style lang="scss" scoped>
.authentication-reports {
  width: 100%;
  padding: 16px 20px;

  border-radius: 6px;
  background: $white;
  border: 1px solid $grey-50;
  position: relative;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 16px 12px;
  }

  :deep(.reload-icon) {
    @include svg-icon-stroke('path, circle, rect', $primary);
  }

  .authentication-header-text {
    color: $black;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }

  .reports-display-grid {
    display: flex;
    justify-content: space-between;
    margin-top: 28px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-direction: column;
      row-gap: 16px;
    }

    .each-report-block {
      &:not(:first-child) {
        padding-left: 20px;
        border-left: 1px solid $grey-50;

        @media (max-width: $breakpoint-xs-max) {
          border-left: 0;
          padding-left: 0;

          border-top: 1px solid $grey-50;
          padding-top: 16px;
        }
      }
    }

    .report-status-text {
      color: $grey-800;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-top: 10px;
    }
  }
}
</style>
