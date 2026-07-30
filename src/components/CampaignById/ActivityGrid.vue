<template>
  <!-- activities -->
  <div class="recent-activity-grid">
    <div
      v-for="(activity, index) in activities"
      :key="`acitivity-${index}`"

      class="each-recent-activity"
    >
      <div class="left-dashed-border" />

      <LocalSvgIcon
        image="circle-dot"
        classes="circle-dot-icon"
      />

      <div class="recent-activity-item">
        <p class="recent-activity-label">
          {{ activity.label }}
        </p>
        <p class="recent-activity-timestamp">
          {{ formatDate1(activity.timestamp) }}
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue';

// utils
import { formatDate1 } from 'src/utils/dates';

export default defineComponent({
  name: 'ActivityGrid',

  props: {
    activities: {
      type: Array,
      default: () => [],
    },
  },

  setup() {
    return {
      // methods
      formatDate1,
    };
  },
});
</script>

<style lang="scss" scoped>
.recent-activity-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .each-recent-activity {
    display: flex;
    width: 100%;
    gap: 20px;
    position: relative;
    padding-bottom: 4px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      gap: 12px;
    }

    .left-dashed-border {
      position: absolute;
      border-left: 1.2px dashed $grey-50;

      height: 100%;
      left: 3.5px;
      top: 14px;
      z-index: 0;
    }

    &:last-child {
      padding-bottom: 0px;

      .left-dashed-border {
        display: none;
      }
    }

    :deep(.circle-dot-icon) {
      z-index: 1;
      position: relative;
      top: 4px;
      overflow: visible;
      circle {
        stroke-width: 1px;
        fill: rgba($color: var(--primary-rgb), $alpha: 0.1);
        stroke: rgba($color: var(--primary-rgb), $alpha: 0.3);
      }
    }

    .recent-activity-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .recent-activity-label {
        font-size: 14px;
        font-weight: 500;
        line-height: 16px;
        color: $black;
      }

      .recent-activity-timestamp {
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
        color: $grey;
      }
    }
  }
}
</style>
