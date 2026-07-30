<template>
  <q-card
    flat
    class="app-toaster"
    :class="warning ? 'warning' : 'positive'"
    :style="{ maxWidth }"
  >
    <LocalSvgIcon image="failed" class="toaster-icon" />

    <p class="toaster-text">
      {{ message }}
    </p>

    <q-space />

    <q-btn
      flat
      round
      dense
      v-close-popup

      :color="warning ? 'negative' : 'positive'"
      class="toaster-close-btn"
    >
      <LocalSvgIcon
        image="close"
        class="toaster-close-icon"
      />
    </q-btn>
  </q-card>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppToaster',

  props: {
    /** two type of toaster - positive and warning. By default - positive is true */
    warning: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: '',
    },
    maxWidth: {
      type: String,
      default: '',
    },
  },

});
</script>

<style lang="scss" scoped>
.app-toaster {
  width: fit-content;
  display: flex;
  border-radius: 8px !important;
  padding: 20px;

  backdrop-filter: blur(100px);

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 16px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1; /* Place background behind the card content */
    border-radius: inherit; /* Match border radius if any */

    border: rgba($color: var(--negative-rgb), $alpha: 0.25);
    background: rgba($color: var(--negative-rgb), $alpha: 0.08);
  }

  :deep(.toaster-icon) {
    min-width: 24px;
  }

  .toaster-text {
    margin-left: 12px;

    color: $black;
    font-size: 14px;
    font-weight: 400;
  }

  .toaster-close-btn {
    min-width: 20px;
    min-height: 20px;

    max-width: 20px;
    max-height: 20px;

    margin-left: 16px;

    border-radius: 100% !important;

    .toaster-close-icon {
      width: 12px;
    }
  }

  &.positive {
    &::before {
      border: rgba($color: var(--positive-rgb), $alpha: 0.25);
      background: rgba($color: var(--positive-rgb), $alpha: 0.08);
    }

    :deep(.toaster-icon) {
      circle {
        &:first-child {
          fill: $positive;
        }
      }
    }

  }
}
</style>
