<template>
  <q-card
    flat
    class="config-card"
  >
    <!-- Select Schedule Modal Dialog -->
    <q-dialog
      v-model="modals.showSelectScheduleDialog"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SelectSendingScheduleModal
        :selectedScheduleId="ui.scheduleJson?.id"
        @useSendingSchedule="onSelectScheduleFromModal"
        @scheduleUpdated="onScheduleUpdatedInModal"
      />
    </q-dialog>

    <!-- Card Header -->
    <div class="config-card-header">
      <div class="config-card-icon-wrap">
        <LocalSvgIcon
          image="seq-schedule"
        />
      </div>

      <div class="config-card-title">Sending Schedule</div>
    </div>

    <!-- Row 1: Schedule -->
    <div class="config-row">
      <!-- left -->
      <div class="config-row-left">
        <p class="config-label-line">
          Schedule
        </p>

        <p
          v-if="scheduleAtText"
          class="config-subtext"
        >
          {{ scheduleAtText }}
        </p>
      </div>

      <!-- Right: Opens Select Schedule Modal -->
      <div class="config-row-right">
        <q-btn
          flat
          dense
          no-caps

          color="primary"
          class="btn-font-weight-500 schedule-select-btn"

          @click="modals.showSelectScheduleDialog = true"
        >
          <div class="flex no-wrap items-center">
            <span class="schedule-btn-label">
              {{ currentScheduleName }}
            </span>
            <q-icon name="keyboard_arrow_down" size="16px" class="q-ml-xs" />
          </div>
        </q-btn>
      </div>
    </div>

    <!-- Row: Campaign Start Date -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="flex no-wrap q-gutter-sm items-center">
          <p class="config-label-line">
            Campaign Start Date
          </p>

          <InfoTooltip
            iconName="circle-question"
            tooltipText="Set the campaign start date.
            Leave empty to start the campaign immediately."
          />
        </div>
      </div>

      <!-- right -->
      <div class="config-row-right flex no-wrap items-center">
        <DatePicker
          :outlined="false"
          :borderless="true"
          placeholder="Set Start Date"
          class="schedule-date-picker"
          :input-class="ui.scheduledDate ? 'schedule-date-picker-input' : ''"
          sendTimestamp
          v-model="ui.scheduledDate"
          @update:modelValue="onUpdateScheduleData"
        />

        <!-- Close Button -->
        <q-btn
          v-if="ui.scheduledDate"
          flat
          dense
          no-caps
          unelevated
          color="negative"
          class="app-negative-button"
          title="Clear Start Date"
          @click="onClearScheduledDate"
        >
          <LocalSvgIcon
            image="close"
            class="app-negative-icon"
          />
        </q-btn>
      </div>
    </div>

    <!-- Row: Daily Limit -->
    <div class="config-row">
      <div class="config-row-left">
        <p class="config-label-line">
          Daily New Contacts Limit
        </p>
      </div>

      <div class="config-row-right">
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          class="btn-font-weight-500"
          :label="newContactPerDayText"
          @click="$emit('editDailyLimit')"
        />
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, watch, computed,
} from 'vue';

// Components
import DatePicker from 'src/components/Input/DatePicker.vue';
import InfoTooltip from 'src/components/General/InfoTooltip.vue';
import SelectSendingScheduleModal from 'src/components/SendingSchedule/Modals/SelectSendingSchedule.vue';

// Composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Utils
import { getNumeralAmount } from 'src/utils/numbers';
import { getApiCall } from 'src/utils/apiRequests';
import { getTimezoneJson, getSendingDaysLabel } from 'src/utils/campaignApi';

// Constants
import { DEFAULT_CAMPAIGN_SETTINGS } from 'boot/campaign-constants';

