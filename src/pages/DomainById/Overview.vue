<template>
  <div class="domain-by-id-overview custom-scrollbar">
    <div
      class="domain-by-id-overview-content"

      v-if="domainByJson.id"
    >
      <!-- auth -->
      <div class="domain-overview-authentication">
        <!-- Authentication and Reputation -->
        <AuthenticationReports
          :dnsErrors="dnsErrors"
          :authReports="authReports"
          :domainId="domainByJson.id"

          @updateAuthReports="onUpdateAuthReports"
        />

        <!-- Mailbox Overview -->
        <MailboxOverview
          :provider="domainByJson.provider"
          :isConnected="true"
          lastSyncAt=""
        />
      </div>

      <TotalEngagement
        :overallEngagementMetrics="overallEngagementMetrics"
        :espPerformanceMetrics="espPerformanceMetrics"
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
          :showLoader="showOverallEngagementLoader"
        />
      </div>
    </div>
  </div>
</template>
<script>
// vue
import {
  defineComponent, computed, reactive, toRefs, onMounted, getCurrentInstance,
} from 'vue';

// Components
import TotalEngagement from 'components/DomainById/TotalEngagement.vue';
import MailboxOverview from 'components/MailboxById/Overview.vue';
import AuthenticationReports from 'components/MailboxById/Authentication.vue';

import EmailEngagement from 'components/DomainById/EmailEngagement.vue';
import BounceCategories from 'components/MailboxById/BounceCategories.vue';

// utils
import { fetchSequenceDateStats, fetchSequenceOverallStats, fetchSequenceEspStats } from 'src/utils/domainMailboxesApi';
import {
  yearMonthDateFilterFormat, subtractDaysFromTheCurrentDate, addNDaysForTheGivenDate,
} from 'src/utils/dates';

export default defineComponent({
  name: 'DomainsOverview',

  emits: ['updateAuthReports'],

  components: {
    TotalEngagement,
    MailboxOverview,
    AuthenticationReports,

    EmailEngagement,
    BounceCategories,
  },

  props: {
    domainByJson: {
      type: Object,
      required: true,
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      showOverallEngagementLoader: false,
      overallEngagementMetrics: {},

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
    });

    //
    const authReports = computed(() => ({
      spf_pass: props.domainByJson?.spf_pass || false,
      dkim_pass: props.domainByJson?.dkim_pass || false,
      dmarc_pass: props.domainByJson?.dmarc_pass || false,
      mx_pass: props.domainByJson?.mx_pass || false,
    }));

    const dnsErrors = computed(() => props.domainByJson.dns_errors || {});

    // methods
    const onUpdateAuthReports = (responseJson) => {
      emit('updateAuthReports', responseJson);
    };

    const onFetchEmailEngagementMetrics = async () => {
      try {
        state.showEmailEngagementLoader = true;

        const response = await fetchSequenceDateStats({
          endpoint: `/stats/domains/${props.domainByJson.id}/sequence-date-stats`,
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
          endpoint: `stats/domains/${props.domainByJson.id}/sequence-esp-stats`,
        });

        // update the value
        state.espPerformanceMetrics = response;
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        onFetchEmailEngagementMetrics();
        state.isLoadingEspPerformanceMetrics = false;
      }
    };

    const onFetchOverallEngagementMetrics = async () => {
      try {
        state.showOverallEngagementLoader = true;

        const response = await fetchSequenceOverallStats({
          endpoint: `stats/domains/${props.domainByJson.id}/sequence-overall-stats`,
        });

        state.overallEngagementMetrics = response;
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        onFetchEspPerformanceMetrics();
        state.showOverallEngagementLoader = false;
      }
    };

    const onUpdateDateRangeInputJson = () => {
      if (state.dateRangeInputJson?.from && state.dateRangeInputJson?.to) {
        onFetchEmailEngagementMetrics();
      }
    };

    onMounted(() => {
      onFetchOverallEngagementMetrics();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      authReports,
      dnsErrors,

      // methods
      onUpdateAuthReports,
      onUpdateDateRangeInputJson,
    };
  },
});
</script>

<style lang="scss" scoped>
.domain-by-id-overview {
  width: 100%;
  position: relative;

  min-height: 0;
  display: grid;

  .domain-by-id-overview-content {
    display: flex;
    flex-direction: column;
    row-gap: 32px;

    padding: 20px;
    padding-bottom: 40px;

    overflow-y: auto;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }

    .domain-overview-authentication, .mailbox-bounce {
      width: 100%;
      display: flex;
      row-gap: 32px;
      column-gap: 32px;

      // md max
      @media (max-width: $breakpoint-md-max) {
        flex-direction: column;
      }

      :deep(.mailbox-overview), :deep(.bounce-categories-card) {
        max-width: 40%;

        @media (max-width: $breakpoint-md-max) {
          max-width: 100%;
        }
      }
    }
  }
}
</style>
