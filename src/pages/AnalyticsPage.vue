<template>
  <div class="analytics-page">
    <!-- Header -->
    <AppHeader title="Analytics">
      <template v-slot:headerRightSection>
        <div
          class="analytics-header-right-section"
        >
          <SelectMultipleDomains
            v-model="filterDomainsArray"

            @update:model-value="onUpdateSelectedDomain"

            class="analytics-filters-dd small-height"
          />

          <SelectMultipleMailboxes
            v-model="filterMailboxesArray"

            @update:model-value="onUpdateSelectedMailbox"

            class="analytics-filters-dd small-height"
          />
        </div>
      </template>
    </AppHeader>

    <!-- Content -->
    <div class="analytics-page-content">
      <TotalEngagement
        :showLoader="isLoadingOverallEngagementMetrics"
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
    </div>
  </div>
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance, onMounted,
} from 'vue';

// components
import AppHeader from 'components/Headers/AppHeader.vue';
import EmailEngagement from 'components/DomainById/EmailEngagement.vue';
import TotalEngagement from 'components/DomainById/TotalEngagement.vue';
import SelectMultipleDomains from 'src/components/Dropdown/SelectMultipleDomains.vue';
import SelectMultipleMailboxes from 'components/Dropdown/SelectMultipleMailboxes.vue';

// quasar
import { useMeta } from 'quasar';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { yearMonthDateFilterFormat, subtractDaysFromTheCurrentDate, addNDaysForTheGivenDate } from 'src/utils/dates';

