<template>
  <q-card
    class="inbox-action-summary-card"
  >
    <!-- Close Button -->
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
        class="inbox-action-summary-close-icon"
      />
    </q-btn>

    <!-- Selection Count Label -->
    <p class="inbox-selection-count">
      {{ selectionCountLabel }}
    </p>

    <!-- Action Buttons (Desktop) -->
    <div class="inbox-actions">
      <q-btn
        v-for="action in inboxActions"
        :key="`each-inbox-action-${action.emitValue}`"

        dense
        flat
        no-caps
        unelevated

        :disable="isReadOnly"
        :color="action.color"
        :class="`inbox-action-btn ${action.color}`"

        @click="$emit('onAction', action.emitValue)"
      >
        <div class="action-text">
          {{ action.label }}
        </div>

        <AppTooltip
          v-if="isReadOnly"
          anchor="top middle"
          self="bottom middle"
          content="You have read-only access in this workspace"
        />
      </q-btn>
    </div>

    <!-- More Button (Mobile & Dropdown Menu) -->
    <MoreButton
      class="more-button"
      :disable="isReadOnly"
    >
      <AppTooltip
        v-if="isReadOnly"
        anchor="top middle"
        self="bottom middle"
        content="You have read-only access in this workspace"
      />
      <q-menu
        v-if="!isReadOnly"
        auto-close
        transition-show="jump-down"
        transition-hide="jump-up"
        class="unibox-more-actions-menu"
      >
        <UniboxInboxMoreOptions
          @emitAction="($event) => $emit('onAction', $event)"
        />
      </q-menu>
    </MoreButton>
  </q-card>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// composables
import { usePermissions } from 'src/composables/usePermissions';

// components
import AppTooltip from 'components/General/AppTooltip.vue';
import MoreButton from 'components/Buttons/MoreButton.vue';
import UniboxInboxMoreOptions from 'components/Unibox/UniboxInboxMoreOptions.vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers.js';

// constants
import { TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';
import { UNIBOX_INBOX_ACTIONS } from 'src/boot/unibox-constants.js';

export default defineComponent({
  name: 'InboxActionSummary',

  emits: ['onCancel', 'onAction'],

  components: {
    AppTooltip,
    MoreButton,
    UniboxInboxMoreOptions,
  },

  props: {
    numberOfSelectedItems: {
      type: Number,
      default: 0,
      required: true,
    },
    totalCount: {
      type: Number,
      default: 0,
      required: true,
    },
    multiSelectOptionJson: {
      type: Object,
      default: () => ({}),
      required: false,
    },
  },

  setup(props) {
    // composables
    const { isReadOnly } = usePermissions();

    // inbox actions
    const inboxActions = computed(() => {
      const actions = [
        {
          label: 'Update Category',
          emitValue: UNIBOX_INBOX_ACTIONS.UPDATE_CATEGORY,
          color: 'blue-grey',
        },
        {
          label: 'Mark as Read',
          emitValue: UNIBOX_INBOX_ACTIONS.MARK_AS_READ,
          color: 'blue-grey',
        },
        {
          label: 'Mark as Unread',
          emitValue: UNIBOX_INBOX_ACTIONS.MARK_AS_UNREAD,
          color: 'blue-grey',
        },
        {
          label: 'Clear Category',
          emitValue: UNIBOX_INBOX_ACTIONS.CLEAR_CATEGORY,
          color: 'negative',
        },
        {
          label: 'Archive',
          emitValue: UNIBOX_INBOX_ACTIONS.ARCHIVE,
          color: 'negative',
        },
      ];

      return actions;
    });

    const selectionCountLabel = computed(() => {
      const totalCountFormatted = getNumeralAmount(props.totalCount);

      if (props.multiSelectOptionJson?.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        return `${totalCountFormatted} selected`;
      }
      const selectedCountFormatted = getNumeralAmount(props.numberOfSelectedItems);

      return `${selectedCountFormatted} of ${totalCountFormatted} selected`;
    });

    return {
      inboxActions,
      selectionCountLabel,
      isReadOnly,
    };
  },
});
</script>

<style lang="scss" scoped>
.inbox-action-summary-card {
  max-width: unset !important;
  box-shadow: 0 4px 32px 0 rgba(4, 26, 68, 0.15);

  padding: 10px 20px;
  background: $white;
  border: 1px solid $grey-50;

  width: fit-content !important;
  border-radius: 6px !important;

  display: flex;
  align-items: center;

  .inbox-selection-count {
    white-space: nowrap;
    color: $black;
    font-size: 14px;
    font-weight: 400;

    margin-left: 8px;
    padding-right: 12px;

    border-right: 1px solid $grey-50;
  }

  :deep(.inbox-action-summary-close-icon) {
    @include svg-icon-stroke('path', $grey-300);
  }

  .more-button {
    margin-left: 12px;
    display: none;

    @media (max-width: $breakpoint-xs-max) {
      display: inline-flex;
    }
  }

  .inbox-actions {
    padding-left: 12px;
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: $breakpoint-xs-max) {
      display: none;
    }
  }

  .inbox-action-btn {
    padding: 8px 12px;
    border: 1px solid $blue-grey;
    background: $white;

    .action-text {
      color: $black;
      font-size: 14px;
      white-space: nowrap;
    }

    &.blue-grey {
      &:hover {
        background: rgba(var(--primary-rgb), 0.1) !important;

        .action-text {
          color: $primary;
        }
      }
    }

    &.negative {
      &:hover {
        border: 1px solid $negative;

        .action-text {
          color: $negative;
        }
      }
    }
  }
}
</style>