export default defineComponent({
  name: 'SendingScheduleCard',

  emits: ['editDailyLimit', 'updateCampaignSettings'],

  components: {
    DatePicker,
    InfoTooltip,
    SelectSendingScheduleModal,
  },

  props: {
    campaignSettings: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // Helpers and composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      ui: {
        scheduleJson: {},
        scheduledDate: null,
      },

      loaders: {
        isFetchingSchedule: false,
      },

      modals: {
        showSelectScheduleDialog: false,
      },
    });

    // computed
    const currentScheduleName = computed(() => {
      if (state.ui.scheduleJson?.name) {
        return state.ui.scheduleJson.name;
      }
      if (state.loaders.isFetchingSchedule) {
        return 'Loading schedule...';
      }
      return 'Select Schedule';
    });

    const scheduleAtText = computed(() => {
      const schedule = state.ui.scheduleJson;
      if (!schedule?.timezone) return '';

      const tzObj = getTimezoneJson(schedule.timezone);
      const tzLabel = tzObj?.label || schedule.timezone;
      const days = getSendingDaysLabel(schedule.windows);

      // Get hours from the first window if available
      let hoursText = '';
      if (schedule.windows?.length) {
        const firstWin = schedule.windows[0];
        const startTime = (firstWin.start_time || firstWin.startTime)?.slice(0, 5);
        const endTime = (firstWin.end_time || firstWin.endTime)?.slice(0, 5);
        if (startTime && endTime) {
          hoursText = ` • ${startTime} – ${endTime}`;
        }
      }

      if (!days) return `Scheduled at ${tzLabel}${hoursText}`;
      return `Scheduled at ${tzLabel} on ${days}${hoursText}`;
    });

    const newContactPerDayText = computed(() => {
      const limit = props.campaignSettings?.new_contacts_per_day
        ?? DEFAULT_CAMPAIGN_SETTINGS.new_contacts_per_day
        ?? 1000;
      return `${getNumeralAmount(limit)}/Day`;
    });

    // methods
    const fetchScheduleDetailsById = async (scheduleId) => {
      if (!scheduleId) return;
      try {
        state.loaders.isFetchingSchedule = true;
        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: `/sending-schedules/${scheduleId}`,
        });

        if (response?.id === scheduleId) {
          state.ui.scheduleJson = response;
        }
      } catch (error) {
        // Silently keep minimal id state if fetch fails
      } finally {
        state.loaders.isFetchingSchedule = false;
      }
    };

    const loadSettingsState = () => {
      const scheduleId = props.campaignSettings?.sending_schedule_id;

      if (scheduleId) {
        if (state.ui.scheduleJson?.id !== scheduleId) {
          state.ui.scheduleJson = { id: scheduleId };
          fetchScheduleDetailsById(scheduleId);
        }
      } else {
        state.ui.scheduleJson = {};
      }

      state.ui.scheduledDate = props.campaignSettings?.scheduled_date || null;
    };

    const onSelectScheduleFromModal = (selectedSchedule) => {
      state.ui.scheduleJson = selectedSchedule || {};
      state.modals.showSelectScheduleDialog = false;

      emit('updateCampaignSettings', {
        sending_schedule_id: selectedSchedule?.id || null,
      });
    };

    const onScheduleUpdatedInModal = (scheduleId) => {
      if (scheduleId && scheduleId === state.ui.scheduleJson?.id) {
        fetchScheduleDetailsById(scheduleId);
      }
    };

    const onUpdateScheduleData = () => {
      emit('updateCampaignSettings', {
        scheduled_date: state.ui.scheduledDate,
      });
    };

    const onClearScheduledDate = () => {
      state.ui.scheduledDate = null;
      onUpdateScheduleData();
    };

    // watchers
    watch(
      () => props.campaignSettings,
      () => {
        loadSettingsState();
      },
      { immediate: true, deep: true },
    );

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      currentScheduleName,
      scheduleAtText,
      newContactPerDayText,

      // methods
      onSelectScheduleFromModal,
      onScheduleUpdatedInModal,
      onUpdateScheduleData,
      onClearScheduledDate,
    };
  },
});
</script>

<style lang="scss" scoped>
.config-card {
  .schedule-select-btn {
    font-size: 14px;
    font-weight: 500;
    color: $primary;

    .schedule-btn-label {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .schedule-date-picker {
    max-width: 120px;

    :deep(.schedule-date-picker-input) {
      color: $primary;
      font-weight: 500;
    }
  }
}
</style>
