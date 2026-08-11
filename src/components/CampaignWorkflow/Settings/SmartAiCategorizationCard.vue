<template>
  <q-card
    flat
    class="config-card"
  >
    <!-- Card Header -->
    <div class="config-card-header">
      <div class="config-card-icon-wrap">
        <q-icon name="smart_toy" size="20px" />
      </div>

      <div class="config-card-title">
        Smart AI Contact Categorization
      </div>
    </div>

    <!-- Row 1: AI Auto-categorise toggle -->
    <div class="config-row">
      <div class="config-row-left">
        <div class="config-label-line">
          <span>AI auto-categorise contact replies</span>
        </div>
      </div>
      <div class="config-row-right">
        <div class="toggle-group">
          <span :class="['toggle-state-text', { disabled: !aiAutoCategorize }]">
            {{ aiAutoCategorize ? 'Enabled' : 'Disabled' }}
          </span>
          <q-toggle v-model="aiAutoCategorize" color="primary" dense />
        </div>
      </div>
    </div>

    <!-- Nested Category Configuration Block -->
    <div v-if="aiAutoCategorize" class="nested-category-box">
      <!-- Sub-row 1: Select Reply Categories -->
      <div class="config-row">
        <div class="config-row-left">
          <div class="config-label-line">
            <span>Select Reply Categories</span>
          </div>
          <div class="config-subtext">
            {{ activeCategories.join(', ') }}
          </div>
        </div>
        <div class="config-row-right">
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            class="blue-link-btn"
            icon="grid_view"
            @click="showCategoriesDialog = true"
          >
            Manage Categories
          </q-btn>
        </div>
      </div>

      <!-- Sub-row 2: Ignore OOO reply from reply % -->
      <div class="config-row">
        <div class="config-row-left">
          <div class="config-label-line">
            <span>Ignore the auto-categorised OOO reply from the reply %</span>
          </div>
        </div>
        <div class="config-row-right">
          <div class="toggle-group">
            <span :class="['toggle-state-text', { disabled: !ignoreOooFromReplyRate }]">
              {{ ignoreOooFromReplyRate ? 'Enabled' : 'Disabled' }}
            </span>
            <q-toggle v-model="ignoreOooFromReplyRate" color="primary" dense />
          </div>
        </div>
      </div>

      <!-- Sub-row 3: Re-activate OOO contact delay -->
      <div class="config-row">
        <div class="config-row-left">
          <div class="config-label-line">
            <span>Re-activate auto-categorised OOO contact after a delay</span>
          </div>
        </div>
        <div class="config-row-right">
          <q-input
            v-model="reactivateDelayDays"
            placeholder="Enter days"
            outlined
            dense
            class="days-input"
            bg-color="white"
          />
        </div>
      </div>
    </div>

    <!-- Dialog for Managing Categories -->
    <q-dialog v-model="showCategoriesDialog">
      <q-card style="min-width: 380px; padding: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Manage Reply Categories</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-md">
          <q-list separator>
            <q-item v-for="cat in allCategories" :key="cat" tag="label" v-ripple>
              <q-item-section side top>
                <q-checkbox v-model="activeCategories" :val="cat" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ cat }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
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
  name: 'SmartAiCategorizationCard',

  setup() {
    // state
    const state = reactive({
      aiAutoCategorize: true,
      ignoreOooFromReplyRate: true,
      reactivateDelayDays: '',
      showCategoriesDialog: false,
      allCategories: [
        'Out of Office',
        "Don't Contact",
        'Meeting Requested',
        'Not Interested',
        'Wrong Person',
        'Unsubscribe',
        'Forwarded',
      ],
      activeCategories: [
        'Out of Office',
        "Don't Contact",
        'Meeting Requested',
        'Not Interested',
        'Wrong Person',
      ],
    });

    // computed

    // methods

    return {
      ...toRefs(state),
    };
  },
});
</script>
