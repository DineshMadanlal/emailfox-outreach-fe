<template>
  <div
    v-if="isWarmupBlocked && false"
    class="warmup-blocked-banner"
  >
    <div class="banner-content">
      <h6 class="banner-title">
        Unblock warm-up
      </h6>
      <p class="banner-description">
        For your safety, warm-up is blocked because an action or verification is needed.
        Click "Unblock Warm-up" to resolve this issue and resume warming up your mailbox.
      </p>
    </div>

    <!-- Unblock warmup -->
    <q-btn
      flat
      no-caps
      unelevated

      color="negative"
      label="Unblock Warm-up"
      class="light-negative-btn"

      :disable="isReadOnly"

      @click="$emit('unblockWarmup')"
    >
      <!-- app tooltip -->
      <AppTooltip
        v-if="isReadOnly"
        content="You have read-only access in this workspace"
      />
    </q-btn>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// composables
import { usePermissions } from 'src/composables/usePermissions';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';

// constants
import { WARMUP_STATUS } from 'src/boot/warmup-constants';

export default defineComponent({
  name: 'WarmupBlockedBanner',

  components: {
    AppTooltip,
  },

  props: {
    warmupDetails: {
      type: Object,
      default: () => ({}),
    },
    mailboxByJson: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ['unblockWarmup'],

  setup(props) {
    // permissions
    const { isReadOnly } = usePermissions();

    // computed
    const isWarmupBlocked = computed(() => (
      props.mailboxByJson?.warmup_status === WARMUP_STATUS.BLOCKED
    ));

    return {
      // computed
      isReadOnly,
      isWarmupBlocked,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-blocked-banner {
  width: 100%;
  padding: 16px 20px;
  border-radius: 8px;
  background: rgba(var(--negative-rgb), 0.05);
  border: 1px solid rgba(var(--negative-rgb), 0.1);

  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: $breakpoint-xs-max) {
    flex-direction: column;
    align-items: flex-start;
  }

  .banner-content {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .banner-title {
      color: $black;
      font-size: 16px;
      font-weight: 600;
    }

    .banner-description {
      color: $grey-800;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;

      max-width: 740px;
    }
  }

  .light-negative-btn {
    border-radius: 6px;
  }
}
</style>
