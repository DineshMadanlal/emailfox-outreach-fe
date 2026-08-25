<template>
  <q-card flat class="linkedin-daily-activity-card">
    <ApiLoader :show="isApiLoading" />

    <!-- Header -->
    <div class="daily-activity-header">
      <h6 class="daily-activity-title">
        Daily activity
      </h6>

      <q-space />

      <div class="header-filters">
        <DateRangeInput
          v-model="dateRangeInputJson"
        />
      </div>
    </div>

    <!-- Chart -->
    <div class="daily-activity-chart-wrapper">
      <EngagementChart
        v-if="xAxisCategories.length > 0 && dataSeries.length > 0"
        :dataSeries="dataSeries"
        :xAxisCategories="xAxisCategories"
      />

      <div
        v-else-if="!isApiLoading"
        class="no-data-placeholder"
      >
        <p class="no-data-text">
          No activity data available for the selected period
        </p>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, getCurrentInstance, onMounted, reactive, toRefs, watch, computed,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import DateRangeInput from 'components/Input/DateRangeInput.vue';
import EngagementChart from 'components/Charts/EngagementChart.vue';

// utils
import {
  yearMonthDateFilterFormat, subtractDaysFromTheCurrentDate, addNDaysForTheGivenDate,
} from 'src/utils/dates';

import { fetchLinkedInDateStats } from 'src/utils/connectedAccountsApi';

export default defineComponent({
  name: 'LinkedInDailyActivity',

  components: {
    EngagementChart,
    ApiLoader,
    DateRangeInput,
  },

  props: {
    accountId: {
      type: [Number, String],
      required: true,
    },
  },

  setup(props) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,
      dateRangeInputJson: {
        from: yearMonthDateFilterFormat(subtractDaysFromTheCurrentDate(6)),
        to: yearMonthDateFilterFormat(addNDaysForTheGivenDate(new Date(), 0)),
      },
      statsList: [],
      xAxisCategories: [],
    });

    // methods
    const fetchDateStats = async () => {
      if (!props.accountId) return;

      try {
        state.isApiLoading = true;

        const startDate = state.dateRangeInputJson?.from;
        const endDate = state.dateRangeInputJson?.to;

        const response = await fetchLinkedInDateStats({
          accountId: props.accountId,
          startDate,
          endDate,
        });

        const list = Array.isArray(response) ? response : (response?.data || []);
        state.statsList = list;

        const categories = [];
        list.forEach((item) => {
          const date = new Date(item.stat_date);
          const options = { day: '2-digit', month: 'short' };
          categories.push(date.toLocaleDateString('en-GB', options));
        });
        state.xAxisCategories = categories;
      } catch (error) {
        const status = error?.status || error?.response?.status;
        if (status !== 404) {
          appContext?.config?.globalProperties?.$toast?.({
            warning: true,
            message: error.message || 'Failed to fetch daily activity stats',
          });
        }
      } finally {
        state.isApiLoading = false;
      }
    };

    const dataSeries = computed(() => {
      const invitesSent = [];
      const invitesAccepted = [];
      const messagesSent = [];
      const inmailsSent = [];
      const repliesReceived = [];

      let totalInMails = 0;
      let totalAccepted = 0;

      state.statsList.forEach((item) => {
        const sent = item.li_connections_sent || 0;
        const accepted = item.li_connections_accepted || 0;
        const messages = item.li_messages_sent || 0;
        const inmails = item.li_inmails_sent || 0;
        const replies = item.li_replies || 0;

        totalInMails += inmails;
        totalAccepted += accepted;

        invitesSent.push(sent);
        invitesAccepted.push(accepted);
        messagesSent.push(messages);
        inmailsSent.push(inmails);
        repliesReceived.push(replies);
      });

      const series = [
        {
          name: 'Invites sent',
          type: 'column',
          colorName: 'primary',
          data: invitesSent,
        },
      ];

      if (totalAccepted > 0) {
        series.push({
          name: 'Invites accepted',
          type: 'line',
          colorName: 'secondary',
          data: invitesAccepted,
        });
      }

      series.push({
        name: 'Messages sent',
        type: 'column',
        colorName: 'positive',
        data: messagesSent,
      });

      if (totalInMails > 0) {
        series.push({
          name: 'InMails sent',
          type: 'line',
          colorName: 'warning',
          data: inmailsSent,
        });
      }

      series.push({
        name: 'Replies received',
        type: 'line',
        dashArray: 4,
        colorName: 'tertiary',
        data: repliesReceived,
      });

      return series;
    });

    onMounted(() => {
      fetchDateStats();
    });

    watch(
      () => state.dateRangeInputJson,
      () => {
        fetchDateStats();
      },
      { deep: true },
    );

    watch(
      () => props.accountId,
      (newId) => {
        if (newId) fetchDateStats();
      },
    );

    return {
      ...toRefs(state),
      dataSeries,
    };
  },
});
</script>

<style lang="scss" scoped>
.linkedin-daily-activity-card {
  width: 100%;
  border: 1px solid $grey-50;
  background: $white;
  border-radius: 8px;
  padding: 20px;

  @media (max-width: $breakpoint-xs-max) {
    padding: 16px 12px;
  }

  .daily-activity-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    @media (max-width: $breakpoint-xs-max) {
      flex-direction: column;
      align-items: flex-start;
    }

    .daily-activity-title {
      font-size: 16px;
      font-weight: 600;
      color: $black;
      margin: 0;
      line-height: 20px;
    }

    .header-filters {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .daily-activity-chart-wrapper {
    width: 100%;
    min-height: 280px;

    .no-data-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 260px;

      .no-data-text {
        color: $grey;
        font-size: 14px;
      }
    }
  }
}
</style>
