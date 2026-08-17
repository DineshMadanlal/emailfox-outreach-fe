<template>
  <q-card
    flat
    class="config-card"
  >
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
        <!--  -->
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

      <!-- Right -->
      <div class="config-row-right">
        <!--  -->
        <SelectSendingSchedule
          v-model="ui.scheduleJson"

          :borderless="true"
          :outlined="false"
          canCreateSchedule

          class="campaign-settings-dd"

          ref="sendingScheduleRef"

          @update:modelValue="onUpdateScheduleJson"
        />
      </div>
    </div>

    <!-- Row: Campaign Start Date -->
    <div
      class="config-row"
    >
      <!--  -->
      <div class="config-row-left">
        <div class="flex no-wrap q-gutter-sm items-center">
          <!--  -->
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
          moreClass="dead-small"
          class="app-negative-button"
          title="Clear Start Date"

          @click="ui.scheduledDate = null; onUpdateScheduleData()"
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
      <!--  -->
      <div class="config-row-left">
        <!--  -->
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
        >
        </q-btn>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, onMounted, watch, computed,
} from 'vue';

// Components
import DatePicker from 'src/components/Input/DatePicker.vue';
import InfoTooltip from 'src/components/General/InfoTooltip.vue';
import SelectSendingSchedule from 'src/components/Dropdown/SelectSendingSchedule.vue';

// Utils
import { getNumeralAmount } from 'src/utils/numbers';

// constants
import { SCHEDULE_DAYS_SHORT_LABEL, TIMEZONES_LIST } from 'boot/campaign-constants';

export default defineComponent({
  name: 'SendingScheduleCard',

  emits: ['editDailyLimit'],

  components: {
    DatePicker,
    InfoTooltip,
    SelectSendingSchedule,
  },

  props: {
    campaignSettings: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      sendingScheduleRef: null,

      ui: {
        scheduleJson: {},
        scheduledDate: null,
      },

      loaders: {
        isFetching: false,
      },
    });

    // computed
    const scheduleAtText = computed(() => {
      if (state.ui.scheduleJson?.timezone) {
        const { windows } = state.ui.scheduleJson;
        const days = windows?.sort(
          (a, b) => a.day_of_week - b.day_of_week,
        )
          .map((window) => SCHEDULE_DAYS_SHORT_LABEL[window.day_of_week])
          .join(', ');

        const selectedTimezone = TIMEZONES_LIST.find(
          (tz) => tz.value === state.ui.scheduleJson.timezone,
        );

        return `Scheduled at ${selectedTimezone.label} on ${days}`;
      }

      return '';
    });

    const newContactPerDayText = computed(() => `${getNumeralAmount(props.campaignSettings.new_contacts_per_day)}/Day`);

    // methods
    const loadSettingsState = () => {
      if (props.campaignSettings?.sending_schedule_id
        !== state.ui.scheduleJson?.id
      ) {
        state.ui.scheduleJson = {
          id: props.campaignSettings.sending_schedule_id,
        };
      }

      state.ui.scheduledDate = props.campaignSettings.scheduled_date;
    };

    const onUpdateScheduleData = () => {
      emit('updateCampaignSettings', {
        scheduled_date: state.ui.scheduledDate,
      });
    };

    const onUpdateScheduleJson = () => {
      if (props.campaignSettings.sending_schedule_id === state.ui.scheduleJson?.id) {
        return;
      }
      emit('updateCampaignSettings', {
        sending_schedule_id: state.ui.scheduleJson?.id,
      });
    };

    // lifecycle hooks
    onMounted(() => {
      // loadSettinxwgsState();
    });

    // watchers
    watch(
      () => props.campaignSettings,
      () => {
        loadSettingsState();
      },
    );

    return {
      // state
      ...toRefs(state),

      // computed
      scheduleAtText,
      newContactPerDayText,

      // methods
      onUpdateScheduleJson,
      onUpdateScheduleData,
    };
  },
});
</script>

<style lang="scss" scoped>
.config-card {
  .schedule-date-picker {
    max-width: 120px;

    :deep(.schedule-date-picker-input) {
      color: $primary;
      font-weight: 500;
    }
  }
}
</style>
