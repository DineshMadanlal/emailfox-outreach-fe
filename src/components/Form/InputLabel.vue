<template>
  <div
    class="input-label-block"
    :class="{
      'no-margin-bottom': noMarginBottom,
    }"
  >
    <p class="form-input-label-text">
      {{ label }}
      <span
        v-if="isImportant"
        class="important-span-text"
      >
        *
      </span>
    </p>

    <div
      v-if="tooltip"
      class="tooltip-div-text"
    >
      <LocalSvgIcon
        image="circle-question"
      />

      <AppTooltip
        :content="tooltip"
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'InputLabel',

  components: {
    AppTooltip,
  },

  props: {
    label: {
      type: String,
      required: true,
      default: '',
    },
    isImportant: {
      type: Boolean,
      required: false,
      default: false,
    },
    tooltip: {
      type: String,
      default: '',
    },
    noMarginBottom: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.input-label-block {
  width: fit-content;
  display: flex;
  align-items: center;

  margin-bottom: 6px;

  &.no-margin-bottom {
    margin-bottom: 0;
  }

  .form-input-label-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;

    .important-span-text {
      color: $negative;
      font-size: 14px;
      font-weight: 400;
    }
  }

  .tooltip-div-text {
    display: flex;
    margin-left: 4px;
  }
}
</style>
