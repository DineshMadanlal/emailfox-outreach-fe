<template>
  <q-btn
    flat
    no-caps
    unelevated

    color="primary"
    class="new-step-btn"

    @click="$emit('click')"
  >
    <LocalSvgIcon
      image="circle-plus"
      classes="circle-plus-icon"
    />

    <p class="new-step-text">
      New Step
    </p>
  </q-btn>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NewStepButton',

  emits: ['click'],
});
</script>

<style lang="scss" scoped>
.new-step-btn {

  :deep(.circle-plus-icon) {
    width: 16px;
    height: 16px;

    @include svg-icon-stroke('path, circle', $primary);
  }

  .new-step-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;

    margin-left: 6px;

  }
}
</style>
