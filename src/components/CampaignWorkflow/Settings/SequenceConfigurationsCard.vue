<template>
  <q-card
    flat
    class="config-card"
  >
    <!-- Card Header -->
    <div class="config-card-header">
      <div class="config-card-icon-wrap">
        <q-icon name="filter_alt" size="20px" />
      </div>

      <div class="config-card-title">Sequence Configurations</div>
    </div>

    <!-- Row 1: Stop Sending Trigger -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Stop Sending When</span>
        </div>
      </div>
      <div class="config-row-right">
        <q-btn-dropdown
          flat
          dense
          no-caps
          color="primary"
          class="blue-link-btn"
          :label="stopSendingTrigger"
        >
          <q-list style="min-width: 160px">
            <q-item clickable v-close-popup @click="stopSendingTrigger = 'Lead Replies'">
              <q-item-section>Lead Replies</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="stopSendingTrigger = 'Lead Clicks Link'">
              <q-item-section>Lead Clicks Link</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="stopSendingTrigger = 'Lead Opens Email'">
              <q-item-section>Lead Opens Email</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Row 2: Stop Emails to Same Company -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Stop Emails to the Same Company After a Reply</span>
          <q-icon name="info" class="info-icon">
            <q-tooltip anchor="top middle" self="bottom middle">
              Halt automated follow-ups to all
              contacts in a domain once anyone at the company replies.
            </q-tooltip>
          </q-icon>
        </div>
      </div>
      <div class="config-row-right">
        <div class="toggle-group">
          <span :class="['toggle-state-text', { disabled: !stopSameCompany }]">
            {{ stopSameCompany ? 'Enabled' : 'Disabled' }}
          </span>
          <q-toggle v-model="stopSameCompany" color="primary" dense />
        </div>
      </div>
    </div>

    <!-- Row 3: Spintax Distribution Mode -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Email Variant & Spintax Distribution Mode</span>
        </div>
      </div>
      <div class="config-row-right">
        <div class="row items-center q-gutter-sm">
          <q-radio
            v-model="spintaxMode" val="pattern" label="Pattern-Based" dense color="primary" />
          <q-radio
            v-model="spintaxMode" val="randomized"
            label="Randomized" dense color="primary" class="q-ml-md" />
        </div>
      </div>
    </div>

    <!-- Row 4: Sending Volume -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Sending Volume</span>
          <q-icon name="info" class="info-icon">
            <q-tooltip anchor="top middle" self="bottom middle">
              Prioritize follow-up messages over new cold emails in your daily queue.
            </q-tooltip>
          </q-icon>
        </div>
      </div>
      <div class="config-row-right">
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          class="blue-link-btn"
          icon="tune"
          @click="showVolumeDialog = true"
        >
          {{ followUpRatio }}% follow-ups, {{ 100 - followUpRatio }}% new leads
        </q-btn>
      </div>
    </div>

    <!-- Dialog for Volume Slider -->
    <q-dialog v-model="showVolumeDialog">
      <q-card style="min-width: 360px; padding: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Sending Volume Ratio</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-md">
          <div class="text-subtitle2 text-grey-8 q-mb-sm">
            Follow-ups: <b>{{ followUpRatio }}%</b> | New Leads: <b>{{ 100 - followUpRatio }}%</b>
          </div>
          <q-slider v-model="followUpRatio" :min="0" :max="100" :step="5" color="primary" label />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Done" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
// vue
import { defineComponent, reactive, toRefs } from 'vue';

export default defineComponent({
  name: 'SequenceConfigurationsCard',

  setup() {
    // state
    const state = reactive({
      stopSendingTrigger: 'Lead Replies',
      stopSameCompany: true,
      spintaxMode: 'pattern',
      followUpRatio: 100,
      showVolumeDialog: false,
    });

    // computed

    // methods

    return {
      ...toRefs(state),
    };
  },
});
</script>
