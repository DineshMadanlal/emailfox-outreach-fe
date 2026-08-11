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
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Schedule</span>
        </div>
        <div class="config-subtext">
          Scheduled at {{ scheduleTimezone }} on {{ scheduleDays.join(', ') }}
        </div>
      </div>
      <div class="config-row-right">
        <q-btn-dropdown
          flat
          dense
          no-caps
          color="primary"
          class="blue-link-btn"
          icon="event"
          :label="selectedSchedule"
        >
          <q-list style="min-width: 180px">
            <q-item clickable v-close-popup @click="selectedSchedule = 'Default Schedule'">
              <q-item-section>Default Schedule</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="selectedSchedule = 'European Schedule'">
              <q-item-section>European Schedule</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="selectedSchedule = 'Weekend Blast'">
              <q-item-section>Weekend Blast</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Row 2: Daily Limit -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Daily New Contacts Limit</span>
        </div>
      </div>
      <div class="config-row-right">
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          class="blue-link-btn"
          @click="showLimitDialog = true"
        >
          {{ dailyLimit.toLocaleString() }}/Day
        </q-btn>
      </div>
    </div>

    <!-- Dialog for Editing Daily Limit -->
    <q-dialog v-model="showLimitDialog">
      <q-card style="min-width: 320px; padding: 12px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Daily New Contacts Limit</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-md">
          <q-input
            v-model.number="tempLimit"
            type="number"
            outlined
            dense
            suffix="/Day"
            autofocus
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveDailyLimit" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
// vue
import { defineComponent, reactive, toRefs } from 'vue';

export default defineComponent({
  name: 'SendingScheduleCard',

  setup() {
    // state
    const state = reactive({
      selectedSchedule: 'Default Schedule',
      scheduleTimezone: 'Pacific SA Standard Time',
      scheduleDays: ['Mon', 'Tue', 'Wed', 'Thr', 'Fri'],
      dailyLimit: 1000,
      showLimitDialog: false,
      tempLimit: 1000,
    });

    // computed

    // methods
    const saveDailyLimit = () => {
      if (state.tempLimit > 0) {
        state.dailyLimit = state.tempLimit;
      }
    };

    return {
      // state
      ...toRefs(state),

      // methods
      saveDailyLimit,
    };
  },
});
</script>
