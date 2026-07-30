<template>
  <q-card class="domain-action-summary-card">
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
        class="domain-action-summary-close-icon"
      />
    </q-btn>

    <!--  -->
    <p class="domain-selection-count">
      {{ numberOfSelectedDomains }} of {{ totalCount }} selected
    </p>

    <!-- Actions -->
    <div class="domain-actions">
      <q-btn
        dense
        no-caps
        outline
        unelevated

        color="blue-grey"
        class="domain-action-btn"

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
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DomainActionSummary',

  emits: ['onDelete', 'onCancel'],

  props: {
    numberOfSelectedDomains: {
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
});
</script>

<style lang="scss" scoped>
.domain-action-summary-card {
  max-width: unset !important;
  box-shadow: 0 4px 32px 0 rgba(4, 26, 68, 0.15);

  padding: 10px 20px;
  background: $white;
  border: 1px solid $grey-50;

  width: fit-content !important;
  border-radius: 6px !important;

  display: flex;
  align-items: center;

  .domain-selection-count {
    color: $black;
    font-size: 14px;
    font-weight: 400;

    margin-left: 8px;
    padding-right: 14px;

    border-right: 1px solid $grey-50;
  }

  :deep(.domain-action-summary-close-icon) {
    @include svg-icon-stroke('path', $grey-300);
  }

  .domain-actions {
    padding-left: 12px;
    display: flex;
    align-items: center;
    gap: 12px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      display: none;
    }
  }

  .domain-action-btn {
    padding: 8px 12px;

    :deep(.domain-action-summary-delete-icon) {
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
