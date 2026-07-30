<template>
  <div class="warmup-stats">
    <!-- Loader -->
    <ApiLoader
      show
      v-if="isApiLoading"
    />

    <h6 class="warmup-stats-header-text">
      Warmup Stats
    </h6>

    <div class="health-grid">
      <!-- Mailbox Health -->
      <div class="each-health-card">
        <!-- Icon -->
        <div
          class="health-icon-wrapper tertiary-bg"
        >
          <LocalSvgIcon image="health" />
        </div>

        <div>
          <p class="health-type-text">
            Mailbox Health
          </p>

          <p class="score-text">
            {{ mailboxHealth }} / 100

            <span class="status-text">
              {{ healthStatus }}
            </span>
          </p>
        </div>
      </div>

      <!-- Inbox Pacement -->
      <div class="each-health-card">
        <!-- Icon -->
        <div
          class="health-icon-wrapper primary-bg"
        >
          <LocalSvgIcon image="mail" class="health-icon" />
        </div>

        <div>
          <p class="health-type-text">
            Inbox Placement
          </p>

          <p class="score-text">
            {{ inboxPlacement }}%
          </p>
        </div>
      </div>

      <!-- Spam Placement -->
      <div class="each-health-card">
        <!-- Icon -->
        <div
          class="health-icon-wrapper warning-bg"
        >
          <LocalSvgIcon image="circle-close" class="health-icon" />
        </div>

        <div>
          <p class="health-type-text">
            Spam Placement
          </p>

          <p class="score-text">
            {{ spamPlacement }}%
          </p>
        </div>
      </div>

      <!-- Bounce Rate -->
      <div class="each-health-card">
        <!-- Icon -->
        <div
          class="health-icon-wrapper negative-bg"
        >
          <LocalSvgIcon image="seq-bounced" class="health-icon" />
        </div>

        <div>
          <p class="health-type-text">
            Bounce Rate
          </p>

          <p class="score-text">
            {{ bounceRate }}%
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, onMounted, reactive, toRefs, getCurrentInstance, computed,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';

// utils
import { findPercentage } from 'src/utils/numbers';
import { getMailboxWarmupStats } from 'src/utils/warmupApi';

export default defineComponent({
  name: 'WarmupStats',

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

      backendResponse: {},
    });

    // computed
    const totalSent = computed(() => state.backendResponse.sent_count || 0);

    const inboxPlacement = computed(() => {
      if (!totalSent.value) return 0;

      return findPercentage({
        part: state.backendResponse.inbox_count || 0,
        total: totalSent.value,
      });
    });

    const spamPlacement = computed(() => {
      if (!totalSent.value) return 0;

      return findPercentage({
        part: state.backendResponse.spam_count || 0,
        total: totalSent.value,
      });
    });

    const bounceRate = computed(() => {
      if (!totalSent.value) return 0;

      return findPercentage({
        part: state.backendResponse.bounce_count || 0,
        total: totalSent.value,
      });
    });

    /**
 * Mailbox Health Formula
 * You can tweak weights later
 */
    const mailboxHealth = computed(() => {
      let score = 100;

      score -= spamPlacement.value * 4;
      score -= parseFloat(bounceRate.value) * 6;

      if (score < 0) score = 0;

      return Math.round(score);
    });

    const healthStatus = computed(() => {
      if (mailboxHealth.value >= 80) return 'Healthy';
      if (mailboxHealth.value >= 60) return 'Average';

      return 'Poor';
    });

    // methods
    const makeApiCallOnMounted = async () => {
      try {
        state.isApiLoading = true;

        const response = await getMailboxWarmupStats({
          mailboxId: props.mailboxId,
        });

        state.backendResponse = response;
      } catch (error) {
        if (error.message.includes('No warmup')) {
          state.backendResponse = {};

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
      totalSent,
      inboxPlacement,
      spamPlacement,
      bounceRate,
      mailboxHealth,
      healthStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-stats {
  width: 100%;

  .warmup-stats-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;

    margin-bottom: 12px;
  }

  .health-grid {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;

    .each-health-card {
      border-radius: 6px;
      background: $white;
      border: 1px solid $grey-50;
      padding: 20px;

      display: flex;
      gap: 16px;
      flex: 1;

      // sm min
      @media (min-width: $breakpoint-sm-min) {
        min-width: 270px;
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 12px;
        width: 100%;
      }

      .health-icon-wrapper {
        min-width: 32px;
        height: 32px;
        border-radius: 50%;

        display: flex;
        align-items: center;
        justify-content: center;

        .health-icon {
          width: 16px;
        }

        &.tertiary-bg {
          background-color: rgba(var(--tertiary-rgb), 0.1);
        }

        &.negative-bg {
          background-color: rgba(var(--negative-rgb), 0.1);

          :deep .health-icon {
            @include svg-icon-fill('path', $negative);

            circle {
              &:first-child {
                stroke: $negative;
              }

              &:last-child {
                fill: $negative;
              }
            }
          }
        }

        &.primary-bg {
          background-color: rgba(var(--primary-rgb), 0.1);

          :deep .health-icon {
            @include svg-icon-stroke('path, rect', $primary);
          }
        }

        &.warning-bg {
          background-color: rgba(var(--warning-rgb), 0.1);

          :deep .health-icon {
            @include svg-icon-stroke('path, circle', $warning);
          }
        }
      }

      .health-type-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;

        margin-bottom: 4px;
      }

      .score-text {
        color: $black;
        font-size: 22px;
        font-weight: 600;

        .status-text {
          color: $black;
          font-size: 14px;
          font-weight: 400;

          margin-left: 6px;
        }
      }
    }
  }
}
</style>
