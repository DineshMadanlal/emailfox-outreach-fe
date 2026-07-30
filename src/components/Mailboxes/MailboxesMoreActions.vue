<template>
  <!-- LIST -->
  <q-list
    style="min-width: 250px"
    class="more-action-list"
  >
    <q-item
      clickable
      :class="`${action.class || ''} more-action-item`"

      v-for="action in moreActions"
      :key="`each-more-action-${action.emitValue}`"

      @click="$emit('emitAction', action.emitValue)"
    >
      <div class="more-action-text">
        {{ action.label }}
      </div>
    </q-item>
  </q-list>
</template>
<script>
// vue
import { defineComponent, computed } from 'vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// constants
import { MAILBOX_ACTIONS } from 'src/boot/mailbox-constants.js';

export default defineComponent({
  name: 'MailboxesMoreActions',

  emits: ['emitAction'],

  setup() {
    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // computed
    const moreActions = computed(() => {
      const mobileActions = [];

      if (isMobileDevice.value) {
        mobileActions.push(
          {
            label: 'Set Daily Send Count',
            emitValue: MAILBOX_ACTIONS.SET_DAILY_SEND_COUNT,
          },
          {
            label: 'Enable Warmup',
            emitValue: MAILBOX_ACTIONS.ENABLE_WARMUP,
          },
          {
            label: 'Disable Warmup',
            emitValue: MAILBOX_ACTIONS.DISABLE_WARMUP,
          },
        );
      }

      const actions = [
        ...mobileActions,
        {
          label: 'Set Signature',
          emitValue: MAILBOX_ACTIONS.SET_SIGNATURE,
        },
        {
          label: 'Clear Signature',
          emitValue: MAILBOX_ACTIONS.CLEAR_SIGNATURE,
        },
        {
          label: 'Delete',
          emitValue: MAILBOX_ACTIONS.DELETE,
          class: 'negative-action',
        },
      ];

      return actions;
    });

    return {
      moreActions,
    };
  },
});
</script>

<style lang="scss" scoped>
.more-action-list {
  display: flex;
  flex-direction: column;
  gap: 0.5px;

  border-radius: 6px;

  .more-action-item {
    padding: 8px 12px;
    min-height: unset !important;

    .more-action-text {
      font-size: 14px;
      color: $black;
    }

    &:hover {
      background: rgba(var(--primary-rgb), 0.1);
    }

    &.negative-action {
      .more-action-text {
        color: $negative;
      }

      &:hover {
        background: rgba(var(--negative-rgb), 0.1);
      }
    }
  }
}
</style>
