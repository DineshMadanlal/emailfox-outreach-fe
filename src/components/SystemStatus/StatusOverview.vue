<template>
  <div class="status-overview">
    <div class="status-overview-header">
      <!-- header -->
      <h6 class="status-header-text">
        {{ header }}
      </h6>

      <div class="status-tooltip">
        <LocalSvgIcon
          image="circle-question"
        />

        <AppTooltip
          :content="tooltip"
        />
      </div>
    </div>

    <!--  -->
    <p class="status-description-text">
      {{ description }}
    </p>
  </div>
</template>
<script>
// vue
import { defineComponent } from 'vue';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'StatusOverview',

  components: {
    AppTooltip,
  },

  props: {
    header: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tooltip: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.status-overview {
  width: 100%;

  .status-overview-header {
    display: flex;
    align-items: center;

    .status-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
    }

    .status-tooltip {
      display: flex;
      margin-left: 6px;
    }
  }

  .status-description-text {
    color: $grey;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px; /* 114.286% */

    margin-top: 8px;
  }
}
</style>
