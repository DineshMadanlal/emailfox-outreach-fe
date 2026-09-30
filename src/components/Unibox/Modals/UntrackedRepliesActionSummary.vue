<template>
  <q-card
    class="untracked-action-summary-card"
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
        class="untracked-action-summary-close-icon"
      />
    </q-btn>

    <!-- Selection Count Label -->
    <p class="untracked-selection-count">
      {{ selectionCountLabel }}
    </p>

    <!-- Action Buttons (Desktop) -->
    <div class="untracked-actions">
      <q-btn
        dense
        flat
        no-caps
        unelevated

        v-for="action in untrackedActions"
        :key="`each-untracked-action-${action.emitValue}`"
        :class="action.class"
        :disable="isReadOnly"

        color="blue-grey"
        class="untracked-action-btn"

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

      <!-- Menu -->
      <q-menu
        v-if="!isReadOnly"
        auto-close

        transition-hide="jump-up"
        transition-show="jump-down"
      >
        <UniboxUntrackedMoreOptions
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
import UniboxUntrackedMoreOptions from 'components/Unibox/UniboxUntrackedMoreOptions.vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers.js';

// constants
import { TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';
import { UNIBOX_UNTRACKED_ACTIONS } from 'src/boot/unibox-constants.js';

export default defineComponent({
  name: 'UntrackedRepliesActionSummary',

  emits: ['onCancel', 'onAction'],

  components: {
    AppTooltip,
    MoreButton,
    UniboxUntrackedMoreOptions,
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

    // untracked reply actions
    const untrackedActions = computed(() => {
      const actions = [
        {
          label: 'Mark as Read',
          emitValue: UNIBOX_UNTRACKED_ACTIONS.MARK_AS_READ,
        },
        {
          label: 'Mark as Unread',
          emitValue: UNIBOX_UNTRACKED_ACTIONS.MARK_AS_UNREAD,
        },
        {
          label: 'Delete',
          emitValue: UNIBOX_UNTRACKED_ACTIONS.DELETE,
          class: 'negative-action-btn',
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
      untrackedActions,
      selectionCountLabel,
      isReadOnly,
    };
  },
});
</script>

<style lang="scss" scoped>
.untracked-action-summary-card {
  max-width: unset !important;
  box-shadow: 0 4px 32px 0 rgba(4, 26, 68, 0.15);

  padding: 10px 20px;
  background: $white;
  border: 1px solid $grey-50;

  width: fit-content !important;
  border-radius: 6px !important;

  display: flex;
  align-items: center;

  .untracked-selection-count {
    white-space: nowrap;
    color: $black;
    font-size: 14px;
    font-weight: 400;

    margin-left: 8px;
    padding-right: 12px;

    border-right: 1px solid $grey-50;
  }

  :deep(.untracked-action-summary-close-icon) {
    @include svg-icon-stroke('path', $grey-300);
  }

  .more-button {
    margin-left: 12px;
    display: none;

    @media (max-width: $breakpoint-xs-max) {
      display: inline-flex;
    }
  }

  .untracked-actions {
    padding-left: 12px;
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: $breakpoint-xs-max) {
      display: none;
    }
  }

  .untracked-action-btn {
    padding: 8px 12px;
    border: 1px solid $blue-grey;

    .action-text {
      color: $black;
      font-size: 14px;
      white-space: nowrap;
    }

    &:hover {
      background: rgba(var(--primary-rgb), 0.1) !important;
    }

    &.negative-action-btn {
      .action-text {
        color: $negative;
      }

      &:hover {
        border: 1px solid $negative;
        background: rgba(var(--negative-rgb), 0.1) !important;
      }
    }
  }
}
</style>
