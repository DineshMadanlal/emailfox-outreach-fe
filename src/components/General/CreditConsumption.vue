<template>
  <div class="credit-consumption-container">
    <!-- progress -->
    <q-linear-progress
      rounded

      :value="creditConsumption"

      class="credit-consumption"
    >
      <!-- Tooltip -->
      <AppTooltip
        :content="`${creditUsagePercent}% used`"
      />
    </q-linear-progress>

    <!-- credits data -->
    <p class="credits-data-text">
      {{ label }}:
      {{ getNumeralAmount(creditsUsed) }}/{{ getNumeralAmount(creditsAvailable) }}
    </p>

  </div>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';

// Utils
import { getNumeralAmount, findPercentage } from 'src/utils/numbers';

export default defineComponent({
  name: 'CreditProgress',

  components: {
    AppTooltip,
  },

  props: {
    label: {
      type: String,
      default: '',
    },
    creditsUsed: {
      type: Number,
      default: 0,
    },
    creditsAvailable: {
      type: Number,
      default: 0,
    },
  },

  setup(props) {
    // computed
    const creditUsagePercent = computed(() => findPercentage({
      part: props.creditsUsed,
      whole: props.creditsAvailable,
    }));

    const creditConsumption = computed(() => {
      /** The progress bar accept values from 0 to 1.
       * 0.3 means 30%
       * 0.9 is equivalent to 90%
       */
      const progress = props.creditsUsed / props.creditsAvailable;
      return progress >= 1 ? 1 : progress;
    });

    return {
      // computed
      creditConsumption,
      creditUsagePercent,

      // methods
      getNumeralAmount,
    };
  },

});
</script>

<style lang="scss" scoped>
.credit-consumption-container {
  width: 100%;

  .credit-consumption {
    height: 4px;
    width: 100%;
    border-radius: 8px;
  }

  .credits-data-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;

    margin-top: 9px;
  }

}
</style>
