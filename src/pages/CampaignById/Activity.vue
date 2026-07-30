<template>
  <div class="sequence-by-id-activity">
    <ActivityGrid
      :activities="activities"
    />

    <div
      v-if="isApiLoading"
      class="api-loader-container"
      :class="{ 'absolute-pos': activities.length > 0 }"
    >
      <!-- api loader -->
      <ApiLoader
        show
        size="32px"
      />
    </div>

    <!-- Add an intersection to load more activities - Kind of infinite scroll implementation -->
    <q-intersection
      :disable="allActivitiesFetched"
      @visibility="loadMoreOptions"

      v-if="!isApiLoading"
    >
    </q-intersection>
  </div>
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
  name: 'SequenceByIdActivity',

  components: {
    ApiLoader,
    ActivityGrid,
  },

  setup() {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      activities: [],
      isApiLoading: false,

      allActivitiesFetched: false,
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

    const fetchAllActivities = async () => {
      try {
        state.isApiLoading = true;

        await waitForTimeInSeconds(0.3);

        state.activities.push(...hardcodedRecentActivities);

        if (state.activities.length >= 50) {
          state.allActivitiesFetched = true;
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Something went wrong while fetching activities.',
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const loadMoreOptions = async () => {
      await fetchAllActivities();

      return true;
    };

    onMounted(() => {
      // fetchAllActivities();
    });

    return {
      // state
      ...toRefs(state),

      // methods
      loadMoreOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
.sequence-by-id-activity {
  width: 100%;
  display: flex;
  min-height: 0;
  flex-direction: column;

  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;

  // include custom scrollbar
  @include custom-scrollbar;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;
  }

  .api-loader-container {
    width: 300px;
    height: 32px;
    position: relative;

    &.absolute-pos {
      bottom: 32px;
      position: absolute;
    }
  }
}
</style>
