<template>
  <q-btn
    flat
    no-caps
    unelevated

    class="refresh-status-button"
    :class="{ 'refresh-status-button-loading': buttonLoading }"

    @click="onButtonClick"
  >
    <!--  -->
    <LocalSvgIcon
      image="sync"
      class="sync-icon"
    />

    <!--  -->
    <p class="refresh-status-text">
      {{ buttonLoading ? 'Refreshing...' : 'Refresh Status' }}
    </p>
  </q-btn>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RefreshStatusButton',

  emits: ['click'],

  props: {
    buttonLoading: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    const onButtonClick = () => {
      if (props.buttonLoading) {
        return;
      }

      emit('click');
    };

    return {
      // methods
      onButtonClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.refresh-status-button {
  .refresh-status-text {
    color: $grey;
    font-size: 14px;

    font-weight: 500;
    line-height: 16px;

    margin-left: 8px;
  }

  &.refresh-status-button-loading {
    :deep(.sync-icon) {
      // transition to rotate forever
      animation: rotateForever 2s linear infinite;
    }
  }
}
</style>
