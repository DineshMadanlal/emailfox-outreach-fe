<template>
  <q-card flat class="sequence-recent-activity-card">
    <ApiLoader
      show
      size="32px"
      v-if="isApiLoading"
    />

    <!-- header -->
    <h6 class="recent-activity-header">
      Recent Activity
    </h6>

    <ActivityGrid
      :activities="recentActivites"
    />
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, onMounted, reactive, toRefs, getCurrentInstance,
} from 'vue';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import ActivityGrid from 'components/CampaignById/ActivityGrid.vue';

// utils
import { waitForTimeInSeconds } from 'src/utils/helperFunctions';

export default defineComponent({
  name: 'SequenceByIdRecentActivity',

  components: {
    ApiLoader,
    ActivityGrid,
  },

  setup() {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,

      recentActivites: [],
    });

    const hardcodedRecentActivities = [
      {
        label: 'Sequence paused',
        timestamp: '2026-01-03T10:15:00.000Z',
      },
      {
        label: 'Added 500 contacts',
        timestamp: '2026-01-03T09:40:00.000Z',
      },
      {
        label: 'Variant A selected for Step 2',
        timestamp: '2026-01-03T09:10:00.000Z',
      },
      {
        label: 'Sequence resumed',
        timestamp: '2026-01-03T08:55:00.000Z',
      },
      {
        label: 'Added 1,200 contacts',
        timestamp: '2026-01-03T08:30:00.000Z',
      },
      {
        label: 'Variant B selected for Step 1',
        timestamp: '2026-01-03T08:05:00.000Z',
      },
      {
        label: 'Sequence configuration updated',
        timestamp: '2026-01-03T07:45:00.000Z',
      },
      {
        label: 'Sequence paused',
        timestamp: '2026-01-03T07:20:00.000Z',
      },
    ];

    const fetchRecentActivities = async () => {
      try {
        state.isApiLoading = true;

        await waitForTimeInSeconds(0.5);

        state.recentActivites = hardcodedRecentActivities;

        // API CALL
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Something went wrong while fetching recent activities.',
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    // methods
    const makeApiCallOnMount = async () => {
      fetchRecentActivities();
    };

    // lifecycle
    onMounted(() => {
      makeApiCallOnMount();
    });

    return {
      // state
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.sequence-recent-activity-card {
  width: 100%;
  border-radius: 6px;
  background: $white;
  border: 1px solid $grey-50;
  min-height: 200px;

  padding: 20px;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 16px 12px;
  }

  .recent-activity-header {
    color: $black;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;

    margin-bottom: 24px;
  }
}
</style>
