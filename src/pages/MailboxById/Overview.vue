<template>
  <div class="mailbox-by-id-overview-page">
    <div
      v-if="mailboxByJson.id"
      class="full-width mailbox-by-id-overview-content"
    >
      <div class="mailbox-overview-authentication">
        <!-- Mailbox Overview -->
        <MailboxOverview
          :provider="mailboxByJson.provider"
          :isConnected="mailboxByJson.status === WARMUP_STATUS.ACTIVE"
          :lastSyncAt="mailboxByJson.last_sync_at || mailboxByJson.last_connected_at"
        />

        <!-- Authentication and Reputation -->
        <AuthenticationReports
          :dnsErrors="dnsErrors"
          :authReports="authReports"
          :domainId="mailboxByJson.domain_id"
          :isApiLoading="isAuthReportsLoading"

          @updateAuthReports="onUpdateAuthReports"
        />
      </div>

      <TotalEngagement
        :showLoader="isLoadingOverallEngagementMetrics"
        :espPerformanceMetrics="espPerformanceMetrics"
        :overallEngagementMetrics="overallEngagementMetrics"
        :isLoadingEspPerformanceMetrics="isLoadingEspPerformanceMetrics"
      />

      <EmailEngagement
        :dataSeries="dataSeries"
        :xAxisCategories="xAxisCategories"
        :showLoader="showEmailEngagementLoader"

        v-model:dateRangeInputJson="dateRangeInputJson"

        @update:dateRangeInputJson="onUpdateDateRangeInputJson"
      />

      <div class="mailbox-bounce">
        <BounceCategories
          :metrics="overallEngagementMetrics"
          :showLoader="isLoadingOverallEngagementMetrics"
        />
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, onMounted, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import {
  getDnsAuthResultByDomainId, fetchSequenceDateStats,
  fetchSequenceOverallStats, fetchSequenceEspStats,
} from 'src/utils/domainMailboxesApi';
import {
  yearMonthDateFilterFormat, subtractDaysFromTheCurrentDate, addNDaysForTheGivenDate,
} from 'src/utils/dates';

// Components
import EmailEngagement from 'components/DomainById/EmailEngagement.vue';
import TotalEngagement from 'components/DomainById/TotalEngagement.vue';

import MailboxOverview from 'components/MailboxById/Overview.vue';
import AuthenticationReports from 'components/MailboxById/Authentication.vue';
import BounceCategories from 'components/MailboxById/BounceCategories.vue';

// pinia
import { storeExclusions } from 'src/stores/storeExclusions.js';

// constants
import { WARMUP_STATUS } from 'src/boot/warmup-constants';

