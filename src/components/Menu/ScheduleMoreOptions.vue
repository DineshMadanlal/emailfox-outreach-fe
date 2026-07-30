<template>
  <q-menu
    auto-close
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <!-- List -->
    <q-list
      style="min-width: 180px"
      class="schedule-action-list"
    >
      <!-- Edit -->
      <q-item
        v-ripple
        clickable

        v-for="(action, index) of profileActions"
        :key="`schedule-action-${index}`"
        :class="`flex items-center each-schedule-action-item ${action.classes || ''}`"

        @click="onActionClick(action)"
      >
        <LocalSvgIcon
          :image="action.icon"
          classes="schedule-menu-icon"
        />

        <p class="schedule-action-text">
          {{ action.label }}
        </p>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ScheduleMoreOptions',

  emits: ['editSchedule', 'deleteSchedule'],

  props: {
    tableRow: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // computed
    const profileActions = computed(() => {
      const availableActions = [
        {
          icon: 'edit',
          label: 'Edit Schedule',
          emitValue: 'editSchedule',
        },
        {
          icon: 'delete',
          classes: 'delete-schedule-item',
          label: 'Delete Schedule',
          emitValue: 'deleteSchedule',
        },
      ];

      return availableActions;
    });

    // methods
    const onActionClick = (action) => {
      emit(action.emitValue, props.tableRow);
    };

    return {
      // computed
      profileActions,

      // methods
      onActionClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.schedule-action-list {

  .each-schedule-action-item {
    padding: 10px 12px;
    min-height: unset;

    .schedule-action-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-left: 8px;
    }

    :deep(.schedule-menu-icon) {
      @include svg-icon-stroke('path, circle, rect', $grey);
    }

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    &.delete-schedule-item {
      :deep(.schedule-menu-icon) {
        @include svg-icon-stroke('path, circle, rect', $negative);
      }

      .schedule-action-text {
        color: $negative;
      }

      &:hover {
        background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);
      }
    }
  }
}
</style>
