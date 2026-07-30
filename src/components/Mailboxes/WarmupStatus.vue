<template>
  <div class="warmup-status">
    <div class="flex no-wrap items-center">
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

// constants
import { getWarmupStatus } from 'src/utils/warmupApi.js';

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
    const isWarmupEnabled = computed(() => props.mailboxJson.warmup_enabled);

    const warmupStatusJson = computed(() => getWarmupStatus(
      props.mailboxJson.warmup_first_started_at,
    ));

    return {
      // computed
      isWarmupEnabled,
      warmupStatusJson,
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
  }

  .start-warmup-text {
    color: $black;
    text-decoration: unset;
  }

  .warmup-duration-text {
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
  }
}
</style>
