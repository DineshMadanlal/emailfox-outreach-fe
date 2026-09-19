<template>
  <q-card
    flat
    class="warmup-details-card"
    :class="uiContentColor"
  >
    <!-- Modal -->
    <q-dialog
      v-model="modals.showSaveWarmupProfile"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveWarmupProfile
        readOnly
        :warmupProfileId="warmupProfileId"
        :warmupProfileDetails="modals.warmupProfileJson"
      />
    </q-dialog>

    <!-- LEFT -->
    <div class="warmup-card__content">
      <!-- heading -->
      <div class="warmup-card__heading">
        <!-- title -->
        <p class="title-text">
          {{ uiContent.title }}
        </p>

        <!-- badge -->
        <p class="badge-text">
          {{ uiContent.badge }}
        </p>
      </div>

      <!-- description -->
      <p class="warmup-card__description">
        {{ uiContent.description }}
      </p>

      <!-- started -->
      <p class="warmup-card__started">
        Started on {{ formattedStartedAt }}
      </p>

      <!-- Warmup Profile Actions -->
      <div
        class="warmup-profile-actions"
      >
        <!--  -->
        <div class="flex no-wrap items-center">
          <LocalSvgIcon
            image="warmup"
            class="warmup-icon"
          />

          <p class="warmup-profile-name-text">
            "{{ mailboxWarmupDetails?.warmup_profile_name }}" selected.
          </p>
        </div>

        <!-- Action Links -->
        <div class="profile-actions-buttons">
          <span
            role="button"
            tabindex="0"
            class="profile-action-btn"
            :class="{ 'is-disabled': loaders.isPreviewing }"
            @click="!loaders.isPreviewing && onPreviewProfile()"
            @keydown.enter="!loaders.isPreviewing && onPreviewProfile()"
          >
            <q-spinner
              v-if="loaders.isPreviewing"
              size="13px"
              class="q-mr-xs"
            />
            Preview Profile
          </span>

          <span
            tabindex="0"
            role="button"
            class="profile-action-btn flex items-center no-wrap"
            :class="{ 'is-disabled': loaders.isStopping }"
            @click="!loaders.isStopping && onStopWarmup()"
            @keydown.enter="!loaders.isStopping && onStopWarmup()"
          >
            <q-spinner
              v-if="loaders.isStopping"
              size="13px"
              class="q-mr-xs"
            />
            <span>{{ loaders.isStopping ? 'Stopping...' : 'Stop Warm-up' }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="warmup-card__progress">
      <apex-chart
        type="radialBar"
        height="160"
        :options="radialOptions"
        :series="radialOptions.series"

        class="radial-bar-chart"
      />

      <!-- Text -->
      <div class="progress-label-block">
        <p class="progress-header-text">
          {{ pendingWarmupDays > 0 ? pendingWarmupDays : '14+' }}
        </p>

        <p
          class="progress-subheader-text"
        >
          {{ pendingWarmupDays > 0 ? `of ${MIN_WARMUP_DAYS} days` : 'days' }}
        </p>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, computed, defineAsyncComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// quasar
import { colors } from 'quasar';

// Components
import SaveWarmupProfile from 'components/Warmup/Modals/SaveWarmupProfile.vue';

// utils
import { getBrandColorByName } from 'src/utils/quasarHelpers';
import { bulkUpdateMailboxes } from 'src/utils/domainMailboxesApi';
import { fetchWarmupProfileById } from 'src/utils/warmupApi';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { WARMUP_STATUS_CONTENT, MIN_WARMUP_DAYS } from 'src/boot/warmup-constants';

export default defineComponent({
  name: 'WarmupDetails',

  emits: ['reloadApiCalls'],

  props: {
    mailboxByJson: {
      type: Object,
      default: () => ({}),
    },
    mailboxWarmupDetails: {
      type: Object,
      default: () => ({}),
    },
  },

  components: {
    SaveWarmupProfile,
    ApexChart: defineAsyncComponent(() => import('vue3-apexcharts')),
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      loaders: {
        isStopping: false,
        isPreviewing: false,
      },

      modals: {
        warmupProfileJson: {},
        showSaveWarmupProfile: false,
      },
    });

    // computed
    const warmupProfileId = computed(() => props.mailboxWarmupDetails?.warmup_profile_id);

    // warmup days
    const warmupDays = computed(() => {
      const startedAt = props.mailboxWarmupDetails?.first_started_at;

      if (!startedAt) {
        return 0;
      }

      return Math.floor(
        (Date.now() - new Date(startedAt).getTime())
        / (1000 * 60 * 60 * 24),
      ) + 1;
    });

    const pendingWarmupDays = computed(() => Math.max(MIN_WARMUP_DAYS - warmupDays.value, 0));

    /** progress % */
    const warmupProgress = computed(() => Math.min(
      Math.round((warmupDays.value / MIN_WARMUP_DAYS) * 100),
      100,
    ));

    /** ui state */
    const uiState = computed(() => {
      const healthScore = props.mailboxByJson?.health_score || 0;

      const spamCount = props.mailboxWarmupDetails?.spam_count || 0;

      const bounceCount = props.mailboxWarmupDetails?.bounce_count || 0;

      const warmupEnabled = props.mailboxByJson?.warmup_enabled;

      if (!warmupEnabled) {
        return WARMUP_STATUS_CONTENT.STOPPED.value;
      }

      if (
        healthScore < 40
        || spamCount > 10
        || bounceCount > 5
      ) {
        return WARMUP_STATUS_CONTENT.AT_RISK.value;
      }

      if (warmupDays.value < MIN_WARMUP_DAYS) {
        return WARMUP_STATUS_CONTENT.IN_PROGRESS.value;
      }

      return WARMUP_STATUS_CONTENT.ACTIVE.value;
    });

    const uiContentColor = computed(() => {
      switch (uiState.value) {
        case WARMUP_STATUS_CONTENT.AT_RISK.value:
          return 'warning';
        case WARMUP_STATUS_CONTENT.IN_PROGRESS.value:
          return 'positive';
        case WARMUP_STATUS_CONTENT.ACTIVE.value:
          return 'positive';
        case WARMUP_STATUS_CONTENT.STOPPED.value:
          return 'grey';
        default:
          return 'positive';
      }
    });

    const uiContent = computed(() => WARMUP_STATUS_CONTENT[uiState.value]);

    /** formatted started at */
    const formattedStartedAt = computed(() => {
      const startedAt = props.mailboxWarmupDetails?.first_started_at;

      if (!startedAt) {
        return '-';
      }

      return new Date(startedAt).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    });

    const radialOptions = computed(() => {
      const radialColor = getBrandColorByName(uiContentColor.value);
      const hexToRgbColor = colors.hexToRgb(radialColor);

      const options = {
        series: [warmupProgress.value],

        chart: {
          type: 'radialBar',
          height: 320,

          sparkline: {
            enabled: true,
          },
        },

        colors: [radialColor],

        plotOptions: {
          radialBar: {
            startAngle: -140,
            endAngle: 140,

            hollow: {
              size: '58%',
            },

            track: {
              background: `rgba(${hexToRgbColor.r}, ${hexToRgbColor.g}, ${hexToRgbColor.b}, 0.4)`,
              strokeWidth: '100px',
            },

            dataLabels: {
              show: false,
            },
          },
        },

        stroke: {
          lineCap: 'round',
        },

        labels: ['Warmup'],
      };

      return options;
    });

    // methods
    const onStopWarmup = async () => {
      try {
        state.loaders.isStopping = true;

        // payload
        const payload = {
          filter: {
            mailbox_ids: [props.mailboxByJson.id],
          },
          update_fields: {
            warmup_enabled: false,
          },
        };

        // api call
        await bulkUpdateMailboxes(payload);

        // toaster
        appContext.config.globalProperties.$toast({
          message: 'Warmup stopped successfully',
        });

        emit('reloadApiCalls');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isStopping = false;
      }
    };

    const onPreviewProfile = async () => {
      try {
        state.loaders.isPreviewing = true;

        const response = await fetchWarmupProfileById(warmupProfileId.value);

        state.modals.warmupProfileJson = response;
        state.modals.showSaveWarmupProfile = true;
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isPreviewing = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      uiState,
      uiContent,
      warmupDays,
      radialOptions,
      uiContentColor,
      formattedStartedAt,
      pendingWarmupDays,

      isMobileDevice,
      warmupProfileId,

      // methods
      onStopWarmup,
      onPreviewProfile,

      // hardcoded
      MIN_WARMUP_DAYS,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-details-card {
  width: 100%;
  max-width: 790px;
  border-radius: 6px;
  border: 1px solid $grey-50;

  padding: 20px;

  display: flex;
  gap: 24px;

  // left

  .warmup-card__content {
    flex: 1;

    // heading
    .warmup-card__heading {
      display: flex;
      align-items: center;
      gap: 5px;

      .title-text {
        font-size: 16px;
        font-weight: 600;
        color: $black;
      }

      .badge-text {
        font-size: 14px;
        font-weight: 600;
        padding: 4px 6px;
        border-radius: 4px;
      }
    }

    // description
    .warmup-card__description {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-top: 8px;
      margin-bottom: 16px;
    }

    // date
    .warmup-card__started {
      color: $grey;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;

      margin-bottom: 24px;
    }

    .warmup-profile-actions {
      width: fit-content;
      border-radius: 8px;
      background-color: rgba(var(--primary-rgb), 0.05);
      border: 1px solid rgba(var(--primary-rgb), 0.1);

      padding: 12px 14px;

      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      :deep(.warmup-icon) {
        min-width: 16px;
        height: 17px;

        margin-right: 8px;

        @include svg-icon-stroke('path', $grey-700);
        @include svg-icon-fill('path', unset);
      }

      .warmup-profile-name-text {
        color: $grey-700;
        font-size: 14px;
        line-height: 16px;
      }

      .profile-actions-buttons {
        display: flex;
        align-items: center;
        gap: 16px;

        .profile-action-btn {
          color: $grey-700;
          font-size: 14px;
          font-weight: 500;
          line-height: 16px;
          cursor: pointer;
          text-decoration-line: underline;
          text-decoration-style: dotted;
          text-decoration-skip-ink: auto;
          text-underline-offset: 3px;
          user-select: none;
          text-decoration-thickness: 12.5%; /* 1.75px */
          transition: color 0.15s ease, opacity 0.15s ease;

          &:hover:not(.is-disabled) {
            color: var(--q-primary);
          }

          &.is-disabled {
            cursor: not-allowed;
            opacity: 0.65;
            pointer-events: none;
            text-decoration: none;
          }
        }
      }
    }
  }

  .warmup-card__progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    height: 100px;
    width: 122px;

    .radial-bar-chart {
      position: absolute;
      z-index: 1;
      top: -18px;
      right: -89px;
    }

    .progress-label-block {
      position: absolute;
      z-index: 2;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;

      .progress-header-text {
        font-size: 32px;
        font-weight: 600;
        color: $grey;
      }

      .progress-subheader-text {
        font-size: 12px;
        font-weight: 400;
        line-height: 14px;
        color: $grey-800;
      }
    }
  }

  &.positive {
    background: linear-gradient(
      180deg,
      rgba(var(--positive-rgb), 0.1) 0%,
      var(--white-color) 54.6%);

    .warmup-card__content {
      .warmup-card__heading {
        .badge-text {
          background-color: rgba(var(--positive-rgb), 0.1);
          color: $positive;
        }
      }
    }
  }

  &.warning {
    background: linear-gradient(
      180deg,
      rgba(var(--warning-rgb), 0.1) 0%,
      var(--white-color) 54.6%);

    .warmup-card__content {
      .warmup-card__heading {
        .badge-text {
          background-color: rgba(var(--warning-rgb), 0.1);
          color: $warning;
        }
      }
    }
  }

  &.grey {
    background: linear-gradient(
      180deg,
      rgba(var(--grey-rgb), 0.1) 0%,
      var(--white-color) 54.6%);

    .warmup-card__content {
      .warmup-card__heading {
        .badge-text {
          background-color: rgba(var(--grey-rgb), 0.1);
          color: $grey;
        }
      }
    }
  }

  // xs max
  @media (max-width: $breakpoint-sm-max) {
    padding: 16px 12px;
    max-width: 100%;
    flex-direction: column;
  }
}
</style>
