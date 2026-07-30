<template>
  <div class="info-tooltip-wrapper">
    <LocalSvgIcon :image="iconName" class="info-tooltip-icon" />

    <AppTooltip
      :content="tooltipText"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'InfoTooltip',

  components: {
    AppTooltip,
  },

  props: {
    iconName: {
      type: String,
      default: 'info-circle',
    },
    tooltipText: {
      type: String,
      default: '',
    },
  },
});
</script>

<style lang="scss" scoped>
.info-tooltip-wrapper {
  display: flex;
  width: fit-content;

  .info-tooltip-icon {
    height: 14px;
    width: 14px;
  }
}
</style>
