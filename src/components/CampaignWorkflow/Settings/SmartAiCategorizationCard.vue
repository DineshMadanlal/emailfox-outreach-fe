<template>
  <q-card
    flat
    class="config-card"
  >
    <!-- Card Header -->
    <div class="config-card-header">
      <!-- icon -->
      <div class="config-card-icon-wrap">
        <LocalSvgIcon image="stars" class="config-row-icon fill" />
      </div>

      <p class="config-card-title">
        Smart AI Contact Categorization
      </p>
    </div>

    <!-- Row 1: AI Auto-categorise toggle -->
    <div class="config-row">
      <!-- Left -->
      <div class="config-row-left">
        <p class="config-label-line">
          AI auto-categorise contact replies
        </p>
      </div>

      <!-- Right -->
      <div class="config-row-right">
        <ToggleInput
          v-model="smartAiSettings.aiAutoCategorize"
          @update:modelValue="onUpdateCampaignSettings"
        />
      </div>
    </div>

    <!-- Nested Category Configuration Block -->
    <div
      v-if="smartAiSettings.aiAutoCategorize"
      class="nested-category-box"
    >
      <!-- Sub-row 1: Select Reply Categories -->
      <div class="config-row">

        <!-- Left -->
        <div class="config-row-left">
          <p class="config-label-line">
            Select Reply Categories
          </p>
          <div class="config-subtext">
            {{ activeCategoriesCount }} categories selected
          </div>
        </div>

        <!-- Right -->
        <div class="config-row-right">
          <q-btn
            flat
            dense
            no-caps
            color="primary"

            @click="$emit('manageCategories')"
          >
            <div class="flex no-wrap items-center">
              <div class="text-primary text-weight-medium">
                Manage Categories
              </div>
            </div>
          </q-btn>
        </div>
      </div>

      <!-- Sub-row 2: Ignore OOO reply from reply % -->
      <div class="config-row">
        <!-- Left -->
        <div class="config-row-left">
          <p class="config-label-line">
            Ignore the auto-categorised OOO reply from the reply %
          </p>
        </div>

        <!-- Right -->
        <div class="config-row-right">
          <ToggleInput
            v-model="smartAiSettings.ignoreOooFromReplyRate"
            @update:modelValue="onUpdateCampaignSettings"
          />
        </div>
      </div>

      <!-- Sub-row 3: Re-activate OOO contact delay -->
      <div class="config-row">
        <!-- Left -->
        <div class="config-row-left">
          <p class="config-label-line">
            Re-activate auto-categorised OOO contact after a delay
          </p>
        </div>

        <!-- Right -->
        <div class="config-row-right">
          <!--  -->
          <q-btn
            flat
            dense
            no-caps

            color="primary"
            class="btn-font-weight-500"

            @click="$emit('editReactivateDays')"
          >
            {{ smartAiSettings.reactivateDelayDays || 'Enter' }} days
          </q-btn>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, reactive, toRefs, onMounted, watch, computed,
} from 'vue';

// Components
import ToggleInput from 'components/Input/ToggleInput.vue';

export default defineComponent({
  name: 'SmartAiCategorizationCard',

  emits: ['updateCampaignSettings', 'manageCategories', 'editReactivateDays'],

  components: {
    ToggleInput,
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
      smartAiSettings: {
        aiAutoCategorize: false,
        ignoreOooFromReplyRate: false,

        categories: [],
        reactivateDelayDays: 0,
      },
    });

    // computed
    const activeCategoriesCount = computed(() => size(state.smartAiSettings.categories));

    // methods
    const loadSettingsState = () => {
      // Load settings from API or props (mocked here)
      state.smartAiSettings = {
        aiAutoCategorize: props.campaignSettings.ai_categorisation || false,
        ignoreOooFromReplyRate: props.campaignSettings.ignore_ooo_category_reply || false,
        categories: props.campaignSettings.categories || [],
        reactivateDelayDays: props.campaignSettings.delay_reactivation_ooo_contact || 0,
      };
    };

    const onUpdateCampaignSettings = () => {
      emit('updateCampaignSettings', {
        ai_categorisation: state.smartAiSettings.aiAutoCategorize,
        ignore_ooo_category_reply: state.smartAiSettings.ignoreOooFromReplyRate,
      });
    };

    // life cycle hooks
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
      activeCategoriesCount,

      // methods
      onUpdateCampaignSettings,
    };
  },
});
</script>
