<template>
  <q-card flat class="sequence-email-engagement-card">
    <ApiLoader :show="isApiLoading" />

    <!-- header -->
    <div class="email-engagement-header">
      <h6 class="engagement-header-text">
        {{ headerTitle }}
      </h6>

      <q-space />

      <div class="header-filters">
        <DateRangeInput
          v-model="dateRangeInputJson"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="sequence-chart">
      <EngagementChart
        v-if="xAxisCategories.length > 0 && dataSeries.length > 0"
        :dataSeries="dataSeries"
        :xAxisCategories="xAxisCategories"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, getCurrentInstance, onMounted, reactive, toRefs, watch, computed,
} from 'vue';

// Components
import EngagementChart from 'components/Charts/EngagementChart.vue';
import ApiLoader from 'components/General/ApiLoader.vue';
import DateRangeInput from 'components/Input/DateRangeInput.vue';

// utils
import { yearMonthDateFilterFormat, subtractDaysFromTheCurrentDate, addNDaysForTheGivenDate } from 'src/utils/dates';
import { getSequenceDateStats } from 'src/utils/campaignApi';

export default defineComponent({
  name: 'SequenceEngagement',

  components: {
    EngagementChart,
    ApiLoader,
    DateRangeInput,
  },

  props: {
    campaignId: {
      type: [String, Number],
      default: null,
    },
    view: {
      type: String,
      default: 'email', // 'overview' | 'email' | 'linkedin'
    },
  },

  setup(props) {
    const { appContext } = getCurrentInstance();

    const state = reactive({
      isApiLoading: false,
      dateRangeInputJson: {
        from: yearMonthDateFilterFormat(subtractDaysFromTheCurrentDate(6)),
        to: yearMonthDateFilterFormat(addNDaysForTheGivenDate(new Date(), 0)),
      },
      statsList: [],
      xAxisCategories: [],
    });

    const headerTitle = computed(() => {
      if (props.view === 'overview') return 'Engagement Over Period';
      if (props.view === 'linkedin') return 'LinkedIn Activity Over Time';
      return 'Email Engagement Over Period';
    });

    const fetchSequenceDateStats = async () => {
      if (!props.campaignId) return;

      try {
        state.isApiLoading = true;

        const startDate = state.dateRangeInputJson?.from;
        const endDate = state.dateRangeInputJson?.to;

        const response = await getSequenceDateStats(props.campaignId, {
          start_date: startDate,
          end_date: endDate,
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
            message: error.message,
          });
        }
      } finally {
        state.isApiLoading = false;
      }
    };

    const overviewSeries = computed(() => {
      const emailSent = [];
      const liVisits = [];
      const connections = [];
      const messages = [];
      const replies = [];
      const positiveReplies = [];

      state.statsList.forEach((item) => {
        emailSent.push(item.email_sent || 0);
        liVisits.push(item.li_view_profile || 0);
        connections.push(item.li_connections_sent || 0);
        messages.push(item.li_messages_sent || 0);
        replies.push((item.email_replies || 0) + (item.li_replies || 0));
        positiveReplies.push((item.email_positive_replies || 0) + (item.li_positive_replies || 0));
      });

      return [
        {
          name: 'Email Sent',
          type: 'column',
          colorName: 'primary',
          data: emailSent,
        },
        {
          name: 'LinkedIn Visits',
          type: 'column',
          colorName: 'warning',
          data: liVisits,
        },
        {
          name: 'Connections',
          type: 'line',
          colorName: 'secondary',
          data: connections,
        },
        {
          name: 'Messages',
          type: 'line',
          colorName: 'information',
          data: messages,
        },
        {
          name: 'Replies',
          type: 'line',
          dashArray: 4,
          colorName: 'tertiary',
          data: replies,
        },
        {
          name: 'Positive Reply',
          type: 'column',
          colorName: 'positive',
          data: positiveReplies,
        },
      ];
    });

    const emailSeries = computed(() => {
      const emailSent = [];
      const emailReplies = [];
      const positiveReplies = [];
      const emailBounces = [];
      const emailOpens = [];
      const emailClicks = [];

      let totalOpens = 0;
      let totalClicks = 0;

      state.statsList.forEach((item) => {
        const opens = item.email_opens || 0;
        const clicks = item.email_clicks || 0;
        totalOpens += opens;
        totalClicks += clicks;

        emailSent.push(item.email_sent || 0);
        emailReplies.push(item.email_replies || 0);
        positiveReplies.push(item.email_positive_replies || 0);
        emailBounces.push(item.email_bounces || 0);
        emailOpens.push(opens);
        emailClicks.push(clicks);
      });

      const series = [
        {
          name: 'Email Sent',
          type: 'column',
          colorName: 'primary',
          data: emailSent,
        },
      ];

      if (totalOpens > 0) {
        series.push({
          name: 'Opened',
          type: 'line',
          colorName: 'warning',
          data: emailOpens,
        });
      }

      if (totalClicks > 0) {
        series.push({
          name: 'Clicked',
          type: 'line',
          colorName: 'information',
          data: emailClicks,
        });
      }

      series.push(
        {
          name: 'Replied',
          type: 'line',
          colorName: 'tertiary',
          data: emailReplies,
        },
        {
          name: 'Positive Reply',
          type: 'column',
          colorName: 'positive',
          data: positiveReplies,
        },
        {
          name: 'Bounced',
          type: 'line',
          dashArray: 4,
          colorName: 'negative',
          data: emailBounces,
        },
      );

      return series;
    });

    const linkedInSeries = computed(() => {
      const liVisits = [];
      const liConnections = [];
      const liAccepted = [];
      const liMessages = [];
      const liInMails = [];
      const liReplies = [];
      const liPositive = [];

      let totalInMails = 0;
      let totalAccepted = 0;

      state.statsList.forEach((item) => {
        const inmails = item.li_inmails_sent || 0;
        const accepted = item.li_connections_accepted || 0;
        totalInMails += inmails;
        totalAccepted += accepted;

        liVisits.push(item.li_view_profile || 0);
        liConnections.push(item.li_connections_sent || 0);
        liAccepted.push(accepted);
        liMessages.push(item.li_messages_sent || 0);
        liInMails.push(inmails);
        liReplies.push(item.li_replies || 0);
        liPositive.push(item.li_positive_replies || 0);
      });

      const series = [
        {
          name: 'Profile Visits',
          type: 'column',
          colorName: 'primary',
          data: liVisits,
        },
        {
          name: 'Connect Requests',
          type: 'line',
          colorName: 'warning',
          data: liConnections,
        },
      ];

      if (totalAccepted > 0) {
        series.push({
          name: 'Connection Accepted',
          type: 'line',
          colorName: 'secondary',
          data: liAccepted,
        });
      }

      series.push({
        name: 'Messages',
        type: 'line',
        colorName: 'information',
        data: liMessages,
      });

      if (totalInMails > 0) {
        series.push({
          name: 'InMails Sent',
          type: 'line',
          colorName: 'tertiary',
          data: liInMails,
        });
      }

      series.push(
        {
          name: 'Replies',
          type: 'line',
          dashArray: 4,
          colorName: 'tertiary',
          data: liReplies,
        },
        {
          name: 'Positive Reply',
          type: 'column',
          colorName: 'positive',
          data: liPositive,
        },
      );

      return series;
    });

    const dataSeries = computed(() => {
      if (props.view === 'overview') return overviewSeries.value;
      if (props.view === 'linkedin') return linkedInSeries.value;
      return emailSeries.value;
    });

    onMounted(() => {
      fetchSequenceDateStats();
    });

    watch(
      () => state.dateRangeInputJson,
      () => {
        fetchSequenceDateStats();
      },
      { deep: true },
    );

    return {
      ...toRefs(state),
      headerTitle,
      dataSeries,
    };
  },
});
</script>

<style lang="scss" scoped>
.sequence-email-engagement-card {
  width: 100%;
  border: 1px solid $grey-50;
  border-radius: 6px;
  padding: 20px;

  @media (max-width: $breakpoint-xs-max) {
    padding: 16px 12px;
  }

  .email-engagement-header {
    gap: 12px;
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    @media (max-width: $breakpoint-xs-max) {
      flex-direction: column;
      align-items: flex-start;
    }

    .engagement-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
      line-height: 16px;
    }

    .header-filters {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .sequence-chart {
    width: 100%;
  }
}
</style>