export default defineComponent({
  name: 'MailboxById',

  components: {
    TotalEngagement,
    EmailEngagement,

    MailboxOverview,
    AuthenticationReports,
    BounceCategories,
  },

  props: {
    mailboxByJson: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    // instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // pinia
    const storeExclusionsPinia = storeExclusions();

    // state
    const state = reactive({
      fetchMailboxByIdApiLoading: false,

      overallEngagementMetrics: {
        sent_count: 0,
        received_count: 0,
        bounce_count: 0,
        hard_bounce_count: 0,
      },
      isLoadingOverallEngagementMetrics: true,

      // esp performance
      espPerformanceMetrics: {
        gmail_count: 0,
        outlook_count: 0,
        zoho_count: 0,
        yahoo_count: 0,
        other_count: 0,
      },
      isLoadingEspPerformanceMetrics: true,

      // email engagement metrics
      dataSeries: [],
      xAxisCategories: [],
      showEmailEngagementLoader: true,

      dateRangeInputJson: {
        from: yearMonthDateFilterFormat(subtractDaysFromTheCurrentDate(15)),
        to: yearMonthDateFilterFormat(addNDaysForTheGivenDate(new Date(), 0)),
      },

      // authentication reports
      authReports: {},
      dnsErrors: {},
      isAuthReportsLoading: true,

      // modal
      showPushMailboxesModal: false,
      showDeleteMailboxModal: false,
      showExportCsvOptionsModal: false,
    });

    // computed
    const domainByIdJsonFromStore = computed(() => storeExclusionsPinia.domainByIdJson);

    const domainName = computed(() => {
      if (!props.mailboxByJson?.email?.includes('@')) return '';
      return props.mailboxByJson.email?.split('@')[1];
    });

    // methods
    const onFetchEmailEngagementMetrics = async () => {
      try {
        state.showEmailEngagementLoader = true;

        const response = await fetchSequenceDateStats({
          endpoint: `/stats/mailboxes/${props.mailboxByJson.id}/sequence-date-stats`,
          params: {
            start_date: state.dateRangeInputJson.from,
            end_date: state.dateRangeInputJson.to,
          },
        });

        state.dataSeries = response.dataSeries;
        state.xAxisCategories = response.xAxisCategories;
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.showEmailEngagementLoader = false;
      }
    };

    const onFetchEspPerformanceMetrics = async () => {
      try {
        state.isLoadingEspPerformanceMetrics = true;

        const response = await fetchSequenceEspStats({
          endpoint: `stats/mailboxes/${props.mailboxByJson.id}/sequence-esp-stats`,
        });

        // update the value
        state.espPerformanceMetrics = response;
      } catch (error) {
        if (!error.message.includes('No ESP')) {
          // show error toast
          appContext.config.globalProperties.$toast({
            warning: true,
            message: error.message,
          });
        }
      } finally {
        onFetchEmailEngagementMetrics();
        state.isLoadingEspPerformanceMetrics = false;
      }
    };

    const onUpdateDateRangeInputJson = () => {
      if (state.dateRangeInputJson?.from && state.dateRangeInputJson?.to) {
        onFetchEmailEngagementMetrics();
      }
    };

    const onFetchOverallEngagementMetrics = async () => {
      try {
        state.isLoadingOverallEngagementMetrics = true;

        const response = await fetchSequenceOverallStats({
          endpoint: `stats/mailboxes/${props.mailboxByJson.id}/sequence-overall-stats`,
        });

        // update the value
        state.overallEngagementMetrics = response;
      } catch (error) {
        if (!error.message.includes('No overall')) {
          // show error toast
          appContext.config.globalProperties.$toast({
            warning: true,
            message: error.message,
          });
        }
      } finally {
        onFetchEspPerformanceMetrics();
        state.isLoadingOverallEngagementMetrics = false;
      }
    };

    const onFetchAuthenticationReports = async () => {
      try {
        state.isAuthReportsLoading = true;

        // make api call
        const response = await getDnsAuthResultByDomainId(props.mailboxByJson.domain_id);

        if (response) {
          state.authReports = {
            spf_pass: response.spf_pass,
            dkim_pass: response.dkim_pass,
            dmarc_pass: response.dmarc_pass,
            mx_pass: response.mx_pass,
          };
          state.dnsErrors = response.dns_errors || {};
        }
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isAuthReportsLoading = false;
        onFetchOverallEngagementMetrics();
      }
    };

    const onUpdateAuthReports = (responseJson) => {
      const {
        dns_errors,
        spf_pass,
        dkim_pass,
        dmarc_pass,
      } = responseJson.domain;

      state.authReports = {
        spf_pass,
        dkim_pass,
        dmarc_pass,
      };
      state.dnsErrors = dns_errors || {};

      appContext.config.globalProperties.$toast({
        message: 'Authentication reports updated',
      });
    };

    onMounted(() => {
      onFetchAuthenticationReports();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      domainName,
      isMobileDevice,
      domainByIdJsonFromStore,

      // methods
      onUpdateAuthReports,
      onUpdateDateRangeInputJson,

      // hardcoded
      WARMUP_STATUS,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailbox-by-id-overview-page {
  width: 100%;
  position: relative;

  min-height: 0;
  display: grid;

  @include custom-scrollbar;

  .mailbox-by-id-overview-content {
    display: grid;
    grid-row-gap: 32px;
    padding: 20px;
    padding-bottom: 40px;

    overflow-y: auto;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }

    .mailbox-bounce {
      margin-top: 32px;
    }

    .mailbox-overview-authentication, .mailbox-bounce {
      width: 100%;
      display: flex;
      row-gap: 32px;
      column-gap: 32px;

      // md max
      @media (max-width: $breakpoint-md-max) {
        flex-direction: column;
      }

      :deep(.authentication-reports), :deep(.bounce-categories-card) {
        max-width: 40%;

        @media (max-width: $breakpoint-md-max) {
          max-width: 100%;
        }
      }
    }
  }
}
</style>
