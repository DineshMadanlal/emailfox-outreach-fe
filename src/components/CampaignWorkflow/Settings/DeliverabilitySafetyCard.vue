<template>
  <q-card class="config-card" flat>
    <!-- Card Header -->
    <div class="config-card-header">
      <div class="config-card-icon-wrap">
        <q-icon name="mail" size="20px" />
      </div>
      <div class="config-card-title">Deliverability & Safety</div>
    </div>

    <!-- Row 1: Send Emails in Plain Text -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Send Emails in Plain Text (No HTML)</span>
        </div>
      </div>
      <div class="config-row-right">
        <div class="toggle-group">
          <span :class="['toggle-state-text', { disabled: !plainTextOnly }]">
            {{ plainTextOnly ? 'Enabled' : 'Disabled' }}
          </span>
          <q-toggle v-model="plainTextOnly" color="primary" dense />
        </div>
      </div>
    </div>

    <!-- Row 2: Auto-Match Leads ESP -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Auto-Match Leads ESP (e.g., Gmail &rarr; Gmail)</span>
          <q-icon name="info" class="info-icon">
            <q-tooltip anchor="top middle" self="bottom middle">
              Automatically pair senders and leads on matching email service providers
              (e.g. Gmail to Gmail, Outlook to Outlook) for better inbox placement.
            </q-tooltip>
          </q-icon>
        </div>
      </div>
      <div class="config-row-right">
        <div class="toggle-group">
          <span :class="['toggle-state-text', { disabled: !autoMatchEsp }]">
            {{ autoMatchEsp ? 'Enabled' : 'Disabled' }}
          </span>
          <q-toggle v-model="autoMatchEsp" color="primary" dense />
        </div>
      </div>
    </div>

    <!-- Row 3: Avoid sending to bounced accounts -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Avoid sending emails to email accounts previously bounced.</span>
        </div>
      </div>
      <div class="config-row-right">
        <div class="toggle-group">
          <span :class="['toggle-state-text', { disabled: !avoidBounced }]">
            {{ avoidBounced ? 'Enabled' : 'Disabled' }}
          </span>
          <q-toggle v-model="avoidBounced" color="primary" dense />
        </div>
      </div>
    </div>

    <!-- Row 4: Auto-Optimize A/Z Testing -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Auto-Optimize A/Z Testing</span>
          <q-icon name="info" class="info-icon">
            <q-tooltip anchor="top middle" self="bottom middle">
              Dynamically shift traffic towards
              top-performing email variants based on reply metrics.
            </q-tooltip>
          </q-icon>
        </div>
      </div>
      <div class="config-row-right">
        <div class="toggle-group">
          <span :class="['toggle-state-text', { disabled: !autoOptimizeAz }]">
            {{ autoOptimizeAz ? 'Enabled' : 'Disabled' }}
          </span>
          <q-toggle v-model="autoOptimizeAz" color="primary" dense />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent, reactive, toRefs } from 'vue';

export default defineComponent({
  name: 'DeliverabilitySafetyCard',

  setup() {
    // state
    const state = reactive({
      plainTextOnly: true,
      autoMatchEsp: true,
      avoidBounced: true,
      autoOptimizeAz: true,
    });

    // computed

    // methods

    return {
      ...toRefs(state),
    };
  },
});
</script>
