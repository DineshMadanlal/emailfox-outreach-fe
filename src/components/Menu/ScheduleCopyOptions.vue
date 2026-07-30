<template>
  <q-menu
    auto-close
    transition-hide="jump-up"
    transition-show="jump-down"
    content-class="bg-white text-dark"
  >
    <!-- List -->
    <q-list
      style="min-width: 180px"
      class="schedule-copy-list"
    >
      <!-- Copy to all days -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-copy-action-item"

        v-for="action in actions"
        :key="action.event"

        @click="$emit(action.event)"
      >
        <p class="copy-action-text">
          {{ action.label }}
        </p>
      </q-item>

      <!--  -->
    </q-list>
  </q-menu>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ScheduleCopyOptions',

  emits: [
    'copyAllDays',
    'copyWeekdays',
    'copyWeekends',
  ],

  setup() {
    //
    const actions = [
      {
        label: 'Copy to all days',
        event: 'copyAllDays',
      },
      {
        label: 'Copy to Weekdays',
        event: 'copyWeekdays',
      },
      {
        label: 'Copy to Weekends',
        event: 'copyWeekends',
      },
    ];

    return {
      actions,
    };
  },
});
</script>

<style lang="scss" scoped>
.schedule-copy-list {
  .each-copy-action-item {
    padding: 10px 12px;
    min-height: unset;

    .copy-action-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }
  }
}
</style>
