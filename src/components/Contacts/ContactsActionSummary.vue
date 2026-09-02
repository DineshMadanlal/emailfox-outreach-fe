<template>
  <q-card class="contacts-action-summary-card">
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
        class="contacts-action-summary-close-icon"
      />
    </q-btn>

    <!--  -->
    <p class="contacts-selection-count">
      {{ selectionCountLabel }}
    </p>

    <!-- Actions -->
    <div class="contacts-actions">
      <q-btn
        dense
        no-caps
        outline
        unelevated

        color="blue-grey"
        class="contacts-action-btn"

        @click="$emit('onDelete')"
      >
        <p class="action-text">
          Delete
        </p>
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
  name: 'ContactsActionSummary',

  emits: ['onDelete', 'onCancel'],

  props: {
    numberOfSelectedContacts: {
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
    const selectionCountLabel = computed(() => {
      const totalCount = getNumeralAmount(props.totalCount);

      if (props.multiSelectOptionJson?.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        return `${totalCount} selected`;
      }
      const selectedCount = getNumeralAmount(props.numberOfSelectedContacts);

      return `${selectedCount} of ${totalCount} selected`;
    });

    return {
      // computed
      selectionCountLabel,
    };
  },
});
</script>

<style lang="scss" scoped>
.contacts-action-summary-card {
  max-width: unset !important;
  box-shadow: 0 4px 32px 0 rgba(4, 26, 68, 0.15);

  padding: 10px 20px;
  background: $white;
  border: 1px solid $grey-50;

  width: fit-content !important;
  border-radius: 6px !important;

  display: flex;
  align-items: center;

  .contacts-selection-count {
    color: $black;
    font-size: 14px;
    font-weight: 400;

    margin-left: 8px;
    padding-right: 14px;

    border-right: 1px solid $grey-50;
  }

  :deep(.contacts-action-summary-close-icon) {
    @include svg-icon-stroke('path', $grey-300);
  }

  .contacts-actions {
    padding-left: 12px;
    display: flex;
    align-items: center;
    gap: 12px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      display: none;
    }
  }

  .contacts-action-btn {
    padding: 8px 12px;

    :deep(.contacts-action-summary-delete-icon) {
      width: 16px;
      height: 16px;

      @include svg-icon-stroke('path', $grey-300);
    }

    .action-text {
      color: $black;
      font-size: 14px;
      white-space: nowrap;
    }

    &:hover {
      background: rgba(var(--primary-rgb), 0.1) !important;
    }
  }
}
</style>
