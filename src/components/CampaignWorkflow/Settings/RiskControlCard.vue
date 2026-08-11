<template>
  <q-card class="config-card" flat>
    <!-- Card Header -->
    <div class="config-card-header">
      <div class="config-card-icon-wrap">
        <q-icon name="tune" size="20px" />
      </div>
      <div class="config-card-title">Risk Control</div>
    </div>

    <!-- Row 1: Pause Campaign Bounce Rate -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Pause Campaign When Bounce Rate Reaches</span>
        </div>
      </div>
      <div class="config-row-right">
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          class="blue-link-btn"
          @click="showBounceDialog = true"
        >
          {{ bouncePauseThreshold }}%
        </q-btn>
      </div>
    </div>

    <!-- Row 2: Include Unsubscribe Message -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>Include Unsubscribe Message</span>
        </div>
      </div>
      <div class="config-row-right">
        <div class="toggle-group">
          <span :class="['toggle-state-text', { disabled: !includeUnsubscribe }]">
            {{ includeUnsubscribe ? 'Enabled' : 'Disabled' }}
          </span>
          <q-toggle v-model="includeUnsubscribe" color="primary" dense />
        </div>
      </div>
    </div>

    <!-- Dialog for Editing Bounce Rate Threshold -->
    <q-dialog v-model="showBounceDialog">
      <q-card style="min-width: 320px; padding: 12px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Bounce Rate Pause Limit</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-md">
          <q-input
            v-model.number="tempThreshold"
            type="number"
            outlined
            dense
            suffix="%"
            autofocus
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveBounceThreshold" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
// vue
import { defineComponent, reactive, toRefs } from 'vue';

export default defineComponent({
  name: 'RiskControlCard',

  setup() {
    // state
    const state = reactive({
      bouncePauseThreshold: 5,
      includeUnsubscribe: true,
      showBounceDialog: false,
      tempThreshold: 5,
    });

    // computed

    // methods
    const saveBounceThreshold = () => {
      if (state.tempThreshold >= 0 && state.tempThreshold <= 100) {
        state.bouncePauseThreshold = state.tempThreshold;
      }
    };

    return {
      ...toRefs(state),
      saveBounceThreshold,
    };
  },
});
</script>