export default defineComponent({
  name: 'AnalyticsPage',

  components: {
    AppHeader,
    SelectMultipleDomains,
    SelectMultipleMailboxes,
    EmailEngagement,
    TotalEngagement,
  },

  setup() {
    // instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Analytics'));

    // state
    const state = reactive({
      filterDomainsArray: [],
      filterMailboxesArray: [],

      // esp performance
      espPerformanceMetrics: {
        gmail_count: 0,
        outlook_count: 0,
        zoho_count: 0,
        yahoo_count: 0,
        other_count: 0,
      },
      isLoadingEspPerformanceMetrics: true,

      // overall engagement metrics
      overallEngagementMetrics: {
        sent: 0,
        replies: 0,
        bounced: 0,
      },

      isLoadingOverallEngagementMetrics: true,

      // email engagement metrics
      dataSeries: [],
      xAxisCategories: [],
      showEmailEngagementLoader: true,

      dateRangeInputJson: {
        from: yearMonthDateFilterFormat(subtractDaysFromTheCurrentDate(5)),
        to: yearMonthDateFilterFormat(addNDaysForTheGivenDate(new Date(), 0)),
      },
    });

    const getEmailEngagementApiDetails = () => {
      const basicParams = {
        start_date: state.dateRangeInputJson.from,
        end_date: state.dateRangeInputJson.to,
      };

      if (size(state.filterDomainsArray)) {
        return {
          endpoint: 'statistics/domain/date-aggregate',
          params: {
            ...basicParams,
            domain_ids: state.filterDomainsArray,
          },
        };
      }

      if (size(state.filterMailboxesArray)) {
        const mailboxEmails = state.filterMailboxesArray.map((data) => data.email);

        return {
          endpoint: 'statistics/mailbox/date-aggregate',
          params: {
            ...basicParams,
            mailbox_emails: mailboxEmails,
          },
        };
      }

      return {
        endpoint: 'statistics/date-overview',
        params: basicParams,
      };
    };

    const onFetchEmailEngagementMetrics = async () => {
      try {
        state.showEmailEngagementLoader = true;

        const response = await getApiCall(getEmailEngagementApiDetails());

        const emailsSent = [];
        const replies = [];
        const bounced = [];
        const xAxisCategories = [];

        response.forEach((eachResult) => {
          emailsSent.push(eachResult.sent_count);
          replies.push(eachResult.reply_count);
          bounced.push(eachResult.bounce_count);

          const date = new Date(eachResult.date);

          const options = { day: '2-digit', month: 'short' };
          const formattedDate = date.toLocaleDateString('en-GB', options);

          xAxisCategories.push(formattedDate);
        });

        // update the value
        state.dataSeries = [
          {
            name: 'Emails Sent',
            data: emailsSent,
          },
          {
            name: 'Replies',
            data: replies,
          },
          {
            name: 'Bounce',
            data: bounced,
          },
        ];

        state.xAxisCategories = xAxisCategories;
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

    const getOverallEngagementApiDetails = () => {
      if (size(state.filterDomainsArray)) {
        return {
          endpoint: 'statistics/domain/aggregate',
          params: {
            domain_ids: state.filterDomainsArray,
          },
        };
      }

      if (size(state.filterMailboxesArray)) {
        const mailboxEmails = state.filterMailboxesArray.map((data) => data.email);

        return {
          endpoint: 'statistics/mailbox/aggregate',
          params: {
            mailbox_emails: mailboxEmails,
          },
        };
      }

      return {
        endpoint: 'statistics/overview',
        params: {},
      };
    };

    const getEspPerformanceMetricsApiDetails = () => {
      if (size(state.filterDomainsArray)) {
        return {
          endpoint: 'statistics/esp-stats/domains',
          params: {
            domain_ids: state.filterDomainsArray,
          },
        };
      }

      if (size(state.filterMailboxesArray)) {
        const mailboxEmails = state.filterMailboxesArray.map((data) => data.email);

        return {
          endpoint: 'statistics/esp-stats/mailboxes',
          params: {
            mailbox_emails: mailboxEmails,
          },
        };
      }

      return {
        endpoint: 'statistics/esp-stats/overview',
        params: {},
      };
    };

    const onFetchEspPerformanceMetrics = async () => {
      try {
        state.isLoadingEspPerformanceMetrics = true;

        const response = await getApiCall(getEspPerformanceMetricsApiDetails());

        // update the value
        state.espPerformanceMetrics = response || {};
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isLoadingEspPerformanceMetrics = false;
      }
    };

    const onFetchOverallEngagementMetrics = async () => {
      try {
        state.isLoadingOverallEngagementMetrics = true;

        const response = await getApiCall(getOverallEngagementApiDetails());

        // update the value
        state.overallEngagementMetrics = {
          sent: response.sent_count,
          replies: response.reply_count,
          bounced: response.bounce_count,
        };
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isLoadingOverallEngagementMetrics = false;
      }
    };

    const onUpdateDateRangeInputJson = () => {
      if (state.dateRangeInputJson?.from && state.dateRangeInputJson?.to) {
        onFetchEmailEngagementMetrics();
      }
    };

    const fetchAllAnalytics = () => {
      state.isLoadingOverallEngagementMetrics = true;
      state.showEmailEngagementLoader = true;
      state.isLoadingEspPerformanceMetrics = true;

      // fetch overall engagement metrics
      onFetchOverallEngagementMetrics();
      onFetchEmailEngagementMetrics();
      onFetchEspPerformanceMetrics();
    };

    const onUpdateSelectedDomain = () => {
      state.filterMailboxesArray = [];

      fetchAllAnalytics();
    };

    const onUpdateSelectedMailbox = () => {
      state.filterDomainsArray = [];

      fetchAllAnalytics();
    };

    onMounted(() => {
      fetchAllAnalytics();
    });

    return {
      // state
      ...toRefs(state),

      // methods
      onUpdateSelectedDomain,
      onUpdateSelectedMailbox,
      onUpdateDateRangeInputJson,
    };
  },

});
</script>

<style lang="scss" scoped>
.analytics-page {
  width: 100%;
  overflow-y: auto;

  :deep(.app-header) {

    .analytics-header-right-section {
      display: flex;
      align-items: center;
      // flex-wrap: wrap;

      row-gap: 12px;
      column-gap: 12px;

      .analytics-filters-dd {
        width: auto;
        min-width: 160px;
      }
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-wrap: wrap;
      padding: 16px;

      .analytics-header-right-section {
        order: 1;
        width: 100%;

        margin-top: 12px;

        .analytics-filters-dd {
          width: 100%;
          min-width: unset;
        }
      }
    }
  }

  .analytics-page-content {
    width: 100%;
    padding: 20px;

    display: grid;
    grid-row-gap: 32px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }
  }
}
</style>
