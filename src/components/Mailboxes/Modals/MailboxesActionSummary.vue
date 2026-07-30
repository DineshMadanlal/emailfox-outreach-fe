<template>
  <q-card
    class="mailboxes-action-summary-card"
  >
    <!-- close button -->
    <q-btn
      flat
      dense
      no-caps
      unelevated

      color="grey"

      @click="$emit('onCancel')"
    >
      <LocalSvgIcon
        image="close"
        class="mailboxes-action-summary-close-icon"
      />
    </q-btn>

    <!--  -->
    <p class="mailboxes-selection-count">
      {{ numberOfSelectedMailboxes }} of {{ totalCount }} selected
    </p>

    <!--  -->
    <div
      class="mailbox-actions"
    >
      <!-- Set Daily Send Count -->
      <q-btn
        dense
        no-caps
        outline
        unelevated

        color="blue-grey"
        class="mailbox-action-btn"

        v-for="action in mailboxActions"
        :key="`each-action-${action.emitValue}`"

        @click="$emit('onAction', action.emitValue)"
      >
        <div class="text-black action-text">
          {{ action.label }}
        </div>
      </q-btn>
    </div>

    <!-- More Button -->
    <MoreButton
      class="more-button"
    >
      <q-menu
        auto-close
        transition-show="jump-down"
        transition-hide="jump-up"

        class="mailboxes-more-actions-menu"
      >
        <MailboxesMoreActions
          @emitAction="($event) => $emit('onAction', $event)"
        />
      </q-menu>
    </MoreButton>
  </q-card>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import MoreButton from 'components/Buttons/MoreButton.vue';
import MailboxesMoreActions from 'components/Mailboxes/MailboxesMoreActions.vue';

// constants
import { MAILBOX_ACTIONS } from 'src/boot/mailbox-constants.js';

export default defineComponent({
  name: 'MailboxesActionSummary',

  emits: ['onCancel', 'onAction'],

  components: {
    MoreButton,
    MailboxesMoreActions,
  },

  props: {
    numberOfSelectedMailboxes: {
      type: Number,
      default: 0,
      required: true,
    },

    totalCount: {
      type: Number,
      default: 0,
      required: true,
    },
  },

  setup() {
    // actions
    const mailboxActions = computed(() => {
      const actions = [
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
      ];

      return actions;
    });

    return {
      // computed
      mailboxActions,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailboxes-action-summary-card {
  max-width: unset !important;
  box-shadow: 0 4px 32px 0 rgba(4, 26, 68, 0.15);

  padding: 10px 20px;
  background: $white;
  border: 1px solid $grey-50;

  width: fit-content !important;
  border-radius: 6px !important;

  display: flex;
  align-items: center;

  .mailboxes-selection-count {
    white-space: nowrap;
    color: $black;
    font-size: 14px;
    font-weight: 400;

    margin-left: 8px;
    padding-right: 12px;

    border-right: 1px solid $grey-50;
  }

  :deep(.mailboxes-action-summary-close-icon) {
    @include svg-icon-stroke('path', $grey-300);
  }

  .more-button {
    margin-left: 12px;
  }

  .mailbox-action-btn {
    padding: 8px 12px;

    .action-text {
      font-size: 14px;
      white-space: nowrap;
    }

    &:hover {
      background: rgba(var(--primary-rgb), 0.1) !important;
    }

  }

  .mailbox-actions {
    padding-left: 12px;
    display: flex;
    align-items: center;
    gap: 12px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      display: none;
    }
  }
}
</style>

<style lang="scss">
.mailboxes-more-actions-menu {
  border-radius: 6px;
  border: 1px solid $grey-50;
  background: $white;
  box-shadow: 0 1px 12px 2px rgba(0, 0, 0, 0.12) !important;
}
</style>
