<template>
  <q-card
    flat
    class="config-card"
  >
    <!-- Card Header -->
    <div class="config-card-header">
      <div class="config-card-icon-wrap">
        <q-icon name="event" size="20px" />
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

    <!-- Row 2: Daily Limit -->
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
import SelectSendingSchedule from 'src/components/Dropdown/SelectSendingSchedule.vue';

// Utils
import { getNumeralAmount } from 'src/utils/numbers';

// constants
import { SCHEDULE_DAYS_SHORT_LABEL, TIMEZONES_LIST } from 'boot/campaign-constants';

export default defineComponent({
  name: 'SendingScheduleCard',

  emits: ['editDailyLimit'],

  components: {
    SelectSendingSchedule,
  },

  props: {
    campaignId: {
      type: [String, Number],
      required: true,
    },
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
      if (props.campaignSettings?.sending_schedule_id) {
        state.ui.scheduleJson = {
          id: props.campaignSettings.sending_schedule_id,
        };
      }
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
      loadSettingsState();
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
    };
  },
});
</script>
