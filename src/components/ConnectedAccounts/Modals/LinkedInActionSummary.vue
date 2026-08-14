<template>
  <q-card
    class="accounts-action-summary-card"
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
        class="accounts-action-summary-close-icon"
      />
    </q-btn>

    <!--  -->
    <p class="accounts-selection-count">
      {{ numberOfSelectedRows }} of {{ totalCount }} selected
    </p>

    <!--  -->
    <div
      class="account-actions"
    >
      <q-btn
        dense
        no-caps
        outline
        unelevated

        color="blue-grey"
        class="account-action-btn"

        v-for="action in accountActions"
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

export default defineComponent({
  name: 'LinkedInActionSummary',

  emits: ['onCancel', 'setApiRateLimit', 'delete'],

  props: {
    numberOfSelectedRows: {
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
    const accountActions = computed(() => {
      const actions = [
        {
          label: 'Set API Rate Limit',
          emitValue: 'setApiRateLimit',
        },
        {
          label: 'Delete',
          emitValue: 'delete',
        },
      ];

      return actions;
    });

    return {
      // computed
      accountActions,
    };
  },
});
</script>

<style lang="scss" scoped>
.accounts-action-summary-card {
  max-width: unset !important;
  box-shadow: 0 4px 32px 0 rgba(4, 26, 68, 0.15);

  padding: 10px 20px;
  background: $white;
  border: 1px solid $grey-50;

  width: fit-content !important;
  border-radius: 6px !important;

  display: flex;
  align-items: center;

  .accounts-selection-count {
    white-space: nowrap;
    color: $black;
    font-size: 14px;
    font-weight: 400;

    margin-left: 8px;
    padding-right: 12px;

    border-right: 1px solid $grey-50;
  }

  :deep(.accounts-action-summary-close-icon) {
    @include svg-icon-stroke('path', $grey-300);
  }

  .more-button {
    margin-left: 12px;
  }

  .account-action-btn {
    padding: 8px 12px;

    .action-text {
      font-size: 14px;
      white-space: nowrap;
    }

    &:hover {
      background: rgba(var(--primary-rgb), 0.1) !important;
    }

  }

  .account-actions {
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
