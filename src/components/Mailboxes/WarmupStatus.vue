<template>
  <div class="warmup-status">
    <!-- Blocked -->
    <div
      v-if="isWarmupBlocked"
      class="flex no-wrap items-center"
    >
      <!--  -->
      <LocalSvgIcon
        image="warmup"
        classes="warmup-icon blocked"
      />

      <div class="blocked-text">
        Blocked
      </div>
    </div>

    <!-- Enabled/Disabled -->
    <div
      v-else
      class="flex no-wrap items-center"
    >
      <!--  -->
      <LocalSvgIcon
        image="warmup"
        classes="warmup-icon"
        :class="{ enabled: isWarmupEnabled }"
      />

      <div v-if="isWarmupEnabled">
        Enabled
      </div>

      <div
        v-else
        class="start-warmup-text"
        @click.prevent.stop="$emit('onEnableWarmup')"
      >
        Start Warmup

      </div>
    </div>

    <div
      class="warmup-duration-text"
      :class="[warmupStatusJson.completed ? 'text-positive' : 'text-grey']"
    >
      {{ warmupStatusJson.label }}
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// utils
import { getWarmupStatus } from 'src/utils/warmupApi.js';

// constants
import { WARMUP_STATUS } from 'src/boot/warmup-constants.js';

export default defineComponent({
  name: 'WarmupStatus',

  emits: ['onEnableWarmup'],

  props: {
    mailboxJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // computed
    const isWarmupBlocked = computed(() => props.mailboxJson.warmup_status
      === WARMUP_STATUS.BLOCKED);

    const isWarmupEnabled = computed(() => props.mailboxJson.warmup_enabled);

    const warmupStatusJson = computed(() => getWarmupStatus(
      props.mailboxJson.warmup_first_started_at,
    ));

    return {
      // computed
      isWarmupEnabled,
      warmupStatusJson,
      isWarmupBlocked,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-status {
  display: flex;
  flex-direction: column;

  gap: 4px;

  :deep(.warmup-icon) {
    margin-right: 4px;

    &.enabled {
      @include svg-icon-fill('path', $primary);
    }

    &.blocked {
      @include svg-icon-fill('path', $negative);
    }
  }

  .start-warmup-text {
    color: $black;
    text-decoration: unset;
  }

  .blocked-text {
    color: $negative;
  }

  .warmup-duration-text {
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
  }
}
</style>
