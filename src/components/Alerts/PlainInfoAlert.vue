<template>
  <div class="plain-info-alert">
    <!-- Info Icon -->
    <LocalSvgIcon
      image="info-circle"
    />

    <p class="alert-msg-text">
      {{ alert }}
    </p>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PlainInfoAlert',

  props: {
    alert: {
      type: String,
      default: '',
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.plain-info-alert {
  width: 100%;
  display: flex;

  .alert-msg-text {
    color: $grey;

    font-size: 14px;
    font-weight: 400;
    line-height: 16px; /* 114.286% */

    margin-left: 4px;
  }
}
</style>
