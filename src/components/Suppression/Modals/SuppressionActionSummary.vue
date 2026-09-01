<template>
  <q-card
    class="suppression-action-summary-card"
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
        class="suppression-action-summary-close-icon"
      />
    </q-btn>

    <!--  -->
    <p class="suppression-selection-count">
      {{ selectionCountLabel }}
    </p>

    <!--  -->
    <div
      class="suppress-actions"
    >
      <!-- Set Daily Send Count -->
      <q-btn
        dense
        no-caps
        outline
        unelevated

        color="blue-grey"
        class="suppress-action-btn"

        v-for="action in suppressionActions"
        :key="`each-action-${action.emitValue}`"

        @click="$emit(action.emitValue)"
      >
        <div class="text-black action-text">
          {{ action.label }}
        </div>
      </q-btn>
    </div>

  </q-card>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// Utils
import { getNumeralAmount } from 'src/utils/numbers.js';

// constants
import { TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';

export default defineComponent({
  name: 'SuppressionActionSummary',

  emits: ['onCancel', 'onDelete'],

  props: {
    numberOfSelectedData: {
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
      required: true,
    },
  },

  setup(props) {
    // actions
    const suppressionActions = computed(() => {
      const actions = [
        {
          label: 'Remove',
          emitValue: 'onDelete',
        },
      ];

      return actions;
    });

    const selectionCountLabel = computed(() => {
      const totalCount = getNumeralAmount(props.totalCount);

      if (props.multiSelectOptionJson?.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        return `${totalCount} selected`;
      }
      const selectedCount = getNumeralAmount(props.numberOfSelectedData);

      return `${selectedCount} of ${totalCount} selected`;
    });

    return {
      // computed
      suppressionActions,
      selectionCountLabel,
    };
  },
});
</script>

<style lang="scss" scoped>
.suppression-action-summary-card {
  max-width: unset !important;
  box-shadow: 0 4px 32px 0 rgba(4, 26, 68, 0.15);

  padding: 10px 20px;
  background: $white;
  border: 1px solid $grey-50;

  width: fit-content !important;
  border-radius: 6px !important;

  display: flex;
  align-items: center;

  .suppression-selection-count {
    white-space: nowrap;
    color: $black;
    font-size: 14px;
    font-weight: 400;

    margin-left: 8px;
    padding-right: 12px;

    border-right: 1px solid $grey-50;
  }

  :deep(.suppression-action-summary-close-icon) {
    @include svg-icon-stroke('path', $grey-300);
  }

  .more-button {
    margin-left: 12px;
  }

  .suppress-action-btn {
    padding: 8px 12px;

    .action-text {
      font-size: 14px;
      white-space: nowrap;
    }

    &:hover {
      background: rgba(var(--primary-rgb), 0.1) !important;
    }

  }

  .suppress-actions {
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
.suppression-more-actions-menu {
  border-radius: 6px;
  border: 1px solid $grey-50;
  background: $white;
  box-shadow: 0 1px 12px 2px rgba(0, 0, 0, 0.12) !important;
}
</style>
