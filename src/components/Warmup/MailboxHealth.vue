<template>
  <div class="mailbox-health">
    <!-- Loader -->
    <ApiLoader
      show
      v-if="isApiLoading"
    />

    <p class="health-header-text">
      Mailbox Health Signals
    </p>

    <p class="health-desc-text">
      {{ mailboxHealthDescText }}
    </p>

    <div
      v-if="!isMailboxHealthDataEmpty"
      class="mailbox-health-signals-container"
    >
      <div
        v-for="(metric, index) in healthMetrics"
        :key="`health-metric-${index}`"
        class="signal-item"
      >
        <div class="signal-label">
          {{ metric.label }}
        </div>

        <div class="signal-status">
          <span class="dot"></span>
          <span class="signal-value">
            {{ metric.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, onMounted, reactive, toRefs, getCurrentInstance, computed,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';

// utils
import { getMailboxWarmupHealthMetrics } from 'src/utils/warmupApi';

export default defineComponent({
  name: 'MailboxHealth',

  components: {
    ApiLoader,
  },

  props: {
    mailboxId: {
      type: Number,
      default: null,
    },
  },

  setup(props) {
    //
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,

      mailboxHealthData: {},
    });

    // computed
    const isMailboxHealthDataEmpty = computed(() => isEmpty(state.mailboxHealthData));

    const mailboxHealthDescText = computed(() => {
      if (isMailboxHealthDataEmpty.value) {
        return 'No health signals found for this mailbox.';
      }

      return 'Real-time deliverability signals based on mailbox activity.';
    });

    const healthMetrics = computed(() => {
      if (isMailboxHealthDataEmpty.value) {
        return [];
      }

      const { analysis = {} } = state.mailboxHealthData;

      return [
        // Inbox Placement
        {
          label: 'Inbox Placement',
          ...analysis.inbox_placement,
          message: analysis.inbox_placement?.message || 'No data',
        },
        // Spam Triggers
        {
          label: 'Spam Triggers',
          ...analysis.spam_triggers,
          message: analysis.spam_triggers?.message || 'No data',
        },
        // Reply Consistency
        {
          label: 'Reply Consistency',
          ...analysis.reply_consistency,
          message: analysis.reply_consistency?.message || 'No data',
        },
        // Sending Pattern
        {
          label: 'Sending Pattern',
          ...analysis.sending_pattern,
          message: analysis.sending_pattern?.message || 'No data',
        },
      ];
    });

    // methods
    const makeApiCallOnMounted = async () => {
      try {
        state.isApiLoading = true;

        const response = await getMailboxWarmupHealthMetrics({
          mailboxId: props.mailboxId,
        });

        state.mailboxHealthData = response;
      } catch (error) {
        if (error.message.includes('No warmup statistics found')) {
          state.mailboxHealthData = {};

          return;
        }
        // Show a toaster that domain have been setup successfully
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    // lifecycle hook
    onMounted(() => {
      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      healthMetrics,
      mailboxHealthDescText,
      isMailboxHealthDataEmpty,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailbox-health {
  width: 100%;
  padding: 20px;

  border-radius: 6px;
  background: $white;
  border: 1px solid $grey-50;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 16px 12px;
  }

  .health-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;

    margin-bottom: 4px;
  }

  .health-desc-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px; /* 114.286% */

    margin-bottom: 32px;
  }

  .mailbox-health-signals-container {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px 80px;

    .signal-item {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .signal-label {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;
      }

      .signal-status {
        display: flex;
        align-items: center;
        gap: 6px;

        .dot {
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: $grey;
        }

        .signal-value {
          font-size: 16px;
          color: $black;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
