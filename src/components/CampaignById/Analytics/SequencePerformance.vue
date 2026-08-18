<template>
  <q-card flat class="sequence-performance-card">
    <ApiLoader :show="isApiLoading" />

    <!-- header -->
    <div class="sequence-performance-header-details">
      <p class="sequence-performance-header-text">
        Sequence-Level Performance
      </p>

      <p class="sequence-performance-desc-subtext">
        {{ subHeaderText }}
      </p>
    </div>

    <!-- content -->
    <q-table
      hide-pagination
      :rows="filteredRows"
      :columns="tableColumns"
      :pagination="TABLE_PAGINATION"
      separator="cell"
      class="app-table"
      no-data-label="No stats found."
    >
      <!-- sequence -->
      <template v-slot:body-cell-sequence="props">
        <q-td :props="props">
          <div class="text-weight-medium">
            {{ formatIndex(props.row.stepIndex) }}
            {{ props.row.name || getStepDefaultName(props.row.step_type) }}
          </div>
        </q-td>
      </template>

      <!-- channel / action -->
      <template v-slot:body-cell-channel="props">
        <q-td :props="props">
          <div class="flex no-wrap items-center gap-2">
            <LocalSvgIcon
              :image="props.row.isEmail ? 'mail' : 'linkedin'"
              classes="channel-icon"
            />
            <span class="channel-label">{{ getChannelLabel(props.row.step_type) }}</span>
          </div>
        </q-td>
      </template>

      <!-- completed -->
      <template v-slot:body-cell-completed="props">
        <q-td :props="props">
          <div>
            {{ getCompletedCount(props.row) }}
          </div>
        </q-td>
      </template>

      <!-- reply count (for overview & linkedin) -->
      <template v-slot:body-cell-reply="props">
        <q-td :props="props">
          <div>
            {{ getReplyCount(props.row) }}
          </div>
        </q-td>
      </template>

      <!-- conversion (for overview & linkedin) -->
      <template v-slot:body-cell-conversion="props">
        <q-td :props="props">
          <div :class="props.row.conversionRate > 0 ? 'text-positive text-weight-bold' : ''">
            {{ props.row.conversionRate !== null ? `${props.row.conversionRate}%` : '-' }}
          </div>
        </q-td>
      </template>

      <!-- sent (email view) -->
      <template v-slot:body-cell-sent="props">
        <q-td :props="props">
          <div class="flex no-wrap items-center">
            <LocalSvgIcon
              image="sent"
              classes="seq-metric-icon"
            />
            <div class="q-ml-sm">
              {{ props.row.email_sent || 0 }}
            </div>
          </div>
        </q-td>
      </template>

      <!-- opened (email view) -->
      <template v-slot:body-cell-opened="props">
        <q-td :props="props">
          <div class="flex no-wrap">
            <LocalSvgIcon image="seq-opened" classes="seq-metric-icon" />
            <div class="q-ml-sm">
              <div class="seq-percentage-text">
                {{ findPercentage({ part: props.row.email_opens, whole: props.row.email_sent }) }}%
              </div>
              <div class="seq-value-text">
                {{ props.row.email_opens || 0 }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- clicked (email view) -->
      <template v-slot:body-cell-clicked="props">
        <q-td :props="props">
          <div class="flex no-wrap">
            <LocalSvgIcon image="seq-delivered" classes="seq-metric-icon" />
            <div class="q-ml-sm">
              <div class="seq-percentage-text">
                {{ findPercentage({ part: props.row.email_clicks, whole: props.row.email_sent }) }}%
              </div>
              <div class="seq-value-text">
                {{ props.row.email_clicks || 0 }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- replied (email view) -->
      <template v-slot:body-cell-replied="props">
        <q-td :props="props">
          <div class="flex no-wrap">
            <LocalSvgIcon
              image="seq-replied"
              classes="seq-metric-icon"
            />
            <div class="q-ml-sm">
              <div class="seq-percentage-text">
                {{ findPercentage(
                  { part: props.row.email_replies, whole: props.row.email_sent }) }}%
              </div>
              <div class="seq-value-text">
                {{ props.row.email_replies || 0 }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- positive_reply (email view) -->
      <template v-slot:body-cell-positive_reply="props">
        <q-td :props="props">
          <div class="flex no-wrap">
            <LocalSvgIcon image="positive-reply" classes="seq-metric-icon" />
            <div class="q-ml-sm">
              <div class="seq-percentage-text">
                {{ findPercentage(
                  {
                    part: props.row.email_positive_replies,
                    whole: props.row.email_replies || props.row.email_sent
                  }) }}%
              </div>
              <div class="seq-value-text">
                {{ props.row.email_positive_replies || 0 }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- bounced (email view) -->
      <template v-slot:body-cell-bounced="props">
        <q-td :props="props">
          <div class="flex no-wrap">
            <LocalSvgIcon image="seq-bounced" classes="seq-metric-icon" />
            <div class="q-ml-sm">
              <div class="seq-percentage-text">
                {{ findPercentage(
                  { part: props.row.email_bounces, whole: props.row.email_sent }) }}%
              </div>
              <div class="seq-value-text">
                {{ props.row.email_bounces || 0 }}
              </div>
            </div>
          </div>
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, toRefs, onMounted, getCurrentInstance, watch,
} from 'vue';

// components
import ApiLoader from 'components/General/ApiLoader.vue';

// utils
import { findPercentage } from 'src/utils/numbers.js';
import { getSequenceStepStats } from 'src/utils/campaignApi.js';

// constants
import { TABLE_PAGINATION } from 'boot/constants';
import { WORKFLOW_STEP_TYPES } from 'src/boot/campaign-constants.js';

export default defineComponent({
  name: 'SequencePerformance',

  components: {
    ApiLoader,
  },

  props: {
    campaignId: {
      type: [String, Number],
      default: null,
    },
    view: {
      type: String,
      default: 'overview', // 'overview' | 'email' | 'linkedin'
    },
  },

  setup(props) {
    const { appContext } = getCurrentInstance();

    const state = reactive({
      isApiLoading: false,
      stepStats: [],
    });

    const subHeaderText = computed(() => {
      if (props.view === 'email') return 'Performance metrics by email sequence';
      if (props.view === 'linkedin') return 'Performance metrics by LinkedIn sequence';
      return 'Performance metrics by sequence';
    });

    const fetchStepStats = async () => {
      if (!props.campaignId) return;

      try {
        state.isApiLoading = true;
        const response = await getSequenceStepStats(props.campaignId);
        state.stepStats = Array.isArray(response) ? response : (response?.data || []);
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

    const isEmailStep = (type) => type === WORKFLOW_STEP_TYPES.EMAIL;
    const isLinkedInStep = (type) => type && type.startsWith('LINKEDIN_');

    const getChannelLabel = (stepType) => {
      switch (stepType) {
        case WORKFLOW_STEP_TYPES.EMAIL:
          return 'Email';
        case WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE:
          return 'Profile Visit';
        case WORKFLOW_STEP_TYPES.LINKEDIN_CONNECTION_REQUEST:
          return 'Connect';
        case WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE:
          return 'Message';
        case WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL:
          return 'InMail';
        case WORKFLOW_STEP_TYPES.LINKEDIN_LIKE_POST:
          return 'Like Post';
        case WORKFLOW_STEP_TYPES.LINKEDIN_FOLLOW_PROFILE:
          return 'Follow Profile';
        default:
          return stepType || 'Step';
      }
    };

    const getStepDefaultName = (stepType) => {
      switch (stepType) {
        case WORKFLOW_STEP_TYPES.EMAIL:
          return 'Email Step';
        case WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE:
          return 'Visit Profile';
        case WORKFLOW_STEP_TYPES.LINKEDIN_CONNECTION_REQUEST:
          return 'Connection Request';
        case WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE:
          return 'LinkedIn Message';
        case WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL:
          return 'InMail';
        default:
          return 'Sequence Step';
      }
    };

    const getCompletedCount = (row) => {
      if (isEmailStep(row.step_type)) return row.email_sent || 0;
      if (row.step_type === WORKFLOW_STEP_TYPES.LINKEDIN_VISIT_PROFILE) {
        return row.li_view_profile || 0;
      }
      if (row.step_type === WORKFLOW_STEP_TYPES.LINKEDIN_CONNECTION_REQUEST) {
        return row.li_connections_sent || 0;
      }
      if (row.step_type === WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE) return row.li_messages_sent || 0;
      if (row.step_type === WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL) return row.li_inmails_sent || 0;
      return 0;
    };

    const getReplyCount = (row) => {
      if (isEmailStep(row.step_type)) return row.email_replies || 0;
      if (row.step_type === WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE
        || row.step_type === WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL) {
        return row.li_replies || 0;
      }
      return '-';
    };

    const calculateConversion = (row) => {
      if (isEmailStep(row.step_type)) {
        const whole = row.email_replies || row.email_sent || 0;
        return findPercentage({ part: row.email_positive_replies || 0, whole });
      }
      if (row.step_type === WORKFLOW_STEP_TYPES.LINKEDIN_CONNECTION_REQUEST) {
        return findPercentage(
          { part: row.li_connections_accepted || 0, whole: row.li_connections_sent || 0 },
        );
      }
      if (row.step_type === WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE
        || row.step_type === WORKFLOW_STEP_TYPES.LINKEDIN_INMAIL) {
        return findPercentage(
          {
            part: row.li_positive_replies || 0,
            whole: row.li_replies || row.li_messages_sent || 0,
          },
        );
      }
      return 0;
    };

    const filteredRows = computed(() => {
      let rows = state.stepStats.map((item, index) => ({
        ...item,
        stepIndex: index + 1,
        isEmail: isEmailStep(item.step_type),
        isLinkedIn: isLinkedInStep(item.step_type),
        conversionRate: calculateConversion(item),
      }));

      if (props.view === 'email') {
        rows = rows.filter((r) => r.isEmail);
      } else if (props.view === 'linkedin') {
        rows = rows.filter((r) => r.isLinkedIn);
      }

      return rows;
    });

    const formatIndex = (idx) => {
      const num = Number(idx) || 1;
      return num < 10 ? `0${num}` : `${num}`;
    };

    const hasOpens = computed(() => state.stepStats.some((s) => (s.email_opens || 0) > 0));
    const hasClicks = computed(() => state.stepStats.some((s) => (s.email_clicks || 0) > 0));

    const tableColumns = computed(() => {
      if (props.view === 'overview') {
        return [
          { name: 'sequence', label: 'Day + Sequence Step', align: 'left' },
          { name: 'channel', label: 'Channel', align: 'left' },
          { name: 'completed', label: 'Completed', align: 'left' },
          { name: 'reply', label: 'Reply', align: 'left' },
          { name: 'conversion', label: 'Conversion', align: 'left' },
        ];
      }

      if (props.view === 'linkedin') {
        return [
          { name: 'sequence', label: 'Day + Sequence Step', align: 'left' },
          { name: 'channel', label: 'Action', align: 'left' },
          { name: 'completed', label: 'Completed', align: 'left' },
          { name: 'reply', label: 'Reply', align: 'left' },
          { name: 'conversion', label: 'Conversion', align: 'left' },
        ];
      }

      // Email view
      const cols = [
        { name: 'sequence', label: 'Sequence', align: 'left' },
        { name: 'sent', label: 'Sent', align: 'left' },
      ];

      if (hasOpens.value) {
        cols.push({ name: 'opened', label: 'Opened', align: 'left' });
      }

      if (hasClicks.value) {
        cols.push({ name: 'clicked', label: 'Clicked', align: 'left' });
      }

      cols.push(
        { name: 'replied', label: 'Replied', align: 'left' },
        { name: 'positive_reply', label: 'Positive Reply', align: 'left' },
        { name: 'bounced', label: 'Bounced', align: 'left' },
      );

      return cols;
    });

    onMounted(() => {
      fetchStepStats();
    });

    watch(() => props.campaignId, () => {
      fetchStepStats();
    });

    return {
      ...toRefs(state),
      subHeaderText,
      filteredRows,
      tableColumns,
      formatIndex,
      getChannelLabel,
      getStepDefaultName,
      getCompletedCount,
      getReplyCount,
      findPercentage,
      TABLE_PAGINATION,
    };
  },
});
</script>

<style lang="scss" scoped>
.sequence-performance-card {
  width: 100%;
  border-radius: 6px;
  border: 1px solid $grey-50;
  background: $white;

  .sequence-performance-header-details {
    padding: 20px;

    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }

    .sequence-performance-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
    }

    .sequence-performance-desc-subtext {
      color: $grey;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
      margin-top: 6px;
    }
  }

  .app-table {
    .channel-icon {
      width: 16px;
      height: 16px;
    }

    .channel-label {
      font-size: 14px;
      color: $black;
      margin-left: 6px;
    }

    .seq-metric-icon {
      width: 16px;
      height: 16px;
    }

    .seq-percentage-text {
      color: $black;
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
    }

    .seq-value-text {
      color: $grey;
      font-size: 13px;
      font-weight: 400;
      line-height: 16px;
      margin-top: 4px;
    }
  }
}
</style>
